const model = new Model()

function doGet (e) {

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
  ackCharges:             model.ackCharges.bind(model),
  getAccounts:            model.getAccounts.bind(model),
  getAllData:             model.getAllData.bind(model),
  getCurrentWaterPrice:   model.getCurrentWaterPrice.bind(model),
  getCurrentYear:         model.getCurrentYear.bind(model),
  getEvents:              model.getEvents.bind(model),
  getWaterReadings:       model.getWaterReadings.bind(model),
  getYears:               model.getYears.bind(model),
  insertEvent:            model.insertEvent.bind(model),
  insertReading:          model.insertReading.bind(model),
  setChargingStatus:      model.setChargingStatus.bind(model),
  updateEvent:            model.updateEvent.bind(model)
}

function apiCall (apiName, args) {
  return interface[apiName](args)
}


function include (filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent()
}