var serverUrl = 'http://localhost:8080';

var twitterMarkerOptions = {
	animation: google.maps.Animation.DROP,
	zIndex: 1,
	icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
};

function twitterSearch(latitude, longitude, radius){
	var url = serverUrl + '/SocialMedia/Twitter/?lat=' + latitude + '&lng=' + longitude + '&radius=' + Math.round(radius/1000);
	$.ajax({
		type: "GET",
		dataType: "json",
		url: url,
		success: onTwitterSearchSuccess 
    });
}

function twitterUserSearch(userId){
	var url = serverUrl + '/SocialMedia/Twitter/?userId=' + userId;
	$.ajax({
		type: "GET",
		dataType: "json",
		url: url,
		success: onTwitterUserSearchSuccess 
    });
}
function onTwitterUserSearchSuccess(jsonResponse){
	clearElementsOnMap();
	showTweets({"statuses" : jsonResponse});
}

function compareDatesDescending(a,b) {
  if (a.created_at > b.created_at)
     return -1;
  if (a.created_at < b.created_at)
    return 1;
  return 0;
}

function filterByCreatedDate(element){
	var minTs = Math.round(((new Date().getTime()) - (document.getElementById("minTimestampMinutes").value)*60*1000) / 1000);
	var elementTs = Math.round((new Date(Date.parse(element.created_at.replace(/( +)/, ' UTC$1'))).getTime()) / 1000);
	if(elementTs >= minTs){
		return true;
	}
	return false;
}

function onTwitterSearchSuccess(jsonResponse){
	jsonResponse.statuses = jsonResponse.statuses.sort(compareDatesDescending);
	jsonResponse.statuses = jsonResponse.statuses.filter(filterByCreatedDate);
	showTweets(jsonResponse);
}

function showTweets(jsonResponse){
console.log(jsonResponse);
for(var i=0; i < jsonResponse.statuses.length; i++){
		var location = jsonResponse.statuses[i].coordinates;
		if(location){
			var timestamp = new Date(Date.parse(jsonResponse.statuses[i].created_at.replace(/( +)/, ' UTC$1')));
			var date =timestamp;
			var twitterId =  jsonResponse.statuses[i].id_str;
			var userId = jsonResponse.statuses[i].user.id_str;
			var twitterElement = '<li id="'+ twitterId +'" class="socialResult">' +
									'<div class="twitterThumbnailContainer">' +
										'<img class="twitterThumbnail" src="' + jsonResponse.statuses[i].user.profile_image_url.replace("_normal", "_bigger") + '"/>' +
									'</div> ' +
									'<div class="twitterDescriptionContainer">' +
										'<p class="twitter-user">by ' + jsonResponse.statuses[i].user.screen_name +
										'<p>'+ jsonResponse.statuses[i].text + '</p>' +
										'<p>at ' + date.toLocaleTimeString() + ' of ' + date.toLocaleDateString() + '</p>' +
										'<p><a target="_blank" href="' + "https://twitter.com/" + jsonResponse.statuses[i].user.screen_name + "/status/" + twitterId + '">Link to original</a> | <a class="ShowInfoWindowOnMap" href="#">Show on Map</a> | <a class="analyze-user" href="#">AnalyzeUser</a></p>' +
									'</div>' +
								'</li>';

			$("#socialResults").append(twitterElement);
			twitterMarkerOptions.map = map;
			twitterMarkerOptions.position = new google.maps.LatLng(location.coordinates[1], location.coordinates[0]);
			var twitterMarker = new google.maps.Marker(twitterMarkerOptions);

			twitterMarkers.push(twitterMarker);

			var instagramInfowindow = new google.maps.InfoWindow();
			instagramInfowindow.setContent(twitterElement);
			(function(twitterMarker, instagramInfowindow, twitterId){google.maps.event.addListener(twitterMarker, 'click', function() {
				ScrollToInstagram(twitterId);
			});
			
			$('a.ShowInfoWindowOnMap').last().click({twitterMarker: twitterMarker, instagramInfowindow: instagramInfowindow, twitterId: twitterId}, function(e){
				ScrollToInstagram(e.data.twitterId);
				ShowInfoWindowOnMap(e.data.twitterMarker, e.data.instagramInfowindow);
			});})(twitterMarker, instagramInfowindow, twitterId);

			(function(userId){
			$('a.analyze-user').last().click({userId: userId}, function(e){
				twitterUserSearch(userId);
			});})(userId);
		}
	}

	/*enable marker clusterer when doing analysis of user*/
	/*var markererClusterer = new MarkerClusterer(map, instagramMarkers);*/
}