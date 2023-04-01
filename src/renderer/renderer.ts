/* Declaring a variable called host and assigning it the value of "localhost". */
const host = 'localhost';
/* Creating a variable called port and assigning it the value of 10101. */
const port = 10101;
// Create the config object
const config = {
    host: host,
    port: port,
};

/**
 * It takes a number of milliseconds as an argument, and returns a promise that resolves after that
 * number of milliseconds.
 * @param ms - The amount of time to wait before resolving the promise.
 */
const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));
/* Getting the themes and the tracks from the filesConfiguration.json file. */
const {themes, mapThemes} = JSON.parse(httpGet('./filesConfiguration.json'));
/* Declaring a variable called debugOn and assigning it a value of false. */
let debugOn = false;
// let windowTransparency = false;
let scale = 1;
let started = false;
let yellow = false;
let sc = false;
let vsc = false;
let red = false;
let raining = false;
let version
let themeSelectRef: JQuery<HTMLElement>
let miscOptionsRef: JQuery<HTMLElement>
const getDigiFlagVersion = async () => {
  version= await window.api.getVersion();
}
getDigiFlagVersion()
let LT_Data = {
    RaceControlMessages: {
        Messages: [
            {
                Message: '',
                Category: '',
                SubCategory: '',
                RacingNumber: '',
                Flag: '',
                Scope: '',
                Sector: '',
                Mode: '',
            },
        ],
    },
    TrackStatus: {
        Status: '',
        Message: '',
    },
    WeatherData: {
        AirTemp: '',
        Humidity: '',
        Pressure: '',
        Rainfall: '',
        TrackTemp: '',
        WindDirection: '',
        WindSpeed: '',
    },
};
let lightOn = false;
let lightOnRain = false;
/* Declaring a variable called currentTheme and assigning it a value of 1. */
let currentTheme = 1;
let currentMapTheme = 0;
let raceName = 'Unknown';
let currentMode = 0; // 0 for window, 1 for pixoo64
let disabledBlueFlag = false;
let useTrackMap = false;
let useMVLogo= false;
let pixooIP:string
const instanceWindowWidth = 800;
const instanceWindowHeight = 600;
const instanceWindowOffsetX = 100;
const instanceWindowOffsetY = 200;
/* Creating an object called oldMessages and adding a property called Messages to it. */
let oldMessages = {
    Messages: [
        {
            Message: '',
            Category: '',
            SubCategory: '',
            Flag: '',
            Scope: '',
            Sector: '',
            Mode: '',
        },
    ],
};

/**
 * It makes a GET request to the URL passed in as a parameter.
 * @param theUrl - The URL to send the request to.
 * @returns The responseText property returns the response as a string, or null if the request was
 * unsuccessful or has not yet been sent.
 */
function httpGet(theUrl: string | URL) {
    const xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open('GET', theUrl, false);
    xmlHttpReq.send(null);
    return xmlHttpReq.responseText;
}

const logs: string[] = [];

/**
 * If the last item in the logs array is the same as the text passed in, then return. Otherwise, add
 * the text to the logs array.
 * @param text - The text to be logged.
 * @returns the value of the last expression evaluated.
 */
function log(text: string) {
    console.log(text);
    if (logs[logs.length - 1] === text) return;
    logs.push(text);
}

let countDownRunning = false;
/**
 * If the F1MV Instance is found, start a countdown timer, and when the timer is finished, run the
 * getCurrentSessionInfo() function and the linkF1MV() function.
 */
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
                    if ($('#tagLink').hasClass('badge text-bg-danger')) {
                        $('#tagLink').removeAttr('data-i18n');
                        $('#tagLink').text('Retrying to Connect to F1MV in : ' + timeleft + ' seconds');
                    } else if ($('#tagLink').hasClass('badge text-bg-warning')) {
                        $('#tagLink').removeAttr('data-i18n');
                        $('#tagLink').attr('data-i18n','[prepend]attemptingToConnectToLiveReplayTimingWindow;[append]seconds');
                        $('#tagLink').text(' '+ timeleft + ' ' );
                        $('#raceName').attr('data-i18n','retrievingCurrentSession');
                        $(document).localize()
                    } else  {
                        $('#tagLink').removeClass();
                        $('#tagSession').removeClass();
                        $('#currentSession').removeClass();
                        $('#raceName').removeClass();
                        $('#checkNetworkSettings,#infoTag').hide();
                        $('#tagLink').addClass('badge text-bg-primary');
                        $('#tagSession').addClass('badge text-bg-primary');
                        $('#currentSession').addClass('text-bg-primary');
                        $('#raceName').addClass('text-bg-primary');
                        $('#tagLink').removeAttr('data-i18n');
                        $('#tagLink').attr('data-i18n','[prepend]attemptingToConnectToF1MV;[append]seconds')
                        $('#raceName').attr('data-i18n','retrievingCurrentSession');
                        $('#tagLink').text(' '+ timeleft + ' ' );
                        $(document).localize()
                    }
                }
                timeleft -= 1;
            },1000);
        }
    } catch (error) {
        console.error(error);
        linkF1MV();
    }
}
/**
 * It gets the current race name from the F1MV API and displays it on the page.
 */
async function getCurrentSessionInfo(): Promise<string> {
    try {
        const response = await window.api.LiveTimingAPIGraphQL(config, ['SessionInfo']);
        const sessionName = await response.SessionInfo.Meeting.Name;
        const sessionType = await response.SessionInfo.Name;
        const sessionYear = parseInt(response.SessionInfo.StartDate);
        raceName = `${sessionYear + ' ' + sessionName}`;
        $('#raceName').text(raceName+ ' ' + sessionType);
        if (debugOn) console.log(`Current Race Name: ${raceName}`);
        return raceName;
    } catch (error) {
        if (debugOn) console.error('Unable to Get Data From F1MV GraphQL API:' + '\n' + error.message);
        return 'Unable to Get Data From F1MV GraphQL API';
    }
}

