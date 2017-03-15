var stanza = require ("./modules/stanza/stanza")
var fs = require ('fs');
var log = require ("./modules/log");
var strip_tags = require ("./modules/strip_tags");
var Client = require('node-xmpp-client');
var client = new Client ({
	"jid": process.env.JID,
	"password": process.env.JID_PWD
});
var user = require ("./modules/users");
var nlp = require ("./modules/nlp");
var commandParser = require ('./modules/commands');
var OTR = require ("otr/lib/otr");
var DSA = require ("otr/lib/dsa");

var pKey = null;
user.privateKey (process.env.JID, 
	function (k) { 
		pKey = DSA.parsePrivate(k); 
	}, 
	function () { 
		var d = new DSA (), k = d.packPrivate ();
		return k;
	}
);

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
		body = strip_tags (body);
		user.load (attrs.to, attrs.from, function (userData) { 
			if (userData.redirectCommand && userData.redirectCommand !== true) { 
				var file = userData.redirectCommand; 
				log.info ("Redirecting to " + userData.redirectCommand);
				if (!commandParser.parse (file, body, userData, client, otr)) {
					userData.redirectCommand = false;
					
					user.update (userData, function () {
						otr.sendMsg ("Can you say that again?");
					});
				};

			} else {
				
				var words = body.split (" ");
				if (words.length >= 2) { 
					var cmd = words.slice (0, 2).join ("_").toLowerCase ();
					var file = "../commands/" + cmd + ".js";
					if (!commandParser.parse (file, words, userData, client, otr)) {
						// nlp.parse splits the input into sentences and analyses each one.
						var p = nlp.parse (body)
						for (var i in p) {
							file = "../commands/" + p [i].key + ".js";
							if (!commandParser.parse (file, p [i], userData, client, otr)) { 
								log.info (file + " (nlp) does not exist either");
								commandParser.parse ("../commands/not_found.js", {},  userData, client, otr);
							}
						}
					}
				}
			}
		});
	}
	try { 
		var otr = buddies [attrs.from];
		// new buddy...! 
		if (!buddies [attrs.from]) { 
			otr = new OTR ({fragment_size: 140, send_interval: 200, priv: pKey, debug: true});
			buddies [attrs.from] = otr;
			otr.on ('error', function (error, severity) { 
				log.info ("ERROR (" + severity + "): " + error);
			});
			otr.on ('ui', function (msg, enc, meta) { 
				var lines = body.split ("\n");
				if (!enc && lines [0].trim ().substring (0, 4) == "?OTR") { 
					log.info ("XXX: " + body)
				} else if (!enc) { 
					//Received a plain text message, let's start OTR!
					otr.sendMsg ("Wait... Let's encrypt!");
					otr.sendQueryMsg ();
				} else {
					// At this point, we have a cyphered channel and msg was already decrypted.
 					// Let's call back!
					try { 
						messageReceived (attrs, msg, otr);
					} catch (e) {
						log.info ("Error in callback: " + e);
					}
				}
			});
			otr.on ('io', function (msg, meta) { 
				if (meta) { 
					log.info ("META: "+  meta);
				}
				client.send (stanza.Message.send (attrs.to, attrs.from, msg));
				//log.info ('send: ' + attrs.to + " " + attrs.from + " " + msg);
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
});
