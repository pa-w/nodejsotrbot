var log = require ('./log');
var stanza = require ("./stanza/stanza")
var fs = require ('fs');
var EventEmitter = require('events').EventEmitter;
module.exports = new EventEmitter ();
module.commands = {};
module.commands.say = function (what, conf, user, client, otr) { 
	log.info ("will say" + conf.sentences [what][user.locale ? user.locale : conf.default_locale]);
	otr.sendMsg (conf.sentences [what][user.locale ? user.locale : conf.default_locale]);
}
module.commands.goto = function (what, conf, user, client, otr) {
	log.info ("Go to: " + what);
	if (conf.actions && conf.actions [what]) {
		module.exports.exec (conf.actions [what], conf, user, client, otr);
	}
}
module.exports.exec = function (action, conf, user, client, otr) { 
	var cmds = action.split(";");
	for (var cmd in cmds) { 
		log.info ("cmd: [" + cmds [cmd].trim () + "]");
		var w = cmds [cmd].trim ().split (" ");
		if (module.commands [w [0]]) {
			module.commands [w [0]] (w.slice (1).join (" "), conf, user, client, otr);
		} else {
			log.info ("unknown command: [" + w [0] + "]");
		}
	}
}
module.exports.parse = function (file, cmd, user, client, otr) { 
	try {
		if (fs.statSync (__dirname + "/" + file)) {
			try {
				var r = JSON.parse (fs.readFileSync (__dirname + "/" + file));
				if (r.actions && r.default_action && r.actions [r.default_action]) {
					module.exports.exec (r.actions [r.default_action], r, user, client, otr);
				} else {
					log.info ("no default action");
				}
				return true;
			} catch (x) { log.info (x); }
		}
	} catch (e) {}

	return false;
}
