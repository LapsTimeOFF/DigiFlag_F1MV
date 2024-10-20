import {Theme, MapTheme, FilesConfig} from './types/filesConfig';
import {F1LiveTimingState} from './types/multiViewerAPI';
/* Declaring a variable called host and assigning it the value of "127.0.0.1". */

const userAgent = globalThis.navigator.userAgent;
const host = '127.0.0.1';
/* Creating a variable called port and assigning it the value of 10101. */
const port = 10101;
// Create the config object
const config = {
    host: host,
    port: port,
};

let themes: Theme[];
let mapThemes: MapTheme[];
/**
 * It takes a number of milliseconds as an argument, and returns a promise that resolves after that
 * number of milliseconds.
 * @param ms - The amount of time to wait before resolving the promise.
 */
const timer = (ms: number) => new Promise((response) => setTimeout(response, ms));
/* Declaring a variable called debugOn and assigning it a value of false. */
let debugOn = true;
let expressIP = '';
// let windowTransparency = false;
let currentZoom = 1;
const maxZoom = 2;
const minZoom = 0.5;
let started = false;
let currentTrackStatus = '';
let currentRainStatus = '';
let yellow = false;
let sc = false;
let vsc = false;
let red = false;
let version = '';
let themeSelectReference: JQuery<HTMLElement>;
let miscOptionsReference: JQuery<HTMLElement>;
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
export interface PixooData {
    ReturnCode?: number;
    ReturnMessage?: string;
    DeviceList: PixooDeviceList[];
}

export interface PixooDeviceList {
    DeviceName: string;
    DeviceId: number;
    DevicePrivateIP: string;
    DeviceMac: string;
}

let lightOnRain = false;
/* Declaring a variable called currentTheme and assigning it a value of 1. */
let currentTheme = 1;
let currentMapTheme = 0;
let raceName = 'Unknown';
let raceYear = 0;
let currentMode = 0; // 0 for window, 1 for pixoo64
let blueFlagSwitch = false;
let trackMapSwitch = false;
let mvLogoSwitch = false;
let extraFlagSwitch = false;
let pixooIPs: string[];
let pixoostartup = false;
let isGifPlaying = false;
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

try {
    const response = await fetch('./filesConfiguration.json');
    if (response.ok) {
        const data: FilesConfig = await response.json();
        themes = data.themes;
        mapThemes = data.mapThemes;
    } else {
        throw new Error(`Failed to load file configuration: ${response.status}`);
    }
} catch (error) {
    console.error(error);
}

const logs: string[] = [];

const escapeHtml = (unsafe: string) => {
    return unsafe
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
};

/**
 * If the last item in the logs array is the same as the text passed in, then return. Otherwise, add
 * the text to the logs array.
 * @param text - The text to be logged.
 * @returns the value of the last expression evaluated.
 */
function log(text: string) {
    console.log(text);
    if (logs.at(-1) === text) return;
    logs.push(text);
}

/**
 * This function asynchronously retrieves the version of DigiFlag and returns it as a string.
 * @returns  a Promise that resolves to a string, which is the version obtained from calling the `getVersion() function of the `window.api` object.
 */
async function getDigiFlagVersion() {
    version = await globalThis.api.getVersion();
    return version;
}
if (/electron/i.test(userAgent)) {
    await getDigiFlagVersion();
} else {
    version = '2.7.0';
}
/**
 * This function asynchronously retrieves the IP address of the Express server.
 * @returns A Promise that resolves to a string representing the IP address of the Express server.
 */
async function getExpressIP(): Promise<string> {
    expressIP = await globalThis.api.getExpressIP();
    console.log(`Express IP: ${expressIP}`);
    $('#expressIP').text(`Express Server IP: ${expressIP}`);
    return expressIP;
}

let countDownRunning = false;
/**
 * If the MultiViewer Instance is found, start a countdown timer, and when the timer is finished, run the
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
                        $('#tagLink').text('Retrying to Connect to MultiViewer in : ' + timeleft + ' seconds');
                    } else if ($('#tagLink').hasClass('badge text-bg-warning')) {
                        $('#tagLink').removeAttr('data-i18n');
                        $('#tagLink').attr(
                            'data-i18n',
                            '[prepend]attemptingToConnectToLiveReplayTimingWindow;[append]seconds'
                        );
                        $('#tagLink').text(' ' + timeleft + ' ');
                        $('#raceName').attr('data-i18n', 'retrievingCurrentSession');
                        $(document).localize();
                    } else {
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
                        $('#tagLink').attr('data-i18n', '[prepend]attemptingToConnectToF1MV;[append]seconds');
                        $('#raceName').attr('data-i18n', 'retrievingCurrentSession');
                        $('#tagLink').text(' ' + timeleft + ' ');
                        $(document).localize();
                    }
                }
                timeleft -= 1;
            }, 1000);
        }
    } catch (error) {
        console.error(error);
        linkF1MV();
    }
}
/**
 * It gets the current race name from the MultiViewer API and displays it on the page.
 */
async function getCurrentSessionInfo(): Promise<string> {
    try {
        const response: F1LiveTimingState = await globalThis.api.LiveTimingAPIGraphQL(config, ['SessionInfo']);

        // Check if response and response.SessionInfo exist
        if (!response || !response.SessionInfo) {
            throw new Error('SessionInfo is null or undefined');
        }

        const sessionName = response.SessionInfo.Meeting?.Name;
        const sessionType = response.SessionInfo?.Name;
        raceYear = Number.parseInt(response.SessionInfo.StartDate);

        // Ensure sessionName and sessionType are defined
        if (!sessionName || !sessionType) {
            throw new Error('Incomplete session information');
        }

        raceName = `${raceYear + ' ' + sessionName}`;
        $('#raceName').text(raceName + ' ' + sessionType);
        if (debugOn) console.log(`Current Race Name: ${raceName}`);
        return raceName;
    } catch (error) {
        if (debugOn)
            console.error('Unable to Get Data From MultiViewer GraphQL API:' + '\n' + (error as Error).message);
        return 'Unable to Get Data From MultiViewer GraphQL API';
    }
}

/**
 * It fetches the IP address of a device from a server, and returns it as a string.
 * @returns The IP address of the Pixoo device.
 */

