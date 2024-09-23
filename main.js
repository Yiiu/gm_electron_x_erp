const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const {
  mainLoadURL,
  printLoadURL,
  isOpenDevTools,
  showPrint,
  isOpenPrintDevTools,
} = require('./dev_config')
const handleUpdate = require('./src/main/app_update')
const { appEvent } = require('./src/event')

let mainWindow = null
let printerWindow = null

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    center: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  })
  mainWindow.focus()

  mainWindow.loadURL(mainLoadURL)

  if (isOpenDevTools) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', function () {
    mainWindow = null
    app.quit()
  })
}

function createPrinterWindow(url) {
  if (printerWindow) {
    return
  }
  printerWindow = new BrowserWindow({
    // 尺寸根据 7cm 5cm 在 chrome 中得到具体 size
    width: 264,
    height: 188,
    frame: false,
    show: showPrint,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  })

  printerWindow.loadURL(url || printLoadURL)

  if (isOpenPrintDevTools) {
    printerWindow.webContents.openDevTools()
  }

  printerWindow.on('closed', () => {
    printerWindow = null
  })
}

app.whenReady().then(() => {
  app.allowRendererProcessReuse = false

  Menu.setApplicationMenu(null)

  createWindow()
  // createPrinterWindow()
  handleUpdate(sendUpdateMessage)
})

function sendUpdateMessage(msgObj) {
  mainWindow.webContents.send(appEvent.UPDATE_MESSAGE, msgObj)
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
    createPrinterWindow()
  }
})

// 接受渲染进程对 print 事件
ipcMain.handle('print', (event, payload) => {
  // 像打印窗口发送 print 事件
  printerWindow.webContents.send('print', payload)
  // return payload
})

ipcMain.handle('openPrintWindow', (event, payload) => {
  createPrinterWindow(payload)
})
