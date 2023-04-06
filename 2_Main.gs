const model = new Model()   //TÄMÄ JA KOKO Model LUOKKA TULEVAT POISTUMAAN
const db = DbLib2.getDataAccess(app.dbId)

function dbApi(tableName, methodName, arg1, arg2, arg3) {
  const table = db.getTable(tableName)
  return table[methodName](arg1, arg2, arg3)
}

function serviceApi(functionName, arg1, arg2, arg3) {
  return service[functionName](arg1, arg2, arg3)
}


function doGet (e) {
  if (e.parameters.test) {
    console.log(e.parameters.test)
    return HtmlService.createTemplateFromFile('0_TestBrowserSide').evaluate().setTitle('Tilikirja_test')
  }

  if (e.parameter.profile === 'user') {
    const sheet = SpreadsheetApp.openByUrl(app.dbUrl).getSheetByName('Visitor')
    const range = sheet.getRange(sheet.getLastRow()+1, 1, 1, 1)

    range.setValue(DateTimeLib.getDate())
  }

  const html = HtmlService.createTemplateFromFile('frame')
  html.profile = (e.parameters.profile) ? e.parameters.profile : ''
  html.version = app.version

  return html
    .evaluate()
    .setTitle('Tilikirja')
    .setFaviconUrl('https://cdn.icon-icons.com/icons2/1385/PNG/512/eur-crypto-cryptocurrency-cryptocurrencies-cash-money-bank-payment_95510.png')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
}

// ROUTERIIN TULEE POISTUMAAN KOKONAAN. SPESSU-FUNKTIOT TULEVAT service-OBJEKTIN ALLE
const interface = {
  ackCharges:             (args) => model.ackCharges(args[0], args[1]),
  exportYearlyEvents:     (args) => model.printYearlyEventsOnSpreadsheet(args[0]),
  getAccounts:            (args) => model.getAccounts(),
  getCurrentWaterPrice:   (args) => model.getCurrentWaterPrice(),
  getCurrentYear:         (args) => model.getCurrentYear(),
  getEvents:              (args) => model.getEvents(),
  getWaterReadings:       (args) => model.getWaterReadings(),
  getYears:               (args) => model.getYears(),
  insertEvent:            (args) => model.insertEvent(args[0]),
  insertReading:          (args) => model.insertReading(args[0]),
  setChargingStatus:      (args) => model.setChargingStatus(args[0], args[1]),
  updateEvent:            (args) => model.updateEvent(args[0]),
}

// TÄHÄN TULEE KAKSI API-RAJAPINTAA: dbApi ja serviceApi
function apiCall (apiName, args) {
  return interface[apiName](args)
}

