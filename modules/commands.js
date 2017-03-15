var log = require ('./log');
var stanza = require ("./stanza/stanza")
var fs = require ('fs');
var EventEmitter = require('events').EventEmitter;
var user = require ("./users");
module.exports = new EventEmitter ();
module.exports.parse = function (file, cmd, userData, client, otr) { 
	try {
		if (fs.statSync (__dirname + "/" + file)) {
			try {
				var mod = require (__dirname + "/" + file);
				var ret = mod.exec (cmd, userData, client, otr);
				/* if the exec method does not return true, next input will get redirected to it */
				userData.redirectCommand = false;
				if (ret !== true) { 
					userData.redirectCommand = file;
				}
				user.update (userData, function (u) {
					log.info ("Updated user, redirected command: " + u.redirectCommand);
				});
				return true;
				/*
				var r = JSON.parse (fs.readFileSync (__dirname + "/" + file));
				if (r.actions && r.default_action && r.actions [r.default_action]) {
					module.exports.exec (r.actions [r.default_action], r, user, client, otr);
				} else {
					log.info ("no default action");
				}
				return true;
				*/
			} catch (x) { log.info (x); }
		}
	} catch (e) {}

	return false;
}
