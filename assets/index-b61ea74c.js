(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const l of i)if(l.type==="childList")for(const v of l.addedNodes)v.tagName==="LINK"&&v.rel==="modulepreload"&&n(v)}).observe(document,{childList:!0,subtree:!0});function a(i){const l={};return i.integrity&&(l.integrity=i.integrity),i.referrerpolicy&&(l.referrerPolicy=i.referrerpolicy),i.crossorigin==="use-credentials"?l.credentials="include":i.crossorigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function n(i){if(i.ep)return;i.ep=!0;const l=a(i);fetch(i.href,l)}})();var Z=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},q={},F={},b={},se={get exports(){return b},set exports(e){b=e}};(function(e,t){var a=function(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof Z<"u")return Z;throw new Error("unable to locate global object")},n=a();e.exports=t=n.fetch,n.fetch&&(t.default=n.fetch.bind(n)),t.Headers=n.Headers,t.Request=n.Request,t.Response=n.Response})(se,b);Object.defineProperty(F,"__esModule",{value:!0});F.getAPIVersion=F.getF1MVVersion=void 0;const le=b;async function ne(e){const t=`http://${e.host}:${e.port}/api/v1/app/version`,n=await(await(0,le.default)(t)).json();let{version:i}=n;return i=parseInt(i.replace(/[\D]/g,"")),i}F.getF1MVVersion=ne;async function ce(e,t,a){let n;return t?n=a:n=await ne(e),n>=180&&n<1100?"v2":n>=1100?"graphql":"v1"}F.getAPIVersion=ce;var B={},D={};Object.defineProperty(D,"__esModule",{value:!0});D.testConnection=void 0;const de=b;async function ue(e){try{const t=await(await(0,de.default)(`http://${e.host}:${e.port}/api/v1/app/version`)).json();return t.version!==void 0?t:!1}catch{return!1}}D.testConnection=ue;var I={};Object.defineProperty(I,"__esModule",{value:!0});I.invalidTopic=I.noInstanceFounded=void 0;I.noInstanceFounded=new Error("No MultiViewer instances founded on the requested host. Check if MultiViewer is running or if MultiViewer is allowed in your FireWall rules.");I.invalidTopic=new Error("Invalid Topic requested.");Object.defineProperty(B,"__esModule",{value:!0});B.discoverF1MVInstances=void 0;const fe=D,ge=I;async function pe(e){let t=10101,a=!1;for(let n=t;n<10111;n++){let i={host:e,port:n};if(await(0,fe.testConnection)(i)!==!1){t=n,a=!0;break}}if(!a)throw ge.noInstanceFounded;return{instanceFounded:!0,port:t}}B.discoverF1MVInstances=pe;var f={};Object.defineProperty(f,"__esModule",{value:!0});f.LiveTimingClockAPIGraphQL=f.LiveTimingAPIGraphQL=f.LiveTimingAPIV2=f.LiveTimingAPIV1=void 0;const E=I,Q=b;async function me(e,t){const a=await(await(0,Q.default)(`http://${e.host}:${e.port}/api/v1/live-timing/${t}`)).json();return a.success===!1?E.invalidTopic:a}f.LiveTimingAPIV1=me;async function ye(e,t){const a=await(await(0,Q.default)(`http://${e.host}:${e.port}/api/v2/live-timing/state/${typeof t=="object"?t.join(","):t}`)).json();return a.success===!1?E.invalidTopic:a}f.LiveTimingAPIV2=ye;async function he(e,t){const{data:a}=await(await(0,Q.default)(`http://${e.host}:${e.port}/api/graphql`,{headers:{"content-type":"application/json"},body:JSON.stringify({query:`query LiveTimingState {
                            liveTimingState {
                                ${typeof t=="object"?t.join(`
`):t}
                            }
                        }`,operationName:"LiveTimingState"}),method:"POST"})).json();return a.success===!1?E.invalidTopic:a.liveTimingState}f.LiveTimingAPIGraphQL=he;async function be(e,t){const{data:a}=await(await(0,Q.default)(`http://${e.host}:${e.port}/api/graphql`,{headers:{"content-type":"application/json"},body:JSON.stringify({query:`query LiveTimingClock {
                            liveTimingClock {
                                ${typeof t=="object"?t.join(`
`):t}
                            }
                        }`,operationName:"LiveTimingClock"}),method:"POST"})).json();return a.success===!1?E.invalidTopic:a.liveTimingClock}f.LiveTimingClockAPIGraphQL=be;var oe={};(function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.getCircuitInfo=e.getFIA_Documents=e.baseURL=void 0;const t=b;e.baseURL="https://api.multiviewer.app/api/v1";async function a(i){return await(await(0,t.default)(`${e.baseURL}/fia-documents/${i}`)).json()}e.getFIA_Documents=a;async function n(i,l){return await(await(0,t.default)(`${e.baseURL}/circuits/${i}/${l}`)).json()}e.getCircuitInfo=n})(oe);var d={};Object.defineProperty(d,"__esModule",{value:!0});d.removePlayer=d.syncPlayers=d.createPlayer=d.setSpeedometerVisibility=d.getAllPlayers=d.setPlayerBounds=d.getPlayerBounds=void 0;const L=b;async function ve(e,t){return(await(await(0,L.default)(`http://${e.host}:${e.port}/api/graphql`,{headers:{"content-type":"application/json"},body:JSON.stringify({query:`query Player($playerId: ID!) {
                player(id: $playerId) {
                  bounds {
                    height
                    width
                    x
                    y
                  }
                }
              }`,variables:{playerId:t},operationName:"Player"}),method:"POST"})).json()).data.player.bounds}d.getPlayerBounds=ve;async function $e(e,t,a){return await(await(0,L.default)(`http://${e.host}:${e.port}/api/graphql`,{headers:{"content-type":"application/json"},body:JSON.stringify({query:`mutation PlayerSetBounds($playerSetBoundsId: ID!, $bounds: RectangleInput!) {
                playerSetBounds(id: $playerSetBoundsId, bounds: $bounds) {
                  x
                  y
                }
              }`,variables:{playerSetBoundsId:t,bounds:{x:a.x,y:a.y}},operationName:"PlayerSetBounds"}),method:"POST"})).json()}d.setPlayerBounds=$e;async function Se(e){return(await(await(0,L.default)(`http://${e.host}:${e.port}/api/graphql`,{headers:{"content-type":"application/json"},body:JSON.stringify({query:`query DriverData {
                    players {
                      driverData {
                        driverNumber
                      }
                      id
                      streamData {
                        contentId
                        title
                      }
                    }
                  }`,variables:{},operationName:"DriverData"}),method:"POST"})).json()).data.players}d.getAllPlayers=Se;async function we(e,t,a){return(await(await(0,L.default)(`http://${e.host}:${e.port}/api/graphql`,{headers:{"content-type":"application/json"},body:JSON.stringify({query:`mutation PlayerSetSpeedometerVisibility($playerSetSpeedometerVisibilityId: ID!, $visible: Boolean) {
                playerSetSpeedometerVisibility(id: $playerSetSpeedometerVisibilityId, visible: $visible)
              }`,variables:{playerSetSpeedometerVisibilityId:t,visible:a},operationName:"PlayerSetSpeedometerVisibility"}),method:"POST"})).json()).data.playerSetSpeedometerVisibility}d.setSpeedometerVisibility=we;async function Pe(e,t,a,n,i){return await(await(0,L.default)(`http://${e.host}:${e.port}/api/graphql`,{headers:{"content-type":"application/json"},body:JSON.stringify({query:`mutation PlayerCreate($input: PlayerCreateInput!) {
                playerCreate(input: $input)
              }`,variables:{input:{bounds:n,contentId:a,driverNumber:typeof t=="string"?parseInt(t):t,maintainAspectRatio:i||!0}},operationName:"PlayerCreate"}),method:"POST"})).json()}d.createPlayer=Pe;async function ke(e,t){return await(await(0,L.default)(`http://${e.host}:${e.port}/api/graphql`,{headers:{"content-type":"application/json"},body:JSON.stringify({query:`mutation PlayerSync($playerSyncId: ID!) {
                playerSync(id: $playerSyncId)
              }`,variables:{playerSyncId:t},operationName:"PlayerSync"}),method:"POST"})).json()}d.syncPlayers=ke;async function Ie(e,t){return await(await(0,L.default)(`http://${e.host}:${e.port}/api/graphql`,{headers:{"content-type":"application/json"},body:JSON.stringify({query:`mutation PlayerDelete($playerDeleteId: ID!) {
                playerDelete(id: $playerDeleteId)
              }`,variables:{playerDeleteId:t},operationName:"PlayerDelete"}),method:"POST"})).json()}d.removePlayer=Ie;var W={};Object.defineProperty(W,"__esModule",{value:!0});W.customGraphQL=void 0;const Te=b;async function Me(e,t,a,n){return await(await(0,Te.default)(`http://${e.host}:${e.port}/api/graphql`,{headers:{"content-type":"application/json"},body:JSON.stringify({query:t,variables:a,operationName:n}),method:"POST"})).json()}W.customGraphQL=Me;(function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.invalidTopic=e.noInstanceFounded=e.testConnection=e.LiveTimingClockAPIGraphQL=e.LiveTimingAPIGraphQL=e.LiveTimingAPIV2=e.LiveTimingAPIV1=e.discoverF1MVInstances=e.customGraphQL=e.getAllPlayers=e.setSpeedometerVisibility=e.setPlayerBounds=e.syncPlayers=e.removePlayer=e.createWindow=e.createPlayer=e.getPlayerBounds=e.getCircuitInfo=e.getFIA_Documents=e.getF1MVVersion=e.getAPIVersion=void 0;const t=F;Object.defineProperty(e,"getF1MVVersion",{enumerable:!0,get:function(){return t.getF1MVVersion}}),Object.defineProperty(e,"getAPIVersion",{enumerable:!0,get:function(){return t.getAPIVersion}});const a=B;Object.defineProperty(e,"discoverF1MVInstances",{enumerable:!0,get:function(){return a.discoverF1MVInstances}});const n=f;Object.defineProperty(e,"LiveTimingAPIGraphQL",{enumerable:!0,get:function(){return n.LiveTimingAPIGraphQL}}),Object.defineProperty(e,"LiveTimingAPIV1",{enumerable:!0,get:function(){return n.LiveTimingAPIV1}}),Object.defineProperty(e,"LiveTimingAPIV2",{enumerable:!0,get:function(){return n.LiveTimingAPIV2}}),Object.defineProperty(e,"LiveTimingClockAPIGraphQL",{enumerable:!0,get:function(){return n.LiveTimingClockAPIGraphQL}});const i=D;Object.defineProperty(e,"testConnection",{enumerable:!0,get:function(){return i.testConnection}});const l=I;Object.defineProperty(e,"noInstanceFounded",{enumerable:!0,get:function(){return l.noInstanceFounded}}),Object.defineProperty(e,"invalidTopic",{enumerable:!0,get:function(){return l.invalidTopic}});const v=oe;Object.defineProperty(e,"getFIA_Documents",{enumerable:!0,get:function(){return v.getFIA_Documents}}),Object.defineProperty(e,"getCircuitInfo",{enumerable:!0,get:function(){return v.getCircuitInfo}});const g=d;Object.defineProperty(e,"createPlayer",{enumerable:!0,get:function(){return g.createPlayer}}),Object.defineProperty(e,"createWindow",{enumerable:!0,get:function(){return g.createPlayer}}),Object.defineProperty(e,"getAllPlayers",{enumerable:!0,get:function(){return g.getAllPlayers}}),Object.defineProperty(e,"getPlayerBounds",{enumerable:!0,get:function(){return g.getPlayerBounds}}),Object.defineProperty(e,"removePlayer",{enumerable:!0,get:function(){return g.removePlayer}}),Object.defineProperty(e,"setPlayerBounds",{enumerable:!0,get:function(){return g.setPlayerBounds}}),Object.defineProperty(e,"setSpeedometerVisibility",{enumerable:!0,get:function(){return g.setSpeedometerVisibility}}),Object.defineProperty(e,"syncPlayers",{enumerable:!0,get:function(){return g.syncPlayers}});const re=W;Object.defineProperty(e,"customGraphQL",{enumerable:!0,get:function(){return re.customGraphQL}})})(q);const Ce="2.4.0-Web",Le="localhost",Fe=10101,u={host:Le,port:Fe},S=e=>new Promise(t=>setTimeout(t,e)),{themes:A,mapThemes:_}=JSON.parse(x("./filesConfiguration.json"));let o=!1,z=!1,T=1,R=!1,M=!1,m=!1,y=!1,h=!1,J=0;const Oe=Ce;let N={RaceControlMessages:{Messages:[{Message:"",Category:"",SubCategory:"",Flag:"",Scope:"",Sector:"",Mode:""}]},TrackStatus:{Status:"",Message:""},WeatherData:{AirTemp:"",Humidity:"",Pressure:"",Rainfall:"",TrackTemp:"",WindDirection:"",WindSpeed:""}},G=!1,Y=!1,O=1,K=0,C="Unknown",s=0,w=!1,p=!1;const X="",Ae=800,Ne=600,Ve=100,De=200;let ee={Messages:[{Message:"",Category:"",SubCategory:"",Flag:"",Scope:"",Sector:"",Mode:""}]};function x(e){const t=new XMLHttpRequest;return t.open("GET",e,!1),t.send(null),t.responseText}const U=[];function r(e){console.log(e),U[U.length-1]!==e&&U.push(e)}let j=!1;async function V(){try{let e=3;if(j===!1){const t=setInterval(()=>{e<=0?(ae(),Re(),clearInterval(t),j=!1):(j=!0,$("#tagLink").hasClass("badge text-bg-danger")?($("#tagLink").text("Retrying to Connect to F1MV in : "+e+" seconds"),$("#raceName").text("Attempting to Get Current Session Info From F1MV...")):$("#tagLink").hasClass("badge text-bg-warning")?($("#tagLink").text("Attempting to Connect to Live / Replay Timing Window : "+e+" seconds"),$("#raceName").text("Retrieving Current Session From F1MV...")):($("#tagLink").removeClass(),$("#tagSession").removeClass(),$("#raceName").removeClass(),$("#checkNetworkSettings,#infoTag").hide(),$("#tagLink").addClass("badge text-bg-primary"),$("#tagSession").addClass("badge text-bg-primary"),$("#raceName").addClass("text-bg-primary"),$("#raceName").text("Retrieving Current Session From F1MV..."),$("#tagLink").text("Attempting to Connect to F1MV in : "+e+" seconds"))),e-=1},1e3)}}catch(e){console.error(e),ae()}}async function Re(){try{const e=await q.LiveTimingAPIGraphQL(u,["SessionInfo"]),t=await e.SessionInfo.Meeting.Name;return C=`${parseInt(e.SessionInfo.StartDate)+" "+t}`,$("#raceName").text(C),o&&console.log(`Current Race Name: ${C}`),C}catch(e){return o&&console.error(`Unable to Get Data From F1MV GraphQL API:
`+e.message),"Unable to Get Data From F1MV GraphQL API"}}function ie(e){let t;const a=_[e].trackMaps;return C in a?(t=a[C],o&&console.log(`Track Map Path: ${t}`),t):(o&&console.log("Map Not Found"),"Map Not Found")}function je(e,t){$(".toast").remove(),localStorage.setItem("host",e),t>=0&&t<=65535?(localStorage.setItem("port",t.toString()),o&&r("Network Settings Saved !"),$("#networkSettings > h5").after(`<div class="toast text-bg-dark" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000" data-bs-autohide="true">
        <div class="toast-header text-bg-success">
          <strong class="text-center me-auto">Network Settings Saved!</strong>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
        <p>Host:${e}</p>
        <p>Port:${t}</p>
        </div>
    </div>
    `),$(".toast").toast("show"),V()):(o&&r("Only Host Settings Saved !"),$("#networkSettings > h5").after(`<div class="toast text-bg-dark" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="5000" data-bs-autohide="true">
        <div class="toast-header text-bg-danger">
          <strong class="me-auto">ERROR: Invalid Port!</strong>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
        Only Host Settings Saved !
        <p>The Port Number ${t} is invalid. Please Enter a Valid Port Number Between 0 to 65535.</p>
        </div>
    </div>
        `),$(".toast").toast("show"))}function te(e,t){arguments.length==0&&(e="./index.html",t="DigiFlag Instance");try{return window.open(e,"_blank",`left=${Ve},top=${De},frame=${!1},
            transparent=${!0},menubar=no,autoHideMenuBar==${!1},width=${Ae},height=${Ne},title=${t},icon=./build/icon.ico,nodeIntegration=yes,contextIsolation=no`)}catch(a){return console.error(a),null}}function _e(){const e=localStorage.getItem("host"),t=localStorage.getItem("port");e&&t!==null&&(u.host=e,u.port=parseInt(t))}function Ge(){$(".toast").remove(),localStorage!==null&&localStorage.clear(),u.host="localhost",u.port=10101,$("#networkSettings > h5").after(`<div class="toast text-bg-dark" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="5000" data-bs-autohide="true">
        <div class="toast-header text-bg-danger">
          <strong class="text-center me-auto">Reset Network Settings!</strong>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
        Reset Network Settings To Default Values!
        </div>
    </div>
    `),$(".toast").toast("show"),o&&r("Reset Network Settings To Default"),V()}function xe(e){return e===!0?(o&&r("Debug Mode Enabled"),o=!0):(o&&r("Debug Mode Disabled"),o=!1),!0}xe(o);function k(e){let t="";const a=ie(K);if(e==="void"&&p===!0&&a.slice((a.lastIndexOf(".")-1>>>0)+2))t=a;else for(let n=0;n<A.length;n++){const i=A[n];i.id===O&&(t=i.gifs[e])}return o&&r(`${e} requested, returning ${t}`),t}function qe(e){o&&r("Mode selected : "+e),O=e,$("#nextTheme").prop("disabled",!1)}function Be(e){p==!0&&(o&&r("Map Theme selected : "+_[e].name),K=parseInt(e),ie(K),$("#launchDigiFlag").prop("disabled",!0))}async function P(e){if(e==="ss"||e==="rs"||e==="chequered"||e==="green"||e==="blue"||e==="slippery")if(m===!0)$("#digiflag").prop("src",k("sc"));else{if(y===!0){$("#digiflag").prop("src",k("vsc"));return}else if(h===!0){$("#digiflag").prop("src",k("red"));return}else if(M===!0){$("#digiflag").prop("src",k("yellow"));return}if(s.valueOf()===1){x(`http://localhost:9093/pixoo/void/${O}/${X}`)!=="OK"&&r("Failed to change GIF on Pixoo64");return}if(J){c("rain",0);return}$("#digiflag").prop("src",k("void")),G=!1}else{if(s.valueOf()===1){x(`http://localhost:9093/pixoo/void/${O}/${X}`)!=="OK"&&r("Failed to change GIF on Pixoo64");return}$("#digiflag").prop("src",k("void")),G=!1}}async function c(e,t){if(e==="blue"&&w)return;if(t===1&&s.valueOf()===1){x(`http://localhost:9093/pixoo/${e}/${O}/${X}`)!=="OK"&&r("Failed to change GIF on Pixoo64");return}const a=k(e);$("#digiflag").prop("src",a),e!=="rain"&&(G=!0,Y=!1),e==="rain"&&(Y=!0)}function H(){$("#tagLink").removeClass(),$("#tagSession").removeClass(),$("#raceName").removeClass(),$("#tagLink").addClass("badge text-bg-success"),$("#tagSession").addClass("badge text-bg-success"),$("#raceName").addClass("text-bg-success"),$("#tagLink").text("Successfully Connected to F1MV Timing Window"),$("#tagSession").show(),$("#linkF1MV").remove(),$("#infoTag").remove(),$("#checkNetworkSettings").remove(),$("#networkSettings").remove(),$("#selectTheme").append(`
    <p class="lead text-center fs-4 mb-1">Select a DigiFlag Theme</p>
        <div id="themes">
        </div>
        <button type="button" id="nextTheme" class="btn btn-success" disabled>Next
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="feather feather-arrow-right">
  <path d="M5 12h14M12 5l7 7-7 7"/>
</svg></button>
    `);let e;for(let t=0;t<A.length;t++)e=A[t],$("#themes").append(`
            <div class="form-check" id="window">
                <input class="form-check-input theme" type="radio" name="theme" id="${e.id}">
                <label class="form-check-label theme" for="${e.id}">
                    ${e.name}
                </label>
            </div>
        `);$(".theme").on("change",t=>{qe(parseInt(t.target.id))}),$("#nextTheme").on("click",()=>{$("#selectTheme").remove(),$("#selectDevice").append(`
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
        `),$("#selectMisc").append(`
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
</div>`),A[O].compatibleWith.Pixoo64&&($("#notAvailable").remove(),$("#pixoo64Radio").prop("disabled",!1)),$("#selectDevice").on("change",t=>{t.target.id==="pixoo64Radio"?(o&&console.log("Pixoo64 was Selected"),s=1,o&&console.log("Current Mode: "+s),$("#mapSwitch").prop("disabled",!0)):(o&&console.log("Window was Selected"),s=0,o&&console.log("Current Mode: "+s),$("#mapSwitch").prop("disabled",!1))}),$("#blueFlag").on("change",()=>w?(w=!1,o&&r("Blue Flags Enabled: "+w),w):(w=!0,o&&r("Blue Flags Disabled: "+w),w)),$("#trackMapSwitch").on("change",()=>{if(p)return p=!1,o&&r("use TrackMap as Background? : "+p),$("#launchDigiFlag").prop("disabled",!1),p;p=!0,o&&r("use TrackMap as Background? : "+p),$("#launchDigiFlag").prop("disabled",!0),$("#trackMapStyleSelect>option").remove(),$("#trackMapStyleSelect").append('<option value="none" selected disabled hidden>Select a TrackMap Style</option>');for(let t=0;t<_.length;t++){const a=_[t];$("#trackMapStyleSelect").append(`<option id=${a.id} value=${a.id}>${a.name}</option> `)}return $("#trackMapStyleSelect").on("change",()=>{const t=$("#trackMapStyleSelect").val();Be(t.toString()),$("#launchDigiFlag").prop("disabled",!1)}),p}),$("#menuContent").append('<button type="button" id="launchDigiFlag" class="btn btn-success">Start DigiFlag</button>'),$("#launchDigiFlag").on("click",()=>{$(".menu-box").remove(),$("body").append(`<img src="${k("void")}" id="digiflag" class="center-screen">`),$("#digiflag").insertBefore(".bottom-screen"),$(".bottom-screen:not(:hover)").animate({opacity:0},2e3,"swing",function(){$(".bottom-screen").removeAttr("style")}),$("#zoomIn,#zoomOut,#zoomReset").show(),$("#zoomControl").css("z-index",1),R=!0})})}async function ae(e){o&&r("Link started...");try{if(await q.LiveTimingAPIGraphQL(u,"Heartbeat"))H();else{if(e){H();return}$("#tagLink").removeClass(),$("#tagSession").removeClass(),$("#raceName").removeClass(),$("#tagLink").addClass("badge text-bg-warning"),$("#raceName").addClass("text-bg-warning"),$("#tagSession").addClass("badge text-bg-warning"),$("#networkSettings").hide(),$("#tagLink").text("You are Connected to F1MV, but the Live/Replay Timing Window is not open."),$("#checkNetworkSettings,#infoTag").hide(),$("#raceName").text("Unable to Retrieve Current Session from F1MV"),setTimeout(()=>{V()},1e3)}}catch{if(e){H();return}$("#tagLink").addClass("badge text-bg-danger"),$("#tagSession").addClass("badge text-bg-danger"),$("#raceName").addClass("text-bg-danger"),$("#tagLink").text("Failed to connect to F1MV"),$("#raceName").text("Failed to Retrieve Current Session"),$("#networkSettings").show(),$("#checkNetworkSettings,#infoTag").show(),$("#infoTag").text("Maybe you are trying to connect to another host? Maybe your port isn't the default one?"),$("#checkNetworkSettings").text("Move your Mouse to the Bottom Right Corner & Click on the Settings Gear to check your Network Settings."),setTimeout(()=>{V()},5e3)}}$(function(){_e(),j===!1&&V(),$("#version").text(`DigiFlag Version: ${Oe}`),$("#raceName").text(C),$(".bottom-screen:not(:hover)").css("opacity",1),$("#zoomIn,#zoomOut,#zoomReset").hide(),$("#linkF1MV").remove(),$("#settingsButton").one("click",()=>{$("#networkSettings").append(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="globe" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>`),$("#networkSettings").append("<h5>Network</h5>"),$("#networkSettings").append(`<label for="ip">Multiviewer API IP:</label>
            <input type="text" class="form-control text-bg-dark" value="${u.host}" id="ip">`),$("#networkSettings").append(`<label for="port">Multiviewer API Port:</label>
            <input type="text" class="form-control text-bg-dark" maxlength="5" value="${u.port}" id="port">`),$("#networkSettings").append($("<div/>",{class:"networkbuttons-container"}).append('<button type="button" id="updateSettings" class="btn btn-primary">Save Network Settings</button>','<button type="button"  id="restoreSettings" class="btn btn-danger">Restore Default Settings </button>')),$("#updateSettings").on("click",()=>{o&&r("Editing Settings...");const e=$("#ip").val().toString();u.host=e,o&&r($("#ip").text()),o&&r(`IP = ${$("#ip").val()} = ${u.host}`);const t=$("#port").val().toString();u.port=parseInt(t),o&&r($("#port").text()),o&&r(`PORT = ${$("#port").val()} = ${u.port}`),je(u.host,u.port)}),$("#restoreSettings").on("click",()=>{$("#ip").val("localhost"),$("#port").val(10101),Ge()})}),$("#newInstance").on("click",()=>{te()}),$("#openGithub").on("click",()=>{te("https://github.com/LapsTimeOFF/DigiFlag_F1MV")}),$("#zoomIn").on("click",()=>{const e=T=T+.25;e>=1.75&&(T=.75),$(".center-screen").css({transform:"translate(-50%,-50%) scale("+e+")"})}),$("#zoomOut").on("click",()=>{const e=T=T-.25;e<=.25&&(T=1.25),$(".center-screen").css({transform:"translate(-50%,-50%) scale("+e+")"})}),$("#zoomReset").on("click",()=>{$(".center-screen").removeAttr("style"),T=1})});const Ee=async()=>{if(R===!1)return;const e=N.RaceControlMessages;if(e.Messages.length===ee.Messages.length)o&&r("No new messages.");else{o&&r("New message"),ee=e;const a=e.Messages.filter(n=>n.Category==="Flag"||n.Category==="SafetyCar"||n.Category==="TrackSurfaceSlippery"||n.Message.match(/ROLLING START/i)||n.Message.match(/STANDING START/i)).slice(-1)[0];if(o&&console.log("Most Recent Filtered Message: "),console.table(a),o&&console.log("Most Recent RCM Message: "),console.table(e.Messages.slice(-1)[0]),a.Message.match(/BLACK AND ORANGE/i)&&(a.Category="Flag",a.Flag="BLACK AND ORANGE"),a.Message.match(/ROLLING START/i)&&a.SubCategory!=="IncidentInvestigationAfterSession"){c("rs",s),await S(2e4),P("rs");return}if(a.Message.match(/STANDING START/i)){c("ss",s),await S(2e4),P("ss");return}if(a.Category==="TrackSurfaceSlippery"&&c("slippery",s),a.Category==="SafetyCar"&&(m=!0,c("sc",s)),a.Mode==="VIRTUAL SAFETY CAR"&&(y=!0,c("vsc",s)),a.Flag==="CHEQUERED"){c("chequered",s),await S(6e4),P("chequered");return}if(a.Scope==="Track"){if(a.Flag==="RED"){c("red",s);return}m=!1,y=!1,h=!1,c("green",s),await S(2500),P("green");return}if(a.Category==="Flag")switch(a.Flag){case"YELLOW":c("yellow",s);break;case"DOUBLE YELLOW":c("dyellow",s);break;case"CLEAR":c("green",s),await S(2500),P("green");break;case"RED":h=!0,c("red",s),await S(9e4),P("red");break;case"BLUE":c("blue",s),await S(1e3),P("blue");break}}};async function Qe(){if(!R)return;const e=N.TrackStatus.Status;e==="1"&&(m||y||h||M)&&(o&&r("New track status : Green"),m=!1,M=!1,y=!1,h=!1,c("green",s),await S(2500),P("green")),e==="2"&&(o&&r("New track status : Yellow"),m=!1,M=!0,y=!1,h=!1),e==="4"&&(o&&r("New track status : SC"),m=!0,M=!1,y=!1,h=!1),e==="5"&&(o&&r("New track status : Red"),m=!1,M=!1,y=!1,h=!0),e==="6"&&(o&&r("New track status : VSC"),m=!1,M=!1,y=!0,h=!1)}async function We(){if(!R||G)return;N.WeatherData.Rainfall==="1"&&(J=1),J&&!Y&&c("rain",s)}async function ze(){try{return R&&(N=await q.LiveTimingAPIGraphQL(u,["RaceControlMessages","TrackStatus","WeatherData"])),N}catch(e){return console.error(e),console.log("Reloaded Window Due to Disconnect"),window.location.reload(),null}}setInterval(ze,100);setInterval(Ee,100);setInterval(We,100);setInterval(Qe,100);function Ue(){z?($("body").removeAttr("style"),z=!1):($("body").css("background-color","transparent"),z=!0)}document.addEventListener("keydown",e=>{e.key=="Escape"&&Ue()});