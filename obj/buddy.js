var Base = require ("./base");

function Buddy (who) {
	this.settersFromArray (["username", "isTyping", "layer"])
	this.username (who);
}

Buddy.prototype = Object.create (Base.prototype);
Buddy.prototype.constructor = Buddy;

Buddy.prototype.rawMessage = function (message, attrs) {
	var layer = this.layer ();
	if (layer) {
		this.layer ().receiveMessage (message, attrs);
	} else {
		this.emit ("received_message", this.username (), message);
	}
}
Buddy.prototype.sendMessage = function (message) {
	this.emit ("send_message", message);
}
Buddy.prototype.presence = function (type, attrs) {
	this.emit ("presence", [type, attrs]);
}
Buddy.prototype.setLayer = function (layer, cnf) {
	try {
		cnf.buddy = this;
		var me = this;

		var Layer = require ("./layers/" + layer);
		this.layer (new Layer (cnf));

		this.layer ().on ("send_message", function (msg) {
			me.emit ("send_message", msg);
		});
		this.layer ().on ("received_message", function (msg) {
			me.emit ("received_message", me.username (), msg); 
		});
	} catch (e) {
		this.emit ("error", e);
	}
}

module.exports = Buddy;