/**
 * It fetches the IP address of a device from a server, and returns it as a string.
 * @returns The IP address of the Pixoo device.
 */

async function getPixooIP(): Promise<string> {
    try {
        const response: Response = await fetch('https://app.divoom-gz.com/Device/ReturnSameLANDevice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data: {ReturnCode: number; DeviceList: {DevicePrivateIP: string}[]} = await response.json();

        if (data.ReturnCode === 0 && data.DeviceList.length > 0) {
            const device: {DevicePrivateIP: string} = data.DeviceList[0];
            pixooIP = device.DevicePrivateIP;
            console.log('Pixoo64 IP Address:', pixooIP);
            // You can do something with the pixooIP variable here
            return pixooIP;
        } else {
            console.log('Failed to retrieve Pixoo64 IP Address');
            return 'Failed to retrieve Pixoo64 IP Address';
        }
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
        return 'Failed to retrieve Pixoo64 IP Address';
    }
}

/**
 * It takes the currentMapTheme as an argument and returns the trackMapPath for the current race.
 * @param currentMapTheme - The current map theme that the user has selected.
 * @returns The trackMapPath variable is being returned.
 */
function getCurrentTrackPath(currentMapTheme: number): string {
    let trackMapPath: string;
    /* Creating a variable called trackMaps and assigning it the value of the trackMaps property of the mapThemes JSON in filesConfiguration.json. */
    const trackMaps = mapThemes[currentMapTheme].trackMaps;
    /* Checking to see if the raceName is in the trackMaps object. If it is, it returns the mapPath for the current race. */
    if (raceName in trackMaps) {
        trackMapPath = trackMaps[raceName];
        if (debugOn) console.log(`Track Map Path: ${trackMapPath}`);
        return trackMapPath;
    } else {
        if (debugOn) console.log('Map Not Found');
        return 'Map Not Found';
    }
}

/**
 * It saves the host and port to local storage.
 * @param host - The hostname of the server.
 * @param port{number} - The port number of the server.
 */
function saveSettings(host: string, port: number): void {
    $('.toast').remove();
    localStorage.setItem('host', host);
    /* The code below is checking if the port is valid or not. If the port is valid, it will save the port in the local storage. If the port is invalid, it will throw an error. */
    if (port >= 0 && port <= 65535) {
        localStorage.setItem('port', port.toString());
        if (debugOn) log('Network Settings Saved !');
        $('#networkSettings > h5')
            .after(`<div class="toast text-bg-dark" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000" data-bs-autohide="true">
        <div class="toast-header text-bg-success">
          <strong class="text-center me-auto">Network Settings Saved!</strong>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
        <p>Host:${host}</p>
        <p>Port:${port}</p>
        </div>
    </div>
    `);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        $('.toast').toast('show');
        autoConnectF1MV();
    } else {
        if (debugOn) log('Only Host Settings Saved !');
        $('#networkSettings > h5')
            .after(`<div class="toast text-bg-dark" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="5000" data-bs-autohide="true">
        <div class="toast-header text-bg-danger">
          <strong class="me-auto">ERROR: Invalid Port!</strong>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
        Only Host Settings Saved !
        <p>The Port Number ${port} is invalid. Please Enter a Valid Port Number Between 0 to 65535.</p>
        </div>
    </div>
        `);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        $('.toast').toast('show');
    }
}

/**
 * It creates a new instance of the application.
 * @param url - The URL of the page to open.
 * @param windowTitle - The title of the window.
 * @returns The windowInstance variable is being returned.
 */
function createNewInstance(url?: string | URL, windowTitle?: string): Window|null{
    if (arguments.length == 0) {
        url = './index.html';
        windowTitle = 'DigiFlag Instance';
    }
    try {
        const windowInstance = window.open(
            url,
            '_blank',
            `left=${instanceWindowOffsetX},top=${instanceWindowOffsetY},frame=${false},
            transparent=${true},menubar=no,autoHideMenuBar==${false},width=${instanceWindowWidth},height=${instanceWindowHeight},title=${windowTitle},icon=./build/icon.ico,nodeIntegration=yes,contextIsolation=no`
        );
        return windowInstance;
    } catch (error) {
        console.error(error);
        return null;
    }
}

/**
 * It checks if the host and port data is not null, if it is not null, it sets the host and port
 * variables to the data stored in local storage.
 */
/**
 * It clears the local storage and sets host and port back to default.
 */
function loadSettings() {
    const hostData = localStorage.getItem('host');
    const portData = localStorage.getItem('port');
    if (hostData && portData !== null) {
        config.host = hostData;
        config.port = parseInt(portData);
    }
}

function restoreSettings() {
    $('.toast').remove();
    if (localStorage !== null) localStorage.clear();
    config.host = 'localhost';
    config.port = 10101;
    $('#networkSettings > h5')
        .after(`<div class="toast text-bg-dark" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="5000" data-bs-autohide="true">
        <div class="toast-header text-bg-danger">
          <strong class="text-center me-auto">Reset Network Settings!</strong>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
        Reset Network Settings To Default Values!
        </div>
    </div>
    `);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    $('.toast').toast('show');
    if (debugOn) log('Reset Network Settings To Default');
    autoConnectF1MV();
}

/** It clears the local storage and sets host and port back to default.
 */

/**
 * It's a function that enables or disables debug mode.
 * @param status - true or false
 * @returns the value of true.
 */

function debugMode(status: boolean) {
    if (status === true) {
        if (debugOn) log(`Debug Mode Enabled`);
        debugOn = true;
    } else {
        if (debugOn) log(`Debug Mode Disabled`);
        debugOn = false;
    }
    return true;
}
/* Setting the debugMode to true or false based on the value of debugOn. */
debugMode(debugOn);
/**
 * If the flag is 'void' and the useTrackMap is true and the trackMapPath has a file extension, then
 * set the flagPath to the trackMapPath, otherwise, loop through the themes and if the theme.id is
 * equal to the currentTheme, then set the flagPath to the theme.gifs[flag]
 * @param flag - The flag to get the path for.
 * @returns The path to the GIF file.
 */
function getGifPath(flag: string) {
    let flagPath = '';
    /* Getting the current track path. */
    const trackMapPath = getCurrentTrackPath(currentMapTheme);
    /* Checking if the flag is 'void' and if the useTrackMap is true and if the trackMapPath has a file extension. */
    if (
        flag === 'void' &&
        useMVLogo === true)
        {
            for (let themeIndex = 0; themeIndex < themes.length; themeIndex++) {
                const theme = themes[themeIndex];
                if (theme.id === currentTheme) {
                    flagPath = theme.gifs['mv'];
                }
            }
        }
    else if (
        flag === 'void' &&
        useTrackMap === true &&
        trackMapPath.slice(((trackMapPath.lastIndexOf('.') - 1) >>> 0) + 2)
    ) {
        /* Setting only the void GIF to use TrackMap. */
        flagPath = trackMapPath;
    } else {
        for (let themeIndex = 0; themeIndex < themes.length; themeIndex++) {
            const theme = themes[themeIndex];
            if (theme.id === currentTheme) {
                flagPath = theme.gifs[flag];
            }
        }
    }
    if (debugOn) log(`${flag} requested, returning ${flagPath}`);
    return flagPath;
}
/**
 * When the user clicks on a theme, the theme is selected and the next button is enabled.
 * @param {number}id - the id of the theme
 */
function selectTheme(id: number) {
    if (debugOn) log('Theme Selected: ' + id);
    currentTheme = id;
    $('#nextTheme').prop('disabled', false);
}

/**
 * If the useTrackMap variable is true, then set the currentMapTheme variable to the id of the map
 * theme selected, get the current track path, and disable the launchDigiFlag button.
 * @param id - the id of the map theme selected
 */
function selectMapTheme(id: string) {
    if (useTrackMap == true) {
        if (debugOn) log('Map Theme selected : ' + mapThemes[id].name);
        currentMapTheme = parseInt(id);
        getCurrentTrackPath(currentMapTheme);
        $('#launchDigiFlag').prop('disabled', true);
    }
}

/**
 * If the flag is one of the following, then if the safety car flag is true, set the flag to the safety
 * car flag, otherwise if the virtual safety car flag is true, set the flag to the virtual safety car
 * flag, otherwise if the red flag is true, set the flag to the red flag, otherwise if the yellow flag
 * is true, set the flag to the yellow flag, otherwise if the current mode is 1, set the flag to the
 * void flag, otherwise set the flag to the void flag.
 * </code>
 * @param {string}flag - The flag to turn off
 * @returns The return value of the last statement in the function.
 */
async function turnOff(flag: string) {
    if (
        flag === 'ss' ||
        flag === 'rs' ||
        flag === 'chequered' ||
        flag === 'green' ||
        flag === 'blue' ||
        flag === 'slippery'
    ) {
        if (sc === true) {
            $('#digiflag').prop('src', getGifPath('sc'));
        } else {
            if (vsc === true) {
                $('#digiflag').prop('src', getGifPath('vsc'));
                return;
            } else {
                if (red === true) {
                    $('#digiflag').prop('src', getGifPath('red'));
                    return;
                } else {
                    if (yellow === true) {
                        $('#digiflag').prop('src', getGifPath('yellow'));
                        return;
                    }
                }
            }
            if (currentMode.valueOf() === 1) {
                const res = httpGet(`http://localhost:9093/pixoo/void/${currentTheme}/${pixooIP}`);
                if (res !== 'OK') {
                    log('Failed to change GIF on Pixoo64');
                }
                return;
            }
            $('#digiflag').prop('src', getGifPath('void'));
            lightOn = false;
        }
    } else {
        if (currentMode.valueOf() === 1) {
            const res = httpGet(`http://localhost:9093/pixoo/void/${currentTheme}/${pixooIP}`);
            if (res !== 'OK') {
                log('Failed to change GIF on Pixoo64');
            }
            return;
        }
        $('#digiflag').prop('src', getGifPath('void'));
        lightOn = false;
    }
}
/**
 * "If the flag is blue and the blue flag is disabled, return. If the mode is 1 and the current mode is
 * 1, send a request to the Pixoo64 to change the GIF. If the request fails, log an error. Otherwise,
 * return. Otherwise, set the flag path to the path of the flag and set the src of the #digiflag
 * element to the flag path."
 * </code>
 * @param {string}flag - the flag to change to
 * @param {number}mode -  0 = DigiFlag, 1 = Pixoo64
 * @returns a Promise.
 */
async function changeGif(flag: string, mode: number) {
    if (flag === 'blue' && disabledBlueFlag) return;
    if (mode === 1 && currentMode.valueOf() === 1) {
        const res = httpGet(`http://localhost:9093/pixoo/${flag}/${currentTheme}/${pixooIP}`);
        if (res !== 'OK') {
            log('Failed to change GIF on Pixoo64');
        }
        return;
    }
    const flagPath = getGifPath(flag);
    $('#digiflag').prop('src', flagPath);
    if (flag !== 'rain') {
        lightOn = true;
        lightOnRain = false;
    }
    if (flag === 'rain') {
        lightOn = false;
        lightOnRain = true;
    }
}

/**
 * It creates a menu that allows the user to select a theme, a device, and a track map style.
 */
function linkSuccess() {
    $('#selectTheme>*').remove()
    $('#tagLink').removeClass();
    $('#tagSession').removeClass();
    $('#raceName').removeClass();
    $('#currentSession').removeClass();
    $('#tagLink').addClass('badge text-bg-success');
    $('#tagLink').attr('data-i18n','successfullyConnectedToF1mvTimingWindow');
    $('#tagSession').addClass('badge text-bg-success');
    $('#currentSession').addClass('text-bg-success')
    $('#raceName').addClass('text-bg-success');
    $('#raceName').removeAttr('data-i18n');

    $('#tagSession').show();
    $('#linkF1MV').remove();
    $('#infoTag').remove();
    $('#checkNetworkSettings').remove();
    $('#networkSettings').remove()
    $('#selectTheme').append(`
    <p class="lead text-center fs-4 mb-1" data-i18n="selectADigiflagTheme"></p>
        <div id="themes">
        </div>
        <button type="button" id="nextTheme" class="btn btn-success" data-i18n="nextBtn;" disabled><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="feather feather-arrow-right">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
</button>
    `);
    $('#selectDevice').append(`
    <div class="lead text-center fs-4" data-i18n="selectADevice">Select a Device</div>
        <div class="form-check" id="window">
        <input class="form-check-input" type="radio" name="flexRadioDefault" id="windowRadio" checked>
        <label class="form-check-label" for="windowRadio">
            Window DigiFlag
        </label>
        </div>
        <span class="badge text-bg-danger" data-i18n="pixoo64IsNotCompatible" id="notAvailable" disabled>Pixoo 64 is Not Compatible with the Selected Theme</span>
        <div class="form-check" id="pixoo64">
        <input class="form-check-input" type="radio" name="flexRadioDefault" id="pixoo64Radio" data-bs-toggle="collapse" data-bs-target="#pixooIPContainer" aria-expanded="false" aria-controls="pixooIPContainer" disabled>
        <label class="form-check-label" for="pixoo64Radio">
            Pixoo 64 DigiFlag
        </label>
        <div class="collapse" id="pixooIPContainer">
        <span id="pixooIP">Pixoo IP: ${pixooIP}</span>
        </div>
        </div>
    `);
    $('#selectMisc').append(`<div class="lead text-center fs-4" data-i18n="miscOptions">
    Misc Options
  </div>
  <div class="form-check form-switch" id="trackMapSwitch">
    <input class="form-check-input" type="checkbox" role="switch" id="mapSwitch" data-bs-toggle="collapse" data-bs-target="#collapsetrackMapSelect" aria-expanded="false" aria-controls="collapsetrackMapSelect"> <label class="form-check-label theme" data-i18n="useF1TrackMapBackground" for="mapSwitch">Use F1 Track Map Background?</label>
  </div>
  <div class="collapse" id="collapsetrackMapSelect">
    <div id="trackMapStyle">
      <select class="form-select form-select-sm text-bg-dark mapTheme" id="trackMapStyleSelect">
      </select>
    </div>
  </div>
  <div class="form-check form-switch" id="mvLogoSwitch">
    <input class="form-check-input" type="checkbox" role="switch" id="mvSwitch"> <label class="form-check-label theme" data-i18n="useMultiviewerLogo" for="mvSwitch">Use MultiViewer Logo?</label>
  </div>
  <div class="form-check form-switch" id="blueFlag">
    <input class="form-check-input" type="checkbox" role="switch" id="blueFlagCheckbox"> <label class="form-check-label theme" data-i18n="removeBlueFlags" for="blueFlagCheckbox">Remove Blue Flags?</label>
  </div>`);
  miscOptionsRef=$('#selectDevice,#selectMisc').detach()
    $(document).localize()
    let theme: {id: number; name: string};
    for (let themeIndex = 0; themeIndex < themes.length; themeIndex++) {
        theme = themes[themeIndex];
        $('#themes').append(`
            <div class="form-check" id="window">
                <input class="form-check-input theme" type="radio" name="theme" id="${theme.id}">
                <label class="form-check-label theme ${theme.id}" for="${theme.id}">
                    ${theme.name}
                </label>
            </div>
        `);
    }
    $('.theme').on('change', (e) => {
        selectTheme(parseInt(e.target.id));
    });
    $('#nextTheme').on('click', () => {
        miscOptionsRef.appendTo('#menuContent')
       themeSelectRef= $('#selectTheme').detach();

        if (themes[currentTheme].compatibleWith.Pixoo64) {
            $('#notAvailable').hide();
            $('#pixoo64Radio').prop('disabled', false);
        }
        else{
            currentMode = 0;
            $('#notAvailable').show();
            $('#pixoo64Radio').prop('checked', false);
            $('#pixooIPContainer').removeClass()
            $('#pixooIPContainer').addClass('collapse');
            $('#windowRadio').prop('checked', true);
            $('#pixoo64Radio').prop('disabled', true);
            $('#mapSwitch').prop('disabled',false)
            $('#mvSwitch').prop('disabled', false);
        }
        $('#selectDevice').on('change', (e) => {
            if (e.target.id === 'pixoo64Radio') {
                if (debugOn) console.log('Pixoo64 was Selected');
                currentMode = 1;
                getPixooIP()
                if (debugOn) console.log('Current Mode: ' + currentMode);
                $('#collapsetrackMapSelect').removeClass();
                $('#collapsetrackMapSelect').addClass('collapse');
                $('#mapSwitch').prop('disabled', true);
                $("#mapSwitch").prop("checked",false)
            } else {
                if (debugOn) console.log('Window was Selected');
                currentMode = 0;
                $('#pixooIPContainer').removeClass()
                $('#pixooIPContainer').addClass('collapse');
                if (debugOn) console.log('Current Mode: ' + currentMode);
                $('#mapSwitch').prop('disabled', false);
            }
        });
        /* Checking if the blue flag is disabled, if it is, it will enable it. If it is not, it will disable
it. */
        $('#blueFlag').on('change', () => {
            if (disabledBlueFlag) {
                disabledBlueFlag = false;
                if (debugOn) log('Blue Flags Enabled: ' + disabledBlueFlag);
                return disabledBlueFlag;
            } else {
                disabledBlueFlag = true;
                if (debugOn) log('Blue Flags Disabled: ' + disabledBlueFlag);
                return disabledBlueFlag;
            }
        });
        $('#mvLogoSwitch').on('change', () => {
            if (useMVLogo) {
                useMVLogo = false;
                if (debugOn) log('MV Logo Enabled: ' + useMVLogo);
                $('#mapSwitch').prop('disabled',false)
                return useMVLogo;
            } else {
                useMVLogo = true;
                if (debugOn) log('MV Logo Disabled: ' + useMVLogo);
                $('#mapSwitch').prop('disabled',true)
                return useMVLogo;
            }
        });
        /* Creating a switch that toggles the use of a track map as a background. */
        $('#trackMapSwitch').on('change', () => {
            if (useTrackMap) {
                useTrackMap = false;
                if (debugOn) log('use TrackMap as Background? : ' + useTrackMap);
                $('#mvSwitch').prop('disabled', false);
                $('#launchDigiFlag').prop('disabled', false);
                return useTrackMap;
            } else {
                useTrackMap = true;
                if (debugOn) log('use TrackMap as Background? : ' + useTrackMap);
                $('#mvSwitch').prop('disabled', true);
                $('#launchDigiFlag').prop('disabled', true);
                $('#trackMapStyleSelect>option').remove();
                /* Creating a dropdown menu with the names of the map themes. */
                $('#trackMapStyleSelect').append(
                    `<option  data-i18n="selectAMapStyle"  value="none" selected disabled hidden>Select a Map Style</option>`
                );
                for (let mapIndex = 0; mapIndex < mapThemes.length; mapIndex++) {
                    const mapTheme = mapThemes[mapIndex];
                    $('#trackMapStyleSelect').append(
                        `<option id=${mapTheme.id} value=${mapTheme.id}>${mapTheme.name}</option> `
                    );
                }
                $('#0').attr('data-i18n','mapTheme.streetMap')
                $('#1').attr('data-i18n','mapTheme.satelliteMap')
                $(document).localize()
                /* Changing the map style when the user selects a different style from the dropdown menu. */
                $('#trackMapStyleSelect').on('change', () => {
                    const mapID = $('#trackMapStyleSelect').val();
                    selectMapTheme(mapID.toString());
                    $('#launchDigiFlag').prop('disabled', false);
                });
                return useTrackMap;
            }
        });
        $('#menuContent').append(
            `<div id="menuButtonsContainer"><button type="button" id="backButton" class="btn btn-success" data-i18n="back">Back</button>
            <button type="button" id="launchDigiFlag" class="btn btn-success" data-i18n="startDigiflag">Start DigiFlag</button></div>`
        );
        $('#backButton').on('click', () => {
            themeSelectRef.appendTo('#menuContent')
            $(document).localize()
            miscOptionsRef.remove()
            $('#menuButtonsContainer').remove();
        })
        $('#launchDigiFlag').on('click', () => {
            $('.menu-box').remove();
            $('body').append(`<img src="${getGifPath('void')}" id="digiflag" class="img-fluid center-screen">`);
            $('#digiflag').insertBefore('.bottom-screen');
            $('.bottom-screen:not(:hover)').animate(
                {
                    opacity: 0,
                },
                2000,
                'swing',
                function () {
                    $('.bottom-screen').removeAttr('style');
                }
            );
            $('#zoomIn,#zoomOut,#zoomReset').show();
            $('#zoomControl').css('z-index', 1);
            started = true;
        });
        $(document).localize()
    });
}
/**
 * It's a function that checks if the F1MV is running and if it is, it will change the text of a tag to
 * "F1MV is running".
 * @param force - boolean
 * @returns The response is a JSON object.
 */
async function linkF1MV(force?: boolean) {
    if (debugOn) log('Link started...');
    try {
        const response = await window.api.LiveTimingAPIGraphQL(config, 'Heartbeat');

        if (!response) {
            if (force) {
                linkSuccess();
                return;
            }
            $('#tagLink').removeClass();
            $('#tagSession').removeClass();
            $('#currentSession').removeClass();
            $('#raceName').removeClass();
            $('#tagLink').addClass('badge text-bg-warning');
            $('#raceName').addClass('text-bg-warning');
            $('#currentSession').addClass('text-bg-warning');
            $('#tagSession').addClass('badge text-bg-warning');
            $('#networkSettings').hide();
            $('#tagLink').attr('data-i18n','youAreConnectedToF1mvButTheLiveReplayTimingWindowIsNotOpen');
            $('#checkNetworkSettings,#infoTag').hide();
            $('#raceName').attr('data-i18n','unableToRetrieveCurrentSessionFromF1mv')
            $('#checkNetworkSettings,#infoTag').hide();
            $(document).localize()
            setTimeout(() => {
                autoConnectF1MV();
            }, 1000);
        } else {
            linkSuccess();
        }
    } catch (e) {
        if (force) {
            linkSuccess();
            return;
        }
        /* Adding the class text-bg-danger to the element with the id tagLink. */
        $('#tagLink').addClass('badge text-bg-danger');
        $('#tagSession').addClass('badge text-bg-danger');
        $('#currentSession').addClass('text-bg-danger');
        $('#raceName').addClass('text-bg-danger');
        /* Changing the text of the tag with the id tagLink to Failed to connect to F1MV */
        $('#tagLink').removeAttr('data-i18n');
        $('#raceName').removeAttr('data-i18n');
        $('#raceName').attr('data-i18n','failedToRetrieveCurrentSession');
        $('#tagLink').attr('data-i18n','failedToConnect');
        $('#networkSettings').show();
        $('#checkNetworkSettings,#infoTag').show();
        $(document).localize()
        /* Changing the text of the element with the id "infoTag" to "Maybe you are trying to connect
        to another host? Maybe your port isn't the default one?" */
        /* The above code is changing the text of the element with the id of checkNetworkSettings to
       Click on the Settings Gear Above to check your Network Settings. */
        setTimeout(() => {
        $('#tagLink').removeAttr('data-i18n');
        $('#raceName').removeAttr('data-i18n');
            autoConnectF1MV();
        }, 5000);
    }
}

/* A function that is called when the page is loaded. */
$(function () {
    loadSettings();
    if (countDownRunning === false) {
        autoConnectF1MV();
    }
    $('#version').text(`DigiFlag Version: ${version}`);
    $('#raceName').text(raceName);
    $('.bottom-screen:not(:hover)').css('opacity', 1);
    $('#linkF1MV').remove();

    /* The code below is appending a SVG globe icon, a h5 tag with the text "Network", a
    label with the text "Multiviewer API IP: ", an input tag with the class "form-control" and the value of the variable host and the id "ip", a label with the text "Multiviewer API Port: ", an input tag with the class "form-control" and the value
    of the variable port and the id "port", a div tag with the class "networkbuttons-container" and
    two button tags with the class networkbuttons-container  */
    $('#settingsButton').one('click', () => {
        $('#networkSettings')
            .append(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="globe" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>`);
        $('#networkSettings').append('<h5 data-i18n="network">Network</h5>');
        $('#networkSettings').append(
            `<label for="ip">Multiviewer API IP:</label>
            <input type="text" class="form-control-sm text-bg-dark" value="${config.host}" id="ip">`
        );

        $('#networkSettings').append(
            `<label for="port">Multiviewer API Port:</label>
            <input type="text" class="form-control-sm text-bg-dark" maxlength="5" value="${config.port}" id="port">`
        );
        $('#networkSettings').append(
            $('<div/>', {
                class: 'networkbuttons-container',
            }).append(
                '<button type="button" id="updateSettings" class="btn-sm btn btn-primary" data-i18n="saveNetworkSettings">Save Network Settings</button>',
                '<button type="button" id="restoreSettings" class="btn-sm btn btn-danger" data-i18n="restoreDefaultSettings">Restore Default Network Settings </button>'
            )
        );
        $('#networkSettings').localize()
        $('#updateSettings').on('click', () => {
            if (debugOn) log('Editing Settings...');
            /* Assigning the value of the input field with the id of "ip" to the variable "host". */
            const host = $('#ip').val().toString();
            config.host = host;

            if (debugOn) log($('#ip').text());
            if (debugOn) log(`IP = ${$('#ip').val()} = ${config.host}`);
            /* Assigning the value of the input field with the id of port to the variable port. */
            const port = $('#port').val().toString();

            config.port = parseInt(port);

            if (debugOn) log($('#port').text());
            if (debugOn) log(`PORT = ${$('#port').val()} = ${config.port}`);
            saveSettings(config.host, config.port);
        });
        $('#restoreSettings').on('click', () => {
            /* Setting the value of the input fields back to localhost and 10101. */
            $('#ip').val('localhost');
            $('#port').val(10101);
            restoreSettings();
        });
    });
    /* Creating a new instance of the class when the button is clicked. */
    $('#newInstance').on('click', () => {
        createNewInstance();
    });
    /* Creating a new instance of the browser and opening the link to the Github Repo. */
    $('#openGithub').on('click', () => {
        createNewInstance('https://github.com/LapsTimeOFF/DigiFlag_F1MV');
    });
    /* Increasing the zoom of the image by 20px when the button is clicked. */
    $('#zoomIn').on('click', () => {
        const zoomScaleAdd = (scale = scale + 0.25);
        if (zoomScaleAdd >= 1.75)
            scale = 0.75;
        $('main,.center-screen').css({
            transform: 'scale(' + zoomScaleAdd + ')',
        });
    });
    /* Decreasing the zoom of the image by 20px when the button is clicked. */
    $('#zoomOut').on('click', () => {
        const zoomScaleSubtract = (scale = scale - 0.25);
        if (zoomScaleSubtract <= 0.25)
            scale = 1.25;
        $('main,.center-screen').css({
            transform: 'scale(' + zoomScaleSubtract + ')',
        });
    });
    $('#zoomReset').on('click', () => {
        $('main,.center-screen').removeAttr('style');
        scale = 1;
    });
});

const checkRCM = async () => {
    if (started === false) return;
    const result = LT_Data.RaceControlMessages;
    if (result.Messages.length === oldMessages.Messages.length) {
        if (debugOn) log('No new messages.');
    } else {
        if (debugOn) log('New message');
        oldMessages = result;

        /* Filtering the messages to only include the ones that are of interest to us. */
        const filteredMessages = result.Messages.filter(
            (message) =>
                message.Category === 'Flag' ||
                message.Category === 'Other' ||
                message.Category === 'SafetyCar' ||
                message.Category === 'Drs' ||
                message.Message.match(/ROLLING START/i) ||
                message.Message.match(/STANDING START/i)
        );
        /* Taking the last element of the array and returning it. */
        const recentMessage = filteredMessages.slice(-1)[0];

        if (debugOn) console.log('Most Recent Filtered Message: ');
        if (debugOn) console.table(recentMessage);
        if (debugOn) console.log('Most Recent RCM Message: ');
        if (debugOn) console.table(result.Messages.slice(-1)[0]);
        /* Checking if the message contains the word "BLACK AND ORANGE" and if it does, it sets the category to "Flag" and the flag to "BLACK AND ORANGE". */
        if (recentMessage.Message.match(/BLACK AND ORANGE/i)) {
            recentMessage.Category = 'Flag';
            recentMessage.Flag = 'BLACK AND ORANGE';
        }
/* Checking if the message contains the word "BLACK AND WHITE" and if it does, it will change the gif
to black and white, wait 2.5 seconds, then change the gif to the racing number, wait 2.5 seconds,
then turn off the racing number gif, then turn off the black and white gif. */
        if (recentMessage.Message.match(/BLACK AND WHITE/i)) {
            changeGif('blackandwhite', currentMode);
            await timer(3500);
            const recentRacingNumber = recentMessage.RacingNumber;
            if (recentRacingNumber in themes[currentTheme].gifs) {
                changeGif(recentRacingNumber, currentMode);
                await timer(3500);
                turnOff(recentRacingNumber);
            } else {
                if (debugOn) console.log(`No racing number GIF found for ${recentRacingNumber}`);
            }
            turnOff('blackandwhite');
            return;
        }
/* Checking the recentMessage.SubCategory to see if it is a TimePenalty. If it is, it is checking the
recentMessage.Message to see if it contains the text "CAR #" where # is a number. If it does, it is
checking the recentMessage.Message to see if it contains the text "5 SECOND TIME PENALTY" or "10
SECOND TIME PENALTY". If it does, it is changing the gif to the appropriate gif and then turning it
off after a certain amount of time. */
        if (recentMessage.SubCategory === 'TimePenalty') {
           /* Using a regular expression to match the message to a pattern. */
            const carNumberMatch = recentMessage.Message.match(/CAR (\d+)/i);
            if (carNumberMatch) {
            /* Using a regular expression to extract the car number from the string. */
              const carNumber = carNumberMatch[1];
              if (debugOn) console.log(`Car Number: ${carNumber}`)
              if (recentMessage.Message.match(/5 SECOND TIME PENALTY/i)) {
                changeGif('timepenalty5sec', currentMode);
                await timer(3500);
                turnOff('timepenalty5sec');
                changeGif(carNumber, currentMode);
                await timer(3500);
                turnOff(carNumber);
              }
              if (recentMessage.Message.match(/10 SECOND TIME PENALTY/i)) {
                changeGif('timepenalty10sec', currentMode);
                await timer(3500);
                turnOff('timepenalty10sec');
                changeGif(carNumber, currentMode);
                await timer(3500);
                turnOff(carNumber);
              }
            }
          }
        /* Checking if the message contains the word "ROLLING START" and if it does, it will change the gif to "rs" and then turn it off after 20 seconds. */
        if (
            recentMessage.Message.match(/ROLLING START/i) &&
            //Fixes an issue When the Rolling Start Flag Would Display when a ROLLING START PROCEDURE INFRINGEMENT Occurs
            recentMessage.SubCategory !== 'IncidentInvestigationAfterSession'
        ) {
            changeGif('rs', currentMode);
            await timer(20000);
            turnOff('rs');
            return;
        }
        if (recentMessage.Message.match(/STANDING START/i)) {
            changeGif('ss', currentMode);
            await timer(20000);
            turnOff('ss');
            return;
        }
        if (recentMessage.Message.match(/DRS ENABLED/i)) {
            changeGif('DRSenabled', currentMode);
            await timer(3500);
            turnOff('DRSenabled');
            return;
        }
        if (recentMessage.Message.match(/DRS DISABLED/i)) {
            changeGif('DRSdisabled', currentMode);
            await timer(3500);
            turnOff('DRSdisabled');
            return;
        }

        if (recentMessage.SubCategory === 'TrackSurfaceSlippery') {
            changeGif('slippery', currentMode)
            await timer(5000);
            turnOff('slippery');
            return;
        }

        if (recentMessage.Category === 'SafetyCar' && recentMessage.Mode !== 'VIRTUAL SAFETY CAR') {
            sc = true;
            changeGif('sc', currentMode);
        }
        if (recentMessage.Mode === 'VIRTUAL SAFETY CAR') {
            vsc = true;
            changeGif('vsc', currentMode);
        }
        if (recentMessage.Flag === 'CHEQUERED') {
            changeGif('chequered', currentMode);
            await timer(90000);
            turnOff('chequered');
            return;
        }
        /* Checking if the recent message is a track message and if it is, it is checking if the flag is
red. If it is, it changes the gif to red. If it is not, it sets the sc, vsc, and red
variables to false and then changes the gif to green. It then waits 2.5 seconds and turns off
the green gif. */
        if (recentMessage.Scope === 'Track') {
            if (recentMessage.Flag === 'RED') {
                changeGif('red', currentMode);
                return;
            }
            sc = false;
            vsc = false;
            red = false;
            changeGif('green', currentMode);
            await timer(2500);
            turnOff('green');
            return;
        }
        if (recentMessage.Category === 'Flag') {
            switch (recentMessage.Flag) {
                case 'YELLOW':
                    changeGif('yellow', currentMode);
                    break;
                case 'DOUBLE YELLOW':
                    changeGif('dyellow', currentMode);
                    break;
                case 'CLEAR':
                    changeGif('green', currentMode);
                    await timer(2500);
                    turnOff('green');
                    break;
                case 'RED':
                    red = true;
                    changeGif('red', currentMode);
                    await timer(90000);
                    turnOff('red');
                    break;
                case 'BLUE':
                    changeGif('blue', currentMode);
                    await timer(1000);
                    turnOff('blue');
                    break;
                default:
                    break;
            }
        }
    }
};
/**
 *
 * If the track status is green, then give All Clear Message.
 * If the track status is yellow, turn on the yellow lights.
 * If the track status is SC, turn on the SC lights.
 * If the track status is red, turn on the red lights.
 * If the track status is VSC, turn on the VSC lights.
 * @returns the status of the track
 */
async function checkStatus() {
    if (!started) return;
    /* Getting the track status from the Live Timing Data. */
    const trackStatus = LT_Data.TrackStatus.Status;
    // {"Status":"1","Message":"AllClear"}
    // {"Status":"2","Message":"Yellow"}
    // {"Status":"4","Message":"SCDeployed"}
    // {"Status":"5","Message":"Red"}
    // {"Status":"6","Message":"VSCDeployed"}
    // {"Status":"7","Message":"VSCEnding"}
    if (trackStatus === '1') {
        if (sc || vsc || red || yellow) {
            if (debugOn) log('New track status : Green');
            sc = false;
            yellow = false;
            vsc = false;
            red = false;
            changeGif('green', currentMode);
            await timer(2500);
            turnOff('green');
        }
    }
    if (trackStatus === '2') {
        if (debugOn) log('New track status : Yellow');
        sc = false;
        yellow = true;
        vsc = false;
        red = false;
    }
    if (trackStatus === '4') {
        if (debugOn) log('New track status : SC');
        sc = true;
        yellow = false;
        vsc = false;
        red = false;
    }
    if (trackStatus === '5') {
        if (debugOn) log('New track status : Red');
        sc = false;
        yellow = false;
        vsc = false;
        red = true;
    }
    if (trackStatus === '6') {
        if (debugOn) log('New track status : VSC');
        sc = false;
        yellow = false;
        vsc = true;
        red = false;
    }
}

/**
 * Check if it's raining, if it is, turn on the rain lights
 * @returns if it's raining or not
 * @author LapsTime
 */

async function checkRain() {
    if (!started) return;
    /* Checking to see if the light is on. If it is, it will return. */
    if (lightOn) return;

    /* Extract if it's raining or not from the Live Timing data */
    const Rain = LT_Data.WeatherData.Rainfall;
    if (debugOn) console.log(Rain)
    switch (Rain) {
        case '1':
            raining = true;
            if (debugOn) console.log(`Rain Status ${raining}`);
            if (!lightOnRain) {
                changeGif('rain', currentMode);
                lightOnRain = true;
            }
            break;
        case '0':
            raining = false;
            if (debugOn) console.log(`Rain Status ${raining}`);
            if (lightOnRain) {
                lightOnRain = false;
                changeGif('void', currentMode);
            }
            break;
    }
}

/**
 * Update the Live Timing data
 * @returns the live timing data
 * @author LapsTime
 */
async function updateData() {
    try {
        if (started)
            LT_Data = await window.api.LiveTimingAPIGraphQL(config, ['RaceControlMessages', 'TrackStatus', 'WeatherData']);
        return LT_Data;
} catch (error) {
        console.error(error)
        console.log('Reloaded Window Due to Disconnect')
        window.location.reload()
        return null
    }
}

/* Update the Live Timing data every 100 milliseconds */
setInterval(updateData, 100);
/* Checking the RCM every 100 milliseconds. */
setInterval(checkRCM, 100);
/* Checking the Rain every 100 milliseconds */
setInterval(checkRain, 100);
/* Checking the status of the track every 100 milliseconds. */
setInterval(checkStatus, 100);

/**
 * If the background is transparent, make it opaque. If the background is opaque, make it transparent.
 */

//Disabling Transparency For Now

// function toggleTransparency() {
//     if (windowTransparency) {
//         $('body').removeAttr('style');
//         windowTransparency = false;
//     } else {
//         $('body').css('background-color', 'transparent');
//         windowTransparency = true;
//     }
// }
// /* Listening for the escape key to be pressed and then calling the toggleBackground function. */
// document.addEventListener('keydown', (e) => {
//     if (e.key == 'Escape') {
//         toggleTransparency();
//     }
// });

/**
 * The function returns a promise that resolves to the value returned by the
 * window.api.getAlwaysOnTop() function.
 * @returns A promise.
 */
async function getAlwaysOnTopSetting() {
    return await window.api.getAlwaysOnTop();
}

/* Getting the value of the alwaysOnTop setting from the storage and setting the checkbox to the
value. */
jQuery(async () => {
    const alwaysOnTop = await getAlwaysOnTopSetting();
    $('#alwaysOnTopSwitch').prop('checked', alwaysOnTop);
});

/* When the alwaysOnTop switch is changed it window to always on top. */
$('#alwaysOnTopSwitch').on('change', async () => {
    await window.api.setAlwaysOnTop();
});
