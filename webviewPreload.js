const { contextBridge, ipcRenderer, app } = require('electron')

/**
 * webview 预加载脚本
 */
contextBridge.exposeInMainWorld('electron', {
  // 接受渲染进程的消息
  onMessageFromHost: (channel, callback) => {
    ipcRenderer.on(channel, (event, data) => {
      callback(data)
    })
    return () => {
      ipcRenderer.off(channel, callback)
    }
  },
  // 发送给渲染进程消息
  sendMessageToHost: (channel, data) => {
    ipcRenderer.send(channel, data)
  },
})
