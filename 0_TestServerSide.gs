app.version = 'DEV'
app.dbUrl = 'https://docs.google.com/spreadsheets/d/1gs-h1ZPX2VWCZ4za2r8IGHVNu9WBRjnKihBfIvqCxZE/edit#gid=0'

function testInfo() {
  TestFrame.getInfo()
}

function resumeTable(sheetName) {
  const ss = SpreadsheetApp.openByUrl(app.dbUrl)
  const sheetReplica = ss.getSheetByName(`${sheetName}_repl`)
  const sheetOrig = ss.getSheetByName(sheetName)      
  if (sheetOrig) {
    ss.deleteSheet(sheetOrig)
  }
  sheetReplica.copyTo(ss).setName(sheetName)

}

function test_Events () {
  const t = TestFrame.getTestFrame()

  t.test('Events Module tests', () => {

  const model = new Model()
  const ss = SpreadsheetApp.openByUrl(app.dbUrl)

  t.beforeEach( () => {

    resumeTable('GL_events')
    resumeTable('Water_readings')
  })

  t.run('Model.ackCharges - kuittaa veloitukset', () => {
    /* SETUP */
    const testEvents = [{id:330}, {id:331}, {id:333}]
    const sheet = ss.getSheetByName('GL_events')
    const range = sheet.getRange(61,11,4,1)

    /* EXECUTE */
    model.ackCharges({events:testEvents, date:'2022-01-01'})
    const values =range.getValues()

    /* ASSERT */
    t.isEqual(values[0][0], '2022-01-01', 'Ensimmäinen kuitattu')
    t.isEqual(values[2][0], '', 'Ei kuitaatava')
    t.isEqual(values[3][0], '2022-01-01', 'Viimeinen kuitattava')
  })

  t.run('Model.ackCharges - kuitattavan veloituksen id:tä ei löydy', () => {
    /* SETUP */
    t.errorExpected('Tietuetta (336) ei löydy.')
    const testEvents = [{id:330}, {id:331}, {id:336, event:'Testitapahtuma'}]
    const sheet = ss.getSheetByName('GL_events')
    const range = sheet.getRange(61,11,4,1)

    /* EXECUTE */
    model.ackCharges({events:testEvents, date:'2022-01-01'})
    const values =range.getValues()

    /* ASSERT */
    t.isEqual(values[0][0], '2022-01-01', 'Ensimmäinen kuitattu')
    t.isEqual(values[2][0], '', 'Ei kuitaatava')
    t.isEqual(values[3][0], '2022-01-01', 'Viimeinen kuitattava')
  })

  t.run('Model.getEvents', () => {

    const response = model.getEvents()

    t.isEqual(response.length, 62, 'Tietueiden lukumäärä')
  })

  t.run('Model.getCurrentYear', () => {
    const response = model.getCurrentYear()
  
    t.isEqual(response, '2021', 'Oletusvuosi')
  })

  t.run('Model.setChargingStatus - tietue löytyy', () => {

    const sheet = ss.getSheetByName('GL_events')
    const range = sheet.getRange(60, 10, 2, 1)

    /*EXECUTE*/
    model.setChargingStatus(329, 'x')
    model.setChargingStatus(330, '')

    /*ASSERT*/
    const values = range.getValues()
    t.isEqual(values[0][0], 'x', 'Ensimmäinen asetus')
    t.isEqual(values[1][0], '', 'Toinen asetus')
  })

  t.run('Model.setChargingStatus - tietuetta ei löydy', () => {
    /*SETUP*/
    t.errorExpected('Tapahtumaa ei löytynyt tietokannasta.')

    /*EXECUTE*/
    model.setChargingStatus(500, 'x')
  })


  t.run('Model.insertEvent - uuden tapahtuman lisäys', () => {
    /* SETUP */
    const record = {id:0, number:0, date:'2020-04-10', event:'Testing', total:100, a_share:50, account:'Sähkö', comment:'Huihai', fiscal_year:2021}

    /* EXECUTE */
    const res = model.insertEvent(record)

    /* ASSERT */
    t.isEqual(res.id, 335, 'Tietueen id')
    t.isEqual(res.number, 28, 'Tapahtuman numero')
  })

  t.run('Model.insertEvent - vuoden ensimmäisen tapahtuman lisäys', () => {
    /* SETUP */
    const record = {id:0, number:0, date:'2023-04-10', event:'Testing', total:100, a_share:50, account:'Sähkö', comment:'Huihai', fiscal_year:2023}

    /* EXECUTE */
    const res = model.insertEvent(record)

    /* ASSERT */
    t.isEqual(res.id, 335, 'Tietueen id')
    t.isEqual(res.number, 1, 'Tapahtuman numero')
  })

  t.run('Water.insertReading - lukemasta tapahtumaksi', () => {
    
    /* SETUP */

    /* EXECUTE */
    const event = model.insertReading({id:0, date:'2022-01-01', master_reading:500, a_reading:4822, b_reading:5282, fiscal_year:2022, comment:'Test'})

    /* ASSERT */
    t.isEqual(event.newId, 43, 'Uuden tietueen id')
    t.isEqual(event.newEvent.event, 'Vesimaksu (lukeman mukaan 10 m2)', 'Laskettu kulutuksen määrä')
    t.isEqual(event.newEvent.a_share, 41.30, 'Kulutuksesta laskettu hinta')
    t.isEqual(event.newEvent.fiscal_year, 2022, 'Tilivuosi')
  })


  t.run('Model.updateEvent - tietueen päivitys', () => {

    /* SETUP */
    const record = {id:330, number:10, date:'2023-04-10', event:'Testing', total:100, a_share:50, account:'Sähkö', comment:'Huihai', fiscal_year:2023, charging:'xx', cleared:'2023-06-06'}

    /* EXECUTE */
    const res = model.updateEvent(record)
    const rec = model.getEvents().filterAnd('id', 330)

    /* ASSERT */
    t.isEqual(rec[0].event, 'Testing', 'Muutettu data')
    t.isEqual(rec[0].cleared, '2023-06-06', 'Viimeinen kenttä muutettu')
  })

  t.run('Model.updateEvent - tietuetta ei löydy', () => {

    /* SETUP */
    t.errorExpected('Tietuetta (999) ei löydy.')
    const record = {id:999, number:10, date:'2023-04-10', event:'Testing', total:100, a_share:50, account:'Sähkö', comment:'Huihai', fiscal_year:2023, charging:'xx', cleared:'2023-06-06'}

    /* EXECUTE */
    model.updateEvent(record)
  })
})
}

