module.exports = function(minified) {
  var clayConfig = this;
  var _ = minified._;
  var $ = minified.$;
  var HTML = minified.HTML;

  var statusFailed;
  var postalCodeField;
  var houseNumberField;
  var houseLetterField;
  var communityField;
  var uniqueIDField;
  var companyCodeField;

  function checkAddress() {
    uniqueIDField.set('');
    communityField.set('');
    try {
      $.request('post', 'https://wasteapi.ximmio.com/api/FetchAdress', 
        {'postCode': postalCodeField.get(), 'houseNumber': houseNumberField.get(), 'houseLetter': houseLetterField.get(), 'companyCode': companyCodeField.get()})
        .then(result => {
        try {
          var json = JSON.parse(result);
          uniqueIDField.set(json.dataList[0].UniqueId);
          communityField.set(json.dataList[0].Community);
          statusOK.show();
          statusFailed.hide();
        }
        catch(error) {
          statusOK.hide();
          statusFailed.show();
        }
      });
    }
    catch(error) {
      statusOK.hide();
      statusFailed.show();
    }
  }

  clayConfig.on(clayConfig.EVENTS.AFTER_BUILD, function() {
    var checkButton = clayConfig.getItemById('check');
    checkButton.on('click', checkAddress);
    postalCodeField = clayConfig.getItemById('PostalCode');
    houseNumberField = clayConfig.getItemById('HouseNumber');
    houseLetterField = clayConfig.getItemById('HouseLetter');
    communityField = clayConfig.getItemById('Community');
    uniqueIDField = clayConfig.getItemById('UniqueAddressID');
    companyCodeField = clayConfig.getItemById('CompanyCode');
    companyCodeField.set('78cd4156-394b-413d-8936-d407e334559a');
    communityField.hide();
    uniqueIDField.hide();
    companyCodeField.hide();
    statusFailed = clayConfig.getItemById('statusFailed');
    statusFailed.hide();
    statusOK = clayConfig.getItemById('statusOK');
    statusOK.hide();
  });
  
};
