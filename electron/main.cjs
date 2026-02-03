const { app, ipcMain, BrowserWindow } = require("electron");
const path = require("path");
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
        preload: __dirname + '/preload.js',
      contextIsolation: true
    },
    frame: false,              // ❗ disables native buttons
    titleBarStyle: 'hidden',   // important
  });

  win.loadFile(path.join(__dirname, "../dist/index.html"));
}

app.whenReady().then(createWindow);

ipcMain.on('window-close', () => {
  BrowserWindow.getFocusedWindow().close();
});

ipcMain.on('window-minimize', () => {
  BrowserWindow.getFocusedWindow().minimize();
});

ipcMain.on('window-maximize', () => {
  const win = BrowserWindow.getFocusedWindow();
  win.isMaximized() ? win.unmaximize() : win.maximize();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
