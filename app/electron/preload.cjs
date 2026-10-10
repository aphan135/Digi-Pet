const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('pet', {
  setInteractive: (on) => ipcRenderer.send('set-interactive', on),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  onSettings: (cb) => ipcRenderer.on('settings', (_e, s) => cb(s)),
})
