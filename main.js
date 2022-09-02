"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
function createWindow(width, height, title) {
    let _window = new electron_1.BrowserWindow({
        width: width,
        height: height,
        title: title
    });
    return _window;
}
electron_1.app.whenReady().then(() => {
    let mainWindow = createWindow(800, 600, "F1MV - DigiFlag");
    mainWindow.loadFile('index.html');
});
electron_1.app.on('window-all-closed', function () {
    electron_1.app.quit();
});
