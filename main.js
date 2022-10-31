/* jshint -W097 */// jshint strict:false
/* jslint node: true */
"use strict";

var xml2js = require('xml2js');
var utils = require(__dirname + '/lib/utils'); // Get common adapter utils

var request = require('request');

// Set the headers
var headers = {
    'User-Agent':       'User Agent/0.0.1',
    'Content-Type':     'application/x-www-form-urlencoded'
}

// you have to call the adapter function and pass a options object
// name has to be set and has to be equal to adapters folder name and main file
// name excluding extension
// adapter will be restarted automatically every time as the configuration
// changed, e.g system.adapter.mobile-alerts.0
var adapter = utils.adapter('mobile-alerts');

// is called when adapter shuts down - callback has to be called under any
// circumstances!
adapter.on('unload', function(callback) {
	try {
		adapter.log.debug('cleaned everything up...');
		callback();
	} catch (e) {
		callback();
	}
});

// is called if a subscribed object changes
adapter.on('objectChange', function(id, obj) {
	// Warning, obj can be null if it was deleted
	adapter.log.debug('objectChange ' + id + ' ' + JSON.stringify(obj));
});

// is called if a subscribed state changes
adapter.on('stateChange', function(id, state) {
	// Warning, state can be null if it was deleted
	
	adapter.log.debug('stateChange ' + id + ' ' + JSON.stringify(state));

	// you can use the ack flag to detect if it is status (true) or command
	// (false)
	if (state && !state.ack) {
		adapter.log.debug('ack is not set!');
	}
});

// Some message was sent to adapter instance over message box. Used by email,
// pushover, text2speech, ...
adapter.on('message', function(obj) {
	if (typeof obj == 'object' && obj.message) {
		if (obj.command == 'send') {
			// e.g. send email or pushover or whatever
			console.log('send command');

			// Send response in callback if required
			if (obj.callback)
				adapter.sendTo(obj.from, obj.command, 'Message received', obj.callback);
		}
	}
});

// is called when databases are connected and adapter received configuration.
// start here!
adapter.on('ready', function() {
	main();
});

function main() {
	var methodName = "main";
	adapter.log.debug("in:  " + methodName + " v0.5.1");

	// All states changes inside the adapter's namespace are subscribed
	adapter.subscribeStates('*');

	var ma_hostname = adapter.config.hostname;
	var ma_phoneId = adapter.config.phoneId;
	var ma_path = adapter.config.path;
	var ma_extractNumbers = adapter.config.extractNumbers;
	
	// Configure the request
	var options = {
    	url: 'https://' + ma_hostname + ma_path,
	    method: 'POST',
    	headers: headers,
	    form: {'phoneid': ma_phoneId}
	}

	request(options, function (error, response, body) {
	  	if (error || response.statusCode != 200) {
	  		if (error !== null) { adapter.log.error('error: ' + error); }
	  		adapter.log.error('response.statusCode: ' + response.statusCode);
  			adapter.log.debug('body: ' + body);
  			adapter.log.error('Exit: No valid response from Mobile Alerts server');
			setTimeout(function() {
				process.exit(-2);
			}, 2000);
  		} else {
			adapter.log.debug('Data received from Mobile Alerts server');
			var data = body.toString().match(/(<h[45]>.*<\/h[45]>|<\/?body>|<a .*deviceid=.*<\/a>)/gim);
			
			if (!data || !data.toString()) {
				setTimeout(function() {
  					adapter.log.error('Exit: Data not matched');
  					adapter.log.debug('body: ' + body);
					process.exit(-3);
				}, 2000);
			} else {
				parseData(data.toString());
			}
		}
	});

	// Force terminate
	setTimeout(function() {
		adapter.log.error('Exit: Timeout. Termination forced!');
		process.exit(-1);
	}, 4 * 60000);

	adapter.log.debug("out: " + methodName);
}

