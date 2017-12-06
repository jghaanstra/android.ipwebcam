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

}
