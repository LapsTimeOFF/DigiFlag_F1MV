/* eslint-disable @typescript-eslint/ban-ts-comment */
import {contextBridge} from 'electron';
import {LiveTimingAPIGraphQL} from 'npm_f1mv_api';
import {version} from '../../package.json';

// Custom APIs for renderer
export const api = {
    LiveTimingAPIGraphQL: LiveTimingAPIGraphQL,
    getVersion:version
};

if (process.contextIsolated) {
  try {
      contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
    // @ts-ignore (define in dts)
    window.api = api
}