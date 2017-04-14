# RAct Core
Steps to set up an XMPP bot with OTR support:

1. Generate bot's private key:
	$ node keygen.js > bot.pk
2. Create your own bot.js, a sample file can be bot.js in this repo
3. Run it:
	$ PK="path.to.private.key.file" JID="myuser@home.zom.im" JID_PWD="Av3ryS3cur3_Pwd*" node bot.js 
