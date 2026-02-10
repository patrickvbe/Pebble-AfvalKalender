module.exports = function(minified) {
  var clayConfig = this;
  var _ = minified._;
  var $ = minified.$;
  var HTML = minified.HTML;

  function checkAddress() {
    var postalCodeField = clayConfig.getItemById('PostalCode');
    var houseNumberField = clayConfig.getItemById('HouseNumber');
    var houseLetterField = clayConfig.getItemById('HouseLetter');
    var communityField = clayConfig.getItemById('Community');
    var uniqueIDField = clayConfig.getItemById('UniqueAddressID');
    communityField.set('');
    uniqueIDField.set('');
    
    $.request('post', 'https://wasteapi.ximmio.com/api/FetchAdress', 
        {'postCode': postalCodeField.get(), 'houseNumber': houseNumberField.get(), 'houseLetter': houseLetterField.get(), 'companyCode': '78cd4156-394b-413d-8936-d407e334559a'})
      .then(function(result) {
        var json = JSON.parse(result);
        uniqueIDField.set(json.dataList[0].UniqueId);
        communityField.set(json.dataList[0].Community);
      });
  }

  clayConfig.on(clayConfig.EVENTS.AFTER_BUILD, function() {
    var checkButton = clayConfig.getItemById('check');
    checkButton.on('click', checkAddress);


    // Set the value of an item based on the userData
    // $.request('get', 'https://some.cool/api', {token: clayConfig.meta.userData.token})
    //   .then(function(result) {
    //     // Do something interesting with the data from the server
    //   })
    //   .error(function(status, statusText, responseText) {
    //     // Handle the error
    //   });
  });
  
};
