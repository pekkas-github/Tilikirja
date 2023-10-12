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
    const accounts = this.db.getTable('accounts').getRecords()
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
    const sheet = SpreadsheetApp.openById(app.printEventsSheet).getSheetByName('EventsList')

    sheet.getRange(1, 3, 1, 1).setValue(year)
    sheet.getRange(4, 1, 100, 20).clearContent();

    if (listToPrint.length > 0) {
      sheet.getRange(4, 1, listToPrint.length, 7).setValues(listToPrint)
    }

    const summaryByAccount = {} 

    //Calculate summation per account per fiscal year
    events.forEach( (event) => {
      if (event.fiscal_year === year) {
        if (summaryByAccount[event.account_name]) {
          summaryByAccount[event.account_name].tot += event.total
          summaryByAccount[event.account_name].a += event.a_share
          summaryByAccount[event.account_name].b += event.total - event.a_share
        }else{
          summaryByAccount[event.account_name] = {tot:event.total, a:event.a_share, b:(event.total - event.a_share)}
        }
      }
    })

    //Calculate total per party
    const sums = {tot:0, a:0, b:0}
    for (const key in summaryByAccount) {
      sums.tot += summaryByAccount[key].tot
      sums.a += summaryByAccount[key].a
      sums.b += summaryByAccount[key].b
    }
    const total = sums

    // Change into Sheets array format
    const summary = []
    for (const key in summaryByAccount) {
      const line = []
      line.push(key)
      line.push(summaryByAccount[key].tot)
      line.push(summaryByAccount[key].a)
      line.push(summaryByAccount[key].b)
      summary.push(line)
    }
    
    const totalLine = [['Yhteensä', total.tot, total.a, total.b]]
    
    if (summary.length > 0) {
      sheet.getRange(4, 9, summary.length, 4).setValues(summary)
    }
    sheet.getRange(10, 9, 1, 4).setValues(totalLine)
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
