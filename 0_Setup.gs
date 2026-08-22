const app = {}

app.channel          = 'LIVE'

app.logSheetId       = '1D11HT6LGUoKZBQHdzY4cQajDZ73Zy5sFMqlEfFpEz-A'
app.printingSheet    = '1EBJuVH5flkUhPfIxq1zujKCU4oJICGxBjHkdopJUnZM'
app.printEventsSheet = '1iNPoGOOhp6RK8uJuRxh-IlKvqFQaVB8kAcA-XaU2B6U'

switch (app.channel) {

  case 'LIVE':
    app.version   = 'Live DB'
    app.dbSheetId = '1UvWqMLl4XWYQ8A78VDFV3tJWYNbGf_sqd6cROhB0R-8'
    app.color     = 'blue'
    break
  //1UvWqMLl4XWYQ8A78VDFV3tJWYNbGf_sqd6cROhB0R-8
  case 'BETA':
    app.version   = 'BETA, DB = Test'
    app.dbSheetId = '1xTVfLyotp95O72KSlHqGTNPQ_okRVFB6HCsj7xLN-fQ'
    app.color     = 'grey'
    break

  default:
    app.version   = 'DEV, DB = Test'
    app.dbSheetId = '1xTVfLyotp95O72KSlHqGTNPQ_okRVFB6HCsj7xLN-fQ'
    app.color     = 'red'
}


function include(filename) {
  return HtmlService.createTemplateFromFile(filename).evaluate().getContent()
}

