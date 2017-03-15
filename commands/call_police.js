var log = require ('../modules/log');
var EventEmitter = require('events').EventEmitter;
module.exports = new EventEmitter ();
var u = require ("../modules/users");
module.exports.exec = function (cmd, user, client, otr) {
	otr.sendMsg ("police: " + user.call_police);
	if (!user.call_police) { 
		user.call_police = "confirm";
		u.update (user, function () { 
			otr.sendMsg ("Are you in an emergency?");
		});
	} else {
		if (user.call_police == "confirm") {
			if (cmd == "yes") { 
				user.call_police = "is_medical";
				u.update (user, function () {
					otr.sendMsg ("Do you need medical assistance?");
				});
			} else {
				user.call_police = false;
				u.update (user, function (d) { 
					otr.sendMsg ("Ok, good to hear you are not in an emergency");
				});
				return true;
			}
		}
		if (user.call_police == "is_medical") { 
			user.call_police = false;
			if (cmd == "yes") {
				msg = "Ok, I will call an ambulance too.";
			}
			u.update (user, function () { 
				otr.sendMsg ("Ok, I will call an ambulance too.");
			})

			return true;
		}
	}
}
