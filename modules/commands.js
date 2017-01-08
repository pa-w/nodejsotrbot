var log = require ('./log');
var fs = require ('fs');
var EventEmitter = require('events').EventEmitter;
module.exports = new EventEmitter ();

module.exports.parse = function (file) { 
	log.info ("stat file: " + file);
	try {
	if (fs.statSync (file)) {
		log.info ("required here");
		return true;
	} else {
		log.info ("module does not exists: " + file);
		return false;
	}
	} catch (e) {
		log.info (e);
	}
}
