const electron = require('electron');
const { BrowserWindow, app } = electron;

let mainWindow = null;

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    electron.session.defaultSession.clearCache(() => {});
    app.quit();
  }
});

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: 'hidden',
  });
  mainWindow.loadURL(`file://${__dirname}/app/index.html`);
  mainWindow.on('closed', () => {
    electron.session.defaultSession.clearCache(() => {});
    mainWindow = null;
  });
});
