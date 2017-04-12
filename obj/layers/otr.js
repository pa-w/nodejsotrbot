var OTR = require ("otr/lib/otr");
var DSA = require ("otr/lib/dsa");
function Layer_OTR (cnf) {
	console.log (cnf);
	if (!cnf || !cnf.privateKey) throw "No OTR configuration set: privateKey";
	this.settersFromArray (["privateKey", "otr"]);

	this.privateKey (DSA.parsePrivate(cnf.privateKey))
	this.otr (new OTR ({fragment_size: 140, send_interval: 200, priv: this.privateKey ()}));
	this.otr ().sendQueryMsg ();
	var layer = this;

	this.otr ().on ("error", function (e) { 
		console.log (e);
		layer.emit ("error", e);
	});

	this.otr ().on ("ui", function (msg, enc, meta) {
		if (!enc) { 
			layer.otr ().sendMsg ("Wait! Let's encrypt");
			layer.otr ().sendQueryMsg ();		
		} else {
			layer.emit ("received_message", msg); 
		}
	});
	this.otr ().on ("io", function (msg, meta) {
		layer.sendMessage (msg);
	});
}
var Layer = require ("./layer");
Layer_OTR.prototype = Object.create (Layer.prototype);
Layer_OTR.prototype.constructor = Layer_OTR;
Layer_OTR.prototype.receiveMessage = function (msg, attrs) {
	this.otr ().receiveMsg (msg);
}
Layer_OTR.prototype.sendMessage = function (msg) {
	this.emit ("send_message", msg); 
}

module.exports = Layer_OTR;
