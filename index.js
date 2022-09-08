function httpGet(theUrl) {
    let xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", theUrl, false); 
    xmlHttpReq.send(null);
    return xmlHttpReq.responseText;
}

let host = "localhost"
let port = 10101

const timer = ms => new Promise( res => setTimeout(res, ms));

const {themes} = JSON.parse(httpGet('./filesConfiguration.json'))

let debugOn = false;

let zoom = 512

let started = false;

let yellow = false;
let sc = false;
let vsc = false;
let red = false;

let currentTheme = 1;
let currentMode = 0; // 0 for window, 1 for pixoo64
let disabledBlueFlag = false;

let oldMessages = {
    "Messages": []
}

function getGifPath(flag) {
    let flagPath;
    for (let _i = 0; _i < themes.length; _i++) {
        const theme = themes[_i];
        if(theme.id === currentTheme) {
            flagPath = theme.gifs[flag]
        };
    }
    if(debugOn) console.log(`${flag} requested, returning ${flagPath}`);
    return flagPath;
}

function selectTheme(id) {
    currentTheme = id;
    $('#nextTheme').prop('disabled', false)
}

function turnOff(flag) {
    if(flag === "ss" || flag === "rs" || flag === "chequered" || flag === "green" || flag === "blue" || flag === "slippery") {
        if(sc === true) {
            $('#digiflag').prop('src', getGifPath('sc'))
        } else {
            if(vsc === true) {
                $('#digiflag').prop('src', getGifPath('vsc'));
                return;
            } else {
                if(red === true) {
                    $('#digiflag').prop('src', getGifPath('red'));
                    return;
                } else {
                    if(yellow === true) {
                        $('#digiflag').prop('src', getGifPath('yellow'));
                        return;
                    }
                }
            }
            $('#digiflag').prop('src', getGifPath('void'))
        }
    } else $('#digiflag').prop('src', getGifPath('void'));
}

function changeGif(flag, mode) {
    if(flag === "blue" && disabledBlueFlag) return;
    flagPath = getGifPath(flag);
    $('#digiflag').prop('src', flagPath)
}

function linkF1MV() {
    if(debugOn) console.log('Link started...');
        $('#tagLink').removeClass('text-bg-secondary')
        $('#tagLink').removeClass('text-bg-danger')
        $('#tagLink').removeClass('text-bg-warning')
        $('#tagLink').removeClass('text-bg-success')
        $('#tagLink').addClass('text-bg-primary')
        $('#tagLink').text('Linking to F1MV in progress...')
        try {
            if(debugOn) console.log(`URL = http://${host}:${port.toString()}/api/v1/live-timing/Heartbeat`);
            let response = JSON.parse(httpGet(`http://${host}:${port.toString()}/api/v1/live-timing/Heartbeat`))
            if(response.error === "No data found, do you have live timing running?") {
                $('#tagLink').addClass('text-bg-warning')
                $('#tagLink').removeClass('text-bg-primary')
                $('#tagLink').text('Your F1MV is connected, but it\'s seem like your Live Timing page is not running.')
            } else {
                $('#tagLink').addClass('text-bg-success')
                $('#tagLink').removeClass('text-bg-primary')
                $('#tagLink').removeClass('text-bg-warning')
                $('#tagLink').text('Connected to F1MV')
                $('#edit_hostInfo').remove()
                $('#infotag').text('')
                $('#infolink').text('')

                $('#select_theme').append(`
                    <div id="themes">

                    </div>
                    <button type="button" id="nextTheme" class="btn btn-success" disabled>Next</button>
                `)
                for (let _i = 0; _i < themes.length; _i++) {
                    const theme = themes[_i];
                    $('#themes').append(`
                        <div class="form-check" id="window">
                            <input class="form-check-input" type="radio" name="theme" id="theme${theme.id}">
                            <label class="form-check-label" for="theme${theme.id}">
                                ${theme.name}
                            </label>
                        </div>
                    `)
                    $('#theme' + theme.id).click(() => {
                        selectTheme(theme.id)
                    })
                }
                $('#nextTheme').click(() => {
                    $('#select_theme').remove()
                    $('#select_device').append(`
                        <div class="form-check" id="window">
                        <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" checked>
                        <label class="form-check-label" for="flexRadioDefault1">
                            Window DigiFlag
                        </label>
                        </div>
                        <div class="form-check" id="Pixoo64">
                        <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" disabled>
                        <label class="form-check-label" for="flexRadioDefault2">
                            Pixoo 64 DigiFlag <span class="badge text-bg-danger">Not implemanted yet</span>
                        </label>
                        </div>
                        <div class="form-check" id="blueFlag">
                            <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault">
                            <label class="form-check-label" for="flexCheckDefault">
                                Remove blue flag ?
                            </label>
                        </div>
                        <button type="button" id="launchDigiFlag" class="btn btn-success">Start DigiFlag</button>
                    `)
                    $('#blueFlag').click(() => {
                        if(disabledBlueFlag) {
                            disabledBlueFlag = false;
                        } else {
                            disabledBlueFlag = true;
                        }
                    })
                    $('#launchDigiFlag').click(() => {
                        $('.menu_box').remove()
                        $('body').append(`<img src="${getGifPath('void')}" height="512" id="digiflag" class="center-screen">`)
                        $('#zoomControl').css('opacity', 1)
                        started = true;
                    })
                })

            }
        } catch (e) {
            $('#tagLink').addClass('text-bg-danger')
            $('#tagLink').removeClass('text-bg-primary')
            $('#tagLink').removeClass('text-bg-warning')
            $('#tagLink').text('Failed to connect to F1MV') 
            $('#infotag').text('Maybe your port isn\'t the default one ? Maybe are you trying to connect to another host ?')
            $('#infolink').text('Click here for editing the F1MV config.')
        }
}

