'use strict';

const Util = require('/lib/util.js');

module.exports = {
  async testEmail({homey, body}) {
    const util = new Util({homey: homey});

    const result = await util.testEmail(body);
    return result;
  }
}
