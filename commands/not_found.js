var log = require ('../modules/log');
var EventEmitter = require('events').EventEmitter;
module.exports = new EventEmitter ();
module.exports.exec = function (cmd, user, client, otr) { 
	otr.sendMsg (cmd.toString () + "not found.");

	return true;
}
