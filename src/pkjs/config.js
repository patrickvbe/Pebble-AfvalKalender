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
        "id": "HouseNumber",
        "messageKey": "HouseNumber",
        "label": "Huisnummer",
        "defaultValue": "100"
      },
      {
        "type": "input",
        "id": "HouseLetter",
        "messageKey": "HouseLetter",
        "label": "Nummer toevoeging",
        "defaultValue": ""
      },
      {
        "type": "button",
        "id": "check",
        "defaultValue": "Adres controleren",
      },
      {
        "type": "text",
        "id": "statusOK",
        "defaultValue": "Adres OK",
      },
      {
        "type": "text",
        "id": "statusFailed",
        "defaultValue": "Fout bij adres controle",
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
      },
      {
        "type": "input",
        "id": "CompanyCode",
        "messageKey": "CompanyCode",
        "label": "CompanyCode",
      }
    ]
  },
  {
    "type": "submit",
    "defaultValue": "Instellingen opslaan"
  }
];