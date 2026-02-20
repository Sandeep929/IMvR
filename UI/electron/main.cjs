const { app, ipcMain, BrowserWindow } = require("electron");
const path = require("path");
const { fork } = require('child_process');

let serverProcess;

function startServer() {
  const serverPath = path.join(__dirname, '../backend/server.js');
  serverProcess = fork(serverPath);

  serverProcess.on('error', (err) => {
    console.error('Failed to start server:', err);
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    frame: false,              // ❗ disables native buttons
    titleBarStyle: 'hidden',   // important
  });

  // In development, you might want to load from localhost
  // win.loadURL('http://localhost:5173'); 
  // But keeping original behavior for now:
  win.loadFile(path.join(__dirname, "../dist/index.html"));
}

app.whenReady().then(() => {
  startServer();
  createWindow();
});

app.on('will-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

ipcMain.on('window-close', () => {
  BrowserWindow.getFocusedWindow().close();
});

ipcMain.on('window-minimize', () => {
  BrowserWindow.getFocusedWindow().minimize();
});

ipcMain.on('window-maximize', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.isMaximized() ? win.unmaximize() : win.maximize();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

