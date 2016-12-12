
var fs = require("fs");
var logStream = openLog("/tmp/otrbot.log");

function openLog(logfile) {
	return fs.createWriteStream(logfile, { 
		flags: "a", encoding: "utf8", mode: 0644 
	});
}
module.exports.info = function (msg) {
	logStream.write(msg + "\n");
}
