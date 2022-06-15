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

    return html.evaluate()
  }

  getData () {

    let response = []

    response.push(this.model.getEvents())
    response.push(this.model.getWaterReadings())
    response.push(this.model.getYears())
    response.push(this.model.getAccounts())
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