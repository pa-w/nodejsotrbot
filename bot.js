var stanza = require ("./modules/stanza/stanza")
var fs = require ('fs');
var log = require ("./modules/log");
var Client = require('node-xmpp-client');
var client = new Client ({
	"jid": process.env.JID,
	"password": process.env.JID_PWD
});
var user = require ("./modules/users");
var nlp = require ("./modules/nlp");
var commandParser = require ('./modules/commands');
var OTR = require('./otr/build/otr.js');
var DSA = require('./otr/lib/dsa.js');

log.info ("Computing private key");
var pKey = new DSA ();
log.info ("done");
var buddies = {};

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
stanza.Message.on ("composing", function (attrs) { 
	log.info (attrs.from + " is writing a message!");
});
stanza.Message.on ("message", function (attrs, body) { 
	var messageReceived = function (attrs, body, otr) {
		var profile = user.load (attrs.to, attrs.from, function (user) { 
			var words = body.split (" ");
			if (words.length >= 2) { 
				var cmd = words.slice (0, 2).join ("_").toLowerCase ();
				var file = "../commands/" + cmd + ".json";
				if (!commandParser.parse (file, words, user, client, otr)) {
					log.info (file + " doesnt exist.");
					var p = nlp.parse (body)
						//cmd = p.map (function (x) { return x.key.replace (" ", "_"); }).join ("_"),
					for (var i in p) {
						file = "../commands/" + p [i].key + ".json";
						if (!commandParser.parse (file, p [i], user, client, otr)) { 
							log.info (file + " (nlp) does not exist either");
							commandParser.parse ("../commands/not_found.json", {},  user, client, otr);
						}
					}
				}
				try {
				} catch (e) {
					log.info ("Failed to parse: (" + file + "):" + e);
				}
			}
		});
	}
	try { 
		var otr = buddies [attrs.from];
		if (!buddies [attrs.from]) { 
			otr = new OTR ({fragment_size: 140, send_interval: 200, priv: pKey});
			buddies [attrs.from] = otr;
			otr.on ('error', function (error, severity) { 
				log.info ("ERROR (" + severity + "): " + error);
			});
			otr.on ('ui', function (msg, enc, meta) { 
				var lines = body.split ("\n");
				if (!enc && lines [0].trim ().substring (0, 4) == "?OTR") { 
					log.info ("XXX: " + body)
				} else if (!enc) { 
					log.info ("sending query msg");
					//client.send (stanza.Message.send (attrs.to, attrs.from, "Wait... Let's encrypt!"));
					otr.sendMsg ("Wait... Let's encrypt!");
					otr.sendQueryMsg ();
				} else {
					log.info ("received cyphered message: " + msg)
					//here i will call the receivedMessage callback to parse the actual message.
					try { 
						messageReceived (attrs, msg, otr);
					} catch (e) {
						log.info ("Error in callback: " + e);
					}


					//otr.sendMsg (msg);
					//client.send (stanza.Message.send (attrs.to, attrs.from, ));
				}
			});
			otr.on ('io', function (msg, meta) { 
				if (meta) { 
					log.info ("META: "+  meta);
				}
				client.send (stanza.Message.send (attrs.to, attrs.from, msg));
				log.info ('send: ' + attrs.to + " " + attrs.from + " " + msg);
			});
			otr.on ('status', function (state) { 
				log.info ('change of status: ' + state);
				switch (state) { 
					case OTR.CONST.STATUS_AKE_SUCCESS: 
						log.info ("SUCCESS!");
						break;
				}
			});
		}

		otr.receiveMsg (body, messageReceived);

	} catch (e) { 
		log.info ("COULDNT PARSE MESSAGE: " + e);
	}
	/*

	}

		/*
		client.send (stanza.Message.send (attrs.to, attrs.from, "This are the commands I understood: " + p.map (function (x) { return x.key; }).join (", ")));
		var verbs = p.map ((x) => { return x.verbs.map ((v) => { return v.text; }).join (" ") }),
			people = p.map ((x) => { return x.people.map ((p) => { return p.text; }).join (" ") }),
			nouns = p.map ((x) => { return x.nouns.map ((n) => { return n.text; }).join (" ") });

		client.send (stanza.Message.send (attrs.to, attrs.from, "Verbs: " + verbs + "\nNouns: " + nouns + "\nPeople: " + people));
		*/
});
