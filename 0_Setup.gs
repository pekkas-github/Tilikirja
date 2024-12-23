const app = {}

app.version          = 'DB = Live'
app.dbName           = 'Tilikirja'
app.logName          = 'Tilikirja_log'
app.printingSheet    = '1lVYY_7hIzs6LV3cliD9CzUudKmHgoLcKtGb_JD8sacA'
app.printEventsSheet = '1ny7uTACEAderhT7oza956uhsHIsgd3nNoFH8FuhMIDk'
app.test             = true

if (app.test) {
  app.dbName         = 'Tilikirja_testing'
  app.version        = `** DB = ${app.dbName} **`
}

function include(filename) {
  return HtmlService.createTemplateFromFile(filename).evaluate().getContent()
}

