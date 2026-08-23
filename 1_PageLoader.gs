function doGet (e) {

  app.profile = e.parameter.profile 

  /* Värien ja footerin kanavakohtainen määritys */

  switch (ScriptApp.getService().getUrl().slice(-10)) {

    case 'Wwq5S/exec':    // LIVE
      app.color     = 'blue'
      app.version   = 'LIVE'
      // Vain vierailijakäynnit lokitetaan
      if (app.profile === 'user') {
        app.profile = 'visitor'
        logUser('visitor')
      }
    break

    case '_HVoQ/exec':    // TEST
      app.color     = 'grey'
      app.version   = 'TEST / TESTDB'
      if (!app.profile) {app.profile = 'testing'}  // else admin
    break

    case 'e04iPQ/dev':    // DEV
      app.color     = 'red'
      app.version   = 'DEV / TESTDB'
      app.profile   = 'admin'
    break

    default:
      alert('Huom! LIVE-projektin DEV-koodiversiota ei pysty ajamaan. Siirry DEV-projektiin.')
  }


  const args = {}
  args.myLibraries = include('app_Libraries')
  args.myScripts   = include('app_Scripts')
  args.myStyles    = include('app_Styles')
  args.callParams  = e.parameter
  args.color       = app.color

  const html = FramePages.getFrame(args)

  return html
    .evaluate()
    .setTitle('Tilikirja')
    .setFaviconUrl('https://cdn.icon-icons.com/icons2/1385/PNG/512/eur-crypto-cryptocurrency-cryptocurrencies-cash-money-bank-payment_95510.png')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
}


/* Vierailijatiedon lokitus */

function logUser (profile) {
  
  const logDb   = ServerDBMS.openDatabase(app.logSheetId)

  const logEvent   = logDb.newRecord('UserLog')
  logEvent.date    = new Date().toLocaleDateString()
  logEvent.profile = profile

  logDb.insertRecord('UserLog', logEvent)
}
