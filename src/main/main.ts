import {ip} from 'address';
import {app, BrowserWindow, ipcMain} from 'electron';
import updater from 'electron-updater';
import express from 'express';
import path from 'node:path';
import {Theme} from '../renderer/types/filesConfig';
import {failedToLoadAPI} from './errorTable';
import {mapThemes, themes} from './filesConfiguration.json';
import {
    getAlwaysOnTopState,
    getWindowPositionSettings,
    getWindowSizeSettings,
    saveAlwaysOnTopState,
    saveWindowPos,
    saveWindowSize,
} from './storage';

const version = app.getVersion();
let pixooIPAddress = [''];
/* Creating an express app. */
const expressApp = express();
/* Creating a server that listens on port 9093. */
expressApp
    .listen(9093, () => {
        console.log('API Started');
    })
    .on('error', () => {
        app.quit();
        throw new Error(`${failedToLoadAPI}`);
    });

/* A route that is used to get a gif from the server. */
expressApp.get('/getGif/:gif/:themeID', (request, response) => {
    const {gif, themeID} = request.params;
    const theme: Theme = themes[themeID];
    const gifPath = theme.gifs[gif];
    response.sendFile(`${gifPath}`, {root: path.join(import.meta.dirname, '../renderer/')});
});
expressApp.get('/getTrack/:track/:themeID', (request, response) => {
    const {track, themeID} = request.params;
    const theme = mapThemes[themeID];
    const trackPath = theme.trackMaps[track];
    response.sendFile(`${trackPath}`, {root: path.join(import.meta.dirname, '../renderer/')});
});
/* A route that is used to change the GIF on the Pixoo64. */
expressApp.get('/getGifPixoo/:themeID/:gif.gif/', (request, response) => {
    const {gif, themeID} = request.params;
    const theme: Theme = themes[themeID];
    /* Checking if the theme is compatible with Pixoo64. If it isn't, it sends a 400 error. */
    if (theme.compatibleWith.Pixoo64 !== true) {
        response.statusCode = 400;
        response.send("Theme requested doesn't support Pixoo64");
        return;
    }
    const gifPath = theme.gifs[gif];
    response.sendFile(`${gifPath}`, {root: path.join(import.meta.dirname, '../renderer/')});
});
/* A route that is used to get a DriverNumber GIF. */
expressApp.get('/getGifPixoo/:themeID/DriverNumbers/:year/:driverNumber.gif/', (request, response) => {
    const {driverNumber, themeID, year} = request.params;
    const theme: Theme = themes[themeID];
    const driverNumbersArray = theme.gifs.driverNumber;
    let DriverNumberPath = '';

    if (driverNumbersArray) {
        for (const element of driverNumbersArray) {
            const DriverNumbers = element.DriverNumbers;
            const DriverSeason = element.year;

            if (DriverSeason === year) {
                DriverNumberPath = DriverNumbers[driverNumber];
            }
        }
    }
    /* Checking if the theme is compatible with Pixoo64. If it isn't, it sends a 400 error. */
    if (theme.compatibleWith.Pixoo64 !== true) {
        response.statusCode = 400;
        response.send("Theme requested doesn't support Pixoo64");
    }
    response.sendFile(`${DriverNumberPath}`, {root: path.join(import.meta.dirname, '../renderer/')});
});

let mainWindow: BrowserWindow;
/**
 * `createWindow` is a function that takes three arguments: `width`, `height`, and `title`, and returns
 * a new `BrowserWindow` object
 * @param {number} width - The width of the window in pixels.
 * @param {number} height - The height of the window in pixels.
 * @param {string} title - The title of the window.
 * @returns A BrowserWindow object.
 */
