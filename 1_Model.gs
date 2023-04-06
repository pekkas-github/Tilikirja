// VALTAOSA TÄMÄN MODULIN LOGIIKASTA SIIRRETÄÄN SELAINPÄÄHÄN. AINOASTAAN SHEETS-TAULUKOIDEN PÄIVITYKSIIN
// LIITTYÄVT METODIT JÄÄVÄT. MUILTA OSIN MAIN:STA VIITATAAN SUORAAN DBLIB-METODEIHIN
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

  
  getCurrentWaterPrice () {
    // Return current water price record with calculated base price and total usage price
    const price = this.db
      .getTable('Water_Prices2')
      .getRecords()
      .where('current_value', 'x')[0]

    price.base_part = Math.floor(100 * (price.factor * price.area * price.base_price + 0.005))/100
    price.usage = price.water_price + price.waste_price
    return price
  }

  getCurrentYear () {    
    const years = this.db
      .getTable('Years')
      .getRecords()
      .where('current', 'x')
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

  //private - return consumption of a-dept.
  getWaterConsumption () {
    // Sort last reading first [0]. Previous reading is the next one [1].
    const readings = this.db
      .getTable('Water_readings')
      .getRecords()
      .sortDesc('id')

    // A consumption is master cons - b cons
    return (readings[0].master_reading - readings[1].master_reading) - (readings[0].b_reading - readings[1].b_reading)
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

  insertEvent(newEvent) {
    const table = this.db.getTable('GL_events')
    
    newEvent.number = this.getNewEventNumber(newEvent)  
    newEvent.id = table.insertRecord(newEvent)

    return newEvent
  }


  insertReading (reading) {
    // Save water reading record and set its id
    reading.id = this.db
      .getTable('Water_readings')
      .insertRecord(reading)

    //Charging per every three months 
    const a_consumption = this.getWaterConsumption()
    const price = this.getCurrentWaterPrice()
    const a_share = Math.floor(((a_consumption * price.usage + 3 * price.base_part / 2)*100+0.5))/100 

    // Create event record
    const event = this.db
      .getTable('GL_events')
      .newRecord()

    event.date = reading.date
    event.event = `Vesimaksu (lukeman mukaan ${a_consumption} m2)`
    event.total = 0
    event.a_share = a_share
    event.account_id = 6
    event.fiscal_year = reading.fiscal_year

    // Insert event record and return filled event record
    const newEvent = this.insertEvent(event)
    newEvent.account_name = 'Vesi' 
    return {
      newReading: reading,
      newEvent: newEvent
    }
  }

  printYearlyEventsOnSpreadsheet(year) {
    const events = this.getEvents()
    const listToPrint = []
    for (const event of events) {
      const line = []
      if (parseInt(event.date.substring(0, 4)) === year) {
        line.push(event.number)
        line.push(event.date)
        line.push(event.event)
        line.push(event.total)
        line.push(event.a_share)
        const b_share = (event.total - event.a_share < 0) ? 0 : event.total - event.a_share
        line.push(b_share)
        line.push(event.account_name)
        listToPrint.push(line)
      }
    }
    const sheet = SpreadsheetApp
      .openById(app.printEventsSheet)
      .getSheetByName('EventsList')

    sheet.getRange(1, 2, 1, 1).setValue(year)
    sheet.getRange(4, 1, 100, 7).clearContent();
    sheet.getRange(4, 1, listToPrint.length, 7).setValues(listToPrint)
  }

  setChargingStatus (id, status) {
    try {
      const table = this.db.getTable('GL_events')
      const record = table
        .getRecords()
        .where('id', id)
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
