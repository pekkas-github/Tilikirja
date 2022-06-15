const controller = new Controller()


/* HTML PAGE REQUESTS */

function doGet (e) {

  if (e.parameters.profile) {
    return controller.loadPageFrame(e.parameters.profile)
  }

  return controller.loadPageFrame('')
  
}



/* API REQUESTS */

const api = {}
api.ackCharges = controller.ackCharges.bind(controller)
api.getData = controller.getData.bind(controller)
api.insertEvent = controller.insertEvent.bind(controller)
api.insertReading = controller.insertReading.bind(controller)
api.setChargingStatus = controller.setChargingStatus.bind(controller)
api.updateEvent = controller.updateEvent.bind(controller)


function apiCall(apiName, ...params) {
  return api[apiName](params)
}


/* UTILITY FUNCTIONS */

function include (filename) {

  return HtmlService.createHtmlOutputFromFile(filename).getContent()
  
}