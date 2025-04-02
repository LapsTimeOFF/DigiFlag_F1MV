/* eslint-disable @typescript-eslint/ban-ts-comment */
import { contextBridge, ipcRenderer } from 'electron';
import { type Config, LiveTimingAPIGraphQL, type Topic } from 'npm_f1mv_api';
import type { F1LiveTimingState } from '../renderer/types/multiViewerAPI.d.ts';
export interface API {
  LiveTimingAPIGraphQL: (config: Config, topic: Topic | Topic[]) => Promise<F1LiveTimingState>;
  getVersion: () => Promise<string>;
  getAlwaysOnTop: () => Promise<boolean>;
  setAlwaysOnTop: () => Promise<boolean>;
  getPixooIP: (pixooIP: string[]) => Promise<string[]>;
  getExpressIP: () => Promise<string>;
  openNewWindow: () => Promise<void>;
}

// Custom APIs for renderer
const api = {
  LiveTimingAPIGraphQL: LiveTimingAPIGraphQL,
  openNewWindow: (): Promise<void> => ipcRenderer.invoke('new-window'),
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
