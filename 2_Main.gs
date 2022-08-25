const model = new Model()

function doGet (e) {
  if (e.parameters.test) {
    console.log(e.parameters.test)
    return HtmlService.createTemplateFromFile('0_TestBrowserSide').evaluate().setTitle('Tilikirja_test')
  }

  const html = HtmlService.createTemplateFromFile('AppFrame')
  html.profile = (e.parameters.profile) ? e.parameters.profile : ''
  html.version = app.version

  return html
    .evaluate()
    .setTitle('Tilikirja')
    .setFaviconUrl('https://cdn.icon-icons.com/icons2/1385/PNG/512/eur-crypto-cryptocurrency-cryptocurrencies-cash-money-bank-payment_95510.png')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
}

const interface = {
  ackCharges:             (args) => model.ackCharges(args[0], args[1]),
  getAccounts:            (args) => model.getAccounts(),
  getAllData:             (args) => model.getAllData(),
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

function apiCall (apiName, args) {
  return interface[apiName](args)
}


function include (filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent()
}
