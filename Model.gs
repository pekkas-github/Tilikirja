class Model {

  constructor() {
    this.db = DbLib2.getDataAccess(app.dbUrl)
  }

  ackCharges (events, date) {

    const table = this.db.getTable('GL_events')

    events.forEach( (event) => {
      const record = table.getRecord(event.id)
      record.cleared = date
      table.updateRecord(record)
    })
  }


  getEvents () {

    const table = this.db.getTable('GL_events')
    return table.getRecords()
  }


  getWaterReadings () {

    const table = this.db.getTable('Water_readings')
    return table.getRecords()
  }

  getYears () {

    const table = this.db.getTable('List_years')
    return table.getRecords()
  }


  getAccounts () {

    const table = this.db.getTable('List_accounts')
    return table.getRecords()
  }


  getCurrentYear () {
    
    const table = this.db.getTable('List_years')
    const years = table.getRecords().filterAnd('DefaultYear', 'x')

    return years[0].Years
  }

  getWaterConsumptionAndPrice () {

    // Last reading first and previous ones in order after it
    const readings = this.db.getTable('Water_readings')
      .getRecords()
      .sortDesc('id')

    // Get current unit price
    const price = this.db.getTable('Water_prices')
      .getRecords()
      .filterAnd('current_price', 'x')[0]
      .Laskennallinen_hinta

    // Calculate consumption (last value - previous value)
    const consumption = readings[0].a_reading - readings[1].a_reading

    // Calculate charge
    const charge = consumption * price

    return {amount:consumption, charge:charge}
  }


  insertEvent (eventRecord) {

    const table = this.db.getTable('GL_events')
    const allEvents = table.getRecords()
    const eventYear = eventRecord.date.substring(0,4)

    //hae tapahtumavuoden kaikki tapahtumat
    const eventYearRecordset = allEvents.filter((record) => {
      if (record.date.substring(0,4) === eventYear) {
        return record
      }
    })
    //järjestä vuoden tapahtumat laskevaan järjestykseen
    eventYearRecordset.sort((a, b) => {return b.number - a.number})

    //määritä tapahtuman numero (1 tai inc)
    if (eventYearRecordset.length === 0) {
      eventRecord.number = 1
    } else {
      eventRecord.number = eventYearRecordset[0].number + 1
    }
  
    eventRecord.id = table.insertRecord(eventRecord)

    return eventRecord
  }


  insertReading (readingRecord) {

    const tableWater = this.db.getTable('Water_readings')
    readingRecord.id = tableWater.insertRecord(readingRecord)

    return readingRecord
  }

  insertWaterReadingEvent (date, consumption, charge, fiscalYear) {

    const tableEvent = this.db.getTable('GL_events')

    //create event record
    let event = tableEvent.newRecord()
    event.date = date
    event.event = `Vesimaksu (lukeman mukaan ${consumption} m2)`
    event.total = 0
    event.a_share = charge
    event.account = 'Vesi'
    event.fiscal_year = fiscalYear

    //insert event record and return filled event record
    return this.insertEvent(event)

  }


  setChargingStatus (id, status) {

    const table = this.db.getTable('GL_events')
    const record = table.getRecords().filterAnd('id', id)
    record[0].charging = status

    table.updateRecords(record)
  }


updateChargingSheet () {

  const table = this.db.getTable('GL_events')
  const sheet = SpreadsheetApp.openByUrl(app.printingSheet).getSheetByName('Summary')

  const events = table.getRecords()
  const values = []

  sheet.getRange(5, 2, 14, 5).clearContent();


  events.forEach( (event) => {
    
    if (event.charging === 'x' && event.cleared === '') {
      const newLine = []
      newLine.push(event.date)
      newLine.push(event.event)
      newLine.push(event.total)
      newLine.push(event.a_share)
      newLine.push(event.account)

      values.push(newLine)
    }
  })

  if (values.length === 0) {return}

  sheet.getRange(5, 2, values.length, 5).setValues(values);

}

  updateEvent (eventRecord) {

  const table = this.db.getTable('GL_events')

  return table.updateRecord(eventRecord)

  }
}

