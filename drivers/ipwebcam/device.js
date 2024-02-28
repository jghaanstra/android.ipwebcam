'use strict';

const Homey = require('homey');
const Util = require('../../lib/util.js');

class IpwebcamDevice extends Homey.Device {

  async onInit() {
    if (!this.util) this.util = new Util({homey: this.homey});

    if (!this.getAvailable()) { await this.setAvailable(); }
    this.pollDevice();

    // LIVE SNAPSHOT TOKEN
    this.ipwebcamSnapshot = await this.homey.images.createImage();
    this.ipwebcamSnapshot.setStream(async (stream) => {
      const res = await this.util.getStreamSnapshot('http://'+ this.getSetting('address') +':'+ this.getSetting('port') +'/shot.jpg', this.getSetting('username'), this.getSetting('password'));
      if(!res.ok) throw new Error('Invalid Response');
      return res.body.pipe(stream);
    });
    await this.setCameraImage('ipwebcam', this.homey.__("device.live_snapshot"), this.ipwebcamSnapshot);
  }

  async onDeleted() {
    try {
      this.homey.clearInterval(this.pollingInterval);
    } catch (error) {
      this.error(error);
    }
  }

  async onUninit() {
    try {
      this.homey.clearInterval(this.pollingInterval);
    } catch (error) {
      this.error(error);
    }
  }

  // HELPER FUNCTIONS
  pollDevice() {
    this.homey.clearInterval(this.pollingInterval);
    this.homey.clearInterval(this.pingInterval);

    this.pollingInterval = this.homey.setInterval(async () => {
      try {
        let result = await this.util.getIpwebcam(this.getSetting('address'), this.getSetting('port'), this.getSetting('username'), this.getSetting('password'));

        if (this.getCapabilityValue('measure_battery') != result.battery) {
          this.setCapabilityValue('measure_battery', result.battery);
        }
        if (this.getCapabilityValue('alarm_motion') != result.motionalarm) {
          this.setCapabilityValue('alarm_motion', result.motionalarm);
        }
        if (this.getCapabilityValue('alarm_generic') != result.soundalarm) {
          this.setCapabilityValue('alarm_generic', result.soundalarm);
        }
        if (this.getCapabilityValue('measure_luminance') != result.lux) {
          this.setCapabilityValue('measure_luminance', result.lux);
        }
      } catch (error) {
        switch (error) {
          case 'err_sensor_motion':
          case 'err_sensor_sound':
          case 'err_sensor_light':
          case 'err_sensor_battery':
            this.setUnavailable(this.homey.__(error));
            break;
          default:
            this.setUnavailable(this.homey.__('device.unreachable'));
            break;
        }
        this.pingDevice();
      }
    }, 1000 * this.getSetting('polling'));
  }

  pingDevice() {
    this.homey.clearInterval(this.pollingInterval);
    this.homey.clearInterval(this.pingInterval);

    this.pingInterval = this.homey.setInterval(async () => {
      try {
        let result = await this.util.getIpwebcam(this.getSetting('address'), this.getSetting('port'), this.getSetting('username'), this.getSetting('password'));
        if (!this.getAvailable()) { await this.setAvailable(); }
        this.pollDevice();
      } catch (error) {
        this.log('Device is not reachable, pinging every 63 seconds to see if it comes online again.');
      }
    }, 63000);
  }

}

module.exports = IpwebcamDevice;