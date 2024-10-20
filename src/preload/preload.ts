/* eslint-disable @typescript-eslint/ban-ts-comment */
import {contextBridge} from 'electron';
import {ipcRenderer} from 'electron';
import {LiveTimingAPIGraphQL} from 'npm_f1mv_api';
export interface API {
    LiveTimingAPIGraphQL: typeof LiveTimingAPIGraphQL;
    getVersion: () => Promise<string>;
    getAlwaysOnTop: () => Promise<boolean>;
    setAlwaysOnTop: () => Promise<boolean>;
    getPixooIP: (pixooIP: string[]) => Promise<string[]>;
    getExpressIP: () => Promise<string>;
}

// Custom APIs for renderer
const api = {
    LiveTimingAPIGraphQL: LiveTimingAPIGraphQL,
    getVersion: (): Promise<string> => ipcRenderer.invoke('get-version'),
    getAlwaysOnTop: () => ipcRenderer.invoke('get-always-on-top'),
    setAlwaysOnTop: () => ipcRenderer.invoke('set-always-on-top'),
    getPixooIP: (pixooIP: string) => ipcRenderer.invoke('get-pixooIP', pixooIP),
    getExpressIP: (): Promise<string> => ipcRenderer.invoke('get-expressIP'),
};

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('api', api);
    } catch (error) {
        console.error(error);
    }
} else {
    // @ts-ignore (define in dts)
    globalThis.api = api;
}
