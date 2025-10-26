import { screen } from 'electron';
import Store from 'electron-store';
/* Creating a new instance of the Store class. */

const storage = new Store();

/**
 * It gets the size of the screen, multiplies it by 0.8, and returns the value. If the value is not
 * defined, it sets the value to the default value and returns the default value.
 * @returns the width and height of the screen.
 */
export function getWindowSizeSettings() {
  /* Getting the Primary Display. */
  const primaryDisplay = screen.getPrimaryDisplay();
  /* Getting the work area of the screen. */
  const workArea = primaryDisplay.workAreaSize;
  // Calculate the width as 75% of the available work area width and round down.
  const width = Math.floor(workArea.width * 0.8);
  console.log(`Window Width: ${width}`);
  // Calculate the height as 80% of the available work area height and round down.
  const height = Math.floor(workArea.height * 0.8);
  console.log(`Window Height: ${height}`);
  /* Creating an array with the width and height of the screen. */
  const defaultWindowSize: number[] = [width, height];
  /* Getting the value of the key "lastWindowSize" from the storage object. */
  const windowSize = storage.get('lastWindowSize') as number[];
  /* Checking if the windowSize is defined, if it is, it returns the windowSize, if it is not, it sets the size to the defaultWindowSize and returns the defaultWindowSize. */
  if (windowSize) return windowSize;
  else {
    storage.set('lastWindowSize', defaultWindowSize);
    return defaultWindowSize;
  }
}
/**
 * If the window position is stored in the config.json, return it, otherwise return the default
 * window position.
 * @returns An array of two numbers.
 */
export function getWindowPositionSettings() {
  const defaultWindowPositon: number[] = [];
  const windowPos = storage.get('lastWindowPosition') as number[];
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
  console.log('Window Size Saved:', windowSize);
}
/**
 * This function saves the window position to the config.json
 * @param {number[]} windowPos - number[]
 */
export function saveWindowPos(windowPos: number[]): void {
  storage.set('lastWindowPosition', windowPos);
  console.log('Window Position Saved:', windowPos);
}

export function getAlwaysOnTopState() {
  const defaultAlwaysOnTopState = false;
  const alwaysOnTopState = storage.get('alwaysOnTop') as boolean;
  if (alwaysOnTopState) return alwaysOnTopState;
  else {
    storage.set('alwaysOnTop', defaultAlwaysOnTopState);
    return defaultAlwaysOnTopState;
  }
}

export function saveAlwaysOnTopState(alwaysOnTop: boolean): void {
  storage.set('alwaysOnTop', alwaysOnTop);
  console.log(`Always on Top State (${alwaysOnTop}) Saved:`, alwaysOnTop);
}
