var Base = require ('./base');
var BuddyList  = require ('./buddyList');

function Bot () {
	this._protocol = null;
	this._buddyList = null;
	var cb = function () {
		return function (key, val) {
			if (this.protocol () && this.username () && this.password () && this.layer ()) {
				this.ready ();
			}
		}
	}
	this.settersFromArray (["protocol", "layer", "username", "password"], cb ());
}
Bot.prototype = Object.create (Base.prototype);
Bot.prototype.constructor = Bot;
/**
* ready, called when all the variables have been set 
*/
Bot.prototype.ready = function () {	
	this.emit ("ready");
	this.connect ();
}
Bot.prototype.connect = function () { 
	try {
		var p = require ("./protocols/" + this.protocol ());
		this._protocol = new p (this);
	} catch (e) { this.emit ("error", e); }

	this._buddyList = new BuddyList (this.username ());
	var me = this;	
	var layer = this.layer ();
	var messageCb = function (buddy) { 
		return function (from, msg, attrs) { 
			me.emit ("received_message", me.username (), from, msg);
		}
	}
	var presenceCb = function (buddy) {
		return function (type, attrs) {
			console.log ("Presence: (" + buddy.username () + ") " + type); 
		}
	}
	var sendCb = function (buddy) { 
		return function (message) {
			console.log ("Will send message: " + message);
			me._protocol.sendMessage (me.username (), buddy.username (), message);
		}
	}
	this._buddyList.on ("buddy_add", function (buddy) { 
		me.emit ("buddy_add", buddy); 
		buddy.setLayer.apply (buddy, layer); 
		buddy.on ("presence", presenceCb (buddy));
		buddy.on ("send_message", sendCb (buddy));
		buddy.on ("received_message", messageCb (buddy));
	});
}
Bot.prototype.disconnect = function () {
	this._protocol.disconnect ();
}
Bot.prototype.acceptFriendship = function (to) {
	this._protocol.acceptFriendship (to);
}
Bot.prototype.buddy = function (who) {
	var buddy = this._buddyList.buddy (who);
	if (!buddy) {
		buddy = this._buddyList.addBuddy (who);
	}

	return buddy;
}

module.exports = Bot;
