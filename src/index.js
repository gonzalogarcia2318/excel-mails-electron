const { app, BrowserWindow } = require('electron');
const path = require('path');

const XLSX = require('xlsx');

if (require('electron-squirrel-startup')) {
  app.quit();
}


app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  })
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  mainWindow.webContents.openDevTools();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
