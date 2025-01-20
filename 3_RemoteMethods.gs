function getModel(Db) {

  const public = {}
  const db = Db

  // Generoi tapahtumatietueelle id sekä tositenumero ja talleta events-tauluun.
  // Palauta täydennetty tietue clientille.
  public.addEvent = (event) => {

    const eventsOfYear = getEventsByCalendarYear(event.date.substring(0,4))

    // Järjestä vuoden toistenumerot laskevaan järjestykseen
    eventsOfYear.sort((a, b) => {return b.number - a.number})

    // Vuoden tositenumero on 1 tai seuraava
    if (eventsOfYear.length === 0) {
      event.number = 1
    }else{
      event.number = eventsOfYear[0].number + 1
    }

    event.id = db.getTable('events').insertRecord(event).id
    return event
  }

  public.getEventNumber = (year) => {

    /* Hae annetun vuoden vuositietue */
    const recYear = db.getRecords('years').where('year', year)[0]

    /* Poimi kyseisen vuodan seuraava tositenumero ja kasvatetaan sitä yhdellä */ 
    const nextEventNro = recYear.nextEventNro
    recYear.nextEventNro ++

    /* Päivitä seuraava tositenumero tietokantaan */ 
    db.updateRecord('years', recYear)

    return nextEventNro
  }

  // Kirjoita valitun vuoden tapahtumat ja tilikohtainen yhteenveto
  // Sheets-tauluun tulostamista varten.
  public.printYearResumeOnSheet = (year) => {

    printEvents(year)
    printSummary(year)
  }

  // Kirjoita veloitettavat tapahtumat ja veloitettava summa
  // Sheets-tauluun tulostamista varten
  public.updateChargingSheet = () => {

    const events   = db.getRecords('events').where('cleared', '').where('charging', 'x')
    const accounts = db.getRecords('accounts')
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

// PRIVATE METHODS

  // Palauta kalenterivuoden kaikki tapahtumatietueet.
  // Lisää tilien selväkieliset nimet.
  public.getEventsByCalendarYear = (year) => {

    const events   = db.getRecords('events')
    const accounts = db.getRecords('accounts')

    const eventsOfYear = events.filter( event => {
      if (event.date.substr(0,4) === year) {
        for(const account of accounts) {
          if (event.account_id === account.id) {
            event.account_name = account.name
          }
        }

      return event
      }
    })

    return eventsOfYear
  }

  // Palauta tilivuodelle kohdistuvat kaikki tapahtumat.
  // Lisää tilien selväkieliset nimet.
  public.getEventsByFiscalYear =  (year) => {

    const events   = db.getRecords('events')
    const accounts = db.getRecords('accounts')
    const fiscalYear = parseInt(year)

    //Add account_name field with account name values
    const eventsOfYear = events.filter( event => {
      if (event.fiscal_year === fiscalYear) {
        for(const account of accounts) {
          if (event.account_id === account.id) {
            event.account_name = account.name
          }
        }
      return event
      }
    })
    return eventsOfYear
  }

  // Kirjoita kalenterivuoden tapahtumat Sheet-taulukkoon
  const printEvents = (year) => {

    const eventsOfCalendarYear = public.getEventsByCalendarYear(year)
    const listToPrint = []
    const sheet = SpreadsheetApp.openById(app.printEventsSheet).getSheetByName('EventsList')

    for (const event of eventsOfCalendarYear) {
      const line = []
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

    sheet.getRange(1, 3, 1, 1).setValue(year)
    sheet.getRange(4, 1, 100, 20).clearContent();

    if (listToPrint.length > 0) {
      sheet.getRange(4, 1, listToPrint.length, 7).setValues(listToPrint)
    }
  }

  // Kirjoita tilivuoden yhteenveto Sheet-taulukkoon
  const printSummary = (year) => { 

    const eventsOfFiscalYear = public.getEventsByFiscalYear(year)
    const summaryByAccount = {} 
    const sheet = SpreadsheetApp.openById(app.printEventsSheet).getSheetByName('EventsList')

    // Laske tilikohtaisesti tapahtumien summa (kaikki ja per asunto)
    eventsOfFiscalYear.forEach( (event) => {
      if (summaryByAccount[event.account_name]) {
        summaryByAccount[event.account_name].tot += event.total
        summaryByAccount[event.account_name].a += event.a_share
        summaryByAccount[event.account_name].b += event.total - event.a_share
      }else{
        summaryByAccount[event.account_name] = {tot:event.total, a:event.a_share, b:(event.total - event.a_share)}
      }
    })

    // Laske kaikkien tilien kokonaissumma per yhtiö ja asunnot
    const sums = {tot:0, a:0, b:0}
    for (const key in summaryByAccount) {
      sums.tot += summaryByAccount[key].tot
      sums.a += summaryByAccount[key].a
      sums.b += summaryByAccount[key].b
    }
    const total = sums

    // Muuta objektirakenne{{}} array-rakenteeksi [[]]
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

  return public
}
