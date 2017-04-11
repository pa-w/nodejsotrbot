var Base = require ("./base");
var Buddy = require ("./buddy");

function BuddyList () {
	this._buddies = {};
}
BuddyList.prototype = Object.create (Base.prototype);
BuddyList.prototype.constructor = BuddyList;
BuddyList.prototype.getBuddies = function () { 
	return this._buddies;	
}
BuddyList.prototype.isBuddy = function (buddy) {
	var list = this.getBuddies ();

	return list [buddy] != undefined;
}
BuddyList.prototype.addBuddy = function (buddy) {
	this._buddies [buddy] = new Buddy (buddy);
	this.emit ("buddy_add", this._buddies [buddy]);

	return this._buddies [buddy];
}
BuddyList.prototype.buddy = function (buddy) {
	return this._buddies [buddy];
}


module.exports = BuddyList;
