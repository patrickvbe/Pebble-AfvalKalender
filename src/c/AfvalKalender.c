// Shows the trash schedule Pebble watch.
// Copyright (C) 2026 Patrick van Beem (patrick@vanbeem.info)
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.


#include <pebble.h>

#define MAX(x, y) (((x) > (y)) ? (x) : (y))
#define MIN(x, y) (((x) < (y)) ? (x) : (y))

#define MAX_ENTRIES 32
uint64_t s_entries[MAX_ENTRIES];
int s_num_entries = 0;

#define MAX_CONFIG_STR_SIZE 64
typedef struct Settings {
  char community[MAX_CONFIG_STR_SIZE];
  char unique_address_id[MAX_CONFIG_STR_SIZE];
  char company_code[MAX_CONFIG_STR_SIZE];
} Settings;
Settings s_settings;
bool s_settings_changed = false;  // So we know we should save it.

const char* const s_entry_types[] = {"Grijs", "Groen", "Papier", "Verpakkingen"};

// Persistency of data, so we don't have to communicate each time we start the app.
#define STORAGE_KEY_ENTRIES      0
#define STORAGE_KEY_SETTINGS     1

static Window *s_window;
static MenuLayer *s_menu_layer;

AppTimer* request_entries_timer = NULL;

void request_entries() {
  request_entries_timer = NULL;
  APP_LOG(APP_LOG_LEVEL_DEBUG, "Request entries");
  DictionaryIterator *out_iter;
  AppMessageResult result = app_message_outbox_begin(&out_iter);
  if(result == APP_MSG_OK) {
    dict_write_uint8(out_iter, MESSAGE_KEY_RequestData, 0);
    dict_write_cstring(out_iter, MESSAGE_KEY_Community, s_settings.community);
    dict_write_cstring(out_iter, MESSAGE_KEY_UniqueAddressID, s_settings.unique_address_id);
    dict_write_cstring(out_iter, MESSAGE_KEY_CompanyCode, s_settings.company_code);
    result = app_message_outbox_send();
    if(result != APP_MSG_OK) {
      APP_LOG(APP_LOG_LEVEL_ERROR, "Error sending the outbox: %d", (int)result);
    }
  } else {
    // The outbox cannot be used right now
    APP_LOG(APP_LOG_LEVEL_ERROR, "Error preparing the outbox: %d", (int)result);
  }
}

void schedule_request_entries() {
  // Combine multiple request within a short amount of time into one request.
  if ( request_entries_timer == NULL ) {
    request_entries_timer = app_timer_register(3000, request_entries, NULL);
  }
}

void update_entries_received(Tuple* tuple) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "Entries received");
  const uint16_t buf_size = MIN(tuple->length, sizeof(s_entries));
  s_num_entries = buf_size / sizeof(uint64_t);
  APP_LOG(APP_LOG_LEVEL_DEBUG, "Received %d entries.", s_num_entries);
  if ( s_num_entries > 0 ) {
    memcpy(&s_entries, tuple->value->data, buf_size);
    menu_layer_reload_data(s_menu_layer);
    // Store data for next app start.
    persist_write_data(STORAGE_KEY_ENTRIES, s_entries, buf_size);
  }
}

static void inbox_received_handler(DictionaryIterator *iter, void *context) {
  Tuple* tp = dict_read_first(iter);
  APP_LOG(APP_LOG_LEVEL_DEBUG, "Inbox received %ld", tp->key);
  Tuple *tuple = dict_find(iter, MESSAGE_KEY_JSReady);
  if(tuple) {
    // PebbleKit JS is ready! Safe to send messages
    APP_LOG(APP_LOG_LEVEL_DEBUG, "JSReady received");
    schedule_request_entries();
    return;
  }
  tuple = dict_find(iter, MESSAGE_KEY_Entries);
  if(tuple) {
    update_entries_received(tuple);
    return;
  }
  tuple = dict_find(iter, MESSAGE_KEY_Community);
  if(tuple) {
    memcpy(s_settings.community, tuple->value->cstring, MIN(tuple->length, MAX_CONFIG_STR_SIZE));
    s_settings.community[MAX_CONFIG_STR_SIZE-1] = 0;
    //schedule_request_entries();
    s_settings_changed = true;
    return;
  }
  tuple = dict_find(iter, MESSAGE_KEY_UniqueAddressID);
  if(tuple) {
    memcpy(s_settings.unique_address_id, tuple->value->cstring, MIN(tuple->length, MAX_CONFIG_STR_SIZE));
    s_settings.unique_address_id[MAX_CONFIG_STR_SIZE-1] = 0;
    //schedule_request_entries();
    s_settings_changed = true;
    return;
  }
  tuple = dict_find(iter, MESSAGE_KEY_CompanyCode);
  if(tuple) {
    memcpy(s_settings.company_code, tuple->value->cstring, MIN(tuple->length, MAX_CONFIG_STR_SIZE));
    s_settings.company_code[MAX_CONFIG_STR_SIZE-1] = 0;
    //schedule_request_entries();
    s_settings_changed = true;
    return;
  }
}

