import { ip } from 'address';
import { app, BrowserWindow, ipcMain } from 'electron';
import express from 'express';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { FilesConfig, Gifs, Theme } from '../renderer/types/filesConfig.d.ts';
import { failedToLoadAPI } from './errorTable.js';
import {
  getAlwaysOnTopState,
  getWindowPositionSettings,
  getWindowSizeSettings,
  saveAlwaysOnTopState,
  saveWindowPos,
  saveWindowSize,
} from './storage.js';

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

let themes = {};

/**
 * Loads configuration data from a JSON file located at '../renderer/filesConfiguration.json'.
 * Parses the JSON file and assigns the 'themes' property to the global 'themes' variable.
 * Logs an error if the configuration loading fails.
 *
 * @function
 * @throws {Error} If there is an issue with reading or parsing the configuration file.
 */
function loadConfig() {
  try {
    // Define the path to the configuration file
    const filePath = path.join(import.meta.dirname, '../renderer/filesConfiguration.json');

    // Read the file content as a UTF-8 encoded string
    const file = readFileSync(filePath, 'utf8');

    // Parse the JSON string into a JavaScript object, casting it to the FilesConfig type
    const data = JSON.parse(file) as FilesConfig;

    // Extract and store the themes from the configuration data
    themes = data.themes;
  } catch (error) {
    // Log an error message if the configuration loading fails
    console.log('Failed to load configuration:', error);
  }
}

// Call the loadConfig function to load the configuration when the script runs
loadConfig();

/* A route that is used to change the GIF on the Pixoo64. */
expressApp.get('/getGifPixoo/:themeID/:gif.gif/', (request, response) => {
  const { gif, themeID } = request.params;
  const theme: Theme = themes[themeID] as Theme;
  /* Checking if the theme is compatible with Pixoo64. If it isn't, it sends a 400 error. */
  if (!theme.compatibleWith.Pixoo64) {
    response.statusCode = 400;
    response.send("Theme requested doesn't support Pixoo64");
    return;
  }
  const gifPath = theme.gifs[gif as keyof Gifs];
  response.sendFile(`${gifPath}`, {
    root: path.join(import.meta.dirname, '../renderer/'),
  });
});
/* A route that is used to get a DriverNumber GIF. */
expressApp.get('/getGifPixoo/:themeID/DriverNumbers/:year/:driverNumber.gif/', (request, response) => {
  const { driverNumber, themeID, year } = request.params;
  const theme: Theme = themes[themeID] as Theme;
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
  if (!theme.compatibleWith.Pixoo64) {
    response.statusCode = 400;
    response.send("Theme requested doesn't support Pixoo64");
  }
  response.sendFile(DriverNumberPath, {
    root: path.join(import.meta.dirname, '../renderer/'),
  });
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
    roundedCorners: process.platform === 'darwin' ? true : false,
    accentColor: false,
    backgroundColor: '#121212',
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
  if (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void mainWindow.loadFile(path.join(import.meta.dirname, '../renderer/index.html'));
  }
  // Event listeners on the window
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
    if (version.includes('dev')) mainWindow.webContents.openDevTools({ mode: 'detach' });
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
    debounce(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        saveWindowPos(mainWindow.getPosition());
      }
    }, 500)
  );

  mainWindow.on(
    'resize',
    debounce(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        saveWindowSize(mainWindow.getSize());
      }
    }, 500)
  );

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url === 'https://github.com/LapsTimeOFF/DigiFlag_F1MV') {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          frame: true,
          backgroundColor: '#131416',
        },
      };
    }
    if (url === 'https://muvi.gg/go/app') {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          show: false,
          backgroundColor: '#131416',
        },
      };
    } else if (url.includes('index.html')) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          frame: false,
          roundedCorners: process.platform === 'darwin' ? true : false,
          accentColor: false,
          backgroundColor: '#121212',
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
  // Hide macOS Traffic Lights
  if (process.platform === 'darwin') {
    mainWindow.setWindowButtonVisibility(false);
  }
  return mainWindow;
}
function createInstanceWindow() {
  const instanceWindow = new BrowserWindow({
    autoHideMenuBar: true,
    frame: true,
    show: false,
    roundedCorners: process.platform === 'darwin' ? true : false,
    accentColor: false,
    backgroundColor: '#121212',
    transparent: false,
    titleBarStyle: 'hidden',
    title: 'DigiFlag Instance',
    icon: path.join(import.meta.dirname, '../../build/icon.png'),
    webPreferences: {
      preload: path.join(import.meta.dirname, '../preload/preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  instanceWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url === 'https://github.com/LapsTimeOFF/DigiFlag_F1MV') {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          frame: true,
          backgroundColor: '#131416',
        },
      };
    }
    if (url === 'https://muvi.gg/go/app') {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          show: false,
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
  if (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) {
    void instanceWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void instanceWindow.loadFile(path.join(import.meta.dirname, '../renderer/index.html'));
  }
  instanceWindow.once('ready-to-show', () => {
    // Hide macOS Traffic Lights
    if (process.platform === 'darwin') {
      instanceWindow.setWindowButtonVisibility(false);
    }
    instanceWindow.show();
  });
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
void app.whenReady().then(() => {
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
    // On macOS, it's common to re-create a window in the app when the
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

ipcMain.handle('get-version', () => {
  return version;
});
ipcMain.handle('get-pixooIP', (_, pixooIP: string[]) => {
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

ipcMain.handle('get-expressIP', () => {
  const expressIP = ip();
  return expressIP;
});

ipcMain.handle('new-window', () => {
  createInstanceWindow();
});
