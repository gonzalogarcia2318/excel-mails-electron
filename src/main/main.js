const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const Storage = require('../storage/storage.js');

if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    resizable: true,
    minWidth: 400,
    minHeight: 500,
    useContentSize: true,
    title: "MailHelper",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  })

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('user-config', storage.getAll());
  })

  mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));

  // Menu
  const templateMenu = [
    {
      label: 'Opciones',
      submenu: [
        {
          label: 'Resetear',
          click() {
            mainWindow.webContents.send('reset-values');
          }
        },
        {
          label: 'Configuración',
          click() {
            showConfigurationWindow();
          }
        }
      ]
    },
    {
      label: 'Dev Tools',
      accelerator: 'F12',
      click() {
        mainWindow.webContents.openDevTools();
      }
    }
  ];


  const menu = Menu.buildFromTemplate(templateMenu)

  mainWindow.setMenu(menu);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


// Store and read data
const storage = new Storage();

ipcMain.on('get-user-config', (event) => {
  event.returnValue = storage.getAll();
});

ipcMain.on('save-user-config', (event, userConfig) => {
  storage.setAll(userConfig);
  mainWindow.webContents.send('user-config', storage.getAll());
})


function showConfigurationWindow() {
  const configWindow = new BrowserWindow({
    width: 800,
    height: 700,
    modal: true,
    useContentSize: true,
    title: "Configuracion",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  })

  configWindow.setMenu(null);
  configWindow.webContents.openDevTools();

  configWindow.webContents.on('did-finish-load', () => {
    configWindow.webContents.send('user-config', storage.getAll());
  })

  configWindow.loadFile(path.join(__dirname, "../renderer/config-dialog/config-dialog.html"));
}