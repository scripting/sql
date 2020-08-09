const myProductName = "davesql", myVersion = "0.4.0"; 

exports.runSqltext = runSqltext; 
exports.queueQuery = queueQuery; 
exports.encodeValues = encodeValues; 
exports.encode = encode; 
exports.start = start; 

const mysql = require ("mysql");
const dateFormat = require ("dateformat");

var config;
var theSqlConnection = undefined;
var theSqlConnectionPool = undefined; 
var sqlQueue = new Array ();
var ctCurrentQueries = 0;

function formatDateTime (when) {
	if (when === undefined) {
		when = new Date ();
		}
	return (dateFormat (new Date (when), "yyyy-mm-dd HH:MM:ss"));
	}
function encode (s) {
	return (mysql.escape (s));
	}
function encodeValues (values) {
	var part1 = "", part2 = "";
	for (var x in values) { //generate something like this: (feedurl, title, htmlurl, description, whenupdated)
		if (part1.length > 0) {
			part1 += ", ";
			}
		part1 += x;
		}
	for (var x in values) { //and this: ('http://scripting.com/rss.xml', Scripting News', 'http://scripting.com/', 'Even worse etc', '2018-02-04 12:04:08')
		if (part2.length > 0) {
			part2 += ", ";
			}
		part2 += encode (values [x]);
		}
	return ("(" + part1 + ") values (" + part2 + ");");
	}
function runSqltext (s, callback) {
	theSqlConnectionPool.getConnection (function (err, connection) {
		if (err) {
			console.log ("runSqltext: err.code == " + err.code + ", err.message == " + err.message);
			if (callback !== undefined) {
				callback (err);
				}
			}
		else {
			connection.query (s, function (err, result) {
				connection.release ();
				if (err) {
					console.log ("runSqltext: err.code == " + err.code + ", err.message == " + err.message);
					if (callback !== undefined) {
						callback (err);
						}
					}
				else {
					if (callback !== undefined) {
						callback (undefined, result);
						}
					}
				});
			}
		});
	}

function queueQuery (s, callback) {
	sqlQueue.push ({s, callback});
	}
function checkQueryQueue () {
	if (sqlQueue.length > 0) {
		if (ctCurrentQueries < config.connectionLimit) {
			const query = sqlQueue.shift ();
			ctCurrentQueries++;
			runSqltext (query.s, function (err, val) {
				ctCurrentQueries--;
				if (query.callback !== undefined) {
					query.callback (err, val);
					}
				});
			}
		}
	}
function startQueryQueue () {
	setInterval (checkQueryQueue, 100); //every tenth second
	}

function start (options, callback) {
	theSqlConnectionPool = mysql.createPool (options);
	config = options; //keep a copy
	startQueryQueue ();
	if (callback !== undefined) {
		callback ();
		}
	}
