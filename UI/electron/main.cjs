const { app, ipcMain, BrowserWindow, dialog } = require("electron");
const path = require("path");
const { spawn } = require('child_process');
const fs = require('fs');

// Copy new logo files automatically on startup
try {
  const sourcePath = 'C:\\Users\\sihar\\.gemini\\antigravity\\brain\\84f7f705-490a-4f7e-86de-15c9cd719abe\\media__1779994176367.png';
  if (fs.existsSync(sourcePath)) {
    const pngData = fs.readFileSync(sourcePath);
    
    // Target paths to copy the PNG logo
    const targets = [
      path.join(__dirname, '../src/assets/Gemini_Generated_Image_98lfx498lfx498lf.png'),
      path.join(__dirname, '../src/assets/Gemini_Generated_Image_vozrbevozrbevozr.png'),
      path.join(__dirname, '../src/assets/print-logo.jpg'),
      path.join(__dirname, '../dist/assets/Gemini_Generated_Image_98lfx498lfx498lf-he9lolVp.png'),
      path.join(__dirname, '../dist/assets/print-logo-DekbwDbR.jpg')
    ];
    
    targets.forEach(target => {
      try {
        const dir = path.dirname(target);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(target, pngData);
        console.log(`Successfully copied logo to ${target}`);
      } catch (err) {
        console.error(`Failed to copy to ${target}:`, err);
      }
    });

    // Create ICO file for the desktop/window icon
    try {
      const icoTarget = path.join(__dirname, '../src/assets/Gemini_Generated_Image_vozrbevozrbevozr (1).ico');
      const N = pngData.length;
      const icoHeader = Buffer.alloc(22);
      
      // ICO Header (6 bytes)
      icoHeader.writeUInt16LE(0, 0);   // Reserved
      icoHeader.writeUInt16LE(1, 2);   // Type (1 = ICO)
      icoHeader.writeUInt16LE(1, 4);   // Image count (1)
      
      // Directory Entry (16 bytes)
      icoHeader.writeUInt8(0, 6);      // Width (0 means 256)
      icoHeader.writeUInt8(0, 7);      // Height (0 means 256)
      icoHeader.writeUInt8(0, 8);      // Color palette (0 = no palette)
      icoHeader.writeUInt8(0, 9);      // Reserved (0)
      icoHeader.writeUInt16LE(1, 10);  // Color planes (1)
      icoHeader.writeUInt16LE(32, 12); // Bits per pixel (32)
      icoHeader.writeUInt32LE(N, 14);  // Size of PNG data in bytes
      icoHeader.writeUInt32LE(22, 18); // Offset to PNG data (6 + 16 = 22)
      
      const icoData = Buffer.concat([icoHeader, pngData]);
      fs.writeFileSync(icoTarget, icoData);
      console.log(`Successfully generated ICO icon at ${icoTarget}`);
    } catch (err) {
      console.error('Failed to generate ICO file:', err);
    }
  }
} catch (e) {
  console.error('Error running logo copy script:', e);
}

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

