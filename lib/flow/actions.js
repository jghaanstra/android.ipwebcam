const Homey = require('homey');
const util = require('/lib/util.js');

exports.init = function () {

    new Homey.FlowCardAction('emailsnapshot')
        .register()
        .registerRunListener((args) => {
            const emailSnapshot = async () => {
                const image = await util.createSnapshot(args.device.getSetting('address'), args.device.getSetting('port'), args.device.getSetting('username'), args.device.getSetting('password'))
                if (image) {
                    return Promise.resolve(util.sendSnapshot(image, args));
                } else {
                    throw new Error('Snapshot not created succesfully');
                }
            }
            emailSnapshot();
        });

    new Homey.FlowCardAction('sensor_threshold')
        .register()
        .registerRunListener((args) => {
            if(args.sensor_type == 'motion') {
                var path = "settings/motion_limit?set=" + args.threshold;
            } else if (args.sensor_type == 'sound') {
                var path = "settings/adet_limit?set=" + args.threshold;
            }
            return Promise.resolve(util.singleCommand(args.device.getSetting('address'), args.device.getSetting('port'), args.device.getSetting('username'), args.device.getSetting('password'), args, path));
        });

    new Homey.FlowCardAction('nightvision')
        .register()
        .registerRunListener((args) => {
            return Promise.resolve(util.nightvision(args.device.getSetting('address'), args.device.getSetting('port'), args.device.getSetting('username'), args.device.getSetting('password'), args));
        });

    new Homey.FlowCardAction('zoom')
        .register()
        .registerRunListener((args) => {
            var path = "ptz?zoom=" + args.zoom;
            return Promise.resolve(util.singleCommand(args.device.getSetting('address'), args.device.getSetting('port'), args.device.getSetting('username'), args.device.getSetting('password'), args, path));
        });

    new Homey.FlowCardAction('quality')
        .register()
        .registerRunListener((args) => {
            var path = "settings/quality?set=" + args.quality;
            return Promise.resolve(util.singleCommand(args.device.getSetting('address'), args.device.getSetting('port'), args.device.getSetting('username'), args.device.getSetting('password'), args, path));
        });

    new Homey.FlowCardAction('led')
        .register()
        .registerRunListener((args) => {
            if(args.led == 'on') {
                var path = "enabletorch";
            } else if (args.led == 'off') {
                var path = "disabletorch";
            }
            return Promise.resolve(util.singleCommand(args.device.getSetting('address'), args.device.getSetting('port'), args.device.getSetting('username'), args.device.getSetting('password'), args, path));
        });

    new Homey.FlowCardAction('whichcamera')
        .register()
        .registerRunListener((args) => {
            if(args.whichcamera == 'on') {
                var path = "settings/ffc?set=on";
            } else if (args.whichcamera == 'off') {
                var path = "settings/ffc?set=off";
            }
            return Promise.resolve(util.singleCommand(args.device.getSetting('address'), args.device.getSetting('port'), args.device.getSetting('username'), args.device.getSetting('password'), args, path));
        });

}
