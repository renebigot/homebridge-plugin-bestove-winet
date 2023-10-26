import { PlatformConfig } from 'homebridge';

export interface BestoveWiNETDevice {
    ip: string;
    name: string;
}

export interface BestoveWiNETPlatformConfig extends PlatformConfig {
    devices: BestoveWiNETDevice[];
    polling: number;
}
  