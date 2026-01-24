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


// Require the keys' numeric values.
var keys = require('message_keys');

// Import the Clay package for the configuration page
//var Clay = require('pebble-clay');
// Load our Clay configuration file
//var clayConfig = require('./config');
// Initialize Clay
//var clay = new Clay(clayConfig);


Pebble.addEventListener('ready', function() {
  Pebble.sendAppMessage({JSReady: 1});
});


// Source: https://stackoverflow.com/questions/1038746/equivalent-of-string-format-in-jquery/2648463#2648463
String.prototype.format = String.prototype.f = function() {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

function FetchAddress(postCode, houseNumber, houseLetter, companyCode) {
  var req = new XMLHttpRequest();
  
  req.open('POST', 'https://wasteapi.ximmio.com/api/FetchAdress' , false)
  req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
  req.send('postCode={0}&houseNumber={1}&houseLetter={2}&companyCode={3}'.f(postCode, houseNumber, houseLetter, companyCode))
  // console.log(req.status)
  // console.log(req.responseText)
  if (req.status === 200) {
    try {
      var response = JSON.parse(req.responseText)
      var datalist = response.dataList[0]
      if ( datalist ) {
        uniqueAddressID = datalist.UniqueId
        community = datalist.Community
        console.log("Succeeded: {0} / {1}".f(uniqueAddressID, community))
      }
    } catch(error) {
      //console.log(error)
    }
  }
}


function requestData(dateint) {
  var postCode="5301PA"
  var houseNumber="9"
  var houseLetter=""
  var companyCode="78cd4156-394b-413d-8936-d407e334559a"
  var startDate= new Date()
  var endDate= new Date()
  endDate.setMonth(endDate.getMonth() + 3) // Get 3 months of data.
  var community=""
  var uniqueAddressID=""

  if ( community === "" || uniqueAddressID == "" ) {
    FetchAddress(postCode, houseNumber, houseLetter, companyCode)
    console.log("Address fetched: {0} / {1}".f(community, uniqueAddressID));
  }

  var req = new XMLHttpRequest();
  req.open('POST', 'https://wasteapi.ximmio.com/api/GetCalendar' , false)
  req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
  req.send('startDate={0}&endDate={1}&community={2}&uniqueAddressID={3}&companyCode={4}'.f(startDate.toISOString().substring(0,10), endDate.toISOString().substring(0,10), community, uniqueAddressID, companyCode))
  if (req.status === 200) {
    var result = []
    try {
      //console.log(req.responseText)
      var response = JSON.parse(req.responseText)
      for ( const pickup of response.dataList ) {
        var pickuptype = 0;                                 // Unknown
        if ( pickup.pickupType ==  0 ) pickuptype = 1       // Grijs
        if ( pickup.pickupType ==  1 ) pickuptype = 2       // Groen
        if ( pickup.pickupType ==  2 ) pickuptype = 3       // Papier
        if ( pickup.pickupType == 10 ) pickuptype = 4       // Verpakkingen
        if ( pickuptype != 0 ) {
          for ( const datestr of pickup.pickupDates ) {
            // Convert date + type to a decimal encoded uint32
            var date = new Date(datestr)
            result.push(date.getFullYear()*1000000 + (date.getMonth()+1) * 10000 + date.getDate() * 100 + pickuptype)
          }
        }
        if ( result.length > 32 ) break;  // Sanity check...
      }
    } catch(error) {
      console.log(error)
    }
    // Convert result to binary to send to the watch
    const buffer = new ArrayBuffer(result.length * 4)
    const data = new Uint32Array(buffer)
    var idx = 0
    for ( const code of result ) {
      data[idx++] = code
    }
    Pebble.sendAppMessage({Stroom: Array.from(new Uint8Array(buffer))});
  } else {
    console.log("Request failed: {0}: {1}".f(req.status, req.statusText));
  }
}

Pebble.addEventListener('appmessage', function(e) {
  console.log(e.type);
  console.log(e.payload[keys.RequestData]);
  requestData(e.payload[keys.RequestData]);
});
