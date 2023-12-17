const db    = ServerDBMS.openDatabase(app.dbName)
model       = getModel(db)

function api(methodName, arg1, arg2, arg3) {
  const lock = LockService.getScriptLock()
  const locked = lock.tryLock(15000)

  if(locked) {
    return model[methodName](arg1, arg2, arg3)
  }
  throw new Error('Tietokantaoperaation timeout ylittyi.')
}

function dbApi(methodName, arg1, arg2, arg3) {
  const lock = LockService.getScriptLock()
  const locked = lock.tryLock(15000)

  if(locked) {
    return db[methodName](arg1, arg2, arg3)
  }
  throw new Error('Tietokantaoperaation timeout ylittyi.')
}

function initApi(methodName, a1, a2, a3) {
  return db[methodName](a1, a2, a3)
}

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

//  const html = HtmlService.createTemplateFromFile('frame')
//  html.profile = (e.parameters.profile) ? e.parameters.profile : ''
//  html.version = app.version

  return html
    .evaluate()
    .setTitle('Tilikirja')
    .setFaviconUrl('https://cdn.icon-icons.com/icons2/1385/PNG/512/eur-crypto-cryptocurrency-cryptocurrencies-cash-money-bank-payment_95510.png')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
}

function include(filename) {
  return HtmlService.createTemplateFromFile(filename).evaluate().getContent()
}

