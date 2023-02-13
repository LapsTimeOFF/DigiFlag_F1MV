import {contextBridge} from 'electron';
import {discoverF1MVInstances, getAPIVersion, getF1MVVersion, invalidTopic, LiveTimingAPIGraphQL} from 'npm_f1mv_api'

// Custom APIs for renderer
export const api = {
    discoverF1MVInstances: discoverF1MVInstances,
    getAPIVersion: getAPIVersion,
    getF1MVVersion: getF1MVVersion,
    invalidTopic: invalidTopic,
    LiveTimingAPIGraphQL: LiveTimingAPIGraphQL
};
contextBridge.exposeInMainWorld('api', api);