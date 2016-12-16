var stanza = require ("./modules/stanza/stanza")
var log = require ("./modules/log");
var Client = require('node-xmpp-client');
var client = new Client ({
	"jid": process.env.JID,
	"password": process.env.JID_PWD
});
var nlp = require ("./modules/nlp");

client.connection.on ("data", function (data) { 
	//log.info (data);
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
	client.send (stanza.Presence.acceptSubscription (attrs.from));
})
stanza.Message.on ("message", function (attrs, body) { 
	var lines = body.split ("\n");
	if (lines [0].trim ().substring (0, 4) == "?OTR") { 
		client.send (stanza.Message.send (attrs.to, attrs.from, "I will support OTR soon!"));
	} else {
		log.info (body);
		var p = nlp.parse (body);
		console.log (p);
		for (var x in p) { 
			console.log (p [x].key)
		}
	}
});
