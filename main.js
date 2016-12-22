import { electron, app, BrowserWindow } from 'electron';

let mainWindow = null;

app.on('window-all-closed', () => {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    "title-bar-style": "hidden-inset"
  });
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});