uint16_t menu_layer_num_sections(struct MenuLayer *menu_layer, void *callback_context)
{
  return 1;
}
uint16_t menu_layer_num_rows(struct MenuLayer *menu_layer, uint16_t section_index, void *callback_context)
{
  return s_num_entries;
}

 void menu_layer_draw_row(GContext* ctx, const Layer *cell_layer, MenuIndex *cell_index, void *callback_context) {
   char sub_title[50];
   uint64_t entry = s_entries[cell_index->row];
   int entry_type = entry % 100;
   time_t entry_time = entry / 100;
   struct tm* entry_time_struct = gmtime(&entry_time);
   strftime(sub_title, 50, "%a %x", entry_time_struct);
   menu_cell_basic_draw(ctx, cell_layer, entry_type > 0 && entry_type <= 4 ? s_entry_types[entry_type-1] : NULL, sub_title, NULL);
 }

MenuLayerCallbacks menu_layer_callbacks = {
  menu_layer_num_sections,  // MenuLayerGetNumberOfSectionsCallback
  menu_layer_num_rows,      //MenuLayerGetNumberOfRowsInSectionsCallback
  NULL,                     // MenuLayerGetCellHeightCallback
  NULL,                     // MenuLayerGetHeaderHeightCallback
  menu_layer_draw_row,      // MenuLayerDrawRowCallback
  NULL,                     // MenuLayerDrawHeaderCallback
  NULL,                     // MenuLayerSelectCallback select_click;
  NULL,                     // MenuLayerSelectCallback select_long_click;
  NULL,                     // MenuLayerSelectionChangedCallback selection_changed;
  NULL,                     // MenuLayerGetSeparatorHeightCallback get_separator_height;
  NULL,                     // MenuLayerDrawSeparatorCallback draw_separator;
  NULL,                     // MenuLayerSelectionWillChangeCallback selection_will_change;
  NULL,                     // MenuLayerDrawBackgroundCallback draw_background;
};

static void prv_window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  s_menu_layer = menu_layer_create(bounds);
  menu_layer_set_click_config_onto_window(s_menu_layer, window);
  menu_layer_set_callbacks(s_menu_layer, NULL, menu_layer_callbacks);
  layer_add_child(window_layer, menu_layer_get_layer(s_menu_layer));
}

static void prv_window_unload(Window *window) {
  menu_layer_destroy(s_menu_layer);
}

static void prv_init(void) {
  s_settings.community[0] = 0;
  s_settings.unique_address_id[0] = 0;
  s_settings.company_code[0] = 0;
  persist_read_data(STORAGE_KEY_SETTINGS, &s_settings, sizeof(s_settings));

  //uint64_t inits[] = {177007320004, 177085080002, 177093720001, 177102360003, 177188760004, 177206040002, 177327000002, 177335640001, 177344280003, 177370200004, 177447960002, 177551280004, 177568560002, 177577200001, 177585840003, 177689520002, 177732720004};
  //s_num_entries = sizeof(inits) / sizeof(uint64_t);
  //memcpy(s_entries, inits, sizeof(inits));
  if ( persist_exists(STORAGE_KEY_ENTRIES) ) {
    int data_size = MIN(persist_get_size(STORAGE_KEY_ENTRIES), (int)sizeof(s_entries));
    persist_read_data(STORAGE_KEY_ENTRIES, s_entries, data_size);
    s_num_entries = data_size / sizeof(uint64_t);
  }

  s_window = window_create();
  window_set_window_handlers(s_window, (WindowHandlers) {
    .load = prv_window_load,
    .unload = prv_window_unload,
  });
  const bool animated = true;
  window_stack_push(s_window, animated);

  app_message_register_inbox_received(inbox_received_handler);
  app_message_open(sizeof(s_entries) + 32, 256);
}

static void prv_deinit(void) {
  window_destroy(s_window);

  // Store settings before we exit.
  if ( s_settings_changed ) {
    persist_write_data(STORAGE_KEY_SETTINGS, &s_settings, sizeof(s_settings));
  }
}

int main(void) {
  prv_init();
  app_event_loop();
  prv_deinit();
}
