const { autoUpdater } = require('electron-updater')
const { ipcMain, dialog } = require('electron')
const { eventFromMain } = require('../event')

function handleUpdate(dispatchUpdateMsg = () => {}) {
  const update_msg = {
    error: { status: -1, msg: '检测更新异常' },
    checking: { status: 0, msg: '正在检查更新' },
    updateAvailable: { status: 1, msg: '检测到新版本可用' },
    updateNotAvailable: { status: 2, msg: '当前使用的是最新版本' },
    canUpdateNow: { status: 3, msg: '新版本已下载完毕，是否现在安装' },
    downloading: { status: 4, msg: '正在下载' },
  }

  autoUpdater.setFeedURL('https://js.guanmai.cn/v2/static/file/mes/')

  autoUpdater.on('error', (e) => {
    dispatchUpdateMsg(update_msg.error)
  })

  autoUpdater.on('checking-for-update', () => {
    dispatchUpdateMsg(update_msg.checking)
  })

  autoUpdater.on('update-available', () => {
    console.log('update-available')
    dispatchUpdateMsg(update_msg.updateAvailable)
  })

  autoUpdater.on('update-not-available', () => {
    console.log('update-not-available')
    dispatchUpdateMsg(update_msg.updateNotAvailable)
  })

  autoUpdater.on('download-progress', (progressObj) => {
    dispatchUpdateMsg({
      ...update_msg.downloading,
    })
  })

  autoUpdater.on('update-downloaded', (progressObj) => {
    dispatchUpdateMsg(update_msg.canUpdateNow)
    dialog
      .showMessageBox({
        title: '升级提示',
        type: 'question',
        message: update_msg.canUpdateNow.msg,
        buttons: ['立即更新', '暂不更新'],
        defaultId: 0,
        cancelId: 1,
      })
      .then(({ response }) => {
        if (response === 0) {
          autoUpdater.quitAndInstall(true, true)
        }
      })
    // ipcMain.handle(eventFromMain.UPDATE_NOW, (event, payload) => {
    //   autoUpdater.quitAndInstall(true, true)
    // })
  })

  ipcMain.handle(eventFromMain.CHECK_FOR_UPDATE, (event, payload) => {
    // autoUpdater.checkForUpdates()
    autoUpdater.checkForUpdatesAndNotify()
  })

  autoUpdater
    .checkForUpdatesAndNotify()
    .then(({ updateInfo }) => {
      console.log('updateInfo', updateInfo)
    })
    .catch((reason) => {
      console.log('checkForUpdates error', '检查更新出错')
    })
}

module.exports = handleUpdate
