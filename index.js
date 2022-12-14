/* Declaring a variable called host and assigning it the value of "localhost". */
let host = 'localhost';
/* Creating a variable called port and assigning it the value of 10101. */
let port = 10101;
/**
 * It takes a number of milliseconds as an argument, and returns a promise that resolves after that
 * number of milliseconds.
 * @param ms - The amount of time to wait before resolving the promise.
 */
const timer = (ms) => new Promise((res) => setTimeout(res, ms));
/* Getting the themes from the filesConfiguration.json file. */
const {themes} = JSON.parse(httpGet('./filesConfiguration.json'));
/* Getting the tracks from the filesConfiguration.json file. */
const {mapThemes} = JSON.parse(httpGet('./filesConfiguration.json'));
/* Declaring a variable called debugOn and assigning it a value of false. */
let debugOn = true;
let windowTransparency = false;
let scale = 1;
let started = false;
let yellow = false;
let sc = false;
let vsc = false;
let red = false;
let raining = 0;
const DigiFlag_Version = JSON.parse(httpGet('./package.json')).version;
let LT_Data = {};
let lightOn = false;
let lightOnRain = false;
/* Declaring a variable called currentTheme and assigning it a value of 1. */
let currentTheme = 1;
let currentMapTheme = 0;
let raceName = 'Unknown';
const currentMode = 0; // 0 for window, 1 for pixoo64
let disabledBlueFlag = false;
let useTrackMap = false;
const pixooIP = '';
const instanceWindowWidth = 800;
const instanceWindowHeight = 600;
const instanceWindowOffsetX = 100;
const instanceWindowOffsetY = 200;
/* Creating an object called oldMessages and adding a property called Messages to it. */
let oldMessages = {
    Messages: [],
};

/**
 * It makes a GET request to the URL passed in as a parameter.
 * @param theUrl - The URL to send the request to.
 * @returns The responseText property returns the response as a string, or null if the request was
 * unsuccessful or has not yet been sent.
 */
function httpGet(theUrl) {
    const xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open('GET', theUrl, false);
    xmlHttpReq.send(null);
    return xmlHttpReq.responseText;
}

const logs = [];

/**
 * If the last item in the logs array is the same as the text passed in, then return. Otherwise, add
 * the text to the logs array.
 * @param text - The text to be logged.
 * @returns the value of the last expression evaluated.
 */
function log(text) {
    console.log(text);
    if (logs[logs.length - 1] === text) return;
    logs.push(text);
}

/**
 * It creates a new XMLHttpRequest object, sets the method to POST, sets the url to the url passed in,
 * sets the async to true, sets the content type to application/json, and then sends the postData.
 * @param url - The URL to send the request to.
 * @param body - The body of the request.
 */
function httpPost(url, body) {
    const method = 'POST';
    const postData = body;
    // log(postData);

    const shouldBeAsync = true;

    const request = new XMLHttpRequest();

    request.open(method, url, shouldBeAsync);

    request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

    request.send(postData);
}

/**
 * It returns a string of random characters of a specified length.
 * @param length - The length of the string you want to generate.
 * @returns A string of random characters.
 */
function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 * It sends a POST request to a server with a JSON object containing the logs, the platform, the
 * LT_Dump, the DigiFlag version, the F1MV host, the F1MV port, the F1MV version, the F1MV API version,
 * the debug mode, the current track status, the current theme, the current mode, the disabled blue
 * flag, the themes and the started variable
 * @param eulaAccept - Boolean, true if you accept the EULA, false if you don't.
 * @returns a promise.
 */
