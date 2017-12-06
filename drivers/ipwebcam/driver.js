"use strict";

const Homey = require('homey');
const util = require('/lib/util.js');

class IpwebcamDriver extends Homey.Driver {

    onPair(socket) {
        socket.on('testConnection', function(data, callback) {
            util.createSnapshot(data.address, data.port, data.username, data.password)
                .then(image => {
                    callback(false, image.toString('base64'));
                })
                .catch(error => {
                    callback(error, null);
                })
        });
    }

}

module.exports = IpwebcamDriver;
