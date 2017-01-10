var EventEmitter = require ('events').EventEmitter;
var log = require ('./log');

var nano = require ('nano') ('http://localhost:5984');

module.exports = new EventEmitter ();
module.exports.load = function (service, id, cb) { 
	module.exports.checkDb ('profiles', function () { 
		var profiles = nano.use ('profiles');
		profiles.get (service+"_"+id, {}, function (err, body) { 
			if (err) {
				profiles.insert ({_id: service+"_"+id, service: service, id: id}, function (err, body) { 
					if (!err) { 
						module.exports.load (service, id, cb);
					}
				});
				return;
			}
			cb (body);
		});
	});
	
}
module.exports.checkDb = function (db, cb, t) { 
	nano.db.get ('profiles', function (err, body) { 
		if (err)  { 
			log.info (err);
			if (!t) {
				log.info ("will create db");
				nano.db.create (db);
				module.exports.checkDb (db, cb, true);
			}
			return; 
		}

		cb ();

	});
}
