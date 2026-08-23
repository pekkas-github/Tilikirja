const app = {}

app.logSheetId       = '1D11HT6LGUoKZBQHdzY4cQajDZ73Zy5sFMqlEfFpEz-A'
app.printingSheet    = '1EBJuVH5flkUhPfIxq1zujKCU4oJICGxBjHkdopJUnZM'
app.printEventsSheet = '1iNPoGOOhp6RK8uJuRxh-IlKvqFQaVB8kAcA-XaU2B6U'


function include(filename) {
  return HtmlService.createTemplateFromFile(filename).evaluate().getContent()
}

