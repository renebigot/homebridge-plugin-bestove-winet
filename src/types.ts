import { PlatformConfig } from 'homebridge';

export interface BestoveWiNETPlatformConfig extends PlatformConfig {
    devices: string[];
    polling: number;
}
