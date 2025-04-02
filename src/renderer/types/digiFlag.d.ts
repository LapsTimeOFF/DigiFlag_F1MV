import { F1LiveTimingState } from './multiViewerAPI';
export interface PixooData {
  ReturnCode?: number;
  ReturnMessage?: string;
  DeviceList: PixooDeviceList[];
}

export interface PixooDeviceList {
  DeviceName: string;
  DeviceId: number;
  DevicePrivateIP: string;
  DeviceMac: string;
}

export type LTData = Pick<
  F1LiveTimingState,
  'RaceControlMessages' | 'LapCount' | 'SessionStatus' | 'SessionInfo' | 'TrackStatus' | 'WeatherData'
>;
