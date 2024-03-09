export interface FilesConfig {
    themes: Theme[];
    mapThemes: MapTheme[];
}

export interface MapTheme {
    id: number;
    name: string;
    seasons: Season[];
}

export interface Season {
    year: string;
    trackMaps: {[key: string]: string};
}

export interface DriverNumbers {
    year: string;
    DriverNumbers: {[key: string]: string};
}

export interface Theme {
    id: number;
    name: string;
    compatibleWith: CompatibleWith;
    sourcePath?: string;
    gifs: Gifs;
}

export interface CompatibleWith {
    Window: boolean;
    Pixoo64: boolean;
}

export interface Gifs {
    blackandwhite: string;
    blue: string;
    chequered: string;
    dyellow: string;
    green: string;
    mec: boolean | string;
    mv: string;
    rain: string;
    red: string;
    rs: string;
    sc: string;
    slippery: string;
    ss: string;
    void: string;
    vsc: string;
    white: string;
    yellow: string;
    driverNumber?: DriverNumbers[];
    DRSenabled: string;
    DRSdisabled: string;
    medicalcar: string;
    pitclosed: string;
    pitentry: string;
    recoveryvehicle: string;
    stopgopenalty10sec: string;
    timepenalty5sec: string;
    timepenalty10sec: string;
    pixoostartup: string;
    pixoostartupMV: string;
}
