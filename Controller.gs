class Controller {

  constructor () {
    
    this.model = new Model() 
  }

  ackCharges (params) {

    const events = params[0]
    const date = params[1]

    this.model.ackCharges(events, date)
    this.model.updateChargingSheet()

  }


  loadPageFrame (profile) {

    const html = HtmlService.createTemplateFromFile('PageFrame')
    html.profile = profile
    html.version = app.version

    return html.evaluate().setTitle('Tilikirja').setFaviconUrl('https://cdn.icon-icons.com/icons2/1994/PNG/512/bank_bill_finance_invoice_money_payment_receipt_icon_123239.png')
  }

  getData () {

    let response = []

    const events = this.model.getEvents()
    const accounts = this.model.getAccounts()
    events.forEach( (event) => {
      for(const account of accounts) {
        if (event.account_id === account.id) {
          event.account_name = account.name
          return
        }
      }
    })


    response.push(events)
    response.push(this.model.getWaterReadings())
    response.push(this.model.getYears())
    response.push(accounts)
    response.push(this.model.getCurrentYear())

    return response
  }

  insertEvent (params) {

    const eventRecord = params[0]

    return this.model.insertEvent(eventRecord)
  }

  insertReading (params) {

    let reading = params[0]

    reading = this.model.insertReading(reading)

    const consumption = this.model.getWaterConsumptionAndPrice()

    const event = this.model.insertWaterReadingEvent(reading.date, consumption.amount, consumption.charge, reading.fiscal_year)

    return [event, reading]
  }

  setChargingStatus (params) {

    const id = params[0]
    const status = params[1]

    this.model.setChargingStatus(id, status)
    this.model.updateChargingSheet()
  }

  updateEvent (params) {

    const eventRecord = params[0]

    return this.model.updateEvent(eventRecord)

  }
}

function testEventsNew() {
  const c = new Controller()
  c.getData()
}