async function getPixooIPs(): Promise<PixooDeviceList[]> {
    try {
        const response = await fetch('https://app.divoom-gz.com/Device/ReturnSameLANDevice');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const pixooData: PixooData = await response.json();

        // Extract all device IPs
        pixooIPs = pixooData.DeviceList.map((device) => device.DevicePrivateIP);

        // Send all IPs to the main process
        globalThis.api.getPixooIP(pixooIPs);

        return pixooData.DeviceList;
    } catch (error) {
        console.error('Error fetching Pixoo devices:', error);

        // Clear the pixooIPs array in case of error
        pixooIPs = [];

        // Return an empty array if there's an error
        return [];
    }
}

function updatePixooDisplay(pixooDevices: PixooDeviceList[]) {
    const pixooIPsContainer = document.querySelector('#pixooIPs');
    if (pixooIPsContainer) {
        pixooIPsContainer.innerHTML = pixooDevices
            .map((device, index) => `<span id="pixooIP${index}">${device.DeviceName}: ${device.DevicePrivateIP}</span>`)
            .join('<br>');
    }
}

async function fetchAndDisplayPixooDevices() {
    const pixooDevices = await getPixooIPs();
    updatePixooDisplay(pixooDevices);
}
/**
 * Initializes the Pixoo64 device by displaying a startup sequence of GIF images.
 *
 * @returns A Promise that resolves when the initialization is complete.
 */
async function initializePixoo() {
    // At start, display MVlogo to init display
    if (pixoostartup === true && currentMode === 1) {
        if (debugOn) log('Pixoo64 showing startup sequence');
        /*If `mvLogoSwitch` is `true`, it will display a Pixoo Startup Gif with an MV Logo.
        Otherwise, it will use the standard Pixoo Startup. */
        if (mvLogoSwitch === true) {
            changeGif('pixoostartupMV', currentMode);
        } else {
            changeGif('pixoostartup', currentMode);
        }
        //Wait for Pixoo Startup Gif to Finish
        await timer(10000);
        changeGif('void', currentMode);
        await timer(2000);
        if (debugOn) log('Pixoo64 ending startup sequence');
        await timer(2000);
        // We change the status at the end of the sequence to ensure we don't interfere with the startup, e.g. rain detected
        pixoostartup = false;
    }
}

/**
 * The function `getCurrentTrackPath` returns the path of the current track map based on the current map theme
 * @param {number} currentMapTheme - The currentMapTheme parameter is a number that represents the
 * theme of the map.
 * @returns  The function will return either the track map path if it is found in the map theme, or it
 * will return 'Map Not Found' if the track map is not found. If the track map switch is not enabled,
 * it will return 'TrackMap Not Enabled'.
 */
function getCurrentTrackPath(currentMapTheme: number): string {
    if (trackMapSwitch === true) {
        let trackMapPath: string;

        // Creating a variable called mapTheme and assigning it the value of the mapThemes JSON in filesConfiguration.json.
        const mapTheme = mapThemes[currentMapTheme];

        /* The above code is iterating through the `trackMaps` property of each season in the `mapTheme`
       object. It checks if the `raceName` exists as a key in the `trackMaps` object. If it does,
       it assigns the corresponding value to the `trackMapPath` variable and returns it. */
        for (let index = 0; index < mapTheme.seasons.length; index++) {
            const trackMaps = mapTheme.seasons[index].trackMaps;

            if (raceName in trackMaps) {
                trackMapPath = trackMaps[raceName];
                if (debugOn) console.log(`Track Map Path: ${trackMapPath}`);
                return trackMapPath;
            }
        }

        if (debugOn) console.log('Map Not Found');
        return 'Map Not Found';
    } else {
        return 'TrackMap Not Enabled';
    }
}
/**
 * The function `getDriverNumberPath` retrieves the path for a specific driver number based on the
 * current theme and race year.
 * @param {string} DriverNumber - The `DriverNumber` parameter in the `getDriverNumberPath` function is
 * a string that represents the driver number for which you want to retrieve the corresponding path.
 * @returns The function `getDriverNumberPath` returns the `DriverNumberPath` based on the
 * `DriverNumber` index if a match is found in the `driverNumbersArray`. If no match is found, it
 * returns 'Driver Number Not Found'.
 */
