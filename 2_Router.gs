// API name definitions
app.db    = ServerDBMS.openDatabase(app.dbName)
app.model = getModel(app.db)


// API handler
function serverRequest (apiName, method, p1, p2, p3) {

	try {

    if (app[apiName] === undefined) throw new Error(`api\nEi löydy palvelua ${apiName}`)
    if (app[apiName][method] === undefined) throw new Error(`api\nEi löydy metodia ${apiname}.${method}`)

		return app[apiName][method](p1, p2, p3)
	}
	catch (e) {
		e.name = 'SERVER ' + e.name
		throw e
	}
}