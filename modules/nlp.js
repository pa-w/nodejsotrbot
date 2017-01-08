//var natural = require ('natural');
var log = require ('./log');
var WordPOS = require('wordpos');
WordPOS.defaults = {
	stopwords: false
}
var wordpos = new WordPOS();
var natural = require ('natural');
var nlp = require('nlp_compromise');
var tokenizer = new natural.TreebankWordTokenizer();
var EventEmitter = require('events').EventEmitter;
module.exports = new EventEmitter ();

module.exports.parse = function (body) {
	var cb = function (line) {  
		/*
		return function (b) {
			var qWords = ["who", "where", "what", "when", "which", "why"];
			var personalPronouns = ["I", "you", "he", "she", "it", "they", "we"];
			if (b) { 
				var pos = [], ks = {}, verbs = [], words = line.split (" "), idx = {};
				for (var i in words) { 
					ks [words [i]] = line.indexOf (words [i]);
					idx [words [i]] = i;
				}
				b.verbs.sort (function (a, b) { if (ks [a] > ks [b]) { return 1; } else { return -1; } return 0; });
				verbs = b.verbs.filter (function (a) { return (b.adverbs.indexOf (a) == -1); })
				if (verbs.length > 0) { 
					var previous = idx [verbs [0]] - 1, next = parseInt (idx [verbs [0]]) + 1, useVerb = 0, isQuestion = false, actor =words [next];
					log.info (next + ": " + words [next] + " " + words.length)
					while (useVerb < verbs.length && previous >= 0 && qWords.indexOf (words [previous]) !== -1) { 
						useVerb ++;
						if (personalPronouns.indexOf (next) !== -1) {
							if (words [next].toLower () == "i") { 
								actor = "you";
							} else if (words [next].toLower () == "you") {
								actor = "I";
							}
						}

						previous = idx [verbs [useVerb]] - 1, next = idx [verbs [useVerb]] + 1;
						isQuestion = true;
					}
					log.info ("definitive verb: " + verbs [useVerb] + " actor: " + actor);
					
					//client.send (stanza.Message.send (attrs.to, attrs.from, "Ok. I will " + verbs [0])); 
				} else {
					log.info ("This would be nice to google");
				}
			} else {
				log.info ("no b");
			}
			for (var x in b) { 
				log.info (x + ": " + b [x]);
			}
		}
		*/
	}
	var lines = nlp.text (body).sentences;
	var terms = [];
	for (var line in lines) {
		var analysis = nlp.sentence (lines [line].text ())
		log.info (lines [line].text () + " ///\n Terms: " + analysis.terms.length);
		var isQuestion = false, capturingSubject = false, subject = "I";
		var responseTime = null;
		var verbs = [], people = [], dates = [], nouns = [], questions = [];
		for (var x in analysis.terms) { 
			/*
			console.log (analysis.terms [x]);
			console.log (analysis.terms [x].text + " : " + analysis.terms [x].tag);
			for (var y in analysis.terms [x].pos) {
				console.log ("\t" + y + " " +analysis.terms [x].pos [y]);
			}
			*/
			if (analysis.terms [x-1] && analysis.terms [x-1].pos.Possessive) { 
				analysis.terms [x].possessive = analysis.terms [x-1];
			}
			if (!isQuestion && analysis.terms [x].pos.Question) { 
				isQuestion = true;
				questions.push (analysis.terms [x]);
			}
			if (!responseTime && analysis.terms [x].pos.Verb && !analysis.terms [x].pos.Copula) {
				responseTime = analysis.terms [x].tag;
			}
			if (analysis.terms [x].pos.Verb && (analysis.terms [x].pos.Infinitive || analysis.terms [x].pos.Gerund || analysis.terms [x].pos.Copula)) {
				if (analysis.terms [x].pos.Copula) { 
					var w = analysis.terms [x].normal.split (' ');
					if (w.length > 1) {
						verbs.push (nlp.verb (analysis.terms [x].normal.split (' ') [w.length - 1]));
					}
				} else {
					verbs.push (analysis.terms [x]);
				}
			}
			if (analysis.terms [x].pos.Person) { 
				people.push (analysis.terms [x]);
			} else if (analysis.terms [x].pos.Noun && !analysis.terms [x].pos.Pronoun && !analysis.terms [x].pos.Value && !analysis.terms [x].pos.Date) { 
				nouns.push (analysis.terms [x]);
			} else if (analysis.terms [x].pos.Pronoun) { 
				people.push (analysis.terms [x]);
			} 
			if (analysis.terms [x].pos.Date) { 
				dates.push (analysis.terms [x]);
			}
		}
		var key_noun = nouns.length > 0 ? (nouns [nouns.length -1].possessive ? nouns [nouns.length -1].possessive.normal + "_" + nouns [nouns.length -1].normal  : nouns [nouns.length - 1].normal) : "";
		if (key_noun == "" && people.length > 0 ) { key_noun = people [people.length -1].normal; }
		if (verbs.length == 0) key_noun = nouns.map (function (x) { return (x.possessive ? x.possessive.normal + "_" : "") + x.normal; }).join (" ");
		var key_verb = verbs.length > 0 ? (verbs [verbs.length -1].possessive ? verbs [verbs.length -1].possessive.normal + "_" : "") + nlp.verb (verbs [verbs.length - 1].normal).conjugate ().infinitive : "";
		var keys = [];
		if (key_verb) keys.push (key_verb);
		if (key_noun) keys.push (key_noun);
		if (keys.length == 0 && questions.length > 0) { 
			keys.push ((questions [0].expansion ? questions [0].expansion : questions [0].normal));
			if (verbs.length > 0) { 
				keys.push (verbs [0].normal);
			}
			keys.push ((people.length > 0 ? people [0].normal : analysis.terms [analysis.terms.length - 1].normal));  
		} else if (keys.length == 0) {
			keys.push (analysis.terms [0].normal)
			keys.push (analysis.terms [analysis.terms.length - 1].normal);
		}
		terms.push ({"key": keys.join ('_').toLowerCase (), "question": isQuestion, "time": responseTime, "verbs": verbs, "people": people, "dates": dates, "nouns": nouns});
	}

	return terms;
}
