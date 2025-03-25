const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 320,
    height: 450,
    frame: false,
    transparent: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,  // Consider changing this for production for better security
      enableRemoteModule: true  // Add this line to enable remote module
    },
  });

  mainWindow.loadURL(`file://${path.join(__dirname, "public/index.html")}`);
  
  // Add this line to enable dragging
  mainWindow.setMovable(true);

  ipcMain.on('minimize', () => {
    mainWindow.minimize();
  });

  ipcMain.on('close', () => {
    mainWindow.close();
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
