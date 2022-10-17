import { app, BrowserWindow } from "electron";
import express from "express";
import { address } from "ip";
import request from "request";

import { themes } from "./filesConfiguration.json";
import { version } from "./package.json";

/* Simple auto-reloading for Electron apps during development
When files used in the main process are changed, the app is restarted.
The try/catch is needed so it doesn't throw Cannot find module 'electron-reloader' in production.*/
try {
  require("electron-reloader")(module);
} catch (error) {
  console.error(error);
}

/* Creating an express app. */
const expressApp = express();
/* Creating a server that listens on port 9093. */
expressApp.listen(9093, () => {
  console.log("API Started");
});
/* A route that is used to get a gif from the server. */
expressApp.get("/getGif/:gif/:themeID", (req, res) => {
  const { gif, themeID } = req.params;
  const theme = themes[themeID];
  const gifPath = theme.gifs[gif];
  res.sendFile(`${__dirname}/${gifPath}`);
});
/* A route that is used to get a gif from the server. */
expressApp.get("/getGifPixoo/:gif/:themeID", (req, res) => {
  const { gif, themeID } = req.params;
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
expressApp.get("/pixoo/:gif/:themeID/:ip", (req, res) => {
  const { gif, themeID, ip } = req.params;
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
        Command: "Device/PlayTFGif",
        FileType: 2,
        FileName: `http://${address()}:9093/getGifPixoo/${gif}/${themeID}`,
      },
    },
    /* A callback function that is called when the request is completed. */
    (err, res, body) => {
      const response = JSON.parse(body);
      if (err || response.error_code !== 0) {
        res.statusCode = 500;
        response.post("Failed to change GIF on Pixoo64");
        return;
      }
      response.send("OK");
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
function createWindow(width: number, height: number, title: string) {
  const window = new BrowserWindow({
    width: width,
    height: height,
    title: title,
    icon: "icon.ico",
    // alwaysOnTop: true,
    autoHideMenuBar: true,
  });
  return window;
}
app.whenReady().then(() => {
  const mainWindow = createWindow(800, 600, "F1MV - DigiFlag - " + version);
  if (version.includes("dev")) mainWindow.webContents.openDevTools();
  mainWindow.loadFile("index.html");
});
/* A function that is called when all windows are closed. */
app.on("window-all-closed", function () {
  /* Closing the app. */
  app.quit();
});
