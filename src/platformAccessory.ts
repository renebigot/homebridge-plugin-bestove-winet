import { CharacteristicGetCallback, CharacteristicSetCallback, CharacteristicValue, PlatformAccessory, Service } from 'homebridge';

import { BestoveWiNETPlatform } from './platform';
import { BestoveWiNETPlatformConfig } from './types';
import fetch from 'node-fetch';

const postOptions = (ip, body) => {
  return {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Content-Length': body.length,
      'Cookie': 'winet_lang=fr',
      'Origin': `http://${ip}`,
      'Referer': `http://${ip}/management.html`,
      'X-Requested-With': 'XMLHttpRequest',
    },
  };
};

const valueForRegister = (id, registers) => {
  return ((registers||[]).find(el => el[1]===id)||[])[2]||0;
};

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class BestoveWiNETPlatformAccessory {
  private service: Service;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private states = {
    currentHeatingCoolingState: this.platform.Characteristic.CurrentHeatingCoolingState.HEAT as CharacteristicValue,
    targetHeatingCoolingState: this.platform.Characteristic.TargetHeatingCoolingState.HEAT as CharacteristicValue,
    currentTemperature: 10 as CharacteristicValue,
    targetTemperature: 10 as CharacteristicValue,
    temperatureDisplayUnits: this.platform.Characteristic.TemperatureDisplayUnits.CELSIUS as CharacteristicValue,
  };

  constructor(
    private readonly platform: BestoveWiNETPlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Bestove')
      .setCharacteristic(this.platform.Characteristic.Model, 'WiNET-IoT')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, '---');

    this.service = this.accessory.getService(this.platform.Service.Thermostat) ||
      this.accessory.addService(this.platform.Service.Thermostat);

    this.service.setCharacteristic(this.platform.Characteristic.Name, this.platform.config.name || 'Pellet stove');

    // create handlers for required characteristics
    this.service.getCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState)
      .on('get', this.handleCurrentHeatingCoolingStateGet.bind(this));
    
    this.service.getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
      .setProps({
        // Heat only !
        maxValue: this.platform.Characteristic.TargetHeatingCoolingState.HEAT,
      })
      .on('get', this.handleTargetHeatingCoolingStateGet.bind(this))
      .on('set', this.handleTargetHeatingCoolingStateSet.bind(this));
    
    this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .on('get', this.handleCurrentTemperatureGet.bind(this));
    
    this.service.getCharacteristic(this.platform.Characteristic.TargetTemperature)
      .on('get', this.handleTargetTemperatureGet.bind(this))
      .on('set', this.handleTargetTemperatureSet.bind(this));
    
    this.service.getCharacteristic(this.platform.Characteristic.TemperatureDisplayUnits)
      .on('get', this.handleTemperatureDisplayUnitsGet.bind(this))
      .on('set', this.handleTemperatureDisplayUnitsSet.bind(this));

    this._watchRegisters();
  }

  _currentHeatingCoolingState (state: number): CharacteristicValue {
    switch (state ) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        return this.platform.Characteristic.CurrentHeatingCoolingState.HEAT;
      default:
        return this.platform.Characteristic.CurrentHeatingCoolingState.OFF;
    }
  }

  _watchRegisters() {
    const ip = this.accessory.context.device.ip;

    if (!ip) {
      return;
    }
    
    const url = `http://${ip}/ajax/get-registers`;
    
    fetch(url, postOptions(ip, 'key=020&category=2'))
      .then(res => res.json())
      .catch(err => {
        this.platform.log.error('Watch register error:', err);
      })
      .then(res => {
        if (!res||!res.ram) {
          return;
        }

        const currentHeatingCoolingState = this._currentHeatingCoolingState(valueForRegister(33, res.ram));
        const currentTemperature = valueForRegister(1, res.ram) * 0.5 + 0;
        const targetTemperature = valueForRegister(125, res.eep);

        if (currentHeatingCoolingState !== this.states.currentHeatingCoolingState) {
          this.states.currentHeatingCoolingState = currentHeatingCoolingState;
          this.platform.log.info('Current heating cooling state:', currentHeatingCoolingState);
        }

        if (currentTemperature !== this.states.currentTemperature) {
          this.states.currentTemperature = currentTemperature;
          this.platform.log.info('Current temperature:', currentTemperature);
        }

        if (targetTemperature !== this.states.targetTemperature) {
          this.states.targetTemperature = targetTemperature;
          this.platform.log.info('Target temperature:', targetTemperature);
        }

      })
      .then(() => {
        const { polling } = this.platform.config as BestoveWiNETPlatformConfig;

        setTimeout(() => this._watchRegisters.bind(this)(), polling || 2000);
      });
  }

  /**
   * Handle requests to get the current value of the "Current Heating Cooling State" characteristic
   */
  handleCurrentHeatingCoolingStateGet(callback: CharacteristicGetCallback) {
    this.platform.log.debug('Triggered GET CurrentHeatingCoolingState');
    callback(null, this.states.currentHeatingCoolingState);
  }

  /**
   * Handle requests to Set the current value of the "Current Heating Cooling State" characteristic
   */
  handleCurrentHeatingCoolingStateSet(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.platform.log.debug('Triggered SET CurrentHeatingCoolingState');
    this.states.currentHeatingCoolingState = value;
    callback(null);
  }


  /**
   * Handle requests to get the current value of the "Target Heating Cooling State" characteristic
   */
  handleTargetHeatingCoolingStateGet(callback: CharacteristicGetCallback) {
    this.platform.log.debug('Triggered GET TargetHeatingCoolingState');
    callback(null, this.states.targetHeatingCoolingState);
  }

  /**
   * Handle requests to set the "Target Heating Cooling State" characteristic
   */
  handleTargetHeatingCoolingStateSet(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.platform.log.debug('Triggered SET TargetHeatingCoolingState: '+ value);
    this.states.targetHeatingCoolingState = value;

    // const url = `http://${this.platform.config.ip}/ajax/set-registers`;
    
    // fetch(url, postOptions(this.platform.config.ip, 'key=020&category=2'))
    //   .catch(err => {
    //     this.platform.log.error('Set register error:', err);
    //   });
    callback(null);
  }

  /**
   * Handle requests to get the current value of the "Current Temperature" characteristic
   */
  handleCurrentTemperatureGet(callback: CharacteristicGetCallback) {  
    this.platform.log.debug('Triggered GET CurrentTemperature');
    callback(null, this.states.currentTemperature);
  }

  /**
   * Handle requests to get the current value of the "Target Temperature" characteristic
   */
  handleTargetTemperatureGet(callback: CharacteristicGetCallback) {
    this.platform.log.debug('Triggered GET TargetTemperature');
    callback(null, this.states.targetTemperature);
  }

  /**
   * Handle requests to set the "Target Temperature" characteristic
   */
  handleTargetTemperatureSet(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.states.targetTemperature = `${Math.floor(Number(value))}`;
    this.platform.log.debug('Triggered SET TargetTemperature:', value, '->', this.states.targetTemperature);
    
    const url = `http://${this.accessory.context.device.ip}/ajax/set-register`;

    fetch(url, postOptions(this.accessory.context.device.ip, `key=002&memory=1&regId=125&value=${this.states.targetTemperature}`))
      .then(res => res.json())
      .then(res => {
        this.platform.log.warn(JSON.stringify(res));
        callback(null);
      })
      .catch(err => {
        this.platform.log.error('Set register error:', err);
        callback(err);
      });
  }

  /**
   * Handle requests to get the current value of the "Temperature Display Units" characteristic
   */
  handleTemperatureDisplayUnitsGet(callback: CharacteristicGetCallback) {
    this.platform.log.debug('Triggered GET TemperatureDisplayUnits');
    callback(null, this.states.temperatureDisplayUnits);
  }

  /**
   * Handle requests to set the "Temperature Display Units" characteristic
   */
  handleTemperatureDisplayUnitsSet(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.platform.log.info('Triggered SET TemperatureDisplayUnits:', value);
    this.states.temperatureDisplayUnits = value;
    callback(null);
  }
}
