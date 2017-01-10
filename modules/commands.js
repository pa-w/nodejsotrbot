var log = require ('./log');
var stanza = require ("./stanza/stanza")
var fs = require ('fs');
var EventEmitter = require('events').EventEmitter;
module.exports = new EventEmitter ();
module.commands = {};
module.commands.say = function (what, conf, user, client) { 
	client.send (stanza.Message.send (user.service, user.id, conf.sentences [what][user.locale ? user.locale : conf.default_locale]));
}
module.exports.exec = function (action, conf, user, client) { 
	var cmds = action.split(";");
	for (var cmd in cmds) { 
		var w = cmds [cmd].split (" ");
		if (module.commands [w [0]]) {
			module.commands [w [0]] (w.slice (1).join (" "), conf, user, client);
		}
	}
}
module.exports.parse = function (file, cmd, user, client) { 
	try {
		if (fs.statSync (__dirname + "/" + file)) {
			try {
				var r = JSON.parse (fs.readFileSync (__dirname + "/" + file));
				if (r.actions && r.default_action && r.actions [r.default_action]) {
					module.exports.exec (r.actions [r.default_action], r, user, client);
				} else {
					log.info ("no default action");
				}
				return true;
			} catch (x) { log.info (x); }
		}
	} catch (e) {}

	return false;
}
