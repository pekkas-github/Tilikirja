class Model {

  constructor() {
    this.db = DbLib2.getDataAccess(app.dbUrl)
  }

  /* Change selected events as 'payed by A' on the given date */
  ackCharges (events, date) {
    const table   = this.db.getTable('GL_events')
    
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

  //private
  getWaterConsumption () {
    // Sort last reading first and previous one in order after it
    const readings = this.db
      .getTable('Water_readings')
      .getRecords()
      .sortDesc('id')

    return readings[0].a_reading - readings[1].a_reading
  }

  //private
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

  insertEvent(newEvent) {
    const table = this.db.getTable('GL_events')
    
    newEvent.number = this.getNewEventNumber(newEvent)  
    newEvent.id = table.insertRecord(newEvent)

    return newEvent
  }

  //private
  getNewEventNumber(newEvent) {
    const eventYear = newEvent.date.substring(0,4)
    const allEvents = this.db.getTable('GL_events').getRecords()
    
    //Filter out events of the year
    const eventYearEvents = allEvents.filter((event) => {
      if (event.date.substring(0,4) === eventYear) {
        return event
      }
    })
    
    //Sort the events in descending order based on event log number (latest on top)
    eventYearEvents.sort((a, b) => {return b.number - a.number})

    //Return 1 or next
    if (eventYearEvents.length === 0) {
      return 1
    }    
    return eventYearEvents[0].number + 1
  }


  insertReading (reading) {
    // Save water reading record and set its id
    reading.id = this.db
      .getTable('Water_readings')
      .insertRecord(reading)

    const consumption = this.getWaterConsumption()
    const price = this.getWaterPrice()
    const a_share = Math.floor(((consumption * price)*100+0.5))/100

    // Create event record
    const event = this.db
      .getTable('GL_events')
      .newRecord()

    event.date = reading.date
    event.event = `Vesimaksu (lukeman mukaan ${consumption} m2)`
    event.total = 0
    event.a_share = a_share
    event.account_id = 6
    event.fiscal_year = reading.fiscal_year

    // Insert event record and return filled event record
    const newEvent = this.insertEvent(event)
    newEvent.account_name = 'Vesi' 
    return {
      newId: reading.id,
      newEvent: newEvent
    }
  }


  setChargingStatus (id, status) {
    try {
      const table = this.db.getTable('GL_events')
      const record = table
        .getRecords()
        .filterAnd('id', id)
      record[0].charging = status
      table.updateRecords(record)

      this.updateChargingSheet()
    }

    catch(err) {
      throw new Error(`Tapahtumaa ei löytynyt tietokannasta.`)
    }
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

  updateEvent (event) {
    this.db.getTable('GL_events').updateRecord(event)
  }
}