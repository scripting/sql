const myProductName = "davesql", myVersion = "0.6.2"; 

exports.runSqltext = runSqltext; 
exports.queueQuery = queueQuery; 
exports.getQueueLength = getQueueLength;  //11/21/20 by DW
exports.encodeValues = encodeValues; 
exports.encode = encode; 
exports.formatDateTime = formatDateTime; //12/18/20 by DW
exports.start = start; 

const utils = require ("daveutils");
const dateFormat = require ("dateformat");
var mysql;

const config = new Object (); //9/22/23 by DW -- changed to const

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
function encode (val) {
	if ((typeof (val) != "object") || (val instanceof Date)) {
		return (mysql.escape (val));
		}
	else {
		let jsontext = JSON.stringify (val); //5/26/23 by DW
		jsontext = utils.replaceAll (jsontext, "'", "\\'");
		return ("'" + jsontext + "'");
		}
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
function runQueryNow (s, callback) {
	const whenstart = new Date ();
	
	function callLogCallback (err, result) { //9/21/23 by DW
		if (config.logCallback !== undefined) { 
			const theDataForCall = {
				err,
				result,
				sqltext: s,
				ctsecs: utils.secondsSince (whenstart)
				};
			config.logCallback (theDataForCall);
			}
		}
	
	ctCurrentQueries++;
	if (utils.getBoolean (config.flLogQueries)) {
		console.log ("runQueryNow: " + s);
		}
	theSqlConnectionPool.getConnection (function (err, connection) {
		if (err) {
			ctCurrentQueries--;
			console.log ("runQueryNow: err.code == " + err.code + ", err.message == " + err.message);
			if (callback !== undefined) {
				callback (err);
				}
			callLogCallback (err); //9/21/23 by DW
			}
		else {
			connection.query (s, function (err, result, fields) {
				connection.release ();
				ctCurrentQueries--;
				if (err) {
					console.log ("runQueryNow: err.code == " + err.code + ", err.message == " + err.message);
					if (callback !== undefined) {
						callback (err);
						}
					callLogCallback (err); //9/21/23 by DW
					}
				else {
					if (callback !== undefined) {
						callback (undefined, result, fields); //7/12/22 by DW
						}
					callLogCallback (undefined, result); //9/21/23 by DW
					}
				});
			}
		});
	}
function runSqltext (s, callback) {
	
	if (config === undefined) { //9/22/23 by DW
		debugger;
		}
	
	if (config.flQueueAllRequests) {
		queueQuery (s, callback);
		checkQueryQueue ();
		}
	else {
		if (ctCurrentQueries >= config.connectionLimit) {
			queueQuery (s, callback);
			}
		else {
			runQueryNow (s, callback);
			}
		}
	}

function queueQuery (s, callback) {
	sqlQueue.push ({s, callback});
	}
function checkQueryQueue () {
	if (sqlQueue.length > 0) {
		if (ctCurrentQueries < config.connectionLimit) {
			const query = sqlQueue.shift ();
			runQueryNow (query.s, function (err, val, fields) {
				if (query.callback !== undefined) {
					query.callback (err, val, fields);
					}
				});
			}
		}
	}
function getQueueLength () { //11/21/20 by DW -- used in the OPML tags app
	return (sqlQueue.length);
	}
function startQueryQueue () {
	setInterval (checkQueryQueue, config.millisecsBetwQueueRuns); //every tenth second
	}



function start (options, callback) {
	for (var x in options) { //9/22/23 by DW
		config [x] = options [x];
		}
	if (config.millisecsBetwQueueRuns === undefined) { //12/28/20 by DW
		config.millisecsBetwQueueRuns = 100;
		}
	if (config.flQueueAllRequests === undefined) { //1/9/23 by DW
		config.flQueueAllRequests = false;
		}
	if (config.flUseMySql2 === undefined) { //4/12/24 by DW
		config.flUseMySql2 = false;
		}
	
	console.log ("davesql.start: using " + ((config.flUseMySql2) ? "mysql2" : "mysql") + "."); //4/12/24 by DW
	mysql = (config.flUseMySql2) ? require ("mysql2") : require ("mysql"); //4/12/24 by DW
	
	if (config.flUseMySql2) { //6/27/24 by DW
		options.jsonStrings = true;
		}
	
	theSqlConnectionPool = mysql.createPool (options);
	
	startQueryQueue ();
	
	if (callback !== undefined) {
		callback ();
		}
	}
