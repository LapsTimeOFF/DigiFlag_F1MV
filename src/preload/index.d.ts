/* eslint-disable no-var */
import {API} from './preload.ts';
import {ElectronAPI} from '@electron-toolkit/preload';
declare global {
    //Make sure you use var instead of let or const, as it attaches to the global object.
    var api: API;
    var electron: ElectronAPI;
    interface JQuery {
        localize(): void;
    }
}