function test_Water() {
  const t = TestFrame.getTestFrame()

  t.test('Water Module tests', () => {
    const model = new Model()

    t.beforeEach( () => {

      resumeTable('Water_readings')
      resumeTable('GL_events')      
    })

    t.run('Water.insertReading - uusi lukema', () => {
      
      /* SETUP */
      const record = {id:0, date:'2022-01-01', master_reading:2000, a_reading:4900, b_reading:3000, comment:'Huihai', fiscal_year: 2022}

      /* EXECUTE */
      const res = model.insertReading(record)

      /* ASSERT */
      t.isEqual(res.newId, 43, 'Lukematietueen id')
      t.isEqual(res.newEvent.id, 335, 'Tapahtumatietueen id')
      t.isEqual(res.newEvent.account_id, 6, 'Tilin nimi')
      t.isEqual(res.newEvent.a_share - 363.44, 0, 'A-asunnon osuus')
      t.isEqual(res.newEvent.fiscal_year, 2022, 'Tilivuosi')
    })

    t.run('Water.getWaterConsumption', () => {

      /* EXECUTE */
      const consumption = model.getWaterConsumption()

      /* ASSERT */
      t.isEqual(consumption, 59, 'Kulutuslukema')
    })

    t.run('Water.getWaterPrice', () => {

      /* EXECUTE */
      const price = model.getWaterPrice()

      /* ASSERT */
      t.lessThan(price - 4.13, 0.0001, 'Veloitus')
    })
  })
}

function singleTest() {
  const t = TestFrame.getTestFrame()

  t.beforeEach( () => {
    resumeTable('GL_events')
    resumeTable('Water_readings')
  })

  t.test('Single Test', () => {
    const model = new Model()
    
    t.run('Water.getWaterConsumption', () => {

      /* EXECUTE */
      const consumption = model.getWaterConsumption()

      /* ASSERT */
      t.isEqual(consumption, 59, 'Kulutuslukema')
    })

  })
}
