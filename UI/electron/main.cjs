const { app, ipcMain, BrowserWindow, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

let serverStarted = false;

function startServer() {
  if (serverStarted) return;
  serverStarted = true;

  // Set userData path before loading the backend bundle
  // This tells sqliteDb.js and mail.js where to store their data files
  const userData = app.getPath("userData");
  process.env.USER_DATA_PATH = userData;

  // Load MongoDB URI from bundled backend.env (production) or backend/.env (dev)
  if (app.isPackaged) {
    const bundledEnv = path.join(process.resourcesPath, "backend.env");
    if (fs.existsSync(bundledEnv)) {
      require("dotenv").config({ path: bundledEnv });
    }
  } else {
    require("dotenv").config({ path: path.join(__dirname, "../../backend/.env") });
  }

  try {
    // Require the esbuild-bundled backend (starts Express on port 5000)
    const serverBundle = app.isPackaged
      ? path.join(process.resourcesPath, "server-bundle.cjs")
      : path.join(__dirname, "server-bundle.cjs");

    require(serverBundle);
    console.log("[Main] Backend server started.");
  } catch (err) {
    console.error("[Main] Failed to start backend:", err);
  }
}

function createWindow() {
  const iconPath = path.join(__dirname, "../src/assets/icon.png");

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarOverlay: true,
  });

  win.setMenu(null);
  win.loadFile(path.join(__dirname, "../dist/index.html"));
}

app.whenReady().then(() => {
  startServer();
  createWindow();
});

ipcMain.on("window-close", () => {
  BrowserWindow.getFocusedWindow()?.close();
});

ipcMain.on("window-minimize", () => {
  BrowserWindow.getFocusedWindow()?.minimize();
});

ipcMain.on("window-maximize", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.isMaximized() ? win.unmaximize() : win.maximize();
  }
});

ipcMain.handle("print-to-pdf", async (event, defaultFilename) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: "Save Statement",
    filters: [{ name: "PDF Documents", extensions: ["pdf"] }],
    defaultPath: defaultFilename || "Statement.pdf",
  });

  if (canceled) return { success: false, error: "Canceled" };

  try {
    const pdfData = await win.webContents.printToPDF({
      printBackground: true,
      preferCSSPageSize: true,
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