$('document').ready(() => {
    $('#zoomControl').css('opacity', 0)
    $('#LinkF1MV').click(() => {
        linkF1MV()
    })
    $('#infolink').click(() => {
        $('#edit_hostInfo').append('<p>IP : </p>')
        $('#edit_hostInfo').append('<input type="text" class="form-control" placeholder="localhost" value="localhost" id="ip">')
        $('#edit_hostInfo').append('<p>Port : </p>')
        $('#edit_hostInfo').append('<input type="text" class="form-control" placeholder="10101" value="10101" id="port">')
        $('#edit_hostInfo').append('<button type="button" id="updateSettings" class="btn btn-primary">Update settings</button>')
        $('#updateSettings').click(() => {
            if(debugOn) console.log('Editing settings...');
            host = $('#ip').val();
            if(debugOn) console.log($('#ip').val() !== "");
            if(debugOn) console.log(`IP = ${$('#ip').val()} = ${host}`);
            port = $('#port').val();
            if(debugOn) console.log($('#port').val() !== "");
            if(debugOn) console.log(`PORT = ${$('#port').val()} = ${port}`);
            if(debugOn) console.log('Settings edited !');
        })
    })
    $('#zoomIn').click(() => {
        zoom = zoom + 20;
        $('#digiflag').prop('height', zoom)
    })
    $('#zoomOut').click(() => {
        zoom = zoom - 20;
        $('#digiflag').prop('height', zoom)
    })
})

