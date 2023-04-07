const app = {}

  app.version = '2.5.0 (rel. 13)'
  app.dbId  = '1QeewQlfAR6WmuuonRqYJwSLY6vgfUtaiQbQNfaj9r2U'
  app.printingSheet = '1lVYY_7hIzs6LV3cliD9CzUudKmHgoLcKtGb_JD8sacA'
  app.printEventsSheet = '1ny7uTACEAderhT7oza956uhsHIsgd3nNoFH8FuhMIDk'

  app.include = function(filename) {
    return HtmlService.createTemplateFromFile(filename).evaluate().getContent()
  }