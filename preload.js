const { contextBridge, ipcRenderer, app } = require('electron')

const { getPaperSizeInfo, getPaperSizeInfoAll } = require("win32-pdf-printer");

/**
 * electron 预加载脚本
 */
contextBridge.exposeInMainWorld('electron', {
  webviewPreload: `file://${__dirname}/webviewPreload.js`,
  invoke: (channel, args) => {
    return ipcRenderer.invoke(channel, args)
  },
  // 获取打印机尺寸
  getPaperSizeInfo(printer) {
    if (process.platform === 'win32') {
      return getPaperSizeInfo({ printer })
    }
  },
  getPaperSizeInfoAll: () => {
    if (process.platform === 'win32') {
      return getPaperSizeInfoAll()
    }
  },
  // 打印错误
  onPrintError: (callback) => {
    ipcRenderer.on('print-error', callback)
    return () => {
      ipcRenderer.off('print-error', callback)
    }
  },
  // 打印成功
  onPrintSuccess: (callback) => {
    ipcRenderer.on('print-success', callback)
    return () => {
      ipcRenderer.off('print-success', callback)
    }
  },
})