async function checkRCM() {
    if(started === false) return;


    const urlRCM = `http://${host}:${port}/api/v1/live-timing/RaceControlMessages`

    const result = await JSON.parse(httpGet(urlRCM))

    if(result.Messages.length === oldMessages.Messages.length) {
        if(debugOn) console.log('No new messages.');
    } else {
        if(debugOn) console.log('New message');
        message = result.Messages[oldMessages.Messages.length]
        oldMessages = result
    
        let messageData = {};

        if (message.Message.match(/BLACK AND ORANGE/i)) {
            messageData.Category = "Flag";
            messageData.Flag = "BLACK AND ORANGE";
        }

        if (message.Message.match(/SAFETY CAR/i)) {
            messageData.Category = "SafetyCar";
        }

        if (message.Message.match(/VIRTUAL SAFETY CAR/i)) {
            messageData.Category = "VirtualSafetyCar";
        }

        if (message.Message.match(/TRACK SURFACE SLIPPERY/i)) {
            messageData.Category = "TrackSurfaceSlippery";
        }

        if (message.Message.match(/ROLLING START/i)) {
            started = false;
            changeGif('rs', currentMode)
            await timer(20000)
            turnOff('rs')
            started = true;
        }
        if (message.Message.match(/STANDING START/i)) {
            started = false;
            changeGif('ss', currentMode)
            await timer(20000)
            turnOff('ss')
            started = true;
        }

        if (message.Flag !== undefined) {
            messageData.Category = "Flag";
            messageData.Flag = message.Flag;
            messageData.Sector = message.Sector;
            messageData.Scope = message.Scope
        }

        if(debugOn) console.log(messageData);

        if(messageData.Category === "TrackSurfaceSlippery") changeGif('slippery')
        if(messageData.Category === "SafetyCar"){
            sc = true;
            changeGif('sc', currentMode)
        }
        if(messageData.Category === "VirtualSafetyCar") {
            vsc = true;
            changeGif('vsc', currentMode)
        }
        
        if(messageData.Flag === "CHEQUERED") {
            changeGif('chequered', currentMode)
            await timer(60000)
            turnOff('chequered')
            return;
        }

        if(messageData.Scope === "Track") {
            if(messageData.Flag === "RED") {
                changeGif('red', currentMode)
                return;
            }
            sc = false;
            vsc = false;
            red = false;
            changeGif('green', currentMode)
            await timer(2500)
            changeGif('void')
            return;
        }

        if (messageData.Category === "Flag") {
            switch (messageData.Flag) {
                case "YELLOW":
                    changeGif('yellow', currentMode)
                    break;
                case "DOUBLE YELLOW":
                    changeGif('dyellow', currentMode)
                    break;
                case "CLEAR":
                    changeGif('green', currentMode)
                    await timer(2500)
                    turnOff('green')
                    break;
                case "RED":
                    red = true;
                    changeGif('red', currentMode)
                    await timer(90000)
                    turnOff('red')
                    break;
                case "BLUE":
                    changeGif('blue', currentMode)
                    await timer(1000)
                    turnOff('blue')
                    break;
            
                default:
                    break;
            }
        }
    }

}

async function checkStatus() {
    if(!started) return;


    let urlStatus = `http://${host}:${port}/api/v1/live-timing/TrackStatus`

    let trackStatus = JSON.parse(httpGet(urlStatus)).Status

    // {"Status":"1","Message":"AllClear"}
    // {"Status":"2","Message":"Yellow"}
    // {"Status":"4","Message":"SCDeployed"}
    // {"Status":"5","Message":"Red"}
    // {"Status":"6","Message":"VSCDeployed"}
    // {"Status":"7","Message":"VSCEnding"}

    if(trackStatus === "1") {
        if(sc || vsc || red || yellow) {
            if (debugOn) console.log('New track status : Green');
            sc = false;
            yellow = false;
            vsc = false;
            red = false;
            changeGif('green')
            await timer(2500)
            turnOff('green')
        }
    }
    if(trackStatus === "2") {
        if (debugOn) console.log('New track status : Yellow');
        sc = false;
        yellow = true;
        vsc = false;
        red = false;
    }
    if(trackStatus === "4") {
        if (debugOn) console.log('New track status : SC');
        sc = true;
        yellow = false;
        vsc = false;
        red = false;
    }
    if(trackStatus === "5") {
        if (debugOn) console.log('New track status : Red');
        sc = false;
        yellow = false;
        vsc = false;
        red = true;
    }
    if(trackStatus === "6") {
        if (debugOn) console.log('New track status : VSC');
        sc = false;
        yellow = false;
        vsc = true;
        red = false;
    }
}

setInterval(checkRCM, 100)
setInterval(checkStatus, 100);