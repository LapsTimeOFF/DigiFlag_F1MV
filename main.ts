import { app, BrowserWindow } from "electron";
import * as path from "path";
import { version } from './package.json'

function createWindow(width:number, height:number, title:string) {
    let _window = new BrowserWindow({
        width: width,
        height: height,
        title: title,
        autoHideMenuBar: true
    })

    return _window;
}

app.whenReady().then(() => {
    let mainWindow = createWindow(800,600,"F1MV - DigiFlag - " + version)
    mainWindow.loadFile('index.html')
})

app.on('window-all-closed', function () {
    app.quit()
})