async function sendTelemetry(eulaAccept) {
    log('Checking if telemetry server is available...');
    const url = 'https://DigiFlagTelemetryServer.4rkjjdzwv2.repl.co';
    const {available} = await JSON.parse(httpGet(`${url}/telemetryAvailable`));

    if (!available) {
        log(`Telemetry isn't available for now, please contact @????????| LapsTime#6837 on the F1MV Discord`);
        return false;
    } else {
        log('Telemetry server is available.');
        if (eulaAccept !== true) {
            console.warn('EULA not accepted. Requesting EULA...');
            log(httpGet(`${url}/eula`));
            log('Execute "sendTelemetry(true)" to accept EULA.');
            return;
        }
        log(`Generating unique telemetry ID...`);
        const id = makeid(6);
        log(`Getting all the data...`);
        const telemetryPackage = {
            logs: logs,
            platform: window.navigator.platform,
            LT_Dump: httpGet(await F1MV_API_BuildLiveTimingUrl('RaceControlMessages,TrackStatus,WeatherData')),
            DigiFlag_Version: DigiFlag_Version,
            F1MV_Host: host,
            F1MV_Port: port,
            F1MV_Version: await getF1MVVersion(),
            F1MV_APIVersion: await getAPIVersion(),
            debugMode: debugOn,
            currentTrackStatus: {
                yellow: yellow,
                sc: sc,
                vsc: vsc,
                red: red,
            },
            currentTheme: currentTheme,
            currentMode: currentMode,
            disabledBlueFlag: disabledBlueFlag,
            themes: themes,
            started: started,
        };
        log(`Data Collected`);
        log(`Sending DATA...`);
        httpPost(`${url}/uploadTelemetry/${id}`, JSON.stringify(telemetryPackage));
        log(
            `Your telemetry report has been successfully send. Here is your data ID : ${id}. If you want to see your telemetryPackage, go to ${url}/downloadTelemetryReport/${id}`
        );
    }
}

/**
 * It gets the current race name from the F1MV API and displays it on the page.
 */
async function getCurrentSessionInfo() {
    try {
        const response = await fetch(`http://${host}:${port}/api/graphql`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                query: 'query {\n  liveTimingState {\n    SessionInfo\n  }\n}',
            }),
        });

        if (response.ok) {
            const result = await response.json();
            const sessionName = await result.data.liveTimingState.SessionInfo.Meeting.Name;
            const sessionYear = parseInt(result.data.liveTimingState.SessionInfo.StartDate);
            raceName = `${sessionYear + ' ' + sessionName}`;
            $('#raceName').text(raceName);
            return raceName;
        }
    } catch (error) {
        console.log('Unable to Get Data From F1MV GraphQL API:');
        console.error(error);
    }
}

/**
 * It takes the currentMapTheme as an argument and returns the trackMapPath for the current race.
 * @param currentMapTheme - The current map theme that the user has selected.
 * @returns The trackMapPath variable is being returned.
 */
function getCurrentTrackPath(currentMapTheme) {
    let trackMapPath;
    console.log(`Current Race Name: ${raceName}`);

    /* Creating a variable called trackMaps and assigning it the value of the trackMaps property of the mapThemes JSON in filesConfiguration.json. */
    const trackMaps = mapThemes[currentMapTheme].trackMaps;
    /* Checking to see if the raceName is in the trackMaps object. If it is, it returns the mapPath for the current race. */
    if (raceName in trackMaps) {
        trackMapPath = trackMaps[raceName];
        console.log(`Track Map Path: ${trackMapPath}`);
        return trackMapPath;
    } else {
        return console.log('Map Not Found');
    }
}

/**
 * It saves the host and port to local storage.
 * @param host - The hostname of the server.
 * @param port{number} - The port number of the server.
 */
