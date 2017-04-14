var fs = require ('fs');
var Bot = require ("./obj/bot");

var privateKey = fs.readFileSync (process.env.PK).toString ();

var b = new Bot ()

b.protocol ("xmpp")
	.username (process.env.JID)
	.password (process.env.JID_PWD)
	.layer ("otr", {"privateKey": privateKey})
	.on ("online", function () { console.log ("online"); })
	.on ("subscribe", function (attrs) { console.log ("FRIEND REQUEST"); b.acceptFriendship (attrs.from); })
	.on ("offline", function () { console.log ("offline"); })
	.on ("buddy_add", function (buddy) { console.log ("ADDED BUDDY: " + buddy.username ()); })
	.on ("error", function (msg) { console.log (msg); })
	.on ("received_message", function (from, to, msg) { console.log ("RECEIVED MSG: " + msg); b.buddy (from).sendMessage ("Received: " + msg);  })
