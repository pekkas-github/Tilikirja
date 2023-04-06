const app = {}

  app.version = '2.5.0 (rel. 13)'
  app.dbId  = '1QeewQlfAR6WmuuonRqYJwSLY6vgfUtaiQbQNfaj9r2U'
  app.dbUrl = 'https://docs.google.com/spreadsheets/d/1QeewQlfAR6WmuuonRqYJwSLY6vgfUtaiQbQNfaj9r2U/edit#gid=0'
  app.printingSheet = 'https://docs.google.com/spreadsheets/d/1lVYY_7hIzs6LV3cliD9CzUudKmHgoLcKtGb_JD8sacA/edit#gid=0'
  app.printEventsSheet = '1ny7uTACEAderhT7oza956uhsHIsgd3nNoFH8FuhMIDk'

  app.include = function(filename) {
    return HtmlService.createTemplateFromFile(filename).evaluate().getContent()
  }