var log = require ('./log');
module.exports = new EventEmitter ();

module.exports.parse = function (file) { 
	var conf = require (file);
	log.info ("actions: " + conf.actions.length);
	
}
