function doGet (e) {
  app.profile = e.parameter.profile  // admin-profiili näyttää kaikki kontrollit

  const args = {}
  args.myLibraries = include('app_Libraries')
  args.myScripts   = include('app_Scripts')
  args.myStyles    = include('app_Styles')
  args.callParams  = e.parameter
  args.color       = (app.test) ? 'red' : 'blue'

  const html = FramePages.getFrame(args)

  return html
    .evaluate()
    .setTitle('Tilikirja')
    .setFaviconUrl('https://cdn.icon-icons.com/icons2/1385/PNG/512/eur-crypto-cryptocurrency-cryptocurrencies-cash-money-bank-payment_95510.png')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
}
