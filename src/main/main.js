const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const Storage = require('../storage/storage.js');

if (require('electron-squirrel-startup')) {
  app.quit();
}


app.on('ready', () => {
  const mainWindow = new BrowserWindow({
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

ipcMain.on('get-email-message', (event, platform) => {
  event.returnValue = getEmailMessage(platform);
});

ipcMain.on('edit-email-messages', (event, emailMessages) => {
  emailMessages.forEach(emailMessage => {
    editEmailMessage(emailMessage.platform, emailMessage.value);
  })
});


function getEmailMessage(platform) {
  return storage.get(getKeyByPlatform(platform));
}

function editEmailMessage(platform, value) {
  return storage.set(getKeyByPlatform(platform), value);
}

function getKeyByPlatform(platform) {
  if (platform === 'WELIVERY') {
    return 'weliveryEmailMessage';
  } else {
    return 'ocaEmailMessage';
  }
}


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

  const emailsMessages = [];
  emailsMessages.push({ platform: 'WELIVERY', value: getEmailMessage('WELIVERY') });
  emailsMessages.push({ platform: 'OCA', value: getEmailMessage('OCA') });

  configWindow.webContents.on('did-finish-load', () => {
    configWindow.webContents.send('email-messages', emailsMessages);
  })

  configWindow.loadFile(path.join(__dirname, "../renderer/config-dialog/config-dialog.html"));
}