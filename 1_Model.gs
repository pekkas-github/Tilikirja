class Model {

  constructor(db) {
    this.db = db
  }

  addEvent(event) {
    const eventsOfYear = this.getEventsOfYear(event.date.substring(0,4))
    
    // Järjestä vuoden toistenumerot laskevaan järjestykseen
    eventsOfYear.sort((a, b) => {return b.number - a.number})

    // Vuoden tositenumero on 1 tai seuraava
    if (eventsOfYear.length === 0) {
      event.number = 1
    }else{
      event.number = eventsOfYear[0].number + 1
    }

    event.id = this.db.getTable('events').insertRecord(event).id
    return event
  }

  getEventsOfYear(year) {
    const events = db.getTable('events').getRecords()
    const eventsOfYear = events.filter( event => {
      if (event.date.substr(0,4) === year) {
        return event
      }
    })

    return eventsOfYear
  }

  getEvents () {
    const events = this.db.getTable('events').getRecords()
    const accounts = this.db.getTable('accounts').getRecords()

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


  printYearlyEventsOnSpreadsheet(year) {
    const events = this.getEvents()
    const listToPrint = []
    console.log(events)
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
    const sheet = SpreadsheetApp.openById(app.printEventsSheet).getSheetByName('EventsList')

    sheet.getRange(1, 2, 1, 1).setValue(year)
    sheet.getRange(4, 1, 100, 7).clearContent();
    sheet.getRange(4, 1, listToPrint.length, 7).setValues(listToPrint)
  }


  updateChargingSheet() {
    const events   = db.getTable('events').getRecords().filter(db.where('cleared', '')).filter(db.where('charging', 'x'))
    const accounts = db.getTable('accounts').getRecords()
    const sheet    = SpreadsheetApp.openById(app.printingSheet).getSheetByName('Summary')
    const values   = []

    sheet.getRange(5, 2, 14, 5).clearContent();

    events.forEach( (event) => {    
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
    })

    if (values.length === 0) {return}
    sheet.getRange(5, 2, values.length, 5).setValues(values)
  }
}
