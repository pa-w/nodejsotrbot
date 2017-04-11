var Base = require ("./base");

function Buddy (who) {
	this.settersFromArray (["username", "isTyping"])
	this.username (who);
}

Buddy.prototype = Object.create (Base.prototype);
Buddy.prototype.constructor = Buddy;

Buddy.prototype.message = function (message, attrs) {
}
Buddy.prototype.presence = function (type, attrs) {
}
Buddy.prototype.setLayer = function (layer) {
	console.log ("setting layer");
}

module.exports = Buddy;
