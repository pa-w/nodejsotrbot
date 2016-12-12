var Presence = require ('./presence');
var Message = require ('./message');
var log = require ('../log');

module.exports.Presence = Presence;
module.exports.Message = Message;
module.exports.parse = function (sta) { 
	if (!sta) return;
	if (sta.is ("presence")) { Presence.parse (sta); }
	if (sta.is ("message")) { Message.parse (sta); } 
}
