var searchApiUrl = "https://api.twitter.com/1.1/search/tweets.json";
var userSearchApiUrl = "https://api.twitter.com/1.1/statuses/user_timeline.json";
var oauthConsumerKey;
var oauthNonce;
var oauthSignature;
var oauthSignatureMethod = "HMAC-SHA1";
var oauthTimestamp;
var oauthToken;
var oauthVersion = "1.0";
var consumerSecret;
var oauthTokenSecret;
var oauth_signature;
var allParameters = [];
var tools = require('./sha1');
var request = require('request');

function setSecrets(secrets){
	oauthConsumerKey = secrets.oauthConsumerKey;
	oauthToken = secrets.oauthToken;
	consumerSecret = secrets.consumerSecret;
	oauthTokenSecret = secrets.oauthTokenSecret;
}

function twitterSearch(fun, latitude, longitude, radius){
	
	var paramsRequest = {
					"q" : "",
					"geocode" : latitude + ',' + longitude + ',' + radius + "km",
					"result_type" : "recent",
					"include_entities" : "true",
					"count" : "100"
				};

	var params = objectToListOfKvp(paramsRequest);

	var headers = {
		'Authorization': getHeader("GET", searchApiUrl, params)
	};

	var options = {
		url: searchApiUrl,
		method: 'GET',
		headers: headers,
		qs: paramsRequest
	};

	request(options, fun);
}

function twitterUserSearch(fun, userId){
	
	var paramsRequest = {
					"user_id" : userId,
					"include_rts" : "1",
					"count" : 100
				};
				
	var params = objectToListOfKvp(paramsRequest);
	
	var headers = {
		'Authorization': getHeader("GET", userSearchApiUrl, params)
	};

	var options = {
		url: userSearchApiUrl,
		method: 'GET',
		headers: headers,
		qs: paramsRequest
	};
	
	request(options, fun);
}

function objectToListOfKvp(obj){
	var list = [];
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) {
			list.push([key, obj[key]]);
		}
	}
	return list;
}

function percentEncode(s) {
  if (s === null) {
    return "";
  }

  if (s instanceof Array) {
    var e = "";
    for (var i = 0; i < s.length; ++s) {
      if (e !== ""){
        e += '&';
      }
      e += OAuth.percentEncode(s[i]);
    }
    return e;
  }
  s = encodeURIComponent(s);
  // Now replace the values which encodeURIComponent doesn't do
  // encodeURIComponent ignores: - _ . ! ~ * ' ( )
  // OAuth dictates the only ones you can ignore are: - _ . ~
  // Source: http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Functions:encodeURIComponent
  s = s.replace(/\!/g, "%21");
  s = s.replace(/\*/g, "%2A");
  s = s.replace(/\'/g, "%27");
  s = s.replace(/\(/g, "%28");
  s = s.replace(/\)/g, "%29");
  return s;
}

function generateOauthNonce(){
	var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        var result = "";
        for (var i = 0; i < 32; ++i) {
            var rnum = Math.floor(Math.random() * chars.length);
            result += chars.substring(rnum, rnum+1);
        }
		
        return result;
}

function getTimestamp(){
        var t = new Date().getTime();
        return Math.floor(t / 1000);
}

function generateSignature(HttpMethod, baseUrl, parameters){
	var key, value;
	var parametersString = "", signatureBaseString = "";
	oauthTimestamp = getTimestamp();
	oauthNonce = generateOauthNonce();
	allParameters = [
						["oauth_consumer_key", oauthConsumerKey],
						["oauth_nonce", oauthNonce],
						["oauth_signature_method", oauthSignatureMethod],
						["oauth_timestamp", oauthTimestamp],
						["oauth_token", oauthToken],
						["oauth_version", oauthVersion]
					];

	for(var i=0; i<parameters.length; i++){
		allParameters.push([parameters[i][0], parameters[i][1]]);
	}
	
	allParameters = allParameters.sort(
		function(a,b){
			if(a[0].toLowerCase() < b[0].toLowerCase()) return -1;
			if(a[0].toLowerCase() > b[0].toLowerCase()) return 1;
			return 0;
		});

	for(i=0; i<allParameters.length; i++){
		parametersString = parametersString + percentEncode(allParameters[i][0]) + '='+ percentEncode(allParameters[i][1]) + '&';
	}
	parametersString = parametersString.substr(0, parametersString.length - 1);
	
	signatureBaseString = HttpMethod.toUpperCase() + '&' + percentEncode(baseUrl) + '&' + percentEncode(parametersString);
	
	signingKey = percentEncode(consumerSecret) + '&' + percentEncode(oauthTokenSecret);
	
	oauth_signature = tools.sha1_encrypt(signingKey, signatureBaseString);
	oauth_signature = oauth_signature + "=";
}

function getHeader(HttpMethod, baseUrl, parameters){
	generateSignature(HttpMethod, baseUrl, parameters);
	var headerString = "OAuth ";
	var headerParams = [
							["oauth_consumer_key", oauthConsumerKey],
							["oauth_nonce", oauthNonce],
							["oauth_signature", oauth_signature],
							["oauth_signature_method", oauthSignatureMethod],
							["oauth_timestamp", oauthTimestamp],
							["oauth_token", oauthToken],
							["oauth_version", oauthVersion]
						];
	for(var i = 0; i < headerParams.length; i++){
		headerString = headerString + (headerParams[i][0]) + '=' + '"' + percentEncode(headerParams[i][1]) + '"' + ', ';
	}
	headerString = headerString.substr(0, headerString.length - 2);

	return headerString;
}

module.exports = {
  twitterSearch: twitterSearch,
  twitterUserSearch: twitterUserSearch,
  initialize: setSecrets
};