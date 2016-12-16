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
		var verbs = [], people = [], dates = [], nouns = [];
		for (var x in analysis.terms) { 
			/*
			console.log (analysis.terms [x]);
			console.log (analysis.terms [x].text + " : " + analysis.terms [x].tag);
			for (var y in analysis.terms [x].pos) {
				console.log ("\t" + y + " " +analysis.terms [x].pos [y]);
			}
			*/
			if (!isQuestion && analysis.terms [x].pos.Question) isQuestion = true;
			if (!responseTime && analysis.terms [x].pos.Verb && !analysis.terms [x].pos.Copula) {
				responseTime = analysis.terms [x].tag;
			}
			if (analysis.terms [x].pos.Verb && (analysis.terms [x].pos.Infinitive || analysis.terms [x].pos.Gerund)) {
				verbs.push (analysis.terms [x]);
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
		var key_noun = nouns.length > 0 ? nouns [nouns.length - 1].text : "";
		var key_verb = verbs.length > 0 ? nlp.verb (verbs [verbs.length - 1].text).conjugate ().infinitive : "";
		terms.push ({"key": key_verb + " " + key_noun, "question": isQuestion, "time": responseTime, "verbs": verbs, "people": people, "dates": dates, "nouns": nouns});
	}

	return terms;
}
