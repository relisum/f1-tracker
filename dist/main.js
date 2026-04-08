"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
electron_1.ipcMain.on("close", () => {
    electron_1.app.quit();
});
let win = null;
function createWindow() {
    win = new electron_1.BrowserWindow({
        width: 700,
        height: 900,
        webPreferences: {
            preload: path_1.default.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: true,
        },
    });
    win.loadFile(path_1.default.join(__dirname, "index.html"));
}
electron_1.app.whenReady().then(() => {
    try {
        createWindow();
    }
    catch (e) {
        console.error(e);
    }
});
