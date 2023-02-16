import {LiveTimingAPIGraphQL} from "npm_f1mv_api/dist/index.js";
import { version } from "./package.json";
const host = "localhost";
const port = 10101;
const config = {
  host,
  port
};
const timer = (ms) => new Promise((res) => setTimeout(res, ms));
const { themes, mapThemes } = JSON.parse(httpGet("./filesConfiguration.json"));
let debugOn = true;
let windowTransparency = false;
let scale = 1;
let started = false;
let yellow = false;
let sc = false;
let vsc = false;
let red = false;
let raining = 0;
const DigiFlag_Version = version
let LT_Data = {
  RaceControlMessages: {
    Messages: [
      {
        Message: "",
        Category: "",
        SubCategory: "",
        Flag: "",
        Scope: "",
        Sector: "",
        Mode: ""
      }
    ]
  },
  TrackStatus: {
    Status: "",
    Message: ""
  },
  WeatherData: {
    AirTemp: "",
    Humidity: "",
    Pressure: "",
    Rainfall: "",
    TrackTemp: "",
    WindDirection: "",
    WindSpeed: ""
  }
};
let lightOn = false;
let lightOnRain = false;
let currentTheme = 1;
let currentMapTheme = 0;
let raceName = "Unknown";
let currentMode = 0;
let disabledBlueFlag = false;
let useTrackMap = false;
const pixooIP = "";
const instanceWindowWidth = 800;
const instanceWindowHeight = 600;
const instanceWindowOffsetX = 100;
const instanceWindowOffsetY = 200;
let oldMessages = {
  Messages: [
    {
      Message: "",
      Category: "",
      SubCategory: "",
      Flag: "",
      Scope: "",
      Sector: "",
      Mode: ""
    }
  ]
};
function httpGet(theUrl) {
  const xmlHttpReq = new XMLHttpRequest();
  xmlHttpReq.open("GET", theUrl, false);
  xmlHttpReq.send(null);
  return xmlHttpReq.responseText;
}
const logs = [];
function log(text) {
  console.log(text);
  if (logs[logs.length - 1] === text)
    return;
  logs.push(text);
}
let countDownRunning = false;
async function autoConnectF1MV() {
  try {
    let timeleft = 3;
    if (countDownRunning === false) {
      const countdownTimer = setInterval(() => {
        if (timeleft <= 0) {
          linkF1MV();
          getCurrentSessionInfo();
          clearInterval(countdownTimer);
          countDownRunning = false;
        } else {
          countDownRunning = true;
          if ($("#tagLink").hasClass("badge text-bg-danger")) {
            $("#tagLink").text("Retrying to Connect to F1MV in : " + timeleft + " seconds");
            $("#raceName").text("Attempting to Get Current Session Info From F1MV...");
          } else if ($("#tagLink").hasClass("badge text-bg-warning")) {
            $("#tagLink").text(
              "Attempting to Connect to Live / Replay Timing Window : " + timeleft + " seconds"
            );
            $("#raceName").text("Retrieving Current Session From F1MV...");
          } else {
            $("#tagLink").removeClass();
            $("#tagSession").removeClass();
            $("#raceName").removeClass();
            $("#checkNetworkSettings,#infoTag").hide();
            $("#tagLink").addClass("badge text-bg-primary");
            $("#tagSession").addClass("badge text-bg-primary");
            $("#raceName").addClass("text-bg-primary");
            $("#raceName").text("Retrieving Current Session From F1MV...");
            $("#tagLink").text("Attempting to Connect to F1MV in : " + timeleft + " seconds");
          }
        }
        timeleft -= 1;
      }, 1e3);
    }
  } catch (error) {
    console.error(error);
    linkF1MV();
  }
}
async function getCurrentSessionInfo() {
  try {
    const response = await LiveTimingAPIGraphQL(config, ["SessionInfo"]);
    const sessionName = await response.SessionInfo.Meeting.Name;
    const sessionYear = parseInt(response.SessionInfo.StartDate);
    raceName = `${sessionYear + " " + sessionName}`;
    $("#raceName").text(raceName);
    if (debugOn)
      console.log(`Current Race Name: ${raceName}`);
    return raceName;
  } catch (error) {
    if (debugOn)
      console.error("Unable to Get Data From F1MV GraphQL API:\n" + error.message);
    return "Unable to Get Data From F1MV GraphQL API";
  }
}
function getCurrentTrackPath(currentMapTheme2) {
  let trackMapPath;
  const trackMaps = mapThemes[currentMapTheme2].trackMaps;
  if (raceName in trackMaps) {
    trackMapPath = trackMaps[raceName];
    if (debugOn)
      console.log(`Track Map Path: ${trackMapPath}`);
    return trackMapPath;
  } else {
    if (debugOn)
      console.log("Map Not Found");
    return "Map Not Found";
  }
}
function saveSettings(host2, port2) {
  $(".toast").remove();
  localStorage.setItem("host", host2);
  if (port2 >= 0 && port2 <= 65535) {
    localStorage.setItem("port", port2.toString());
    if (debugOn)
      log("Network Settings Saved !");
    $("#networkSettings > h5").after(`<div class="toast text-bg-dark" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000" data-bs-autohide="true">
        <div class="toast-header text-bg-success">
          <strong class="text-center me-auto">Network Settings Saved!</strong>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
        <p>Host:${host2}</p>
        <p>Port:${port2}</p>
        </div>
    </div>
    `);
    $(".toast").toast("show");
    autoConnectF1MV();
  } else {
    if (debugOn)
      log("Only Host Settings Saved !");
    $("#networkSettings > h5").after(`<div class="toast text-bg-dark" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="5000" data-bs-autohide="true">
        <div class="toast-header text-bg-danger">
          <strong class="me-auto">ERROR: Invalid Port!</strong>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
        Only Host Settings Saved !
        <p>The Port Number ${port2} is invalid. Please Enter a Valid Port Number Between 0 to 65535.</p>
        </div>
    </div>
        `);
    $(".toast").toast("show");
  }
}
function createNewInstance(url, windowTitle) {
  if (arguments.length == 0) {
    url = "./index.html";
    windowTitle = "DigiFlag Instance";
  }
  try {
    const windowInstance = window.open(
      url,
      "_blank",
      `left=${instanceWindowOffsetX},top=${instanceWindowOffsetY},frame=${false},
            transparent=${true},menubar=no,autoHideMenuBar==${false},width=${instanceWindowWidth},height=${instanceWindowHeight},title=${windowTitle},icon=./build/icon.ico,nodeIntegration=yes,contextIsolation=no`
    );
    return windowInstance;
  } catch (error) {
    console.error(error);
    return null;
  }
}
function loadSettings() {
  const hostData = localStorage.getItem("host");
  const portData = localStorage.getItem("port");
  if (hostData && portData !== null) {
    config.host = hostData;
    config.port = parseInt(portData);
  }
}
function restoreSettings() {
  $(".toast").remove();
  if (localStorage !== null)
    localStorage.clear();
  config.host = "localhost";
  config.port = 10101;
  $("#networkSettings > h5").after(`<div class="toast text-bg-dark" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="5000" data-bs-autohide="true">
        <div class="toast-header text-bg-danger">
          <strong class="text-center me-auto">Reset Network Settings!</strong>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
        Reset Network Settings To Default Values!
        </div>
    </div>
    `);
  $(".toast").toast("show");
  if (debugOn)
    log("Reset Network Settings To Default");
  autoConnectF1MV();
}
function debugMode(status) {
  if (status === true) {
    if (debugOn)
      log(`Debug Mode Enabled`);
    debugOn = true;
  } else {
    if (debugOn)
      log(`Debug Mode Disabled`);
    debugOn = false;
  }
  return true;
}
debugMode(debugOn);
function getGifPath(flag) {
  let flagPath = "";
  const trackMapPath = getCurrentTrackPath(currentMapTheme);
  if (flag === "void" && useTrackMap === true && trackMapPath.slice((trackMapPath.lastIndexOf(".") - 1 >>> 0) + 2)) {
    flagPath = trackMapPath;
  } else {
    for (let themeIndex = 0; themeIndex < themes.length; themeIndex++) {
      const theme = themes[themeIndex];
      if (theme.id === currentTheme) {
        flagPath = theme.gifs[flag];
      }
    }
  }
  if (debugOn)
    log(`${flag} requested, returning ${flagPath}`);
  return flagPath;
}
function selectTheme(id) {
  if (debugOn)
    log("Mode selected : " + id);
  currentTheme = id;
  $("#nextTheme").prop("disabled", false);
}
function selectMapTheme(id) {
  if (useTrackMap == true) {
    if (debugOn)
      log("Map Theme selected : " + mapThemes[id].name);
    currentMapTheme = parseInt(id);
    getCurrentTrackPath(currentMapTheme);
    $("#launchDigiFlag").prop("disabled", true);
  }
}
async function turnOff(flag) {
  if (flag === "ss" || flag === "rs" || flag === "chequered" || flag === "green" || flag === "blue" || flag === "slippery") {
    if (sc === true) {
      $("#digiflag").prop("src", getGifPath("sc"));
    } else {
      if (vsc === true) {
        $("#digiflag").prop("src", getGifPath("vsc"));
        return;
      } else {
        if (red === true) {
          $("#digiflag").prop("src", getGifPath("red"));
          return;
        } else {
          if (yellow === true) {
            $("#digiflag").prop("src", getGifPath("yellow"));
            return;
          }
        }
      }
      if (currentMode.valueOf() === 1) {
        const res = httpGet(`http://localhost:9093/pixoo/void/${currentTheme}/${pixooIP}`);
        if (res !== "OK") {
          log("Failed to change GIF on Pixoo64");
        }
        return;
      }
      if (raining) {
        changeGif("rain", 0);
        return;
      }
      $("#digiflag").prop("src", getGifPath("void"));
      lightOn = false;
    }
  } else {
    if (currentMode.valueOf() === 1) {
      const res = httpGet(`http://localhost:9093/pixoo/void/${currentTheme}/${pixooIP}`);
      if (res !== "OK") {
        log("Failed to change GIF on Pixoo64");
      }
      return;
    }
    $("#digiflag").prop("src", getGifPath("void"));
    lightOn = false;
  }
}
async function changeGif(flag, mode) {
  if (flag === "blue" && disabledBlueFlag)
    return;
  if (mode === 1 && currentMode.valueOf() === 1) {
    const res = httpGet(`http://localhost:9093/pixoo/${flag}/${currentTheme}/${pixooIP}`);
    if (res !== "OK") {
      log("Failed to change GIF on Pixoo64");
    }
    return;
  }
  const flagPath = getGifPath(flag);
  $("#digiflag").prop("src", flagPath);
  if (flag !== "rain") {
    lightOn = true;
    lightOnRain = false;
  }
  if (flag === "rain")
    lightOnRain = true;
}
function linkSuccess() {
  $("#tagLink").removeClass();
  $("#tagSession").removeClass();
  $("#raceName").removeClass();
  $("#tagLink").addClass("badge text-bg-success");
  $("#tagSession").addClass("badge text-bg-success");
  $("#raceName").addClass("text-bg-success");
  $("#tagLink").text("Successfully Connected to F1MV Timing Window");
  $("#tagSession").show();
  $("#linkF1MV").remove();
  $("#infoTag").remove();
  $("#checkNetworkSettings").remove();
  $("#networkSettings").remove();
  $("#selectTheme").append(`
    <p class="lead text-center fs-4 mb-1">Select a DigiFlag Theme</p>
        <div id="themes">
        </div>
        <button type="button" id="nextTheme" class="btn btn-success" disabled>Next
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="feather feather-arrow-right">
  <path d="M5 12h14M12 5l7 7-7 7"/>
</svg></button>
    `);
  let theme;
  for (let themeIndex = 0; themeIndex < themes.length; themeIndex++) {
    theme = themes[themeIndex];
    $("#themes").append(`
            <div class="form-check" id="window">
                <input class="form-check-input theme" type="radio" name="theme" id="${theme.id}">
                <label class="form-check-label theme" for="${theme.id}">
                    ${theme.name}
                </label>
            </div>
        `);
  }
  $(".theme").on("change", (e) => {
    selectTheme(parseInt(e.target.id));
  });
  $("#nextTheme").on("click", () => {
    $("#selectTheme").remove();
    $("#selectDevice").append(`
        <div class="lead text-center fs-4">Select a Device</div>
            <div class="form-check" id="window">
            <input class="form-check-input" type="radio" name="flexRadioDefault" id="windowRadio" checked>
            <label class="form-check-label" for="windowRadio">
                Window DigiFlag
            </label>
            </div>
            <span class="badge text-bg-danger" id="notAvailable" diabled>Pixoo 64 is Not Compatible with the Selected Theme</span>
            <div class="form-check" id="pixoo64">
            <input class="form-check-input" type="radio" name="flexRadioDefault" id="pixoo64Radio" disabled>
            <label class="form-check-label" for="pixoo64Radio">
                Pixoo 64 DigiFlag
            </label>
            </div>
        `);
    $("#selectMisc").append(`
        <div class="lead text-center fs-4">Misc Options</div>
        <div class="form-check" id="blueFlag">
        <input class="form-check-input" type="checkbox" value="" id="blueFlagCheckbox">
        <label class="form-check-label theme" for="blueFlagCheckbox">
            Remove Blue Flags?
        </label>
        </div>
        <div class="form-check form-switch" id="trackMapSwitch">
        <input class="form-check-input" type="checkbox" role="switch" id="mapSwitch" data-bs-toggle="collapse" data-bs-target="#collapsetrackMapSelect" aria-expanded="false" aria-controls="collapsetrackMapSelect">
        <label class="form-check-label theme" for="mapSwitch">Use TrackMap as Background?</label>
        </div>
        <div class="collapse" id="collapsetrackMapSelect">
        <div id="trackMapStyle">
        <select class="form-select form-select-sm text-bg-dark mapTheme" id="trackMapStyleSelect"></div>
</div>`);
    if (themes[currentTheme].compatibleWith.Pixoo64) {
      $("#notAvailable").remove();
      $("#pixoo64Radio").prop("disabled", false);
    }
    $("#selectDevice").on("change", (e) => {
      if (e.target.id === "pixoo64Radio") {
        if (debugOn)
          console.log("Pixoo64 was Selected");
        currentMode = 1;
        if (debugOn)
          console.log("Current Mode: " + currentMode);
        $("#mapSwitch").prop("disabled", true);
      } else {
        if (debugOn)
          console.log("Window was Selected");
        currentMode = 0;
        if (debugOn)
          console.log("Current Mode: " + currentMode);
        $("#mapSwitch").prop("disabled", false);
      }
    });
    $("#blueFlag").on("change", () => {
      if (disabledBlueFlag) {
        disabledBlueFlag = false;
        if (debugOn)
          log("Blue Flags Enabled: " + disabledBlueFlag);
        return disabledBlueFlag;
      } else {
        disabledBlueFlag = true;
        if (debugOn)
          log("Blue Flags Disabled: " + disabledBlueFlag);
        return disabledBlueFlag;
      }
    });
    $("#trackMapSwitch").on("change", () => {
      if (useTrackMap) {
        useTrackMap = false;
        if (debugOn)
          log("use TrackMap as Background? : " + useTrackMap);
        $("#launchDigiFlag").prop("disabled", false);
        return useTrackMap;
      } else {
        useTrackMap = true;
        if (debugOn)
          log("use TrackMap as Background? : " + useTrackMap);
        $("#launchDigiFlag").prop("disabled", true);
        $("#trackMapStyleSelect>option").remove();
        $("#trackMapStyleSelect").append(
          `<option value="none" selected disabled hidden>Select a TrackMap Style</option>`
        );
        for (let mapIndex = 0; mapIndex < mapThemes.length; mapIndex++) {
          const mapTheme = mapThemes[mapIndex];
          $("#trackMapStyleSelect").append(
            `<option id=${mapTheme.id} value=${mapTheme.id}>${mapTheme.name}</option> `
          );
        }
        $("#trackMapStyleSelect").on("change", () => {
          const mapID = $("#trackMapStyleSelect").val();
          selectMapTheme(mapID.toString());
          $("#launchDigiFlag").prop("disabled", false);
        });
        return useTrackMap;
      }
    });
    $("#menuContent").append(
      `<button type="button" id="launchDigiFlag" class="btn btn-success">Start DigiFlag</button>`
    );
    $("#launchDigiFlag").on("click", () => {
      $(".menu-box").remove();
      $("body").append(`<img src="${getGifPath("void")}" id="digiflag" class="center-screen">`);
      $("#digiflag").insertBefore(".bottom-screen");
      $(".bottom-screen:not(:hover)").animate(
        {
          opacity: 0
        },
        2e3,
        "swing",
        function() {
          $(".bottom-screen").removeAttr("style");
        }
      );
      $("#zoomIn,#zoomOut,#zoomReset").show();
      $("#zoomControl").css("z-index", 1);
      started = true;
    });
  });
}
async function linkF1MV(force) {
  if (debugOn)
    log("Link started...");
  try {
    const response = await LiveTimingAPIGraphQL(config, "Heartbeat");
    if (!response) {
      if (force) {
        linkSuccess();
        return;
      }
      $("#tagLink").removeClass();
      $("#tagSession").removeClass();
      $("#raceName").removeClass();
      $("#tagLink").addClass("badge text-bg-warning");
      $("#raceName").addClass("text-bg-warning");
      $("#tagSession").addClass("badge text-bg-warning");
      $("#networkSettings").hide();
      $("#tagLink").text(
        "You are Connected to F1MV, but the Live/Replay Timing Window is not open."
      );
      $("#checkNetworkSettings,#infoTag").hide();
      $("#raceName").text("Unable to Retrieve Current Session from F1MV");
      setTimeout(() => {
        autoConnectF1MV();
      }, 1e3);
    } else {
      linkSuccess();
    }
  } catch (e) {
    if (force) {
      linkSuccess();
      return;
    }
    $("#tagLink").addClass("badge text-bg-danger");
    $("#tagSession").addClass("badge text-bg-danger");
    $("#raceName").addClass("text-bg-danger");
    $("#tagLink").text("Failed to connect to F1MV");
    $("#raceName").text("Failed to Retrieve Current Session");
    $("#networkSettings").show();
    $("#checkNetworkSettings,#infoTag").show();
    $("#infoTag").text("Maybe you are trying to connect to another host? Maybe your port isn't the default one?");
    $("#checkNetworkSettings").text(
      "Move your Mouse to the Bottom Right Corner & Click on the Settings Gear to check your Network Settings."
    );
    setTimeout(() => {
      autoConnectF1MV();
    }, 5e3);
  }
}
$(function() {
  loadSettings();
  if (countDownRunning === false) {
    autoConnectF1MV();
  }
  $("#version").text(`DigiFlag Version: ${DigiFlag_Version}`);
  $("#raceName").text(raceName);
  $(".bottom-screen:not(:hover)").css("opacity", 1);
  $("#zoomIn,#zoomOut,#zoomReset").hide();
  $("#linkF1MV").remove();
  $("#settingsButton").one("click", () => {
    $("#networkSettings").append(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="globe" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>`);
    $("#networkSettings").append("<h5>Network</h5>");
    $("#networkSettings").append(
      `<label for="ip">Multiviewer API IP:</label>
            <input type="text" class="form-control text-bg-dark" value="${config.host}" id="ip">`
    );
    $("#networkSettings").append(
      `<label for="port">Multiviewer API Port:</label>
            <input type="text" class="form-control text-bg-dark" maxlength="5" value="${config.port}" id="port">`
    );
    $("#networkSettings").append(
      $("<div/>", {
        class: "networkbuttons-container"
      }).append(
        '<button type="button" id="updateSettings" class="btn btn-primary">Save Network Settings</button>',
        '<button type="button"  id="restoreSettings" class="btn btn-danger">Restore Default Settings </button>'
      )
    );
    $("#updateSettings").on("click", () => {
      if (debugOn)
        log("Editing Settings...");
      const host2 = $("#ip").val().toString();
      config.host = host2;
      if (debugOn)
        log($("#ip").text());
      if (debugOn)
        log(`IP = ${$("#ip").val()} = ${config.host}`);
      const port2 = $("#port").val().toString();
      config.port = parseInt(port2);
      if (debugOn)
        log($("#port").text());
      if (debugOn)
        log(`PORT = ${$("#port").val()} = ${config.port}`);
      saveSettings(config.host, config.port);
    });
    $("#restoreSettings").on("click", () => {
      $("#ip").val("localhost");
      $("#port").val(10101);
      restoreSettings();
    });
  });
  $("#newInstance").on("click", () => {
    createNewInstance();
  });
  $("#openGithub").on("click", () => {
    createNewInstance("https://github.com/LapsTimeOFF/DigiFlag_F1MV");
  });
  $("#zoomIn").on("click", () => {
    const zoomScaleAdd = scale = scale + 0.25;
    if (zoomScaleAdd >= 1.75)
      scale = 0.75;
    $(".center-screen").css({
      transform: "translate(-50%,-50%) scale(" + zoomScaleAdd + ")"
    });
  });
  $("#zoomOut").on("click", () => {
    const zoomScaleSubtract = scale = scale - 0.25;
    if (zoomScaleSubtract <= 0.25)
      scale = 1.25;
    $(".center-screen").css({
      transform: "translate(-50%,-50%) scale(" + zoomScaleSubtract + ")"
    });
  });
  $("#zoomReset").on("click", () => {
    $(".center-screen").removeAttr("style");
    scale = 1;
  });
});
const checkRCM = async () => {
  if (started === false)
    return;
  const result = LT_Data.RaceControlMessages;
  if (result.Messages.length === oldMessages.Messages.length) {
    if (debugOn)
      log("No new messages.");
  } else {
    if (debugOn)
      log("New message");
    oldMessages = result;
    const filteredMessages = result.Messages.filter(
      (message) => message.Category === "Flag" || message.Category === "SafetyCar" || message.Category === "TrackSurfaceSlippery" || message.Message.match(/ROLLING START/i) || message.Message.match(/STANDING START/i)
    );
    const recentMessage = filteredMessages.slice(-1)[0];
    if (debugOn)
      console.log("Most Recent Filtered Message: ");
    console.table(recentMessage);
    if (debugOn)
      console.log("Most Recent RCM Message: ");
    console.table(result.Messages.slice(-1)[0]);
    if (recentMessage.Message.match(/BLACK AND ORANGE/i)) {
      recentMessage.Category = "Flag";
      recentMessage.Flag = "BLACK AND ORANGE";
    }
    if (recentMessage.Message.match(/ROLLING START/i) && //Fixes an issue When the Rolling Start Flag Would Display when a ROLLING START PROCEDURE INFRINGEMENT Occurs
    recentMessage.SubCategory !== "IncidentInvestigationAfterSession") {
      changeGif("rs", currentMode);
      await timer(2e4);
      turnOff("rs");
      return;
    }
    if (recentMessage.Message.match(/STANDING START/i)) {
      changeGif("ss", currentMode);
      await timer(2e4);
      turnOff("ss");
      return;
    }
    if (recentMessage.Category === "TrackSurfaceSlippery")
      changeGif("slippery", currentMode);
    if (recentMessage.Category === "SafetyCar") {
      sc = true;
      changeGif("sc", currentMode);
    }
    if (recentMessage.Mode === "VIRTUAL SAFETY CAR") {
      vsc = true;
      changeGif("vsc", currentMode);
    }
    if (recentMessage.Flag === "CHEQUERED") {
      changeGif("chequered", currentMode);
      await timer(6e4);
      turnOff("chequered");
      return;
    }
    if (recentMessage.Scope === "Track") {
      if (recentMessage.Flag === "RED") {
        changeGif("red", currentMode);
        return;
      }
      sc = false;
      vsc = false;
      red = false;
      changeGif("green", currentMode);
      await timer(2500);
      turnOff("green");
      return;
    }
    if (recentMessage.Category === "Flag") {
      switch (recentMessage.Flag) {
        case "YELLOW":
          changeGif("yellow", currentMode);
          break;
        case "DOUBLE YELLOW":
          changeGif("dyellow", currentMode);
          break;
        case "CLEAR":
          changeGif("green", currentMode);
          await timer(2500);
          turnOff("green");
          break;
        case "RED":
          red = true;
          changeGif("red", currentMode);
          await timer(9e4);
          turnOff("red");
          break;
        case "BLUE":
          changeGif("blue", currentMode);
          await timer(1e3);
          turnOff("blue");
          break;
      }
    }
  }
};
async function checkStatus() {
  if (!started)
    return;
  const trackStatus = LT_Data.TrackStatus.Status;
  if (trackStatus === "1") {
    if (sc || vsc || red || yellow) {
      if (debugOn)
        log("New track status : Green");
      sc = false;
      yellow = false;
      vsc = false;
      red = false;
      changeGif("green", currentMode);
      await timer(2500);
      turnOff("green");
    }
  }
  if (trackStatus === "2") {
    if (debugOn)
      log("New track status : Yellow");
    sc = false;
    yellow = true;
    vsc = false;
    red = false;
  }
  if (trackStatus === "4") {
    if (debugOn)
      log("New track status : SC");
    sc = true;
    yellow = false;
    vsc = false;
    red = false;
  }
  if (trackStatus === "5") {
    if (debugOn)
      log("New track status : Red");
    sc = false;
    yellow = false;
    vsc = false;
    red = true;
  }
  if (trackStatus === "6") {
    if (debugOn)
      log("New track status : VSC");
    sc = false;
    yellow = false;
    vsc = true;
    red = false;
  }
}
async function checkRain() {
  if (!started)
    return;
  if (lightOn)
    return;
  const Rain = LT_Data.WeatherData.Rainfall;
  if (Rain === "1") {
    raining = 1;
  }
  if (raining && !lightOnRain) {
    changeGif("rain", currentMode);
  }
}
async function updateData() {
  try {
    if (started)
      LT_Data = await LiveTimingAPIGraphQL(config, ["RaceControlMessages", "TrackStatus", "WeatherData"]);
    return LT_Data;
  } catch (error) {
    console.error(error);
    console.log("Reloaded Window Due to Disconnect");
    window.location.reload();
    return null;
  }
}
setInterval(updateData, 100);
setInterval(checkRCM, 100);
setInterval(checkRain, 100);
setInterval(checkStatus, 100);
function toggleTransparency() {
  if (windowTransparency) {
    $("body").removeAttr("style");
    windowTransparency = false;
  } else {
    $("body").css("background-color", "transparent");
    windowTransparency = true;
  }
}
document.addEventListener("keydown", (e) => {
  if (e.key == "Escape") {
    toggleTransparency();
  }
});
const index = "";
