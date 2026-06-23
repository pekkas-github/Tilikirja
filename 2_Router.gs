// API name definitions
app.Tilikirja = ServerDBMS.openDatabase(app.dbSheetId)
app.model     = getModel(app.Tilikirja)


// API handler
function serverRequest ({channel, apiName, method, args}) {

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