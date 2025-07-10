const app = {}

app.channel          = 'DEV'

app.logSheetId       = '1uFu_ta5Q9TT3k75tttBc5HcFl_vEBhCn_Xd0TCehcQw'
app.printingSheet    = '1lVYY_7hIzs6LV3cliD9CzUudKmHgoLcKtGb_JD8sacA'
app.printEventsSheet = '1ny7uTACEAderhT7oza956uhsHIsgd3nNoFH8FuhMIDk'

switch (app.channel) {

  case 'LIVE':
    app.version   = 'Live DB'
    app.dbSheetId = '1QeewQlfAR6WmuuonRqYJwSLY6vgfUtaiQbQNfaj9r2U'
    app.color     = 'blue'
    break
  
  case 'BETA':
    app.version   = 'BETA, DB = Test'
    app.dbSheetId = '1gs-h1ZPX2VWCZ4za2r8IGHVNu9WBRjnKihBfIvqCxZE'
    app.color     = 'grey'
    break

  default:
    app.version   = 'DEV, DB = Test'
    app.dbSheetId = '1gs-h1ZPX2VWCZ4za2r8IGHVNu9WBRjnKihBfIvqCxZE'
    app.color     = 'red'
}


function include(filename) {
  return HtmlService.createTemplateFromFile(filename).evaluate().getContent()
}

