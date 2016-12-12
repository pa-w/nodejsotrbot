var stanza = require ("./modules/stanza/stanza")
var log = require ("./modules/log");
var Client = require('node-xmpp-client');
var client = new Client ({
	"jid": process.env.JID,
	"password": process.env.JID_PWD
});
client.connection.on ("data", function (data) { 
	//log (data);
});
client.on ("online", function () { 
	log.info ("online");
	client.send('<presence/>')
});
client.on ("error", function (e) { 
	log.info ("error: " + e);
});
client.on ("stanza", function (sta) { 
	stanza.parse (sta);
});
stanza.Presence.on ("subscribe", function (attrs) { 
	log.info ("subscribe request: " + attrs.from);
	client.send (stanza.Presence.acceptSubscription (attrs.from));
})
stanza.Message.on ("message", function (attrs, body) { 
	log.info ("From: " + attrs.from);
	log.info ("To: " + attrs.to);
	client.send (stanza.Message.send (attrs.to, attrs.from, body.split ("").reverse ().join ("")))
});
