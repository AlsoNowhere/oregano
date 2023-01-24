const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");

Menu.setApplicationMenu(null);

function createWindow() {
  const mainWindow = new BrowserWindow({
    frame: false,
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "./preload.js"),
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("./index.html");

  ipcMain.on("minimize", () => {
    mainWindow.minimize();
  });

  ipcMain.on("close", () => {
    mainWindow.close();
  });

  /* Open the DevTools. */
  // mainWindow.webContents.openDevTools();
}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
