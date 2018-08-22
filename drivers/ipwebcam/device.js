'use strict';

const Homey = require('homey');
const util = require('/lib/util.js');

class IpwebcamDevice extends Homey.Device {

  onInit() {

    var interval = this.getSetting('polling') || 5;
    this.pollDevice(interval);

    // LIVE SNAPSHOT TOKEN
    let ipwebcamSnapshot = new Homey.Image('jpg');
    ipwebcamSnapshot.setBuffer((args, callback) => {
      const createSnapshot = async () => {
        const image = await util.createSnapshot(this.getSetting('address'), this.getSetting('port'), this.getSetting('username'), this.getSetting('password'))
        if (image) {
          callback(null, image);
        } else {
          callback(false, null);
        }
      }
      createSnapshot();
    });

    ipwebcamSnapshot.register()
      .then(() => {
        let ipwebcamSnapshotToken = new Homey.FlowToken('ipwebcam_snapshot', {
          type: 'image',
          title: Homey.__('Live Snapshot')
        })

        ipwebcamSnapshotToken
          .register()
          .then(() => {
            ipwebcamSnapshotToken.setValue(ipwebcamSnapshot);
          })
          .catch(this.error.bind(this, 'ipwebcamSnapshotToken.register'));

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
          this.setUnavailable(Homey.__('Unreachable'));
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
