"use strict";

const Homey = require('homey');
const flowActions = require("/lib/flow/actions.js");

class IpwebcamApp extends Homey.App {

    onInit() {
        this.log('Initializing Android IP Webcam app ...');
        flowActions.init();
    }
}

module.exports = IpwebcamApp;
