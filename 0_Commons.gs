const app = {}

  app.version = '24'
  app.dbName  = 'Tilikirja'
  app.version = '25 beta'
  app.dbName  = 'Tilikirja_testing'

  app.printingSheet = '1lVYY_7hIzs6LV3cliD9CzUudKmHgoLcKtGb_JD8sacA'
  app.printEventsSheet = '1ny7uTACEAderhT7oza956uhsHIsgd3nNoFH8FuhMIDk'

function include(filename) {
  return HtmlService.createTemplateFromFile(filename).evaluate().getContent()
}