function getDriverNumberPath(DriverNumber: string): string {
    const driverNumbersArray = themes[currentTheme].gifs.driverNumber;
    let DriverNumberPath: string;

    if (driverNumbersArray) {
        for (const element of driverNumbersArray) {
            const DriverNumbers = element.DriverNumbers;
            const DriverSeason = element.year;
            const raceYearRegex = new RegExp(raceYear.toString());
            if (raceYearRegex.test(DriverSeason)) {
                DriverNumberPath = DriverNumbers[DriverNumber];
                if (debugOn) console.log(`Driver Number Path: ${DriverNumberPath}`);
                return DriverNumberPath;
            }
        }
    }

    if (debugOn) console.log('Driver Number Not Found');
    return 'Driver Number Not Found';
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
function createNewInstance(url?: string | URL, windowTitle?: string) {
    if (arguments.length === 0) {
        url = './index.html';
        windowTitle = 'DigiFlag Instance';
    }
    try {
        const windowInstance = window.open(
            url,
            '_blank',
            `left=${instanceWindowOffsetX},top=${instanceWindowOffsetY},frame=${false},
            transparent=${true},menubar=no,autoHideMenuBar=${true},width=${instanceWindowWidth},height=${instanceWindowHeight},title=${windowTitle},icon=./build/icon.ico,nodeIntegration=no`
        );
        return windowInstance;
    } catch (error) {
        console.error(error);
        return;
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
        config.port = Number.parseInt(portData);
    }
}

function restoreSettings() {
    $('.toast').remove();
    if (localStorage !== null) localStorage.clear();
    config.host = '127.0.0.1';
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
function ipInvalidToast() {
    $('.toast').remove();
    $('#networkSettings > h5')
        .after(`<div class="toast text-bg-dark" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="5000" data-bs-autohide="true">
        <div class="toast-header text-bg-danger">
          <strong class="text-center me-auto">Invalid IP Address!</strong>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
        Please enter a valid IPv4 address (e.g., 192.168.0.1)
        </div>
    </div>
    `);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    $('.toast').toast('show');
}
function portInvalidToast() {
    $('.toast').remove();
    $('#networkSettings > h5')
        .after(`<div class="toast text-bg-dark" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="5000" data-bs-autohide="true">
        <div class="toast-header text-bg-danger">
          <strong class="text-center me-auto">Invalid Port Number!</strong>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
        Please enter a valid port number (1-65535)
        </div>
    </div>
    `);

    $('.toast').toast('show');
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
 * The function `getGifPath` determines the path of a GIF based on the provided flag and optional
 * driver number, considering various conditions and themes.
 * @param {string} flag - The `flag` parameter in the `getGifPath` function is used to determine which
 * GIF path to retrieve. It is a required parameter and should be a string value. The function checks
 * different conditions based on the value of the `flag` parameter to determine the appropriate GIF
 * path to return.
 * @param {string} [driverNumber] - The `driverNumber` parameter in the `getGifPath` function is an
 * optional parameter that represents the driver number. If provided,
 * it is used to generate the path for the GIF image corresponding to that driver number.
 * @returns The function `getGifPath` returns the path of a GIF image based on the provided flag and
 * optional driver number.
 */
function getGifPath(flag: string, driverNumber?: string) {
    let flagPath = '';
    /* Getting the current track path. */
    const trackMapPath = getCurrentTrackPath(currentMapTheme);
    /* Checking if the flag is 'void' and if the useTrackMap is true and if the trackMapPath has a file extension. */
    if (flag === 'void' && mvLogoSwitch === true) {
        for (const theme of themes) {
            if (theme.id === currentTheme) {
                flagPath = theme.gifs['mv'];
            }
        }
    } else if (
        flag === 'void' &&
        trackMapSwitch === true &&
        trackMapPath.slice(((trackMapPath.lastIndexOf('.') - 1) >>> 0) + 2)
    ) {
        /* Setting only the void GIF to use TrackMap. */
        flagPath = trackMapPath;
        $('#digiflag').css('width', 'auto');
        $('#digiflag').css('object-fit', 'contain');
    } else {
        for (const theme of themes) {
            if (theme.id === currentTheme) {
                flagPath = theme.gifs[flag];
            }
        }
        if (driverNumber) {
            const driverNumberPath = getDriverNumberPath(driverNumber);
            flagPath = driverNumberPath;
        }
        $('#digiflag').css('width', '100%');
        $('#digiflag').css('object-fit', 'cover');
    }
    /* The code below is checking if a given flag path exists for a theme. If the flag path exists, it
    returns the path. If the flag path does not exist, it logs a warning message to the console. */
    if (flagPath === undefined) {
        console.warn(`${flag} Does Not Exist for this Theme!`);
    } else {
        if (debugOn) log(`${flag} requested, returning ${flagPath}`);
    }
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
    if (trackMapSwitch == true) {
        if (debugOn) log('Map Theme selected : ' + mapThemes[id].name);
        currentMapTheme = Number.parseInt(id);
        getCurrentTrackPath(currentMapTheme);
        $('#launchDigiFlag').prop('disabled', true);
    }
}

/**
 * The function `turnOff` is an asynchronous function in TypeScript that updates a flag display based
 * on certain conditions and sends a corresponding GIF URL to a Pixoo64 device for display.
 * @param {string} flag - The `flag` parameter in the `turnOff` function is a string that represents a
 * specific flag status. It is used to determine which GIF to display on a Pixoo64 device. The function
 * checks the value of the `flag` parameter and sets the appropriate URL for fetching the corresponding
 * GIF.
 * @param {string} [driverNumber] - The `driverNumber` parameter in the `turnOff` function is an
 * optional parameter of type string. It is used to specify the driver number when turning off a flag
 * for a specific driver. If provided, it is used to construct a specific URL for fetching the
 * corresponding GIF image for that driver's
 * @returns The function `turnOff` returns nothing explicitly. It is an async function that performs
 * various operations based on the input flag and certain conditions, but it does not have a return
 * statement that explicitly returns a value.
 */
async function turnOff(flag: string, driverNumber?: string) {
    $('#currentPixooFlag').text(flag);
    let url = '';
    if (driverNumber && raceYear) {
        url = `http://${expressIP}:9093/getGifPixoo/5/DriverNumbers/${raceYear}/${flag}.gif`;
    } else {
        url = `http://${expressIP}:9093/getGifPixoo/5/${flag}.gif`;
        if (debugOn) console.log(`URL sent to Pixoo64: ${url}`);
    }

    if (flag === 'yellow' || flag === 'red') {
        return;
    }

    if (sc === true) {
        $('#digiflag').prop('src', getGifPath('sc'));
        url = `http://${expressIP}:9093/getGifPixoo/5/sc.gif`;
        return;
    }

    if (vsc === true) {
        $('#digiflag').prop('src', getGifPath('vsc'));
        url = `http://${expressIP}:9093/getGifPixoo/5/vsc.gif`;
        return;
    }

    if (red === true) {
        $('#digiflag').prop('src', getGifPath('red'));
        url = `http://${expressIP}:9093/getGifPixoo/5/red.gif`;
        return;
    }

    if (yellow === true) {
        $('#digiflag').prop('src', getGifPath('yellow'));
        url = `http://${expressIP}:9093/getGifPixoo/5/yellow.gif`;
        return;
    }

    if (currentRainStatus === '1') {
        $('#digiflag').prop('src', getGifPath('rain'));
        url = `http://${expressIP}:9093/getGifPixoo/5/rain.gif`;
    } else {
        $('#digiflag').prop('src', getGifPath('void'));
        url =
            mvLogoSwitch === true
                ? `http://${expressIP}:9093/getGifPixoo/5/mv.gif`
                : `http://${expressIP}:9093/getGifPixoo/5/void.gif`;
    }

    if (currentMode.valueOf() === 1) {
        if (debugOn) {
            console.log(`${flag} flag was turned off`);
            console.log(`URL sent to Pixoo64: ${url}`);
        }
        for (const pixooIP of pixooIPs) {
            try {
                const response = await fetch(`http://${pixooIP}:80/post`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        Command: 'Device/PlayTFGif',
                        FileType: 2,
                        FileName: `${url}`,
                    }),
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log(`Result for ${pixooIP}:`, result);
                }
            } catch (error) {
                console.error(`Error for ${pixooIP}:`, error);
            }

            // Need to force a delay after an http post to the Pixoo64, else may crash the Pixoo64
            if (debugOn) {
                console.log(`Pixoo64 API cool down 3000ms for ${pixooIP}`);
            }
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
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
 * @param {string} [driverNumber] - The `driverNumber` parameter in the `changeGif` function is an
 * optional parameter of type string. It is used as an argument in the `getGifPath` function to
 * retrieve the path of a GIF based on the provided flag and driver number.
 * @returns a Promise.
 */

async function changeGif(flag: string, mode: number, driverNumber?: string) {
    $('#currentPixooFlag').text(flag);
    const flagPath = getGifPath(flag, driverNumber);
    if (flag === 'void' && mvLogoSwitch === true) {
        flag = `mv`;
    }
    if (mode === 1 && currentMode.valueOf() === 1 && flagPath !== undefined) {
        let url = '';
        if (driverNumber && raceYear) {
            url = `http://${expressIP}:9093/getGifPixoo/5/DriverNumbers/${raceYear}/${flag}.gif`;
            if (debugOn) console.log(`Driver Number sent to Pixoo64: ${url}`);
        } else {
            url = `http://${expressIP}:9093/getGifPixoo/5/${flag}.gif`;
            if (debugOn) console.log(`URL sent to Pixoo64: ${url}`);
        }
        for (const pixooIP of pixooIPs) {
            try {
                const response = await fetch(`http://${pixooIP}:80/post`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        Command: 'Device/PlayTFGif',
                        FileType: 2,
                        FileName: `${url}`,
                    }),
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log(result);
                }
            } catch (error) {
                console.error(error);
            }
            // Need to force a delay after an http post to the Pixoo64, else may crash the Pixoo64
            if (debugOn) {
                console.log(`Pixoo64 API cool down 3000ms`);
            }
            await timer(3000);
        }
    }
    $('#digiflag').prop('src', flagPath);
    if (flag !== 'rain') {
        lightOnRain = false;
    }
    if (flag === 'rain') {
        lightOnRain = true;
    }
}

/**
 * It creates a menu that allows the user to select a theme, a device, and a track map style.
 */
function linkSuccess() {
    $('#selectTheme>*').remove();
    $('#tagLink').removeClass();
    $('#tagSession').removeClass();
    $('#raceName').removeClass();
    $('#currentSession').removeClass();
    $('#tagLink').addClass('badge text-bg-success');
    $('#tagLink').attr('data-i18n', 'successfullyConnectedToF1mvTimingWindow');
    $('#tagSession').addClass('badge text-bg-success');
    $('#currentSession').addClass('text-bg-success');
    $('#raceName').addClass('text-bg-success');
    $('#raceName').removeAttr('data-i18n');

    $('#tagSession').show();
    $('#openMultiViewer').remove();
    $('#linkF1MV').remove();
    $('#infoTag').remove();
    $('#checkNetworkSettings').remove();
    $('#networkSettings').remove();
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
        <div class="form-check" id="pixoo64">
        <input class="form-check-input" type="radio" name="flexRadioDefault" id="pixoo64Radio" data-bs-toggle="collapse" data-bs-target="#pixooIPContainer" aria-expanded="false" aria-controls="pixooIPContainer" disabled>
        <label class="form-check-label" for="pixoo64Radio">
        Divoom Pixoo64 Wi-Fi
        </label>
        </div>
        <div class="collapse" id="pixooIPContainer">
        <div class="card text-bg-dark p-1 align-items-center">
        <span id="expressIP">Express IP: ${expressIP}</span>
        <span id="pixooIPs"></span>
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
    <input class="form-check-input" type="checkbox" role="switch" id="mvSwitch"> <label class="form-check-label theme" data-i18n="multiviewerLogo" for="mvSwitch">MultiViewer Logo</label>
  </div>
  <div class="form-check form-switch" id="blueFlag">
    <input class="form-check-input" type="checkbox" role="switch" id="blueFlagSwitch"> <label class="form-check-label theme" data-i18n="blueFlags" for="blueFlagSwitch">Blue Flags</label>
  </div>
  <div class="form-check form-switch" id="extraFlag">
  <input class="form-check-input" type="checkbox" role="switch" id="extraFlagSwitch"> <label class="form-check-label theme" data-i18n="extraFlags" for="extraFlagSwitch">Extra Flags</label>
</div>`);
    miscOptionsReference = $('#selectDevice,#selectMisc').detach();
    $(document).localize();
    let theme: {id: number; name: string};
    for (const theme_ of themes) {
        theme = theme_;
        $('#themes').append(`
            <div class="form-check" id="window">
                <input class="form-check-input theme" type="radio" name="theme" id="${theme.id}">
                <label class="form-check-label theme ${theme.id}" for="${theme.id}">
                    ${theme.name}
                </label>
            </div>
        `);
    }
    $('.theme').on('change', (event_) => {
        selectTheme(Number.parseInt(event_.target.id));
    });
    $('#nextTheme').on('click', () => {
        miscOptionsReference.appendTo('#menuContent');
        themeSelectReference = $('#selectTheme').detach();

        if (themes[currentTheme].compatibleWith.Pixoo64) {
            $('#menuContent')
                .append(`<div id="menuButtonsContainer"><button type="button" id="backButton" class="btn btn-success" data-i18n="back">Back</button>
            <button type="button" id="launchPixoo" class="btn btn-success" data-i18n="launchPixoo">Launch DigiFlag on Pixoo64</button></div>`);
            $('#launchPixoo').removeClass();
            $('#launchPixoo').addClass('btn btn-secondary');
            $('#launchPixoo').prop('disabled', true);
            $('#window').hide();
            $('#pixoo64').show();
            $('#pixoo64Radio').prop('disabled', false);
            $('#mvSwitch').prop('disabled', true);
            $('#blueFlagSwitch').prop('disabled', true);
            $('#extraFlagSwitch').prop('disabled', true);
            $('#collapsetrackMapSelect').removeClass();
            $('#collapsetrackMapSelect').addClass('collapse');
            $('#mapSwitch').prop('disabled', true);
            $('#mapSwitch').prop('checked', false);
        } else {
            currentMode = 0;
            $('#menuContent').append(
                `<div id="menuButtonsContainer"><button type="button" id="backButton" class="btn btn-success" data-i18n="back">Back</button>
                <button type="button" id="launchDigiFlag" class="btn btn-success" data-i18n="startDigiflag">Start DigiFlag</button>`
            );
            $('#window').show();
            $('#pixoo64').hide();
            $('#pixoo64Radio').prop('checked', false);
            $('#pixooIPContainer').removeClass();
            $('#pixooIPContainer').addClass('collapse');
            $('#windowRadio').prop('checked', true);
            $('#pixoo64Radio').prop('disabled', true);
            $('#mapSwitch').prop('disabled', false);
            $('#mvSwitch').prop('disabled', false);
            $('#blueFlagSwitch').prop('disabled', false);
            $('#extraFlagSwitch').prop('disabled', false);
        }
        $('#selectDevice').on('change', async (event_) => {
            if (event_.target.id === 'pixoo64Radio') {
                if (debugOn) console.log('Pixoo64 was Selected');
                currentMode = 1;
                await getExpressIP();
                await fetchAndDisplayPixooDevices();
                if (pixooIPs.length > 0) {
                    $('#launchPixoo').removeClass();
                    $('#launchPixoo').addClass('btn btn-success');
                    $('#launchPixoo').prop('disabled', false);
                    $('#mvSwitch').prop('disabled', false);
                    $('#blueFlagSwitch').prop('disabled', false);
                    $('#extraFlagSwitch').prop('disabled', false);
                }
                if (debugOn) console.log('Current Mode: ' + currentMode);
            } else {
                if (debugOn) console.log('Window was Selected');
                currentMode = 0;
                $('#launchDigiFlag').show();
                $('#launchPixoo').hide();
                $('#pixooIPContainer').removeClass();
                $('#pixooIPContainer').addClass('collapse');
                if (debugOn) console.log('Current Mode: ' + currentMode);
                $('#mapSwitch').prop('disabled', false);
                $(document).localize();
            }
        });
        /* Checking if the blue flag is disabled, if it is, it will enable it. If it is not, it will disable
it. */
        $('#blueFlag').on('change', () => {
            if (blueFlagSwitch) {
                blueFlagSwitch = false;
                if (debugOn) log('Blue Flags OFF');
                return blueFlagSwitch;
            } else {
                blueFlagSwitch = true;
                if (debugOn) log('Blue Flags ON');
                return blueFlagSwitch;
            }
        });
        $('#mvLogoSwitch').on('change', () => {
            if (mvLogoSwitch) {
                mvLogoSwitch = false;
                if (debugOn) log('MV Logo OFF');
                $('#mapSwitch').prop('disabled', false);
                return mvLogoSwitch;
            } else {
                mvLogoSwitch = true;
                if (debugOn) log('MV Logo ON');
                $('#mapSwitch').prop('disabled', true);
                return mvLogoSwitch;
            }
        });
        $('#extraFlag').on('change', () => {
            if (extraFlagSwitch) {
                extraFlagSwitch = false;
                if (debugOn) log('Extra Flags OFF');
                return extraFlagSwitch;
            } else {
                extraFlagSwitch = true;
                if (debugOn) log('Extra Flags ON');
                return extraFlagSwitch;
            }
        });
        /* Creating a switch that toggles the use of a track map as a background. */
        $('#trackMapSwitch').on('change', () => {
            if (trackMapSwitch) {
                trackMapSwitch = false;
                if (debugOn) log('use TrackMap as Background? : ' + trackMapSwitch);
                $('#mvSwitch').prop('disabled', false);
                $('#launchDigiFlag').prop('disabled', false);
                return trackMapSwitch;
            } else {
                trackMapSwitch = true;
                if (debugOn) log('use TrackMap as Background? : ' + trackMapSwitch);
                $('#mvSwitch').prop('disabled', true);
                $('#launchDigiFlag').prop('disabled', true);
                $('#trackMapStyleSelect>option').remove();
                /* Creating a dropdown menu with the names of the map themes. */
                $('#trackMapStyleSelect').append(
                    `<option  data-i18n="selectAMapStyle"  value="none" selected disabled hidden>Select a Map Style</option>`
                );
                for (const mapTheme of mapThemes) {
                    $('#trackMapStyleSelect').append(
                        `<option id=${mapTheme.id} value=${mapTheme.id}>${mapTheme.name}</option> `
                    );
                }
                $('#0').attr('data-i18n', 'mapTheme.streetMap');
                $('#1').attr('data-i18n', 'mapTheme.satelliteMap');
                $(document).localize();
                /* Changing the map style when the user selects a different style from the dropdown menu. */
                $('#trackMapStyleSelect').on('change', () => {
                    const mapID = $('#trackMapStyleSelect').val();

                    if (mapID !== undefined && mapID !== null) {
                        selectMapTheme(mapID.toString());
                        $('#launchDigiFlag').prop('disabled', false);
                    }
                });
                return trackMapSwitch;
            }
        });
        $('#backButton').on('click', () => {
            themeSelectReference.appendTo('#menuContent');
            $(document).localize();
            miscOptionsReference.remove();
            pixoostartup = false;
            $('#menuButtonsContainer').remove();
        });
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
        $('#launchPixoo').on('click', () => {
            $('.menu-box').remove();
            $('body').append(
                `
            <div id="pixooText" class="card text-white bg-transparent align-items-center"> <h1 class="card-title">
            DigiFlag Currently Displaying` +
                    `<h1 id="currentPixooFlag"></h1>` +
                    `<h1> on Pixoo64</h1></div>`
            );
            $('#pixooText').insertBefore('.bottom-screen');
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
            pixoostartup = true;
            initializePixoo();
        });
        $(document).localize();
    });
}
/**
 * It's a function that checks if the MultiViewer is running and if it is, it will change the text of a tag to
 * "MultiViewer is running".
 * @param force - boolean
 * @returns The response is a JSON object.
 */
async function linkF1MV(force?: boolean) {
    if (debugOn) log('Link started...');
    try {
        const response = await globalThis.api.LiveTimingAPIGraphQL(config, 'Heartbeat');

        if (response) {
            linkSuccess();
        } else {
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
            $('#tagLink').attr('data-i18n', 'youAreConnectedToF1mvButTheLiveReplayTimingWindowIsNotOpen');
            $('#raceName').attr('data-i18n', 'unableToRetrieveCurrentSessionFromF1mv');
            $('#checkNetworkSettings,#infoTag').hide();
            $(document).localize();
            setTimeout(() => {
                autoConnectF1MV();
            }, 1000);
        }
    } catch {
        if (force) {
            linkSuccess();
            return;
        }
        /* Adding the class text-bg-danger to the element with the id tagLink. */
        $('#tagLink').addClass('badge text-bg-danger');
        $('#tagSession').addClass('badge text-bg-danger');
        $('#currentSession').addClass('text-bg-danger');
        $('#raceName').addClass('text-bg-danger');
        /* Changing the text of the tag with the id tagLink to Failed to connect to MultiViewer */
        $('#tagLink').removeAttr('data-i18n');
        $('#raceName').removeAttr('data-i18n');
        $('#raceName').attr('data-i18n', 'failedToRetrieveCurrentSession');
        $('#tagLink').attr('data-i18n', 'failedToConnect');
        $('#networkSettings').show();
        $('#checkNetworkSettings,#infoTag').show();
        $(document).localize();
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
    $('#appVersion').text(`v${version}`);
    $('#raceName').text(raceName);
    $('.bottom-screen:not(:hover)').css('opacity', 1);
    $('#linkF1MV').remove();

    /* The code below is appending a SVG globe icon, a h5 tag with the text "Network", a
    label with the text "MultiViewer API IP: ", an input tag with the class "form-control" and the value of the variable host and the id "ip", a label with the text "MultiViewer API Port: ", an input tag with the class "form-control" and the value
    of the variable port and the id "port", a div tag with the class "networkbuttons-container" and
    two button tags with the class networkbuttons-container  */
    $('#settingsButton').one('click', () => {
        $('#networkSettings')
            .append(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="globe" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>`);
        // Append Network Settings title
        $('#networkSettings').append('<h5 data-i18n="network">Network</h5>');

        const ipv4Pattern = new RegExp(
            `^(25[0-5]|2[0-4]\\d|[01]?\\d{1,2})\\.(25[0-5]|2[0-4]\\d|[01]?\\d{1,2})\\.(25[0-5]|2[0-4]\\d|[01]?\\d{1,2})\\.(25[0-5]|2[0-4]\\d|[01]?\\d{1,2})$`,
            'gm'
        );

        const sanitizedHost = escapeHtml(config.host);
        const sanitizedPort = escapeHtml(config.port.toString());

        // Append IP input with validation
        $('#networkSettings').append(
            `<label for="ip">MultiViewer API IP:</label>
    <input type="text" class="form-control-sm text-bg-dark" value="${sanitizedHost}" id="ip" required pattern="${ipv4Pattern.source}">`
        );

        // Append Port input with validation
        $('#networkSettings').append(
            `<label for="port">MultiViewer API Port:</label>
    <input type="number" class="form-control-sm text-bg-dark" maxlength="5" value="${sanitizedPort}" id="port" required min="1" max="65535">`
        );
        $('#networkSettings').append(
            $('<div/>', {
                class: 'networkbuttons-container',
            }).append(
                '<button type="button" id="updateSettings" class="btn-sm btn btn-primary" data-i18n="saveNetworkSettings">Save Network Settings</button>',
                '<button type="button" id="restoreSettings" class="btn-sm btn btn-danger" data-i18n="restoreDefaultSettings">Restore Default Network Settings </button>'
            )
        );
        $('#networkSettings').localize();
        $('#updateSettings').on('click', () => {
            if (debugOn) log('Editing Settings...');

            const hostInput = $('#ip').val();
            const portInput = $('#port').val();
            const ipv4Regex = ipv4Pattern;

            // Clear any previous toasts
            $('.toast').remove();

            // Check if the inputs are not undefined or null
            if (hostInput && portInput) {
                if (!ipv4Regex.test(hostInput.toString())) {
                    ipInvalidToast();
                    return;
                }

                const host = hostInput.toString();
                config.host = host;

                if (debugOn) log($('#ip').text());
                if (debugOn) log(`IP = ${host} = ${config.host}`);

                const portNumber = Number.parseInt(portInput.toString(), 10);
                if (Number.isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
                    portInvalidToast();
                    return; // Stop submission
                }

                const port = portInput.toString();
                config.port = Number.parseInt(port);

                if (debugOn) log($('#port').text());
                if (debugOn) log(`PORT = ${port} = ${config.port}`);

                saveSettings(config.host, config.port);
            } else {
                // Show a toast if IP or Port input is missing
                $('#networkSettings > h5')
                    .after(`<div class="toast text-bg-dark" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="5000" data-bs-autohide="true">
                        <div class="toast-header text-bg-danger">
                          <strong class="text-center me-auto">Invalid Input!</strong>
                          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                        </div>
                        <div class="toast-body">
                        Both IP and Port fields must be filled out.
                        </div>
                    </div>
                `);
                $('.toast').toast('show');
            }
        });

        $('#restoreSettings').on('click', () => {
            /* Setting the value of the input fields back to 127.0.0.1 and 10101. */
            $('#ip').val('127.0.0.1');
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
    // On click event for zooming in. If currentZoom is less than maxZoom, increase currentZoom by 0.1 and update it to one decimal place. Apply scale transformation to 'main' and '.center-screen' elements.
    $('#zoomIn').on('click', () => {
        if (currentZoom < maxZoom) {
            currentZoom += 0.1;
            currentZoom = Number(currentZoom.toFixed(1));
            $('main, .center-screen').css({
                transform: 'scale(' + currentZoom + ')',
            });
        }
    });

    // On click event for zooming out. If currentZoom is greater than minZoom, decrease currentZoom by 0.1 and update it to one decimal place. Apply scale transformation to 'main' and '.center-screen' elements.
    $('#zoomOut').on('click', () => {
        if (currentZoom > minZoom) {
            currentZoom -= 0.1;
            currentZoom = Number(currentZoom.toFixed(1));
            $('main, .center-screen').css({
                transform: 'scale(' + currentZoom + ')',
            });
        }
    });
    // On click event for resetting zoom. Set transform css attribute to none from 'main' and '.center-screen' elements allowing scale to be reset. Set currentZoom to 1.
    $('#zoomReset').on('click', () => {
        $('main, .center-screen').css({
            transform: 'none',
        });
        currentZoom = 1;
    });
});

const checkRCM = async () => {
    if (started === false) return;
    const result = LT_Data.RaceControlMessages;
    if (!result || !result.Messages || !oldMessages.Messages) {
        return;
    }
    if (result.Messages.length === oldMessages.Messages.length) {
        return;
    } else {
        if (debugOn) log('New message');
        oldMessages = result;

        /* Filtering the messages to only include the ones that are of interest to us. */
        const filteredMessages = result.Messages.filter(
            (message) =>
                message.Category === 'Flag' ||
                message.Category === 'Other' ||
                message.Category === 'SafetyCar' ||
                message.Category === 'Drs'
        );
        /* Taking the last element of the array and returning it. */
        const recentMessage = filteredMessages.at(-1);

        if (debugOn) console.log('Most Recent Filtered Message: ');
        if (debugOn) console.table(recentMessage);
        if (debugOn) console.log('Most Recent RCM Message: ');
        if (debugOn) console.table(result.Messages.at(-1));

        if (recentMessage) {
            /* Checking if the message contains the word "BLACK AND ORANGE" and if it does, it sets the category to "Flag" and the flag to "BLACK AND ORANGE". */
            if (/black and orange/i.test(recentMessage.Message)) {
                const carNumberMatch = recentMessage.Message.match(/car (\d+)/i);
                if (carNumberMatch) {
                    const carNumber = carNumberMatch[1];
                    changeGif('mec', currentMode);
                    await timer(3500);
                    if (carNumber in themes[currentTheme].gifs) {
                        changeGif(carNumber, currentMode);
                        await timer(3500);
                        turnOff(carNumber);
                    } else {
                        if (debugOn) console.log(`No racing number GIF found for ${carNumber}`);
                    }
                }
            }
            /* Checking if the message contains the word "BLACK AND WHITE" and if it does, it will change the gif
to black and white, wait 2.5 seconds, then change the gif to the racing number, wait 2.5 seconds,
then turn off the racing number gif, then turn off the black and white gif. */
            if (/black and white/i.test(recentMessage.Message)) {
                isGifPlaying = true;
                changeGif('blackandwhite', currentMode);
                await timer(3500);
                const recentRacingNumber = recentMessage.RacingNumber;
                if (recentRacingNumber) {
                    changeGif(recentRacingNumber, currentMode, recentRacingNumber);
                    await timer(3500);
                    turnOff(recentRacingNumber, recentRacingNumber);
                    isGifPlaying = false;
                } else {
                    if (debugOn) console.log(`No racing number GIF found for ${recentRacingNumber}`);
                    turnOff('blackandwhite');
                    isGifPlaying = false;
                }
            }
            /* Checking the recentMessage.SubCategory to see if it is a TimePenalty. If it is, it is checking the
recentMessage.Message to see if it contains the text "CAR #" where # is a number. If it does, it is
checking the recentMessage.Message to see if it contains the text "5 SECOND TIME PENALTY" or "10
SECOND TIME PENALTY". If it does, it is changing the gif to the appropriate gif and then turning it
off after a certain amount of time. */
            if (recentMessage.SubCategory === 'TimePenalty' && extraFlagSwitch) {
                /* Using a regular expression to match the message to a pattern. */
                const carNumberMatch = recentMessage.Message.match(/car (\d+)/i);
                if (carNumberMatch) {
                    /* Using a regular expression to extract the car number from the string. */
                    const carNumber = carNumberMatch[1];
                    if (debugOn) console.log(`Car Number: ${carNumber}`);
                    if (/5 second time penalty/i.test(recentMessage.Message)) {
                        isGifPlaying = true;
                        changeGif('timepenalty5sec', currentMode);
                        await timer(3500);
                        changeGif(carNumber, currentMode, carNumber);
                        await timer(3500);
                        turnOff(carNumber, carNumber);
                        isGifPlaying = false;
                    }
                    if (/10 second time penalty/i.test(recentMessage.Message)) {
                        isGifPlaying = true;
                        changeGif('timepenalty10sec', currentMode);
                        await timer(3500);
                        changeGif(carNumber, currentMode, carNumber);
                        await timer(3500);
                        turnOff(carNumber, carNumber);
                        isGifPlaying = false;
                    }
                }
            }
            if (recentMessage.SubCategory === 'StopGoPenalty' && extraFlagSwitch) {
                /* Using a regular expression to match the message to a pattern. */
                const carNumberMatch = recentMessage.Message.match(/car (\d+)/i);
                if (carNumberMatch) {
                    /* Using a regular expression to extract the car number from the string. */
                    const carNumber = carNumberMatch[1];
                    if (debugOn) console.log(`Car Number: ${carNumber}`);
                    if (/10 second stop\/go penalty/i.test(recentMessage.Message)) {
                        isGifPlaying = true;
                        changeGif('stopgopenalty10sec', currentMode);
                        await timer(3500);
                        changeGif(carNumber, currentMode, carNumber);
                        await timer(3500);
                        turnOff(carNumber, carNumber);
                        isGifPlaying = false;
                    }
                }
            }
            /* Checking if the message contains the word "ROLLING START" and if it does, it will change the gif to "rs" and then turn it off after 20 seconds. */
            if (
                /rolling start/i.test(recentMessage.Message) &&
                //Fixes an issue When the Rolling Start Flag Would Display when a ROLLING START PROCEDURE INFRINGEMENT Occurs
                recentMessage.SubCategory !== 'IncidentInvestigationAfterSession' &&
                recentMessage.SubCategory !== 'SessionResume'
            ) {
                isGifPlaying = true;
                changeGif('rs', currentMode);
                await timer(20000);
                turnOff('rs');
                isGifPlaying = false;
            }
            if (
                /standing start procedure/i.test(recentMessage.Message) &&
                recentMessage.SubCategory !== 'SessionResume'
            ) {
                isGifPlaying = true;
                changeGif('ss', currentMode);
                await timer(20000);
                turnOff('ss');
                isGifPlaying = false;
            }
            if (/drs enabled/i.test(recentMessage.Message) && extraFlagSwitch) {
                isGifPlaying = true;
                changeGif('DRSenabled', currentMode);
                await timer(3500);
                turnOff('DRSenabled');
                isGifPlaying = false;
            }
            if (/drs disabled/i.test(recentMessage.Message) && extraFlagSwitch) {
                isGifPlaying = true;
                changeGif('DRSdisabled', currentMode);
                await timer(3500);
                turnOff('DRSdisabled');
                isGifPlaying = false;
            }
            if (/pit lane entry closed/i.test(recentMessage.Message)) {
                isGifPlaying = true;
                changeGif('pitclosed', currentMode);
                await timer(3500);
                turnOff('pitclosed');
                isGifPlaying = false;
            }
            if (/pit exit open/i.test(recentMessage.Message)) {
                isGifPlaying = true;
                changeGif('green', currentMode);
                await timer(3500);
                turnOff('green');
                isGifPlaying = false;
            }
            if (/pit entry closed/i.test(recentMessage.Message)) {
                isGifPlaying = true;
                changeGif('pitclosed', currentMode);
                await timer(3500);
                turnOff('pitclosed');
                isGifPlaying = false;
            }
            if (/recovery vehicle on track/i.test(recentMessage.Message) && extraFlagSwitch) {
                isGifPlaying = true;
                changeGif('recoveryvehicle', currentMode);
                await timer(5000);
                turnOff('recoveryvehicle');
                isGifPlaying = false;
            }
            if (/medical car deployed/i.test(recentMessage.Message) && extraFlagSwitch) {
                isGifPlaying = true;
                changeGif('medicalcar', currentMode);
                await timer(5000);
                turnOff('medicalcar');
                isGifPlaying = false;
            }

            if (recentMessage.SubCategory === 'TrackSurfaceSlippery') {
                isGifPlaying = true;
                changeGif('slippery', currentMode);
                await timer(5000);
                turnOff('slippery');
                isGifPlaying = false;
            }

            if (
                /double yellow/i.test(recentMessage.Message) &&
                !/lap deleted/i.test(recentMessage.Message) &&
                sc !== true &&
                vsc !== true
            ) {
                isGifPlaying = true;
                changeGif('dyellow', currentMode);
                await timer(10000);
                turnOff('dyellow');
                isGifPlaying = false;
            }

            if (/blue flag/i.test(recentMessage.Message) && recentMessage.Flag !== 'CHEQUERED' && blueFlagSwitch) {
                isGifPlaying = true;
                changeGif('blue', currentMode);
                await timer(3500);
                /* Using a regular expression to match the message to a pattern. */
                const recentRacingNumber = recentMessage.RacingNumber;
                if (recentRacingNumber) {
                    changeGif(recentRacingNumber, currentMode, recentRacingNumber);
                    await timer(3500);
                    turnOff(recentRacingNumber, recentRacingNumber);
                    isGifPlaying = false;
                } else {
                    if (debugOn) console.log(`No racing number GIF found for ${recentRacingNumber}`);
                    turnOff('blue');
                    isGifPlaying = false;
                }
            }

            if (/chequered flag/i.test(recentMessage.Message)) {
                isGifPlaying = true;
                changeGif('chequered', currentMode);
                await timer(90000);
                turnOff('chequered');
                isGifPlaying = false;
            }
        }
    }
};
/**
 * This function checks the current status of a race track and updates the display accordingly.
 * @returns the current track status.
 */
async function checkTrackStatus() {
    if (!started) return;
    /* Getting the track status from the Live Timing Data. */
    const trackStatus = LT_Data.TrackStatus.Status;
    // {"Status":"1","Message":"AllClear"}
    // {"Status":"2","Message":"Yellow"}
    // {"Status":"4","Message":"SCDeployed"}
    // {"Status":"5","Message":"Red"}
    // {"Status":"6","Message":"VSCDeployed"}
    // {"Status":"7","Message":"VSCEnding"}
    const recentTrackStatus = trackStatus.at(-1);
    if (recentTrackStatus !== undefined && recentTrackStatus !== currentTrackStatus) {
        // check if the status has changed
        switch (recentTrackStatus) {
            case '1': {
                if (sc || vsc || red || yellow) {
                    if (debugOn) console.log(`New track status : 🟩 %cGreen`, 'color:#05e376');
                    sc = false;
                    yellow = false;
                    vsc = false;
                    red = false;
                    isGifPlaying = true;
                    changeGif('green', currentMode);
                    await timer(2500);
                    turnOff('green');
                    isGifPlaying = false;
                }
                break;
            }
            case '2': {
                // Yellow
                if (debugOn) console.log(`New track status : 🟨 %cYellow`, 'color:#e8f00a');
                sc = false;
                yellow = true;
                vsc = false;
                red = false;
                isGifPlaying = true;
                changeGif('yellow', currentMode);
                break;
            }
            case '4': {
                // SCDeployed
                sc = true;
                yellow = false;
                vsc = false;
                red = false;
                isGifPlaying = true;
                changeGif('sc', currentMode);
                break;
            }
            case '5': {
                // Red
                if (debugOn) console.log(`New track status : 🟥 %cRed`, 'color:#f0250a');
                sc = false;
                yellow = false;
                vsc = false;
                red = true;
                isGifPlaying = true;
                changeGif('red', currentMode);
                break;
            }
            case '6': {
                // VSCDeployed
                sc = false;
                yellow = false;
                vsc = true;
                red = false;
                isGifPlaying = true;
                changeGif('vsc', currentMode);
                break;
            }
            case '7': {
                // VSCEnding
                sc = false;
                yellow = false;
                vsc = true;
                red = false;
                isGifPlaying = true;
                changeGif('vsc', currentMode);
                break;
            }
            default: {
                break;
            }
        }
        currentTrackStatus = recentTrackStatus; // update the current status
        if (debugOn) console.log(`Current Track Status: ${currentTrackStatus}`);
    }
    return currentTrackStatus;
}

/**
 * Check if it's raining, if it is, turn on the rain lights
 * @returns if it's raining or not
 * @author LapsTime
 */

async function checkRain() {
    if (!started) return;
    /* Extract if it's raining or not from the Live Timing data */
    const Rain = LT_Data.WeatherData.Rainfall;
    if (Rain !== currentRainStatus && !isGifPlaying) {
        switch (Rain) {
            case '0': {
                // Not raining
                if (lightOnRain && pixoostartup === false) {
                    if (debugOn) console.log(`%cIt Stopped Raining!`, 'color:orange');
                    changeGif('void', currentMode);
                    lightOnRain = false;
                }
                break;
            }
            case '1': {
                // Raining
                if (!lightOnRain && pixoostartup === false) {
                    if (debugOn) console.log(`%cIt's Raining!`, 'color:aqua');
                    changeGif('rain', currentMode);
                    lightOnRain = true;
                }
                break;
            }
        }
        currentRainStatus = Rain;
        if (debugOn) console.log(`%cCurrent Rain Status: ${currentRainStatus}`, 'color:aqua');
    }
}

/**
 * Update the Live Timing data
 * @returns the live timing data
 * @author LapsTime
 */
async function updateData() {
    try {
        if (started && pixoostartup === false) {
            LT_Data = await globalThis.api.LiveTimingAPIGraphQL(config, [
                'RaceControlMessages',
                'TrackStatus',
                'CarData',
                'TimingData',
                'WeatherData',
            ]);
            checkTrackStatus();
            checkRCM();
            checkRain();
        }
    } catch (error) {
        console.error(error);
    }
    setTimeout(updateData, 500);
}

/* Update the Live Timing data initially */
await updateData();
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
    return await globalThis.api.getAlwaysOnTop();
}
if (/electron/i.test(userAgent)) {
    /* Getting the value of the alwaysOnTop setting from the storage and setting the checkbox to the
value. */
    $(async () => {
        const alwaysOnTop = await getAlwaysOnTopSetting();
        $('#alwaysOnTopSwitch').prop('checked', alwaysOnTop);
    });

    /* When the alwaysOnTop switch is changed it window to always on top. */
    $('#alwaysOnTopSwitch').on('change', async () => {
        await globalThis.api.setAlwaysOnTop();
    });
} else {
    $('#alwaysOnTop').remove();
    $('#networkSettings').remove();
}
