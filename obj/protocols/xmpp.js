var Client = require('node-xmpp-client');
var Protocol = require ("./protocol");
function Protocol_XMPP (Bot) {
	this.client = new Client ({"jid": Bot.username (), "password": Bot.password ()});
	var me = this;
	this.client.on ("online", function () { 
		this.send ("<presence/>");	
		Bot.emit ("online");
	});
	this.client.on ("offline" ,function () {
		Bot.emit ("offline");
	});
	this.client.on ("stanza", function (stanza) {
		if (!stanza || !stanza.attrs) return;
		if (stanza.is ("presence")) {
			Bot.emit (stanza.attrs.type, stanza.attrs); 
			Bot.buddy (stanza.attrs.from).presence (stanza.attrs.type, stanza.attrs);
		}
		if (stanza.is ("message")) {
			var body = stanza.getChildText ("body");
			if (body) { 
				Bot.buddy (stanza.attrs.from).message (body, stanza.attrs);
			} else if (stanza.getChild ('composing')) {
				Bot.buddy (stanza.attrs.from).isTyping (true);
			} else if (stanza.getChild ('paused')) {
				Boy.buddy (stanza.attrs.from).isTyping (false);
			}
		}
	});
}
Protocol_XMPP.prototype = Object.create (Protocol.prototype);
Protocol_XMPP.prototype.constructor = Protocol_XMPP;
Protocol_XMPP.prototype.acceptFriendship = function (to) {
	this.client.send (new Client.Stanza ("presence", {"to": to, "type": "subscribed" })); 
}
module.exports = Protocol_XMPP;
