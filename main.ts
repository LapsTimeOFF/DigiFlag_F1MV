import {app, BrowserWindow} from 'electron';
import express from 'express';
import {address} from 'ip';
import path from 'path';
import request from 'request';
import {getWindowSizeSettings, getWindowPositionSettings, saveWindowPos, saveWindowSize} from './storage';
import {failedToLoadAPI} from './errorTable';
import {themes} from './filesConfiguration.json';
import {version} from './package.json';

/* Simple auto-reloading for Electron apps during development
When files used in the main process are changed, the app is restarted.
The try/catch is needed so it doesn't throw Cannot find module 'electron-reloader' in production.*/
try {
    require('electron-reloader')(module);
} catch (error) {
    console.error(error);
}

/* Creating an express app. */
const expressApp = express();
/* Creating a server that listens on port 9093. */
expressApp
    .listen(9093, () => {
        console.log('API Started');
    })
    .on('error', () => {
        throw failedToLoadAPI;
    });
/* A route that is used to get a gif from the server. */
expressApp.get('/getGif/:gif/:themeID', (req, res) => {
    const {gif, themeID} = req.params;
    const theme = themes[themeID];
    const gifPath = theme.gifs[gif];
    res.sendFile(`${__dirname}/${gifPath}`);
});
/* A route that is used to get a gif from the server. */
expressApp.get('/getGifPixoo/:gif/:themeID', (req, res) => {
    const {gif, themeID} = req.params;
    const theme = themes[themeID];
    /* Checking if the theme is compatible with Pixoo64. If it isn't, it sends a 400 error. */
    if (theme.compatibleWith.Pixoo64 !== true) {
        res.statusCode = 400;
        res.send("Theme requested doesn't support Pixoo64");
        return;
    }
    const gifPath = theme.gifs.pixoo64[gif];
    res.sendFile(`${__dirname}/${gifPath}`);
});
/* A route that is used to change the GIF on the Pixoo64. */
expressApp.get('/pixoo/:gif/:themeID/:ip', (req, res) => {
    const {gif, themeID, ip} = req.params;
    const theme = themes[themeID];
    /* Checking if the theme is compatible with Pixoo64. If it isn't, it sends a 400 error. */
    if (theme.compatibleWith.Pixoo64 !== true) {
        res.statusCode = 400;
        res.send("Theme requested doesn't support Pixoo64");
        return;
    }
    /* Sending a POST request to the Pixoo64. */
    request.post(
        `http://${ip}:80/post`,
        {
            json: {
                Command: 'Device/PlayTFGif',
                FileType: 2,
                FileName: `http://${address()}:9093/getGifPixoo/${gif}/${themeID}`,
            },
        },
        /* A callback function that is called when the request is completed. */
        (err, res, body) => {
            const response = JSON.parse(body);
            if (err || response.error_code !== 0) {
                res.statusCode = 500;
                response.post('Failed to change GIF on Pixoo64');
                return;
            }
            response.send('OK');
        }
    );
});

/**
 * `createWindow` is a function that takes three arguments: `width`, `height`, and `title`, and returns
 * a new `BrowserWindow` object
 * @param {number} width - The width of the window in pixels.
 * @param {number} height - The height of the window in pixels.
 * @param {string} title - The title of the window.
 * @returns A BrowserWindow object.
 */
function createWindow(width: number, height: number, windowPositionX: number, windowPositionY: number, title: string) {
    const window = new BrowserWindow({
        width: width,
        height: height,
        title: title,
        x: windowPositionX,
        y: windowPositionY,
        frame: false,
        transparent: true,
        titleBarStyle: 'hidden',
        /* Setting the icon of the window. */
        icon: path.join(__dirname, 'icon.ico'),
        alwaysOnTop: false,
        autoHideMenuBar: true,
        /* Hiding the window until it is ready to be shown. */
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            sandbox: false,
            nodeIntegrationInSubFrames: true, //for subContent nodeIntegration Enable
            webviewTag: true, //for webView
        },
    });
    // Event listeners on the window
    window.webContents.on('did-finish-load', () => {
        window.show();
        window.focus();
        if (version.includes('dev')) window.webContents.openDevTools();
    });
    window.on('moved', () => saveWindowPos(window.getPosition()));
    /* Saving the window size when the window is resized. */
    window.on('resized', () => saveWindowSize(window.getSize()));
    /* Setting the minimum size of the window to 426x240. */
    window.setMinimumSize(256, 256);
    /* Loading the index.html file into the window. */
    window.loadFile(path.join(__dirname, 'index.html'));
    /* A function that is called when a new window is opened. It checks the URL of the window and sets
   the options of the window accordingly. */
    window.webContents.setWindowOpenHandler(({url}) => {
        if (url === 'https://github.com/LapsTimeOFF/DigiFlag_F1MV') {
            return {
                action: 'allow',
                overrideBrowserWindowOptions: {
                    frame: true,
                    backgroundColor: '#131416',
                },
            };
        } else {
            url === './index.html';
            return {
                action: 'allow',
                overrideBrowserWindowOptions: {
                    frame: false,
                    transparent: true,
                    fullscreenable: false,
                },
            };
        }
    });
    return window;
}

/* Creating a window and loading the index.html file. */
app.whenReady().then(() => {
    const windowSize = getWindowSizeSettings();
    const windowPosition = getWindowPositionSettings();
    if (version.includes('dev')) console.log('WindowSize: ', windowSize);
    if (version.includes('dev')) console.log('WindowPosition: ', windowPosition);
    createWindow(windowSize[0], windowSize[1], windowPosition[0], windowPosition[1], 'F1MV - DigiFlag - ' + version);
    app.on('activate', () => {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow(
                windowSize[0],
                windowSize[1],
                windowPosition[0],
                windowPosition[1],
                'F1MV - DigiFlag - ' + version
            );
        }
    });
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
