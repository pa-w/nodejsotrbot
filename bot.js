var Bot = require ("./obj/bot");

var b = new Bot ()

b.protocol ("xmpp")
	.username (process.env.JID)
	.password (process.env.JID_PWD)
	.layer ("otr")
	.on ("online", function () { console.log ("online"); })
	.on ("subscribe", function (attrs) { console.log ("FRIEND REQUEST"); b.acceptFriendship (attrs.from); })
	.on ("offline", function () { console.log ("offline"); })
	.on ("buddy_add", function (buddy) { console.log ("ADDED BUDDY: " + buddy.username ()); });
