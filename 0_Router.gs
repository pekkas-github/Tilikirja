function serverRequest (route, method, p1, p2, p3) {

  if (route === 'Db') return db[method](p1, p2, p3)
  if (route === 'Cmd') return model[method](p1, p2, p3)
}
