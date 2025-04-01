const app = {}

app.version          = 'DB = Live'
app.dbSheetId        = '1QeewQlfAR6WmuuonRqYJwSLY6vgfUtaiQbQNfaj9r2U'
app.logSheetId       = '1uFu_ta5Q9TT3k75tttBc5HcFl_vEBhCn_Xd0TCehcQw'
app.printingSheet    = '1lVYY_7hIzs6LV3cliD9CzUudKmHgoLcKtGb_JD8sacA'
app.printEventsSheet = '1ny7uTACEAderhT7oza956uhsHIsgd3nNoFH8FuhMIDk'
app.test             = true // Test mode = true

if (app.test) {
  app.dbSheetId      = '1gs-h1ZPX2VWCZ4za2r8IGHVNu9WBRjnKihBfIvqCxZE'
  app.version        = `** DB = Test **`
}

function include(filename) {
  return HtmlService.createTemplateFromFile(filename).evaluate().getContent()
}

