const { contextBridge, ipcRenderer, app } = require('electron')
const path = require('path')

/**
 * electron 预加载脚本
 */
contextBridge.exposeInMainWorld('electron', {
  webviewPreload: `file://${__dirname}/webviewPreload.js`,
  invoke: (channel, args) => {
    return ipcRenderer.invoke(channel, args)
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
