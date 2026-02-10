module.exports = [
  {
    "type": "heading",
    "defaultValue": "Afvalkalender Instellingen"
  },
  {
    "type": "text",
    "defaultValue": "Je kunt hier het adres opgeven waarvan je de afvalkalender wilt zien."
  },
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Adres"
      },
      {
        "type": "input",
        "id": "PostalCode",
        "messageKey": "PostalCode",
        "label": "Postcode",
        "defaultValue": "5300ABC"
      },
      {
        "type": "input",
        "messageKey": "HouseNumber",
        "id": "HouseNumber",
        "label": "Huisnummer",
        "defaultValue": "100"
      },
      {
        "type": "input",
        "messageKey": "HouseLetter",
        "id": "HouseLetter",
        "label": "Nummer toevoeging",
        "defaultValue": ""
      },
      {
        "type": "button",
        "id": "check",
        "defaultValue": "Adres controleren",
      },
      {
        "type": "input",
        "id": "Community",
        "messageKey": "Community",
        "label": "Community",
      },
      {
        "type": "input",
        "id": "UniqueAddressID",
        "messageKey": "UniqueAddressID",
        "label": "UniqueAddressID",
      }
    ]
  },
  {
    "type": "submit",
    "defaultValue": "Instellingen opslaan"
  }
];