const Homey = require('homey');
const util = require('/lib/util.js');

module.exports = [
	{
		description: 'Test email',
		method     : 'PUT',
		path       : '/testemail/',
		public     : false,
		fn: function(args, callback) {
			util.testEmail(args, callback);
		}
	}
]