function saveSettings(host, port) {
    $('.toast').remove();
    localStorage.setItem('host', host);
    /* The code below is checking if the port is valid or not. If the port is valid, it will save the port in the local storage. If the port is invalid, it will throw an error. */
    if (port >= 0 && port <= 65535) {
        localStorage.setItem('port', port);
        if (debugOn) log('Network Settings Saved !');
        $('#networkSettings > h5')
            .after(`<div class="toast text-bg-dark" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000">
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
        $('.toast').toast('show');
    } else {
        if (debugOn) log('Only Host Settings Saved !');
        $('#networkSettings > h5')
            .after(`<div class="toast text-bg-dark" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="5000">
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
        $('.toast').toast('show');
    }
}

/**
 * It creates a new instance of the application.
 * @param url - The URL of the page to open.
 * @param windowTitle - The title of the window.
 * @returns The windowInstance variable is being returned.
 */
function createNewInstance(url, windowTitle) {
    if (arguments.length == 0) {
        url = './index.html';
        windowTitle = 'DigiFlag Instance';
    }
    try {
        const windowInstance = window.open(
            url,
            '_blank',
            `left=${instanceWindowOffsetX},top=${instanceWindowOffsetY},frame=${false},
            transparent=${true},menubar=no,autoHideMenuBar==${false},width=${instanceWindowWidth},height=${instanceWindowHeight},title=${windowTitle},icon=./icon.ico`
        );
        return windowInstance;
    } catch (error) {
        console.error(error);
    }
}

/**
 * It checks if the host and port data is not null, if it is not null, it sets the host and port
 * variables to the data stored in local storage.
 */
function loadSettings() {
    const hostData = localStorage.getItem('host');
    const portData = localStorage.getItem('port');
    if (hostData && portData !== null) {
        host = hostData;
        port = parseInt(portData);
    }
}

/** It clears the local storage and sets host and port back to default.
 */
function restoreSettings() {
    $('.toast').remove();
    if (localStorage !== null) localStorage.clear();
    host = 'localhost';
    port = 10101;
    $('#networkSettings > h5')
        .after(`<div class="toast text-bg-dark" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000">
        <div class="toast-header text-bg-danger">
          <strong class="text-center me-auto">Reset Network Settings!</strong>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
        Reset Network Settings To Default Values!
        </div>
    </div>
    `);
    $('.toast').toast('show');
    log('Reset Network Settings To Default');
}

/**
 * It gets the version of the F1MV app from the server and returns it as an integer.
 * @returns The current version of the F1MV app.
 */
async function getF1MVVersion() {
    loadSettings();
    const res = await JSON.parse(httpGet(`http://${host}:${port}/api/v1/app/version`));
    let ver = res.version;
    ver = parseInt(ver.replace(/[\D]/g, ''));
    log(`Current F1MV Version : ${ver}`);
    return ver;
}
/**
 * If the version of the F1MV is greater than or equal to 180, then the API version needed is v2,
 * otherwise it's v1.
 * @returns A promise.
 */
async function getAPIVersion() {
    if ((await getF1MVVersion()) >= 180) {
        log('Api version needed : v2');
        return 'v2';
    } else {
        log('Api version needed : v1');
        return 'v1';
    }
}
/* Getting the version of the F1MV. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const F1MV_version = getF1MVVersion();
/* Getting the API version of the current page. */
const F1MV_APIVersion = getAPIVersion();
/**
 * It returns a URL for the live timing API
 * @param topic - The topic you want to subscribe to.
 * @returns A promise that resolves to a string.
 */
async function F1MV_API_BuildLiveTimingUrl(topic) {
    return `http://${host}:${port}/api/${await F1MV_APIVersion}/live-timing${
        (await F1MV_APIVersion) === 'v2' ? '/state' : ''
    }/${topic}`;
}

/**
 * It's a function that enables or disables debug mode.
 * @param status - true or false
 * @returns the value of true.
 */

function debugMode(status) {
    if (status === true) {
        log(`Debug mode enabled`);
        debugOn = true;
        linkSuccess();
    } else {
        log(`Debug mode disabled`);
        debugOn = false;
    }
    return true;
}
/* Setting the debugMode to true or false based on the value of debugOn. */
debugMode(debugOn);
/**
 * If the current theme is the same as the theme in the array, then return the flag path.
 * @param flag - the name of the flag you want to get the path for
 * @returns The path to the gif.
 */
function getGifPath(flag) {
    let flagPath;
    /* Getting the current track path. */
    const trackMapPath = getCurrentTrackPath(currentMapTheme);
    /* Checking if the flag is 'void' and if the useTrackMap is true and if the trackMapPath has a file extension. */
    if (
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
function selectTheme(id) {
    if (debugOn) log('Mode selected : ' + id);
    currentTheme = id;
    $('#nextTheme').prop('disabled', false);
}
function selectMapTheme(id) {
    if (useTrackMap == true) {
        if (debugOn) log('Map Theme selected : ' + mapThemes[id].name);
        currentMapTheme = id;
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
async function turnOff(flag) {
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
            if (currentMode === 1) {
                const res = httpGet(`http://localhost:9093/pixoo/void/${currentTheme}/${pixooIP}`);
                if (res !== 'OK') {
                    log('Failed to change GIF on Pixoo64');
                }
                return;
            }
            if (raining) {
                changeGif('rain', 0);
                return;
            }
            $('#digiflag').prop('src', getGifPath('void'));
            lightOn = false;
        }
    } else {
        if (currentMode === 1) {
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
 * @param {number}mode - 1 = Pixoo64, 2 = DigiFlag
 * @returns a Promise.
 */
async function changeGif(flag, mode) {
    if (flag === 'blue' && disabledBlueFlag) return;
    if (mode === 1 && currentMode === 1) {
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
    if (flag === 'rain') lightOnRain = true;
}

function linkSuccess() {
    $('#tagLink').addClass('text-bg-success');
    $('#tagSession').addClass('text-bg-success');
    $('#tagLink').removeClass('text-bg-primary');
    $('#tagLink').removeClass('text-bg-warning');
    $('#tagLink').text('Connected to F1MV');
    $('#tagSession').show();
    $('#checkNetworkSettings').remove();
    $('#networkSettings').remove();
    $('#LinkF1MV').remove();
    $('#infotag').remove();
    $('#selectTheme').append(`
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
        $('#themes').append(`
            <div class="form-check" id="window">
                <input class="form-check-input theme" type="radio" name="theme" id="${theme.id}">
                <label class="form-check-label theme" for="${theme.id}">
                    ${theme.name}
                </label>
            </div>
        `);
    }
    $('.theme').on('change', (e) => {
        selectTheme(parseInt(e.target.id));
    });
    $('#nextTheme').on('click', () => {
        $('#selectTheme').remove();
        $('#selectDevice').append(`
        <div class="lead text-center fs-4">Select a Device</div>
            <div class="form-check" id="window">
            <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" checked>
            <label class="form-check-label" for="flexRadioDefault1">
                Window DigiFlag
            </label>
            </div>
            <span class="badge text-bg-danger" id="notAvailable" diabled>Pixoo 64 is Not Compatible with the Selected Theme</span>
            <div class="form-check" id="Pixoo64">
            <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" disabled>
            <label class="form-check-label" for="flexRadioDefault2">
                Pixoo 64 DigiFlag
            </label>
            </div>
            <div class="form-check" id="blueFlag">
                <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault">
                <label class="form-check-label theme" for="flexCheckDefault">
                    Remove Blue Flags?
                </label>
            </div>
            <div class="form-check form-switch" id="trackMapSwitch">
            <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">
            <label class="form-check-label theme" for="flexSwitchCheckDefault">Use TrackMap as Background?</label>
            </div>
            <button type="button" id="launchDigiFlag" class="btn btn-success">Start DigiFlag</button>
        `);
        if (themes[currentTheme].compatibleWith.Pixoo64) {
            $('#notAvailable').remove();
            $('#flexRadioDefault2').prop('disabled', false);
        }
        /* Checking if the blue flag is disabled, if it is, it will enable it. If it is not, it will disable
it. */
        $('#blueFlag').on('change', () => {
            if (disabledBlueFlag) {
                disabledBlueFlag = false;
                log('Blue Flags Enabled: ' + disabledBlueFlag);
                return disabledBlueFlag;
            } else {
                disabledBlueFlag = true;
                log('Blue Flags Disabled: ' + disabledBlueFlag);
                return disabledBlueFlag;
            }
        });
        /* Creating a switch that toggles the use of a track map as a background. */
        $('#trackMapSwitch').on('change', () => {
            if (useTrackMap) {
                useTrackMap = false;
                log('use TrackMap as Background? : ' + useTrackMap);
                $('#launchDigiFlag').prop('disabled', false);
                $('#trackMapStyle').remove();
                return useTrackMap;
            } else {
                useTrackMap = true;
                log('use TrackMap as Background? : ' + useTrackMap);
                $('#launchDigiFlag').prop('disabled', true);
                $('#trackMapSwitch').after(`<div id="trackMapStyle">
                    <label id='trackMapLabel' for="trackMapStyleSelect" class="form-label">TrackMap Style</label>
                    <select class="form-select form-select-sm text-bg-dark mapTheme" id="trackMapStyleSelect">`);
                /* Creating a dropdown menu with the names of the map themes. */
                $('#trackMapStyleSelect').append(
                    `<option value="none" selected disabled hidden>Select a TrackMap Style</option>`
                );
                for (let mapIndex = 0; mapIndex < mapThemes.length; mapIndex++) {
                    const mapTheme = mapThemes[mapIndex];
                    $('#trackMapStyleSelect').append(
                        `<option id=${mapTheme.id} value=${mapTheme.id}>${mapTheme.name}</option> `
                    );
                }
                /* Changing the map style when the user selects a different style from the dropdown menu. */
                $('#trackMapStyleSelect').on('change', () => {
                    selectMapTheme($('#trackMapStyleSelect').val());
                    $('#launchDigiFlag').prop('disabled', false);
                });
                return useTrackMap;
            }
        });
        $('#launchDigiFlag').on('click', () => {
            $('.menuBox').remove();
            $('body').append(`<img src="${getGifPath('void')}" id="digiflag" class="center-screen">`);
            $('#digiflag').insertBefore('.bottom-screen');
            $('#zoomControl').css('z-index', 1);
            started = true;
        });
    });
}
/**
 * It's a function that checks if the F1MV is running and if it is, it will change the text of a tag to
 * "F1MV is running".
 * @param force - boolean
 * @returns The response is a JSON object.
 */
function linkF1MV(force) {
    if (debugOn) log('Link started...');
    $('#tagLink').removeClass('text-bg-secondary');
    $('#tagLink').removeClass('text-bg-danger');
    $('#tagLink').removeClass('text-bg-warning');
    $('#tagLink').removeClass('text-bg-success');
    $('#tagSession').removeClass('text-bg-secondary');
    $('#tagSession').removeClass('text-bg-danger');
    $('#tagSession').removeClass('text-bg-warning');
    $('#tagSession').removeClass('text-bg-success');
    $('#raceName').removeClass('text-bg-secondary');
    $('#raceName').removeClass('text-bg-danger');
    $('#raceName').removeClass('text-bg-warning');
    $('#raceName').removeClass('text-bg-success');
    $('#tagLink').addClass('text-bg-primary');
    $('#tagLink').text('Linking to F1MV in progress...');
    try {
        if (debugOn) log(`URL = http://${host}:${port.toString()}/api/v1/live-timing/Heartbeat`);
        const response = JSON.parse(httpGet(`http://${host}:${port.toString()}/api/v1/live-timing/Heartbeat`));
        if (response.error === 'No data found, do you have live timing running?') {
            if (force) {
                linkSuccess();
                return;
            }
            $('#tagLink').addClass('text-bg-warning');
            $('#raceName').addClass('text-bg-warning');
            $('#tagSession').addClass('text-bg-warning');
            $('#tagLink').removeClass('text-bg-primary');
            $('#raceName').removeClass('text-bg-primary');
            $('#tagSession').removeClass('text-bg-primary');
            $('#tagLink').text('You are Connected to F1MV, but it seems like your Live Timing Page is not running.');
            $('#raceName').text('Unable to Retrieve Current Session from Live Timing');
        } else {
            linkSuccess();
        }
    } catch (e) {
        if (force) {
            linkSuccess();
            return;
        }
        /* Adding the class text-bg-danger to the element with the id tagLink. */
        $('#tagLink').addClass('text-bg-danger');
        $('#tagSession').addClass('text-bg-danger');
        /* Removing the class text-bg-primary from the element with the id tagLink. */
        $('#tagLink').removeClass('text-bg-primary');
        /* Removing the class text-bg-warning from the element with the id tagLink. */
        $('#tagLink').removeClass('text-bg-warning');
        /* Changing the text of the tag with the id tagLink to Failed to connect to F1MV */
        $('#tagLink').text('Failed to connect to F1MV');
        $('#raceName').text('Failed to Retrieve Current Session');
        /* Changing the text of the element with the id "infotag" to "Maybe you are trying to connect
        to another host? Maybe your port isn't the default one?" */
        $('#infotag').text("Maybe you are trying to connect to another host? Maybe your port isn't the default one?");
        /* The above code is changing the text of the element with the id of checkNetworkSettings to
       Click on the Settings Gear Above to check your Network Settings. */
        $('#checkNetworkSettings').text(
            ' Move your Mouse to the Bottom Right Corner & Click on the Settings Gear to check your Network Settings.'
        );
    }
}
/* A function that is called when the page is loaded. */
$(function () {
    $('#version').text(`DigiFlag Version: ${DigiFlag_Version}`);
    $('#raceName').text(raceName);
    $('#LinkF1MV').on('click', () => {
        linkF1MV();
        getCurrentSessionInfo();
    });

    /* The code below is appending a SVG globe icon, a h5 tag with the text "Network", a paragraph tag
    with the text "IP : ", an input tag with the class "form-control" and the placeholder
    "localhost" and the value of the variable host and the id "ip", a paragraph tag with the text
    "Port : ", an input tag with the class "form-control" and the placeholder "10101" and the value
    of the variable port and the id "port", a div tag with the class "networkButtonsContainer" and
    two button tags with the class networkButtonsContainer  */
    $('#settingsButton').one('click', () => {
        $('#networkSettings')
            .append(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="globe" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>`);
        $('#networkSettings').append('<h5>Network</h5>');
        $('#networkSettings').append('<p>IP : </p>');
        $('#networkSettings').append(
            `<input type="text" class="form-control text-bg-dark" placeholder="localhost" value=${host} id="ip">`
        );
        /* Appending a paragraph tag with the text "Port : " and then appending an input tag with the class
        "form-control" and the placeholder "10101" and the value of the variable port and the id "port". */
        $('#networkSettings').append('<p>Port : </p>');
        $('#networkSettings').append(
            `<input type="number" class="form-control text-bg-dark" placeholder="10101" value=${port} id="port">`
        );
        $('#networkSettings').append(
            $('<div/>', {
                class: 'networkButtonsContainer',
            }).append(
                '<button type="button" id="updateSettings" class="btn btn-primary">Save Network Settings</button>',
                '<button type="button"  id="restoreSettings" class="btn btn-danger">Restore Default Settings </button>'
            )
        );
        $('#updateSettings').on('click', () => {
            if (debugOn) log('Editing Settings...');
            /* Assigning the value of the input field with the id of "ip" to the variable "host". */
            const host = $('#ip').val();
            if (debugOn) log($('#ip').val() !== '');
            if (debugOn) log(`IP = ${$('#ip').val()} = ${host}`);
            /* Assigning the value of the input field with the id of port to the variable port. */
            const port = $('#port').val();
            if (debugOn) log($('#port').val() !== '');
            if (debugOn) log(`PORT = ${$('#port').val()} = ${port}`);
            saveSettings(host, port);
            /* Getting the version of the F1MV. */
            getF1MVVersion();
        });
        $('#restoreSettings').on('click', () => {
            /* Setting the value of the input fields back to localhost and 10101. */
            $('#ip').val('localhost');
            $('#port').val(10101);
            restoreSettings();
            getF1MVVersion();
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
        if (zoomScaleAdd >= 1.75) scale = 0.75;
        $('.center-screen').css({transform: 'translate(-50%,-50%) scale(' + zoomScaleAdd + ')'});
    });
    /* Decreasing the zoom of the image by 20px when the button is clicked. */
    $('#zoomOut').on('click', () => {
        const zoomScaleSubtract = (scale = scale - 0.25);
        if (zoomScaleSubtract <= 0.25) scale = 1.25;
        $('.center-screen').css({transform: 'translate(-50%,-50%) scale(' + zoomScaleSubtract + ')'});
    });
    $('#zoomReset').on('click', () => {
        $('.center-screen').removeAttr('style');
    });
});
/**
 * It checks for new messages from the F1MV API, and if there are any, it checks what the message is and
 * then displays the appropriate GIF
 * @returns a promise.
 */
const checkRCM = async () => {
    if (started === false) return;
    /* Extract all the RCMs from the Live Timing data */
    const result = LT_Data.RaceControlMessages;
    /* Checking to see if the number of messages in the result is the same as the number of messages in the
oldMessages. If it is, then there are no new messages. */
    if (result.Messages.length === oldMessages.Messages.length) {
        if (debugOn) log('No new messages.');
    } else {
        if (debugOn) log('New message');
        /* Getting the last message from the oldMessages array and assigning it to the message variable. */
        const message = result.Messages[oldMessages.Messages.length];
        oldMessages = result;
        /* Creating an object with the properties Category, Flag, Sector, and Scope. */
        const messageData = {
            Category: '',
            Flag: '',
            Sector: undefined,
            Scope: undefined,
        };
        /* Checking if the message contains the text "BLACK AND ORANGE" and if it does, it sets the
           category to "Flag" and the flag to "BLACK AND ORANGE". */
        if (message.Message.match(/BLACK AND ORANGE/i)) {
            messageData.Category = 'Flag';
            messageData.Flag = 'BLACK AND ORANGE';
        }
        /* Checking if the message contains the word "Safety Car" and if it does, it sets the category
           to "SafetyCar". */
        if (message.Message.match(/SAFETY CAR/i)) {
            messageData.Category = 'SafetyCar';
        }
        /* Checking if the message contains the words "Virtual Safety Car" and if it does, it sets the
        category to "VirtualSafetyCar". */
        if (message.Message.match(/VIRTUAL SAFETY CAR/i)) {
            messageData.Category = 'VirtualSafetyCar';
        }
        /* Checking if the message contains the text "TRACK SURFACE SLIPPERY" and if it does, it sets the
Category to "TrackSurfaceSlippery". */
        if (message.Message.match(/TRACK SURFACE SLIPPERY/i)) {
            messageData.Category = 'TrackSurfaceSlippery';
        }
        /* Checking if the message contains the text "ROLLING START" and if it does, it will change the gif to
the "rs" gif and then turn it off after 20 seconds. */
        if (message.Message.match(/ROLLING START/i)) {
            changeGif('rs', currentMode);
            await timer(20000);
            turnOff('rs');
            return;
        }
        /* Checking if the message contains the text "STANDING START" and if it does, it will change the gif to
the "ss" gif and then turn it off after 20 seconds. */
        if (message.Message.match(/STANDING START/i)) {
            changeGif('ss', currentMode);
            await timer(20000);
            turnOff('ss');
            return;
        }
        /* Checking if the message.Flag is undefined. If it is, it will set the messageData.Category to "Flag"
and set the messageData.Flag, messageData.Sector, and messageData.Scope to the values of the
message.Flag, message.Sector, and message.Scope. */
        if (message.Flag !== undefined) {
            messageData.Category = 'Flag';
            messageData.Flag = message.Flag;
            messageData.Sector = message.Sector;
            messageData.Scope = message.Scope;
        }
        if (debugOn) log(messageData);
        /* Changing the gif image to a slippery image. */
        if (messageData.Category === 'TrackSurfaceSlippery') changeGif('slippery', currentMode);
        /* Checking if the messageData.Category is equal to "SafetyCar" and if it is, it sets the sc variable
to true and calls the changeGif function with the parameters "sc" and currentMode. */
        if (messageData.Category === 'SafetyCar') {
            sc = true;
            changeGif('sc', currentMode);
        }
        /* Checking if the messageData.Category is equal to "VirtualSafetyCar" and if it is, it sets the vsc
variable to true and calls the changeGif function with the parameters "vsc" and currentMode. */
        if (messageData.Category === 'VirtualSafetyCar') {
            vsc = true;
            changeGif('vsc', currentMode);
        }
        /* Checking if the messageData.Flag is equal to "CHEQUERED" and if it is, it will change the gif to
"chequered" and then wait for 60 seconds and then turn off the gif. */
        if (messageData.Flag === 'CHEQUERED') {
            changeGif('chequered', currentMode);
            await timer(60000);
            turnOff('chequered');
            return;
        }
        /* Checking if the messageData.Scope is equal to "Track" and if it is, it is checking if the
messageData.Flag is equal to "RED". If it is, it is changing the gif to "red" and returning. If it
is not, it is setting sc, vsc, and red to false, changing the gif to "green", waiting 2.5 seconds, and changing the gif to "void". */
        if (messageData.Scope === 'Track') {
            if (messageData.Flag === 'RED') {
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

        /* Checking to see if the messageData.Category is equal to "Flag" */
        if (messageData.Category === 'Flag') {
            switch (messageData.Flag) {
                /* A switch statement that is checking the value of the variable currentMode. If the value of
                currentMode is "YELLOW", then the changeGif function is called with the parameters "yellow" and
                currentMode. */
                case 'YELLOW':
                    changeGif('yellow', currentMode);
                    break;
                /* A switch statement that is checking the value of the variable currentMode. If the value of
                    currentMode is "DOUBLE YELLOW", then the function changeGif is called with the parameters "dyellow"
                    and currentMode. */
                case 'DOUBLE YELLOW':
                    changeGif('dyellow', currentMode);
                    break;
                /* A switch statement that is checking the currentMode variable. If the currentMode variable is equal
                    to "CLEAR" then it will change the gif to green and then turn off the green light. */
                case 'CLEAR':
                    changeGif('green', currentMode);
                    await timer(2500);
                    turnOff('green');
                    break;
                /* A switch statement that is checking the currentMode variable. If the currentMode variable is equal
                    to "RED" then it will set the red variable to true and call the changeGif function with the
                    parameters "red" and currentMode. It will then wait for 90 seconds and then call the turnOff
                    function with the parameter "red". */
                case 'RED':
                    red = true;
                    changeGif('red', currentMode);
                    await timer(90000);
                    turnOff('red');
                    break;
                /* A switch statement that is checking the currentMode variable. If the currentMode variable is equal
                    to "BLUE" then it will set the red variable to true and call the changeGif function with the
                    parameters "blue" and currentMode. It will then wait for 1 second and then call the turnOff
                    function with the parameter "blue". */
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

    /* Checking if the value of the variable Rain is equal to 1. If it is, then the variable raining is set
to true. */
    raining = Rain === '1';

    /* Checking if it is raining and if the light is on. If it is raining and the light is on, it will
change the gif to rain. */
    if (raining && !lightOnRain) {
        changeGif('rain', currentMode);
    }
}

/**
 * Update the Live Timing data
 * @returns the live timing data
 * @author LapsTime
 */
async function updateData() {
    if (started)
        LT_Data = JSON.parse(httpGet(await F1MV_API_BuildLiveTimingUrl('RaceControlMessages,TrackStatus,WeatherData')));
    return LT_Data;
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
function toggleTransparency() {
    if (windowTransparency) {
        $('body').removeAttr('style');
        windowTransparency = false;
    } else {
        $('body').css('background-color', 'transparent');
        $('#menuBox').removeAttr('style');
        windowTransparency = true;
    }
}
/* Listening for the escape key to be pressed and then calling the toggleBackground function. */
document.addEventListener('keydown', (e) => {
    if (e.key == 'Escape') {
        toggleTransparency();
    }
});
