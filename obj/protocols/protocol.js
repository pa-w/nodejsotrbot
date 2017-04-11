var Base = require ("../base");
function Protocol () {
}

Protocol.prototype = Object.create (Base.prototype);
Protocol.prototype.constructor = Protocol;
Protocol.prototype.connect = function () {
	this.client.connection.connect ();
}
Protocol.prototype.disconnect = function () {
	this.client.connection.disconnect ();
}

module.exports = Protocol;
