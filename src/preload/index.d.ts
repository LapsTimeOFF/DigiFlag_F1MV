import {api} from './preload';
export {};
declare global {
    interface Window {
        api: typeof api;
    }
}
