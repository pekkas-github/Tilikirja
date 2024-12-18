/*
function serverRequest_old (route, method, p1, p2, p3) {

  if (route === 'Db') return db[method](p1, p2, p3)
  if (route === 'Cmd') return model[method](p1, p2, p3)
}
*/

// API name definitions
app.db    = ServerDBMS.openDatabase(app.dbName)
app.model = getModel(app.db)


// API handler
function serverRequest (apiName, method, p1, p2, p3) {

	try {
		return app[apiName][method](p1, p2, p3)
	}
	catch (e) {
		e.name = 'SERVER ERROR IN'
		throw e
	}
}