const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('pet', {
  setInteractive: (on) => ipcRenderer.send('set-interactive', on),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setCorner: (corner) => ipcRenderer.send('set-corner', corner),
  onSettings: (cb) => ipcRenderer.on('settings', (_e, s) => cb(s)),
})
