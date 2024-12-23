function doGet (e) {
  app.profile = e.parameter.profile  // admin-profiili näyttää kaikki kontrollit

  /* Jos profiilia ei ole määritelty, kyse on vierailijasta */

  if (app.profile === undefined) {
    app.profile = "visitor"
  }
  logUser(app.profile)

  const args = {}
  args.myLibraries = include('app_Libraries')
  args.myScripts   = include('app_Scripts')
  args.myStyles    = include('app_Styles')
  args.callParams  = e.parameter
  args.color       = (app.test) ? 'red' : 'blue'

  const html = FramePages.getFrame(args)

  return html
    .evaluate()
    .setTitle('Tilikirja')
    .setFaviconUrl('https://cdn.icon-icons.com/icons2/1385/PNG/512/eur-crypto-cryptocurrency-cryptocurrencies-cash-money-bank-payment_95510.png')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
}


function logUser (profile) {

  /* Lisää prefix, jos ollaan testimoodissa */

  const prefix = (app.test) ? 'Test - ' : ''
  
  /* Talleta käyttäjän profiili ja aikaleima lokiin*/

  const logDb   = ServerDBMS.openDatabase(app.logName)

  const logEvent   = logDb.newRecord('UserLog')
  logEvent.date    = new Date().toLocaleDateString()
  logEvent.profile = prefix + profile

  logDb.insertRecord('UserLog', logEvent)
}