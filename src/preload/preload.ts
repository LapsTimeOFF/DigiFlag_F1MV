/* eslint-disable @typescript-eslint/ban-ts-comment */
import {contextBridge,ipcRenderer} from 'electron';
import {LiveTimingAPIGraphQL} from 'npm_f1mv_api';
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
export const api = {
    LiveTimingAPIGraphQL: LiveTimingAPIGraphQL,
    getVersion:() => ipcRenderer.invoke('get-version'),
    electronAPI
}

if (process.contextIsolated) {
  try {
      contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {

    window.api = api
}