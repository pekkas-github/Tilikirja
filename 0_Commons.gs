const app = {}

  app.version = '20'
  app.dbName  = 'Tilikirja'
  app.version = '21 beta'
  app.dbName  = 'Tilikirja_testing'

  app.dbId  = '1QeewQlfAR6WmuuonRqYJwSLY6vgfUtaiQbQNfaj9r2U'
  app.printingSheet = '1lVYY_7hIzs6LV3cliD9CzUudKmHgoLcKtGb_JD8sacA'
  app.printEventsSheet = '1ny7uTACEAderhT7oza956uhsHIsgd3nNoFH8FuhMIDk'

function include(filename) {
  return HtmlService.createTemplateFromFile(filename).evaluate().getContent()
}

