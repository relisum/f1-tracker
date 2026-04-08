import { app, BrowserWindow, ipcMain } from "electron"
import path from "path"


ipcMain.on("close", () => {
    app.quit()
})

let win: BrowserWindow | null = null

function createWindow() {
    win = new BrowserWindow({
        width: 500,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
            contextIsolation: false,
        },
    })

    win.loadFile(path.join(__dirname, "index.html"))
}

app.whenReady().then(() => {
    try {
        createWindow()
    } catch (e) {
        console.error(e)
    }
})