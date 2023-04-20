/* eslint-disable @typescript-eslint/ban-ts-comment */
import {contextBridge, ipcRenderer} from 'electron';
import {LiveTimingAPIGraphQL} from 'npm_f1mv_api';
import {electronAPI} from '@electron-toolkit/preload';

// Custom APIs for renderer
export const api = {
    LiveTimingAPIGraphQL: LiveTimingAPIGraphQL,
    getVersion: (): Promise<string> => ipcRenderer.invoke('get-version'),
    getAlwaysOnTop: () => ipcRenderer.invoke('get-always-on-top'),
    setAlwaysOnTop: () => ipcRenderer.invoke('set-always-on-top'),
    getPixooIP: (pixooIP: string) => ipcRenderer.invoke('get-pixooIP', pixooIP),
    electronAPI,
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
    window.api = api;
}
