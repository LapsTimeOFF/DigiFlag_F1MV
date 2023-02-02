import Store from 'electron-store';
import {screen} from 'electron';
/* Creating a new instance of the Store class. */

const storage = new Store();

/**
 * It gets the size of the screen, multiplies it by 0.8, and returns the value. If the value is not
 * defined, it sets the value to the default value and returns the default value.
 * @returns the width and height of the screen.
 */
export function getWindowSizeSettings() {
    /* Getting the primary Display Screen. */
    const display = screen.getPrimaryDisplay();
    /* Getting the dimensions of the screen. */
    const dimensions = display.workAreaSize;
    /* Getting the width of the screen and multiplying it by 0.8. */
    const width = dimensions.width * 0.8;
    /* Getting the height of the screen and multiplying it by 0.8. */
    const height = dimensions.height * 0.8;
    /* Creating an array with the width and height of the screen. */
    const defaultWindowSize = [width, height];
    /* Getting the value of the key "lastWindowSize" from the storage object. */
    const windowSize = storage.get('lastWindowSize');

    /* Checking if the windowSize is defined, if it is, it returns the windowSize, if it is not, it sets the size to the defaultWindowSize and returns the defaultWindowSize. */
    if (windowSize) return windowSize;
    else {
        storage.set('lastWindowSize', defaultWindowSize);
        return defaultWindowSize
    }
}
/**
 * If the window position is stored in the config.json, return it, otherwise return the default
 * window position.
 * @returns An array of two numbers.
 */
export function getWindowPositionSettings() {
    /* Getting the width of the screen and multiplying it by 0.8. */
    const defaultWindowPositon = []
    const windowPos = storage.get('lastWindowPosition');
    if (windowPos) return windowPos;
    else {
        storage.set('lastWindowPosition', defaultWindowPositon);
        return defaultWindowPositon;
    }
}
/**
 * This function saves the window size to the config.json.
 * @param {number[]} windowSize - The window size to save.
 */
export function saveWindowSize(windowSize: number[]): void {
    storage.set('lastWindowSize', windowSize);
    console.log('Window Size Saved: ', windowSize);
}
/**
 * This function saves the window position to the config.json
 * @param {number[]} windowPos - number[]
 */
export function saveWindowPos(windowPos: number[]): void {
    storage.set('lastWindowPosition', windowPos);
    console.log('Window Position Saved: ', windowPos);
}