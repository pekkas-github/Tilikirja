class Model {

  constructor() {
    this.db = DbLib2.getDataAccess(app.dbUrl)
  }

  /* Change selected events as 'payed by A' on the given date */
  ackCharges ({events, date}) {
    const table = this.db.getTable('GL_events')

    events.forEach( (event) => {
      const record = table.getRecord(event.id)
      record.cleared = date
      table.updateRecord(record)
    })

    this.updateChargingSheet()
  }

  getAccounts () {
    return this.db
      .getTable('Accounts')
      .getRecords()
  }


  getAllData () {
    let response = []

    response.push(this.getEvents())
    response.push(this.getWaterReadings())
    response.push(this.getYears())
    response.push(this.getAccounts())
    response.push(this.getCurrentYear())
    response.push(this.getCurrentWaterPrice())

    return response
  }

  getCurrentWaterPrice () {
    // Return current water price record as an object {parameters and calculated total price}
    const price = this.db
      .getTable('Water_Prices2')
      .getRecords()
      .filterAnd('current_value', 'x')[0]

    price.base_part = Math.floor(100 * (price.factor * price.area * price.base_price * 12 / price.consumption + 0.005))/100
    price.total = price.base_part + price.water_price + price.waste_price
    return price
  }

  getCurrentYear () {    
    const years = this.db
      .getTable('Years')
      .getRecords()
      .filterAnd('current', 'x')
    return years[0].year
  }

  getEvents () {
    const events = this.db
      .getTable('GL_events')
      .getRecords()
    const accounts = this.getAccounts()

    //Add account_name field with account name values
    events.forEach( (event) => {
      for(const account of accounts) {
        if (event.account_id === account.id) {
          event.account_name = account.name
          return
        }
      }
    })

    return events
  }


  getWaterConsumption () {
    // Sort last reading first and previous one in order after it
    const readings = this.db
      .getTable('Water_readings')
      .getRecords()
      .sortDesc('id')

    return readings[0].a_reading - readings[1].a_reading
  }


  getWaterPrice () {
    // Return current calculated total price (€/m3)
    return this.getCurrentWaterPrice().total
  }


  getWaterReadings () {
    return this.db
      .getTable('Water_readings')
      .getRecords()
  }

  getYears () {
    return this.db
      .getTable('Years')
      .getRecords()
  }



  insertEvent (eventRecord) {
    const table = this.db.getTable('GL_events')
    const allEvents = table.getRecords()
    const eventYear = eventRecord.date.substring(0,4)
    //Get all events of the event year
    const eventYearRecordset = allEvents.filter((record) => {
      if (record.date.substring(0,4) === eventYear) {
        return record
      }
    })

    //Sort the events in descending order based on event log number
    eventYearRecordset.sort((a, b) => {return b.number - a.number})

    //Define the log number of this event (the first of the year or next after the last event)
    if (eventYearRecordset.length === 0) {
      eventRecord.number = 1
    } else {
      eventRecord.number = eventYearRecordset[0].number + 1
    }
  
    eventRecord.id = table.insertRecord(eventRecord)

    return eventRecord
  }


  insertReading (readingRecord) {
    // Save water reading record and set its id
    readingRecord.id = this.db
      .getTable('Water_readings')
      .insertRecord(readingRecord)

    const consumption = this.getWaterConsumption()
    const price = this.getWaterPrice()
    const a_share = Math.floor(((consumption * price)*100+0.5))/100

    // Create event record
    const event = this.db
      .getTable('GL_events')
      .newRecord()

    event.date = readingRecord.date
    event.event = `Vesimaksu (lukeman mukaan ${consumption} m2)`
    event.total = 0
    event.a_share = a_share
    event.account_id = 6
    event.fiscal_year = readingRecord.fiscal_year

    // Insert event record and return filled event record
    const newEvent = this.insertEvent(event)
    newEvent.account_name = 'Vesi' 
    return {
      newId: readingRecord.id,
      newEvent: newEvent
    }
  }


  setChargingStatus ({id, status}) {
    try {
      const table = this.db.getTable('GL_events')
      const record = table
        .getRecords()
        .filterAnd('id', id)
      record[0].charging = status
      table.updateRecords(record)

      this.updateChargingSheet()
    }
    catch(err) {throw new Error(`Tapahtumaa ei löytynyt tietokannasta.`)}
  }


  updateChargingSheet () {
    const events = this.db
      .getTable('GL_events')
      .getRecords()
    const accounts = this.db
      .getTable('Accounts')
      .getRecords()
    const sheet = SpreadsheetApp
      .openByUrl(app.printingSheet)
      .getSheetByName('Summary')
    const values = []

    sheet.getRange(5, 2, 14, 5).clearContent();

    events.forEach( (event) => {    
      if (event.charging === 'x' && event.cleared === '') {
        const newLine = []
        newLine.push(event.date)
        newLine.push(event.event)
        newLine.push(event.total)
        newLine.push(event.a_share)

        for (const account of accounts) {
          if(account.id === event.account_id) {
            newLine.push(account.name)
            break
          }
        }

        values.push(newLine)
      }
    })

    if (values.length === 0) {return}

    sheet.getRange(5, 2, values.length, 5).setValues(values)
  }

  updateEvent (eventRecord) {
    this.db.getTable('GL_events').updateRecord(eventRecord)
  }
}
