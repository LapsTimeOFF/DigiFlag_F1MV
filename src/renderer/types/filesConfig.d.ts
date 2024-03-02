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

export interface Theme {
    id: number;
    name: string;
    compatibleWith: CompatibleWith;
    sourcePath?: string;
    gifs: Gifs;
    picture?: string;
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
    '1': string;
    '2': string;
    '3': string;
    '4': string;
    '10': string;
    '11': string;
    '14': string;
    '16': string;
    '18': string;
    '20': string;
    '21': string;
    '22': string;
    '23': string;
    '24': string;
    '27': string;
    '31': string;
    '33': string;
    '34': string;
    '40': string;
    '44': string;
    '55': string;
    '63': string;
    '77': string;
    '81': string;
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
