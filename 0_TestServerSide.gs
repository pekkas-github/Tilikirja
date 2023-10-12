app.version = 'DEV'
app.dbId = '1gs-h1ZPX2VWCZ4za2r8IGHVNu9WBRjnKihBfIvqCxZE'


function test_Events () {
  const t = TestFrame.getTestFrame(app.dbId)

  t.test('Events Module tests', () => {

  const model = new Model(db)
  const ss = SpreadsheetApp.openById(app.dbId)

  t.beforeEach( () => {

    t.resumeTable('events')
  })

 
  t.run('Model.getEvents', () => {

    const response = model.getEvents()

    t.isEqual(response.length, 62, 'Tietueiden lukumäärä')
  })


  t.run('Model.addEvent - uuden tapahtuman lisäys', () => {
    /* SETUP */
    const record = {id:0, number:0, date:'2020-04-10', event:'Testing', total:100, a_share:50, account:'Sähkö', comment:'Huihai', fiscal_year:2021}

    /* EXECUTE */
    const res = model.addEvent(record)

    /* ASSERT */
    t.isEqual(res.id, 335, 'Tietueen id')
    t.isEqual(res.number, 28, 'Tapahtuman numero')
  })


  t.run('Model.addEvent - vuoden ensimmäisen tapahtuman lisäys', () => {
    /* SETUP */
    const record = {id:0, number:0, date:'2023-04-10', event:'Testing', total:100, a_share:50, account:'Sähkö', comment:'Huihai', fiscal_year:2023}

    /* EXECUTE */
    const res = model.addEvent(record)

    /* ASSERT */
    t.isEqual(res.id, 335, 'Tietueen id')
    t.isEqual(res.number, 1, 'Tapahtuman numero')
  })
  })
}


function singleTest() {
  const t = TestFrame.getTestFrame(app.dbId)
  const db = ServerDBMS.getDataAccess(app.dbId)
  
  t.beforeEach( () => {
    t.resumeTable('events')
  })

  t.test('Single Test', () => {
    const model = getModel(db)
    
  t.run('Model.addEvent - uuden tapahtuman lisäys', () => {
    /* SETUP */
    const record = {id:0, number:0, date:'2020-04-10', event:'Testing', total:100, a_share:50, account:'Sähkö', comment:'Huihai', fiscal_year:2021}

    /* EXECUTE */
    const res = model.addEvent(record)

    /* ASSERT */
    t.isEqual(res.id, 335, 'Tietueen id')
    t.isEqual(res.number, 28, 'Tapahtuman numero')
  })

  })
}

function test_PrintSummary() {
  const model = getModel(db)
  model.printYearlyEventsOnSpreadsheet(2020)
}
