/* Declaring a variable called host and assigning it the value of "localhost". */
let host = 'localhost';
/* Creating a variable called port and assigning it the value of 10101. */
let port = 10101;

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

let logs = [];

function log(text) {
    console.log(text)
    if(logs[logs.length-1] === text) return;
    logs.push(text)
}

function httpPost(url, body) {
    var method = "POST";
    var postData = body;
    // log(postData);

    var shouldBeAsync = true;

    var request = new XMLHttpRequest();

    request.open(method, url, shouldBeAsync);

    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    request.send(postData);
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

async function sendTelemetry(eulaAccept) {
    log('Checking if telemetry server is available...');
    var {url} = await JSON.parse(httpGet('https://digiflagtelemetryurl.000webhostapp.com/url.json'))
    var {available} = await JSON.parse(httpGet(`${url}/telemetryAvailable`))

    if(!available) {
        log(`Telemetry isn't available for now, please contact @🇫🇷| LapsTime#6837 on the F1MV Discord`)
        return false;
    } else {
        log('Telemetry server is available.')
        if(eulaAccept !== true) {
            console.warn('EULA not accepted. Requesting EULA...');
            log(await httpGet(`${url}/eula`));
            log('Execute "sendTelemetry(true)" to accept EULA.');
            return
        }
        log(`Generating unique telemetry ID...`);
        var id = makeid(6);
        log(`Getting all the data...`);
        const telemetryPackage = {
            "logs": logs,
            "platform": window.navigator.platform,
            "LT_Dump": await httpGet(await F1MV_API_BuildLiveTimingUrl('RaceControlMessages,TrackStatus,WeatherData')),
            "DigiFlag_Version": DigiFlag_Version,
            "F1MV_Host": host,
            "F1MV_Port": port,
            "F1MV_Version": await getF1MVVersion(),
            "F1MV_APIVersion": await getAPIVersion(),
            "debugMode": debugOn,
            "currentTrackStatus": {
                "yellow": yellow,
                "sc": sc,
                "vsc": vsc,
                "red": red
            },
            "currentTheme": currentTheme,
            "currentMode": currentMode,
            "disabledBlueFlag": disabledBlueFlag,
            "themes": themes,
            "started": started
        }
        log(`Data Collected`);
        log(`Sending DATA...`);
        await httpPost(`${url}/uploadTelemetry/${id}`, JSON.stringify(telemetryPackage));
        log(`Your telemetry report has been successfully send. Here is your data ID : ${id}. If you want to see your telemetryPackage, go to ${url}/downloadTelemetryReport/${id}`);
    }
}

/**
 * It gets the current race name from the F1MV API and displays it on the page.
 */
async function getCurrentRace() {
    try {
        const url = await F1MV_API_BuildLiveTimingUrl('SessionInfo');
        const response = await fetch(url, {
            method: 'GET',
        });

        if (response.status === 200) {
            const result = await response.json();
            const raceName = await result.Meeting.Name;
            const raceYear = await parseInt(result.StartDate);
            $('#raceName').text(raceYear + ' ' + raceName);
        }
    } catch (err) {
        console.error(err);
    }
}

/**
 * It saves the host and port to local storage.
 * @param host - The hostname of the server.
 * @param port - The port number of the server.
 */
function saveSettings(host, port) {
    localStorage.setItem('host', host);
    localStorage.setItem('port', port);
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
            '',
            `left=${instanceWindowOffsetX},top=${instanceWindowOffsetY},menubar=no,autoHideMenuBar=true,backgroundColor=#131416,width=${instanceWindowWidth},height=${instanceWindowHeight},title=${windowTitle},icon=./icon.ico`
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
/**
 * It clears the local storage and sets host and port back to default.
 */
function restoreSettings() {
    console;
    if (localStorage !== null) localStorage.clear();
    host = 'localhost';
    port = 10101;
    log('Storage Cleared');
}

/**
 * It gets the version of the F1MV app from the server and returns it as an integer.
 * @returns The current version of the F1MV app.
 */
async function getF1MVVersion() {
    loadSettings();
    const res = await JSON.parse(httpGet(`http://${host}:${port}/api/v1/app/version`));
    let ver = res.version;
    ver = parseInt(ver.replace(/[\D]/g, '').substring(0, 3));
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
let F1MV_version = getF1MVVersion();
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
 * It takes a number of milliseconds as an argument, and returns a promise that resolves after that
 * number of milliseconds.
 * @param ms - The amount of time to wait before resolving the promise.
 */
const timer = (ms) => new Promise((res) => setTimeout(res, ms));
/* Getting the themes from the filesConfiguration.json file. */
const {themes} = JSON.parse(httpGet('./filesConfiguration.json'));
/* Declaring a variable called debugOn and assigning it a value of false. */
let debugOn = true;
let zoom = 512;
let scale = 1;
let started = false;
let yellow = false;
let sc = false;
let vsc = false;
let red = false;
let raining = 0;
let DigiFlag_Version = JSON.parse(httpGet('./package.json')).version
let LT_Data = {};
let lightOn = false;
let lightOnRain = false;
/* Declaring a variable called currentTheme and assigning it a value of 1. */
let currentTheme = 1;
const currentMode = 0; // 0 for window, 1 for pixoo64
let disabledBlueFlag = false;
const pixooIP = '';
const instanceWindowWidth = 800;
const instanceWindowHeight = 600;
const instanceWindowOffsetX = 900;
const instanceWindowOffsetY = 200;
/* Creating an object called oldMessages and adding a property called Messages to it. */
let oldMessages = {
    Messages: [],
};
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
    for (let _i = 0; _i < themes.length; _i++) {
        const theme = themes[_i];
        if (theme.id === currentTheme) {
            flagPath = theme.gifs[flag];
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
                const res = await httpGet(`http://localhost:9093/pixoo/void/${currentTheme}/${pixooIP}`);
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
            const res = await httpGet(`http://localhost:9093/pixoo/void/${currentTheme}/${pixooIP}`);
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
        const res = await httpGet(`http://localhost:9093/pixoo/${flag}/${currentTheme}/${pixooIP}`);
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
    $('#settingsButton').appendTo('#menuContent');
    $('#infotag').remove();
    $('#selectTheme').append(`
        <div id="themes">

        </div>
        <button type="button" id="nextTheme" class="btn btn-success" disabled>Next
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="feather feather-arrow-right">
  <path d="M5 12h14M12 5l7 7-7 7"/>
</svg></button>
    `);
    let theme;
    for (let _i = 0; _i < themes.length; _i++) {
        theme = themes[_i];
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
            <div class="form-check" id="window">
            <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" checked>
            <label class="form-check-label" for="flexRadioDefault1">
                Window DigiFlag
            </label>
            </div>
            <span class="badge text-bg-danger" id="notAvailable" diabled>Not Available with this Theme</span>
            <div class="form-check" id="Pixoo64">
            <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" disabled>
            <label class="form-check-label" for="flexRadioDefault2">
                Pixoo 64 DigiFlag
            </label>
            </div>
            <div class="form-check" id="blueFlag">
                <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault">
                <label class="form-check-label" for="flexCheckDefault">
                    Remove Blue Flags?
                </label>
            </div>
            <button type="button" id="launchDigiFlag" class="btn btn-success">Start DigiFlag</button>
        `);
        if (themes[currentTheme].compatibleWith.Pixoo64) {
            $('#notAvailable').remove();
            $('#flexRadioDefault2').prop('disabled', false);
        }
        $('#blueFlag').on('change', () => {
            if (disabledBlueFlag) {
                disabledBlueFlag = false;
                log('Blue Flags Disabled: ' + disabledBlueFlag);
                return disabledBlueFlag;
            } else {
                disabledBlueFlag = true;
                log('Blue Flags Disabled: ' + disabledBlueFlag);
                return disabledBlueFlag;
            }
        });
        $('#launchDigiFlag').on('click', () => {
            $('#zoomControl').addClass('bottom-screen');
            $('#settingsButton').appendTo('#zoomControl');
            $('.menuBox').remove();
            $('body').append(`<img src="${getGifPath('void')}" height="512" id="digiflag" class="center-screen">`);
            $('#zoomControl').css('z-index', 1);
            /* Increasing the zoom of the image by 20px when the button is clicked. */
            $('#zoomIn').on('click', () => {
                zoom = zoom + 20;
                $('#digiflag').css('height', zoom);
            });
            /* Decreasing the zoom of the image by 20px when the button is clicked. */
            $('#zoomOut').on('click', () => {
                zoom = zoom - 20;
                $('#digiflag').css('height', zoom);
            });
            $('#zoomReset').on('click', () => {
                $('#digiflag').removeAttr('style');
            });
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
            $('#raceName').text('Unable to Retrive Current Sesssion from Live Timing');
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
        $('#checkNetworkSettings').text('Click on the Settings Gear Above to check your Network Settings.');
    }
}
/* A function that is called when the page is loaded. */
$(function () {
    $('#raceName').text('Unkown');
    $('#LinkF1MV').on('click', () => {
        linkF1MV();
        getCurrentRace();
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
            `<input type="text" class="form-control" placeholder="localhost" value=${host} id="ip">`
        );
        /* Appending a paragraph tag with the text "Port : " and then appending an input tag with the class
		"form-control" and the placeholder "10101" and the value of the variable port and the id "port". */
        $('#networkSettings').append('<p>Port : </p>');
        $('#networkSettings').append(
            `<input type="text" class="form-control" placeholder="10101" value=${port} id="port">`
        );
        $('#networkSettings').append(
            $('<div/>', {
                class: 'networkButtonsContainer',
            }).append([
                '<button type="button" id="updateSettings" class="btn btn-primary">Save Network Settings</button>',
                '<button type="button"  id="restoreSettings" class="btn btn-danger">Restore Default Settings </button>',
            ])
        );
        $('#updateSettings').on('click', () => {
            if (debugOn) log('Editing Settings...');
            /* Assigning the value of the input field with the id of "ip" to the variable "host". */
            host = $('#ip').val();
            if (debugOn) log($('#ip').val() !== '');
            if (debugOn) log(`IP = ${$('#ip').val()} = ${host}`);
            /* Assigning the value of the input field with the id of port to the variable port. */
            port = $('#port').val();
            if (debugOn) log($('#port').val() !== '');
            if (debugOn) log(`PORT = ${$('#port').val()} = ${port}`);
            if (debugOn) log('Settings edited !');
            saveSettings(host, port);
            /* Getting the version of the F1MV. */
            F1MV_version = getF1MVVersion();
        });
        $('#restoreSettings').on('click', () => {
            /* Setting the value of the input fields back to localhost and 10101. */
            $('#ip').val('localhost');
            $('#port').val(10101);
            restoreSettings();
            F1MV_version = getF1MVVersion();
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
        $('.menuBox').css({transform: 'scale(' + zoomScaleAdd + ')'});
    });
    /* Decreasing the zoom of the image by 20px when the button is clicked. */
    $('#zoomOut').on('click', () => {
        const zoomScaleSubtract = (scale = scale - 0.25);
        if (zoomScaleSubtract <= 0.25) scale = 1.25;
        $('.menuBox').css({transform: 'scale(' + zoomScaleSubtract + ')'});
    });
    $('#zoomReset').on('click', () => {
        $('.menuBox').removeAttr('style');
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
        LT_Data = JSON.parse(
            await httpGet(await F1MV_API_BuildLiveTimingUrl('RaceControlMessages,TrackStatus,WeatherData'))
        );
}

/* Update the Live Timing data every 100 milliseconds */
setInterval(updateData, 100);
/* Checking the RCM every 100 milliseconds. */
setInterval(checkRCM, 100);
/* Checking the Rain every 100 milliseconds */
setInterval(checkRain, 100);
/* Checking the status of the page every 100 milliseconds. */
setInterval(checkStatus, 100);
