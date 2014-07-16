var restify = require('restify');
var fs = require('fs');
var twitterTools = require('./twitterTools');
var instagramTools = require('./instagramTools');
var server = restify.createServer();
server.use(restify.queryParser());
server.use(restify.CORS());

server.get('/SocialMedia/Twitter/:query', TwitterSearch);
server.get('/SocialMedia/Instagram/:query', InstagramSearch);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});

fs = require('fs')
fs.readFile('./secrets.json', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  var secrets = JSON.parse(data);
  twitterTools.initialize(secrets.twitter);
  instagramTools.initialize(secrets.instagram);
});

function TwitterSearch(req, res, next){
	if(req.query.lat && req.query.lng && req.query.radius){
		twitterTools.twitterSearch(
			function(error, response, body){
				//res.header("Access-Control-Allow-Origin", "*");
				res.writeHead(200, {
					'Content-Length': Buffer.byteLength(body),
					'Content-Type': 'application/json'
				});
				res.write(body);
				res.end();
			}, req.query.lat, req.query.lng, req.query.radius);
	}
	
	if(req.query.userId){
		twitterTools.twitterUserSearch(
		function(error, response, body){
				//res.header("Access-Control-Allow-Origin", "*");
				res.writeHead(200, {
					'Content-Length': Buffer.byteLength(body),
					'Content-Type': 'application/json'
				});
				res.write(body);
				res.end();
			}, req.query.userId);	
	}
}

function InstagramSearch(req, res, next){
	if(req.query.lat && req.query.lng && req.query.radius && req.query.minimumTimestamp){
		instagramTools.instagramSearch(
			function(error, response, body){
				res.writeHead(200, {
					'Content-Length': Buffer.byteLength(body),
					'Content-Type': 'application/json'
				});
				res.write(body);
				res.end();
			}, req.query.lat, req.query.lng, req.query.radius, req.query.minimumTimestamp);
	}
	
	if(req.query.userId){
		instagramTools.instagramUserSearch(
		function(error, response, body){
				//res.header("Access-Control-Allow-Origin", "*");
				res.writeHead(200, {
					'Content-Length': Buffer.byteLength(body),
					'Content-Type': 'application/json'
				});
				res.write(body);
				res.end();
			}, req.query.userId);	
	}
}

function writeToFile(string){
	fs.writeFile("C:\Users\sandaloro\Documents\Maps Api Test", string, function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("The file was saved!");
    }
	}); 
}
