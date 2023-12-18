const db    = ServerDBMS.openDatabase(app.dbName)
model       = getModel(db)

function doGet (e) {
  if (e.parameter.profile === 'user') {
    const sheet = SpreadsheetApp.openById(app.dbId).getSheetByName('Visitor')
    const range = sheet.getRange(sheet.getLastRow()+1, 1, 1, 1)
    const date = new Date().toLocaleDateString()
    range.setValue(date)
  }

  const args = {}
  args.myLibraries = include('app_Libraries')
  args.myScripts   = include('app_Scripts')
  args.myStyles    = include('app_Styles')
  args.callParams  = e.parameter
  args.color       = 'blue'

  const html = FramePages.getFrame1(args)

  return html
    .evaluate()
    .setTitle('Tilikirja')
    .setFaviconUrl('https://cdn.icon-icons.com/icons2/1385/PNG/512/eur-crypto-cryptocurrency-cryptocurrencies-cash-money-bank-payment_95510.png')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
}
