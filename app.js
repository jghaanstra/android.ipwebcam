'use strict';

const Homey = require('homey');
const Util = require('./lib/util.js');

class IpwebcamApp extends Homey.App {

  onInit() {
    this.log('Initializing Android IP Webcam app ...');

    if (!this.util) this.util = new Util({homey: this.homey });

    this.homey.flow.getActionCard('emailsnapshot')
      .registerRunListener(async (args) => {
        try {
          const image = await this.util.getBufferSnapshot('http://'+ args.device.getSetting('address') +':'+ args.device.getSetting('port') +'/shot.jpg', args.device.getSetting('username'), args.device.getSetting('password'), 'buffer');
          return await this.util.sendSnapshot(image, args);
        } catch (error) {
          return Promise.reject(error);
        }
      });

    this.homey.flow.getActionCard('sensor_threshold')
      .registerRunListener(async (args) => {
        if(args.sensor_type == 'motion') {
          var path = "settings/motion_limit?set=" + args.threshold;
        } else if (args.sensor_type == 'sound') {
          var path = "settings/adet_limit?set=" + args.threshold;
        }
        return await this.util.singleCommand(args.device.getSetting('address'), args.device.getSetting('port'), args.device.getSetting('username'), args.device.getSetting('password'), args, path);
      });

    this.homey.flow.getActionCard('nightvision')
      .registerRunListener(async (args) => {
        return await this.util.nightvision(args.device.getSetting('address'), args.device.getSetting('port'), args.device.getSetting('username'), args.device.getSetting('password'), args);
      });

    this.homey.flow.getActionCard('zoom')
      .registerRunListener(async (args) => {
        var path = "ptz?zoom=" + args.zoom;
        return await this.util.singleCommand(args.device.getSetting('address'), args.device.getSetting('port'), args.device.getSetting('username'), args.device.getSetting('password'), args, path);
      });

    this.homey.flow.getActionCard('quality')
      .registerRunListener(async (args) => {
        var path = "settings/quality?set=" + args.quality;
        return await this.util.singleCommand(args.device.getSetting('address'), args.device.getSetting('port'), args.device.getSetting('username'), args.device.getSetting('password'), args, path);
      });

    this.homey.flow.getActionCard('led')
      .registerRunListener(async (args) => {
        if(args.led == 'on') {
          var path = "enabletorch";
        } else if (args.led == 'off') {
          var path = "disabletorch";
        }
        return await this.util.singleCommand(args.device.getSetting('address'), args.device.getSetting('port'), args.device.getSetting('username'), args.device.getSetting('password'), args, path);
      });

    this.homey.flow.getActionCard('whichcamera')
      .registerRunListener(async (args) => {
        if(args.whichcamera == 'on') {
          var path = "settings/ffc?set=on";
        } else if (args.whichcamera == 'off') {
          var path = "settings/ffc?set=off";
        }
        return await this.util.singleCommand(args.device.getSetting('address'), args.device.getSetting('port'), args.device.getSetting('username'), args.device.getSetting('password'), args, path);
      });
  }

}

module.exports = IpwebcamApp;
