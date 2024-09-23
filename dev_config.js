const { app } = require('electron')

const config = {
  mainLoadURL: 'https://q.guanmai.cn/erp',
  printLoadURL: 'https://txcdn.guanmai.cn/erp/feature-lite/print.html',
  isOpenDevTools: false,
  showPrint: false,
  isOpenPrintDevTools: false,
}

try {
  const erp = require(app.getPath('desktop') + '/erp.json')
  Object.assign(config, erp)
} catch (err) {
  console.log(err)
}

module.exports = config
