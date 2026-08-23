// API handler
function serverRequest ({channel, apiName, method, args}) {

  setupTargetDatabase()

	try {

    if (app[apiName] === undefined) throw new Error(`api\nEi löydy palvelua ${apiName}`)
    if (app[apiName][method] === undefined) throw new Error(`api\nEi löydy metodia ${apiname}.${method}`)

		return app[apiName][method](...args)
	}
	catch (e) {
		e.name = 'SERVER ' + e.name
		throw e
	}
}



/* Määritä oikea tietokantayhteys */

function setupTargetDatabase() {

  switch (ScriptApp.getService().getUrl().slice(-10)) {

    case 'Wwq5S/exec':    // LIVE
      app.dbSheetId = '1UvWqMLl4XWYQ8A78VDFV3tJWYNbGf_sqd6cROhB0R-8'
    break

    case '_HVoQ/exec':    // TEST
      app.dbSheetId = '1xTVfLyotp95O72KSlHqGTNPQ_okRVFB6HCsj7xLN-fQ'
    break

    case 'e04iPQ/dev':    // DEV
      app.dbSheetId = '1xTVfLyotp95O72KSlHqGTNPQ_okRVFB6HCsj7xLN-fQ'
    break
  }

  // API name definitions
  app.Tilikirja = ServerDBMS.openDatabase(app.dbSheetId)
  app.model     = getModel(app.Tilikirja)

}