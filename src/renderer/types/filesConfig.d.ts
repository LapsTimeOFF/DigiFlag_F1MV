export interface FilesConfig {
    themes: Theme[];
    mapThemes: MapTheme[];
}

export interface MapTheme {
    id: number;
    name: string;
    season: number;
    trackMaps: TrackMaps;
}

export interface TrackMaps {
    '2022 Bahrain Grand Prix': string;
    '2022 Saudi Arabian Grand Prix': string;
    '2022 Australian Grand Prix': string;
    '2022 Emilia Romagna Grand Prix': string;
    '2022 Miami Grand Prix': string;
    '2022 Spanish Grand Prix': string;
    '2022 Monaco Grand Prix': string;
    '2022 Azerbaijan Grand Prix': string;
    '2022 Canadian Grand Prix': string;
    '2022 British Grand Prix': string;
    '2022 Austrian Grand Prix': string;
    '2022 French Grand Prix': string;
    '2022 Hungarian Grand Prix': string;
    '2022 Belgian Grand Prix': string;
    '2022 Dutch Grand Prix': string;
    '2022 Italian Grand Prix': string;
    '2022 Singapore Grand Prix': string;
    '2022 Japanese Grand Prix': string;
    '2022 United States Grand Prix': string;
    '2022 Mexico City Grand Prix': string;
    '2022 São Paulo Grand Prix': string;
    '2022 Abu Dhabi Grand Prix': string;
    '2023 Pre-Season Testing': string;
    '2023 Bahrain Grand Prix': string;
    '2023 Saudi Arabian Grand Prix': string;
    '2023 Australian Grand Prix': string;
    '2023 Emilia Romagna Grand Prix': string;
    '2023 Miami Grand Prix': string;
    '2023 Spanish Grand Prix': string;
    '2023 Monaco Grand Prix': string;
    '2023 Azerbaijan Grand Prix': string;
    '2023 Canadian Grand Prix': string;
    '2023 British Grand Prix': string;
    '2023 Austrian Grand Prix': string;
    '2023 French Grand Prix': string;
    '2023 Hungarian Grand Prix': string;
    '2023 Belgian Grand Prix': string;
    '2023 Dutch Grand Prix': string;
    '2023 Italian Grand Prix': string;
    '2023 Singapore Grand Prix': string;
    '2023 Japanese Grand Prix': string;
    '2023 United States Grand Prix': string;
    '2023 Mexico City Grand Prix': string;
    '2023 São Paulo Grand Prix': string;
    '2023 Las Vegas Grand Prix': string;
    '2023 Abu Dhabi Grand Prix': string;
}

export interface Theme {
    id: number;
    name: string;
    compatibleWith: CompatibleWith;
    sourcePath: string;
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
    '1': string;
    '2': string;
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
}
