export interface LiveTimingData {
    data: F1Data;
}

export interface F1Data {
    f1LiveTimingState: F1LiveTimingState;
    f1LiveTimingClock: F1LiveTimingClock;
}

export interface F1LiveTimingState {
    RaceControlMessages: RaceControlMessages;
    TrackStatus: TrackStatus;
    WeatherData: WeatherData;
    SessionInfo: SessionInfo;
    SessionData: SessionData;
    LapCount: LapCount;
    DriverList: {[key: string]: DriverList};
    TimingData: TimingData;
    TimingAppData: TimingData;
    ExtrapolatedClock: ExtrapolatedClock;
}

export interface F1LiveTimingClock {
    paused: boolean;
    systemTime: number;
    trackTime: number;
}

export interface RaceControlMessages {
    Messages: Message[];
}

export interface Message {
    Utc: string;
    Lap: number;
    Category: Category;
    Message: string;
    SubCategory?: string;
    Flag?: string;
    Scope?: string;
    Sector?: number;
    RacingNumber?: string;
}

export type Category = 'Other' | 'Flag' | 'CarEvent';

export interface SessionInfo {
    Meeting: Meeting;
    ArchiveStatus: ArchiveStatus;
    Key: number;
    Type: string;
    Number: number;
    Name: string;
    StartDate: string;
    EndDate: string;
    GmtOffset: string;
    Path: string;
}

export interface SessionData {
    Series: Series[];
    StatusSeries: StatusSery[];
}

export interface Series {
    QualifyingPart: number;
    Utc: Date;
}

export interface StatusSery {
    SessionStatus?: string;
    TrackStatus?: string;
    Utc: Date;
}

export interface ArchiveStatus {
    Status: string;
}

export interface Meeting {
    Key: number;
    Name: string;
    OfficialName: string;
    Location: string;
    Country: Country;
    Circuit: Circuit;
}

export interface Circuit {
    Key: number;
    ShortName: string;
}

export interface Country {
    Key: number;
    Code: string;
    Name: string;
}

export interface TrackStatus {
    Status: string;
    Message: string;
}

export interface WeatherData {
    AirTemp: string;
    Humidity: string;
    Pressure: string;
    Rainfall: string;
    TrackTemp: string;
    WindDirection: string;
    WindSpeed: string;
}

export interface LapCount {
    CurrentLap: number;
    TotalLaps: number;
}

export interface ExtrapolatedClock {
    Extrapolating: boolean;
    Remaining: string;
    Utc: Date;
}

export interface DriverList {
    BroadcastName?: string;
    CountryCode?: string;
    FirstName?: string;
    FullName?: string;
    HeadshotUrl?: string;
    LastName?: string;
    Line?: number;
    NameFormat?: string;
    RacingNumber: string;
    Reference: string;
    TeamColour?: string;
    TeamName: string;
    Tla: string;
}

export interface TimingData {
    CutOffPercentage: string;
    CutOffTime: string;
    Lines: {[key: string]: Line};
    NoEntries: number[];
    SessionPart: number;
    Withheld: boolean;
}

export interface TimingAppData {
    Lines: {[key: string]: Line};
}
export interface Stint {
    Compound: Compound;
    LapFlags: number;
    LapNumber: number;
    LapTime: string;
    New: string;
    StartLaps: number;
    TotalLaps: number;
    TyresNotChanged: string;
}

export enum Compound {
    Hard = 'HARD',
    Intermediate = 'INTERMEDIATE',
    Medium = 'MEDIUM',
    Soft = 'SOFT',
    Wet = 'WET',
}

export interface Line {
    BestLapTime: BestLapTime;
    GapToLeader?: string;
    InPit: boolean;
    KnockedOut: boolean;
    IntervalToPositionAhead?: IntervalToPositionAhead;
    LastLapTime: LastLapTime;
    Line: number;
    PitOut: boolean;
    Position: string;
    RacingNumber: string;
    Retired: boolean;
    Sectors: Sector[];
    ShowPosition: boolean;
    Speeds: Speeds;
    Stats: Stat[];
    Status: number;
    Stints: Stint[];
    Stopped: boolean;
    TimeDiffToFastest: string;
    TimeDiffToPositionAhead: string;
}

export interface BestLapTime {
    Value?: string;
    Lap?: number;
}

export interface IntervalToPositionAhead {
    Catching: boolean;
    Value: string;
}

export interface LastLapTime {
    OverallFastest: boolean;
    PersonalFastest: boolean;
    Status: number;
    Value: string;
}

export interface Sector {
    OverallFastest: boolean;
    PersonalFastest: boolean;
    Segments: Segment[];
    Status: number;
    Stopped: boolean;
    Value: string;
}

export interface Segment {
    Status: number;
}

export interface Speeds {
    FL: LastLapTime;
    I1: LastLapTime;
    I2: LastLapTime;
    ST: LastLapTime;
}

export interface Stat {
    TimeDiffToFastest: string;
    TimeDifftoPositionAhead: string;
}
