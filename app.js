"use strict";

const Homey = require('homey');
const util = require('/lib/util.js');

class IpwebcamApp extends Homey.App {

  onInit() {
    this.log('Initializing Android IP Webcam app ...');

    new Homey.FlowCardAction('emailsnapshot')
      .register()
      .registerRunListener(async (args) => {
        const image = await util.getBufferSnapshot('http://'+ args.device.getSetting('address') +':'+ args.device.getSetting('port') +'/shot.jpg', args.device.getSetting('username'), args.device.getSetting('password'))
        if (image) {
          return util.sendSnapshot(image, args);
        } else {
          throw new Error('Snapshot not created succesfully');
        }
      });

    new Homey.FlowCardAction('sensor_threshold')
      .register()
      .registerRunListener((args) => {
        if(args.sensor_type == 'motion') {
          var path = "settings/motion_limit?set=" + args.threshold;
        } else if (args.sensor_type == 'sound') {
          var path = "settings/adet_limit?set=" + args.threshold;
        }
        return util.singleCommand(args.device.getSetting('address'), args.device.getSetting('port'), args.device.getSetting('username'), args.device.getSetting('password'), args, path);
      });

    new Homey.FlowCardAction('nightvision')
      .register()
      .registerRunListener((args) => {
        return util.nightvision(args.device.getSetting('address'), args.device.getSetting('port'), args.device.getSetting('username'), args.device.getSetting('password'), args);
      });

    new Homey.FlowCardAction('zoom')
      .register()
      .registerRunListener((args) => {
        var path = "ptz?zoom=" + args.zoom;
        return util.singleCommand(args.device.getSetting('address'), args.device.getSetting('port'), args.device.getSetting('username'), args.device.getSetting('password'), args, path);
      });

    new Homey.FlowCardAction('quality')
      .register()
      .registerRunListener((args) => {
        var path = "settings/quality?set=" + args.quality;
        return util.singleCommand(args.device.getSetting('address'), args.device.getSetting('port'), args.device.getSetting('username'), args.device.getSetting('password'), args, path);
      });

    new Homey.FlowCardAction('led')
      .register()
      .registerRunListener((args) => {
        if(args.led == 'on') {
          var path = "enabletorch";
        } else if (args.led == 'off') {
          var path = "disabletorch";
        }
        return util.singleCommand(args.device.getSetting('address'), args.device.getSetting('port'), args.device.getSetting('username'), args.device.getSetting('password'), args, path);
      });

    new Homey.FlowCardAction('whichcamera')
      .register()
      .registerRunListener((args) => {
        if(args.whichcamera == 'on') {
          var path = "settings/ffc?set=on";
        } else if (args.whichcamera == 'off') {
          var path = "settings/ffc?set=off";
        }
        return util.singleCommand(args.device.getSetting('address'), args.device.getSetting('port'), args.device.getSetting('username'), args.device.getSetting('password'), args, path);
      });
  }
}

module.exports = IpwebcamApp;
