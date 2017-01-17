import { electron, BrowserWindow, app } from 'electron';
import path from 'path';
import url from 'url';
import * as React from 'react';


let win;

const createWindow = () => {
  win = new BrowserWindow({width: 800, height: 600})
  // メインウィンドウに表示するURLを指定
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  win.on('closed', () => win = null)
}

// 初期化がが完了した時の処理
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => { if (process.platform !== 'darwin') { app.quit() } })

//アプリケーションがアクティブになった時の処理
app.on('activate', () => {
  //メインウィンドウが消えている場合はサイドメインウィンドウを作成する
  if (win === null) { createWindow() }
})