function createWindow(
    width: number,
    height: number,
    windowPositionX: number,
    windowPositionY: number,
    title: string,
    alwaysOnTop: boolean
) {
    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        title: title,
        x: windowPositionX,
        y: windowPositionY,
        frame: true,
        transparent: false,
        titleBarStyle: 'hidden',
        /* Setting the icon of the window. */
        icon: path.join(import.meta.dirname, '../../build/icon.png'),
        alwaysOnTop: alwaysOnTop,
        autoHideMenuBar: true,
        /* Hiding the window until it is ready to be shown. */
        show: false,
        webPreferences: {
            preload: path.join(import.meta.dirname, '../preload/preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
        },
    });
    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
    } else {
        mainWindow.loadFile(path.join(import.meta.dirname, '../renderer/index.html'));
    }
    // Event listeners on the window
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.show();
        if (version.includes('dev')) mainWindow.webContents.openDevTools({mode: 'detach'});
    });

    /* A type alias for a function that takes an array of unknowns and returns a value of type R. */
    type Function_<T extends unknown[], R> = (...arguments_: T) => R;

    /**
     * It returns a function that calls the given function after a delay, but if the returned function is
     * called again before the delay, the delay is reset
     * @param func - The function to debounce.
     * @param {number} delay - The amount of time to wait before calling the function.
     * @returns A function that takes a function and a number and returns a function.
     */
    function debounce<T extends unknown[], R>(function_: Function_<T, R>, delay: number): Function_<T, void> {
        let timeoutId: ReturnType<typeof setTimeout> | undefined;

        return function (this: unknown, ...arguments_: T) {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                function_.apply(this, arguments_);
                timeoutId = undefined;
            }, delay);
        };
    }
    // The debounce functuion is being used to limit the rate at which the `saveWindowPos` and `saveWindowSize` functions are called when the window is moved or resized.
    /* A function that is called when the window is moved. It calls the `saveWindowPos` function with the
position of the window as an argument. */
    mainWindow.on(
        'move',
        debounce(() => saveWindowPos(mainWindow.getPosition()), 500)
    );
    /* A function that is called when the window is resized. It calls the `saveWindowSize` function with
the size of the window as an argument. */
    mainWindow.on(
        'resize',
        debounce(() => saveWindowSize(mainWindow.getSize()), 500)
    );
    /* Setting the minimum size of the window to 256x256. */
    mainWindow.setMinimumSize(256, 256);

    mainWindow.webContents.setWindowOpenHandler(({url}) => {
        if (url === 'https://github.com/LapsTimeOFF/DigiFlag_F1MV') {
            return {
                action: 'allow',
                overrideBrowserWindowOptions: {
                    frame: true,
                    backgroundColor: '#131416',
                },
            };
        } else if (url.includes('index.html')) {
            return {
                action: 'allow',
                overrideBrowserWindowOptions: {
                    frame: false,
                    transparent: true,
                    fullscreenable: false,
                    minWidth: 256,
                    minHeight: 256,
                    webPreferences: {
                        preload: path.join(import.meta.dirname, '../preload/preload.cjs'),
                        nodeIntegration: false,
                        contextIsolation: true,
                        sandbox: false,
                    },
                },
            };
        } else {
            return {
                action: 'deny',
            };
        }
    });
    return mainWindow;
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
    updater.autoUpdater.checkForUpdatesAndNotify();
    const windowSize = getWindowSizeSettings();
    const windowPosition = getWindowPositionSettings();
    const alwaysOnTopState = getAlwaysOnTopState();

    if (version.includes('dev')) console.log('WindowSize:', windowSize);
    if (version.includes('dev')) console.log('WindowPosition:', windowPosition);
    if (version.includes('dev')) console.log('alwaysOnTopState:', alwaysOnTopState);

    createWindow(
        windowSize[0],
        windowSize[1],
        windowPosition[0],
        windowPosition[1],
        'DigiFlag - v' + version,
        alwaysOnTopState
    );
    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow(
                windowSize[0],
                windowSize[1],
                windowPosition[0],
                windowPosition[1],
                'DigiFlag - v' + version,
                alwaysOnTopState
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

ipcMain.handle('get-version', async () => {
    return version;
});
ipcMain.handle('get-pixooIP', async (_, pixooIP: string[]) => {
    pixooIPAddress = pixooIP;
    return pixooIPAddress;
});

ipcMain.handle('get-always-on-top', () => {
    // Get the current state from storage
    return mainWindow.isAlwaysOnTop();
});

ipcMain.handle('set-always-on-top', () => {
    // Get the current state from storage
    const currentState = getAlwaysOnTopState();
    // Toggle the alwaysOnTop state
    const newState = !currentState;
    // Set the new state for the mainWindow
    mainWindow.setAlwaysOnTop(newState);
    // Save the new state to storage
    saveAlwaysOnTopState(newState);
    console.log(mainWindow.isAlwaysOnTop());
});

ipcMain.handle('get-expressIP', async () => {
    const expressIP = ip();
    return expressIP;
});
