import { app, BrowserWindow, Menu, MenuItem } from "electron";
import * as path from "path";
import { version } from './package.json'
import { themes } from './filesConfiguration.json'

const { address } = require('ip')
var request = require('request');
const expressApp = require('express')();

expressApp.listen(9093, () => {
    console.log('API Started');
})

expressApp.get('/getGif/:gif/:themeID', (req:any,res:any) => {
    const { gif, themeID } = req.params
    let theme:any = themes[themeID]
    let gifPath:any = theme.gifs[gif];

    res.sendFile(`${__dirname}/${gifPath}`)
})

expressApp.get('/getGifPixoo/:gif/:themeID', (req:any,res:any) => {
    const { gif, themeID } = req.params
    let theme:any = themes[themeID]
    if(theme.compatibleWith.Pixoo64 !== true) {
        res.statusCode = 400
        res.send('Theme requested doesn\'t support Pixoo64')
        return;
    }
    let gifPath:any = theme.gifs.pixoo64[gif];

    res.sendFile(`${__dirname}/${gifPath}`)
})

expressApp.get('/pixoo/:gif/:themeID/:ip', (req:any,res:any) => {
    const { gif, themeID, ip } = req.params
    let theme:any = themes[themeID]
    if(theme.compatibleWith.Pixoo64 !== true) {
        res.statusCode = 400
        res.send('Theme requested doesn\'t support Pixoo64')
        return;
    }

    request.post(`http://${ip}:80/post`, { json: {
        "Command": "Device/PlayTFGif",
        "FileType": 2,
        "FileName": `http://${address()}:9093/getGifPixoo/${gif}/${themeID}`
    } }, (err: any, res: any, body: any) => {
        let response = JSON.parse(body)
        if(err || response.error_code !== 0) {
            res.statusCode = 500
            res.send('Failed to change GIF on Pixoo64')
            return;
        }
        res.send('OK')
    })
})
 
 
function createWindow(width:number, height:number, title:string) {
   let _window = new BrowserWindow({
      width: width,
      height: height,
      title: title,
      // alwaysOnTop: true,
      autoHideMenuBar: true
   })
   
   return _window;
}
    
app.whenReady().then(() => {
    let mainWindow = createWindow(800,600,"F1MV - DigiFlag - " + version)
    if (version.includes('dev')) mainWindow.webContents.openDevTools();
    mainWindow.loadFile('index.html')
})

app.on('window-all-closed', function () {
    app.quit()
})