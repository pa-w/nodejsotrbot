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
	var p = require ("./protocols/" + this.protocol ());
	this._protocol = new p (this);

	var layer = this.layer ();

	this._buddyList = new BuddyList (this.username ());
	var me = this;	
	this._buddyList.on ("buddy_add", function (buddy) { me.emit ("buddy_add", buddy); buddy.setLayer (layer); });
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
Bot.prototype.receivedMessage = function (from, msg, attrs) {
	
}

module.exports = Bot;
