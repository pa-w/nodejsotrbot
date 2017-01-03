var log = require ('./log');
var fs = require ('fs');
var EventEmitter = require('events').EventEmitter;
module.exports = new EventEmitter ();

module.exports.parse = function (file) { 
	if (fs.existsSync (file)) {
	//	var conf = require (file);
		log.info ("required here");
	} else {
		log.info ("module does not exists: " + file);
	}
}
