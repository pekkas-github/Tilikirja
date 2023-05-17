const db    = DbLib2.getDataAccess(app.dbId)
const model = new Model(db)

function api(methodName, arg1, arg2, arg3) {
  return model[methodName](arg1, arg2, arg3)
}

function dbApi(methodName, arg1, arg2, arg3) {
  return db[methodName](arg1, arg2, arg3)
}

function doGet (e) {
  if (e.parameters.test) {
    console.log(e.parameters.test)
    return HtmlService.createTemplateFromFile('0_TestBrowserSide').evaluate().setTitle('Tilikirja_test')
  }

  if (e.parameter.profile === 'user') {
    const sheet = SpreadsheetApp.openById(app.dbId).getSheetByName('Visitor')
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
