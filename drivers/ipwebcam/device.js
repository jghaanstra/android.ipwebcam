'use strict';

const Homey = require('homey');
const util = require('/lib/util.js');

class IpwebcamDevice extends Homey.Device {

  onInit() {

    var interval = this.getSetting('polling') || 5;
    this.pollDevice(interval);

    // LIVE SNAPSHOT TOKEN
    this.ipwebcamSnapshot = new Homey.Image();
    this.ipwebcamSnapshot.setStream(async (stream) => {
      const res = await util.getStreamSnapshot('http://'+ this.getSetting('address') +':'+ this.getSetting('port') +'/shot.jpg', this.getSetting('username'), this.getSetting('password'));
      if(!res.ok)
        throw new Error('Invalid Response');

      return res.body.pipe(stream);
    });

    this.ipwebcamSnapshot.register()
      .then(() => {
        return this.setCameraImage('ipwebcam', Homey.__('Live Snapshot'), this.ipwebcamSnapshot);
      })
      .catch(this.error.bind(this, 'ipwebcamSnapshot.register'));
  }

  onDeleted() {
    clearInterval(this.pollingInterval);
  }

  // HELPER FUNCTIONS
  pollDevice(interval) {
    clearInterval(this.pollingInterval);
    clearInterval(this.pingInterval);

    this.pollingInterval = setInterval(() => {
      util.getIpwebcam(this.getSetting('address'), this.getSetting('port'), this.getSetting('username'), this.getSetting('password'))
        .then(result => {
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
        })
        .catch(error => {
    		  switch (error) {
		        case 'err_sensor_motion':
			      case 'err_sensor_sound':
			      case 'err_sensor_light':
			      case 'err_sensor_battery':
              this.setUnavailable(Homey.__(error));
			        break;
		        default:
              this.setUnavailable(Homey.__('Unreachable'));
			        break;
		      }
          this.pingDevice();
        })
    }, 1000 * interval);
  }

  pingDevice() {
    clearInterval(this.pollingInterval);
    clearInterval(this.pingInterval);

    this.pingInterval = setInterval(() => {
      util.getIpwebcam(this.getSetting('address'), this.getSetting('port'), this.getSetting('username'), this.getSetting('password'))
        .then(result => {
          this.setAvailable();
          var interval = this.getSetting('polling') || 5;
          this.pollDevice(interval);
        })
        .catch(error => {
          this.log('Device is not reachable, pinging every 63 seconds to see if it comes online again.');
        })
    }, 63000);
  }

}

module.exports = IpwebcamDevice;