function parseData(xml) {
	var methodName = "parseData";
	adapter.log.debug("in:  " + methodName);
	adapter.log.debug("parameter: xml: " + xml);

	var options = {
	  explicitArray : false,
	  mergeAttrs : true
	};

	var parser = new xml2js.Parser(options);
	parser.parseString(xml, function(err, result) {

		if (err || result == undefined || (result.a == undefined || result.h4 == undefined || result.h5 == undefined)) {
			var msg;
			if (err) {
				msg = err;
			} else {
				adapter.log.debug("result: " + JSON.stringify(result));
				msg = "Matching HTML tags not found";
			}
			adapter.log.error("parseString error: " + msg);

		} else {

			adapter.log.debug("result: " + JSON.stringify(result));

			setDevices(result);
			setObjects(result);
			setStates(result);
		}

	});

	setTimeout(function() {
		process.exit(0);
	}, 10000);

	adapter.log.debug("out: " + methodName);

}

function setDevices(result) {
	var methodName = "setDevices";
	adapter.log.debug("in:  " + methodName);

	var i = 0;
	var deviceId = "";

	while (result.a[i] != undefined) {

		var deviceName = result.a[i]["#"].trim();
		var href = result.a[i]["href"];
		var deviceId = getHrefParamValue(href, "deviceid");

		adapter.log.debug(deviceName + ": " + deviceId);

		adapter.setObjectNotExists(deviceId, {
		  type : 'device',
		  common : {
		    name : deviceName,
		    type : 'string',
		    role : 'sensor',
		    ack : true
		  },
		  native : {}
		});
		
		i++;
	}

	adapter.log.debug("out: " + methodName);
}

function setObjects(result) {
	var methodName = "setObjects";
	adapter.log.debug("in:  " + methodName);

	var i = 0;
	var deviceId = "";

	while ((result.a[i] != undefined || result.h4[i] != undefined || result.h5[i] != undefined)) {

		if (result.h4[i] != undefined && result.h4[i] != undefined) {
			var key = result.h5[i];
			var value = result.h4[i];

			if (key == "ID") {
				deviceId = value;

			} else {
				var normalizedKey = normalize(key);
				adapter.setObjectNotExists(deviceId + "." + normalizedKey, {
				  type : 'state',
				  common : {
				    name : key,
				    type : 'string',
				    role : 'data',
				    ack : true
				  },
				  native : {}
				});

			}

		}

		i++;
	}

	adapter.log.debug("out: " + methodName);
}

function setStates(result) {
	var methodName = "setStates";
	adapter.log.debug("in:  " + methodName);

	var i = 0;
	var deviceId = "";

	while ((result.a[i] != undefined || result.h4[i] != undefined || result.h4[i] != undefined)) {

		if (result.h4[i] != undefined && result.h4[i] != undefined) {
			var key = result.h5[i];
			var value = result.h4[i];

			if (key == "ID") {
				deviceId = value;
			} else {
				adapter.setState(deviceId + "." + normalize(key), {
				  val : formatNum(value),
				  ack : true
				});
			}
		}

		i++;
	}

	adapter.log.debug("out: " + methodName);
}

// Utils

function formatNum(s) {

	if (extractNumbers == undefined) {
		var extractNumbers = adapter.config.extractNumbers;
		if (extractNumbers && patternNumber == undefined) {
			var patternNumber = /^(-|\+)?\d+(,|\.)?\d* *(C|F|%|mm|km\/h|hPa|m/s)$/;
		}
	}

	if (extractNumbers && patternNumber.test(s)) {
		s = s.replace(",", ".");
		s = parseFloat(s).toString();
	}
	return s;
}

function normalize(s) {
	s = s.toLowerCase();
	s = s.replace(" ", "_");
	s = s.replace("ä", "ue");
	s = s.replace("ö", "oe");
	s = s.replace("ü", "üe");
	s = s.replace("ß", "ss");
	return s;
}

function getHrefParamValue(href, paramName) {
	var paramValue;
	var params = href.split("?")[1];

	params = params.split("&");
	for (var i = 0; i < params.length; i++) {
		var param = params[i].split("="); // ['this','true'], ...
		if (param[0] == paramName) {
			paramValue = param[1];
			break;
		}
	}
	return paramValue;
}
