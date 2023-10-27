import { PlatformConfig } from 'homebridge';

export interface BestoveWiNETPlatformConfig extends PlatformConfig {
    name: string;
    ip: string;
    polling: number;
}
