const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld('electron', {
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
