app.dbUrl = 'https://docs.google.com/spreadsheets/d/1gs-h1ZPX2VWCZ4za2r8IGHVNu9WBRjnKihBfIvqCxZE/edit#gid=0'
app.version = 'DEV'

function test_Events () {

  const model = new Model()
  const ss = SpreadsheetApp.openByUrl(app.dbUrl)

  t.beforeEach( () => {

    const sheetReplica = ss.getSheetByName('GL_events_repl')
    const sheetOrig = ss.getSheetByName('GL_events')
    
    if (sheetOrig) {
      ss.deleteSheet(sheetOrig)
    }
    
    sheetReplica.copyTo(ss).setName('GL_events')

  })

  t.run('Model.ackCharges - kuittaa veloitukset', () => {
    /* SETUP */
    const events = [{id:330}, {id:331}, {id:333}]
    const sheet = ss.getSheetByName('GL_events')
    const range = sheet.getRange(61,11,4,1)

    /* EXECUTE */
    model.ackCharges(events, '2022-01-01')
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

  t.run('Model.setChargingStatus', () => {

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

  t.run('Water.insertWaterReadingEvent - lukemasta tapahtumaksi', () => {
    
    /* SETUP */

    /* EXECUTE */
    const event = model.insertWaterReadingEvent('2022-01-01', 63, 235.20, 2021)

    /* ASSERT */
    t.isEqual(event.event, 'Vesimaksu (lukeman mukaan 63 m2)', 'Laskettu kulutuksen määrä')
    t.isEqual(event.a_share, 235.20, 'Kulutuksesta laskettu hinta')
    t.isEqual(event.fiscal_year, 2021, 'Tilivuosi')
  })


  t.run('Model.updateEvent - tietueen päivitys', () => {

    /* SETUP */
    const record = {id:330, number:10, date:'2023-04-10', event:'Testing', total:100, a_share:50, account:'Sähkö', comment:'Huihai', fiscal_year:2023, charging:'xx', cleared:'2023-06-06'}

    /* EXECUTE */
    const res = model.updateEvent(record)
    const rec = model.getEvents().filterAnd('id', 330)

    /* ASSERT */
    t.isEqual(res, true, 'Operaation status')
    t.isEqual(rec[0].event, 'Testing', 'Muutettu data')
    t.isEqual(rec[0].cleared, '2023-06-06', 'Viimeinen kenttä muutettu')
  })

  t.run('Model.updateEvent - tietuetta ei löydy', () => {

    /* SETUP */
    const record = {id:999, number:10, date:'2023-04-10', event:'Testing', total:100, a_share:50, account:'Sähkö', comment:'Huihai', fiscal_year:2023, charging:'xx', cleared:'2023-06-06'}

    /* EXECUTE */
    const res = model.updateEvent(record)

    /* ASSERT */
    t.isEqual(res, false, 'Operaation status')
  })

}

function test_Water() {

  const model = new Model()
  const ss = SpreadsheetApp.openByUrl(app.dbUrl)

  t.beforeEach( () => {

    const sheetReplica = ss.getSheetByName('Water_readings_repl')
    const sheetOrig = ss.getSheetByName('Water_readings')
    
    if (sheetOrig) {
      ss.deleteSheet(sheetOrig)
    }
    
    sheetReplica.copyTo(ss).setName('Water_readings')

  })

  t.run('Water.insertReading - uusi lukema', () => {
    
    /* SETUP */
    const record = {id:0, date:'2022-01-01', master_reading:2000, a_reading:4900, b_reading:3000, comment:'Huihai'}

    /* EXECUTE */
    const reading = model.insertReading(record)

    /* ASSERT */
    t.isEqual(reading.id, 43, 'Tietueen ensimmäisen kentän arvo')
    t.isEqual(reading.comment, 'Huihai', 'Tietueen viimeisen kentän arvo')
  })

  t.run('Water.getConsumptionAndPrice', () => {

    /* EXECUTE */
    const consumption = model.getWaterConsumptionAndPrice()

    /* ASSERT */
    t.isEqual(consumption.amount, 63, 'Kulutuslukema')
    t.isEqual(consumption.charge, 252, 'Veloitus')
  })

}