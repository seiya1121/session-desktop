const electron = require('electron');
const { BrowserWindow, app } = electron;
const loadDevtool = require('electron-load-devtool');

let mainWindow = null;

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
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
  loadDevtool(loadDevtool.REACT_DEVELOPER_TOOLS);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});
