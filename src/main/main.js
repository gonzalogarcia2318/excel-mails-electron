const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

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

  mainWindow.webContents.openDevTools();

  // Menu
  const templateMenu = [
    {
      label: 'Acciones',
      submenu: [
        {
          label: 'Resetear',
          click() {
            mainWindow.webContents.send('reset-values');
          }
        }
      ]
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

