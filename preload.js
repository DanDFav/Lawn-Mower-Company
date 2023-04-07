const { contextBridge, ipcRenderer, ipcMain } = require('electron')


contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => ipcRenderer.send(channel, data), 
    on: (channel, func) => ipcRenderer.on(channel, (...args) => func(...args)),
});


contextBridge.exposeInMainWorld('api', {
    invoke: (channel, data) => ipcRenderer.invoke(channel, data), 
    store: {
        get(key){ return ipcRenderer.invoke('store:get', key) }, 
        set(property, value){ return ipcRenderer.send('store:set', property, value) }
    }
});