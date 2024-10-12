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
const path = require('path')

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
      webviewTag: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })
  mainWindow.focus()

  mainWindow.loadURL(mainLoadURL)

  if (isOpenDevTools) {
    mainWindow.webContents.openDevTools()
  }
  // mainWindow.webContents.setWindowOpenHandler((details) => {
  //   mainWindow.loadURL(details.url)
  // })

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
      preload: path.join(__dirname, 'preload.js'),
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
  createPrinterWindow()
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
  return new Promise((resolve, reject) => {
    console.log(payload)
    printerWindow.webContents.print(
      {
        silent: true,
        printBackground: true,
        ...payload,
        pageSize: {
          width: payload.pageSize.width * 1000,
          height: payload.pageSize.height * 1000,
        },
      },
      (success, failureReason) => {
        if (!success) {
          // 把错误信息发送到主进程
          mainWindow.webContents.send('print-error', failureReason)
          reject(failureReason)
        } else {
          mainWindow.webContents.send('print-success')
          resolve(success)
        }
        printerWindow.loadURL(printLoadURL)
      },
    )
  })
})

ipcMain.handle('openPrintWindow', (event, payload) => {
  createPrinterWindow(payload)
})

// 获取打印机列表
ipcMain.handle('getPrintList', async (event, isShowMessage) => {
  try {
    return await mainWindow.webContents.getPrintersAsync()
  } catch (error) {
    console.log('error', error)
  }
})

// 修改打印窗口的url
ipcMain.handle('setPrintUrl', async (event, data) => {
  return printerWindow.loadURL(data.url)
})

// 打印进程错误
ipcMain.handle('print-error', (event, data) => {
  // 返回给主渲染进程显示错误信息
  mainWindow.webContents.send('print-error', data)
})
