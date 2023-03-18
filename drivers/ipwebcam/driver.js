'use strict';

const Homey = require('homey');
const Util = require('../../lib/util.js');

class IpwebcamDriver extends Homey.Driver {

  onInit() {
    if (!this.util) this.util = new Util({homey: this.homey});
  }

  onPair(session) {
    session.setHandler('testConnection', async (data) => {
      return await this.util.getBufferSnapshot('http://'+ data.address +':'+ data.port +'/shot.jpg', data.username, data.password, 'base64');
    });
  }

}

module.exports = IpwebcamDriver;