var request = require('request');
var accessToken;
var clientId;
var searchBaseUrl = "https://api.instagram.com/v1/media/search";
var userMediaSearchBaseUrlBegin = "https://api.instagram.com/v1/users/";
var userMediaSearchBaseUrlEnd = "/media/recent?count=-1";

function setSecrets(secrets){
	accessToken = secrets.accessToken;
	clientId = secrets.clientId;
}

function instagramSearch(fun, lat, lng, radius, minTs){
	var paramsRequest = {
					"access_token" : accessToken,
					"lat" : lat,
					"lng" : lng,
					"distance" : radius,
					"min_timestamp" : minTs
				};

	var options = {
		url: searchBaseUrl,
		method: 'GET',
		qs: paramsRequest
	};

	request(options, fun);
}

function instagramUserSearch(fun, userId){
	var paramsRequest = {
					"access_token" : accessToken
				};
	
	var url = userMediaSearchBaseUrlBegin + userId + userMediaSearchBaseUrlEnd;
	
	var options = {
		url: url,
		method: 'GET',
		qs: paramsRequest
	};

	request(options, fun);
}

module.exports = {
  instagramSearch: instagramSearch,
  instagramUserSearch: instagramUserSearch,
  initialize: setSecrets
};