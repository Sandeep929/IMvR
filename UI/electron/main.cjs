const { app, ipcMain, BrowserWindow, dialog } = require("electron");
const path = require("path");
const { spawn } = require('child_process');
const fs = require('fs');

let serverProcess;

function startServer() {
  const serverPath = path.join(__dirname, '../../backend/server.js');
  const backendDir = path.join(__dirname, '../../backend');
  serverProcess = spawn('node', [serverPath], { stdio: 'inherit', cwd: backendDir });

  serverProcess.on('error', (err) => {
    console.error('Failed to start server:', err);
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, '../src/assets/Gemini_Generated_Image_vozrbevozrbevozr (1).ico'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarOverlay: true
  });

  win.setMenu(null);
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

ipcMain.handle('print-to-pdf', async (event, defaultFilename) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Save Statement',
    filters: [{ name: 'PDF Documents', extensions: ['pdf'] }],
    defaultPath: defaultFilename || 'Statement.pdf'
  });
  
  if (canceled) return { success: false, error: 'Canceled' };

  try {
    const pdfData = await win.webContents.printToPDF({
      printBackground: true,
      preferCSSPageSize: true
    });
    fs.writeFileSync(filePath, pdfData);
    return { success: true, path: filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

