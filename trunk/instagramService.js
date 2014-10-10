var serverUrl = 'http://localhost:8080';
var lastOpenedInfoWindow;
var lastSelectedInstagramId;
var instagramMarkerOptions = {
	animation: google.maps.Animation.DROP,
	zIndex: 1,
	icon: "http://maps.google.com/mapfiles/ms/icons/orange-dot.png"
};

function instagramSearch(lat, lng, radius){	
	var url = serverUrl + '/SocialMedia/Instagram/?lat=' + lat + '&lng=' + lng + '&radius=' + radius + "&minimumTimestamp=" + Math.round(((new Date().getTime()) - (document.getElementById("minTimestampMinutes").value)*60*1000) / 1000);
	
	$.ajax({
		type: "GET",
		dataType: "json",
		url: url,
		success: onSuccess 
    });
}

function userMediaSearch(userId){	
	var url = serverUrl + '/SocialMedia/Instagram/?userId=' + userId;
	
	$.ajax({
		type: "GET",
		dataType: "json",
		url: url,
		success: onUserMediaSearchSuccess
    });
}

function onUserMediaSearchSuccess(jsonResponse){
	console.log(jsonResponse);
	clearElementsOnMap();
	onSuccess(jsonResponse);
}

function ShowInfoWindowOnMap (instagramMarker, instagramInfowindow) {
	instagramInfowindow.open(map, instagramMarker);
	if(lastOpenedInfoWindow && lastOpenedInfoWindow !== instagramInfowindow){
		lastOpenedInfoWindow.close();
	}
	lastOpenedInfoWindow = instagramInfowindow;
}

function ScrollToInstagram(instagramId){
	if(lastOpenedInfoWindow){
		lastOpenedInfoWindow.close();
	}

	if(lastSelectedInstagramId){
		$('#' + lastSelectedInstagramId).css("background-color", "");
	}
	lastSelectedInstagramId = instagramId;
	$('#' + instagramId).css("background-color", "rgba(235, 217, 15, 0.28)");
	var container = $(".social-container"), scrollTo = $('#' + instagramId);

	container.animate({
		scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
	});
}

function onSuccess(jsonResponse){
	for(var i=0; i < jsonResponse.data.length; i++){
		var location = jsonResponse.data[i].location;
		if(location){
			var timestamp = parseInt(jsonResponse.data[i].created_time, 10);
			var date = new Date(timestamp*1000);
			var instagramId =  jsonResponse.data[i].id;
			var userId = jsonResponse.data[i].user.id;
			var imgThumbnail = jsonResponse.data[i].images.thumbnail.url;
			var username = jsonResponse.data[i].user.username;
			var caption = (jsonResponse.data[i].caption !== null ? jsonResponse.data[i].caption.text : "empty");
			var linkToOriginal = jsonResponse.data[i].link;

			var instagramElement = '<div id="'+ instagramId +'">' +
									'<div class="instagramThumbnailContainer">' +
										'<img class="instagramThumbnail" src="' + imgThumbnail + '"/>' +
									'</div> ' +
									'<div class="instagramDescriptionContainer">' +
										'<p class="instagram-user">by ' + username  +
										'<p>'+ caption + '</p>' +
										'<p>at ' + date.toLocaleTimeString() + ' of ' + date.toLocaleDateString() + '</p>' +
										'<p><a target="_blank" href="' + linkToOriginal + '">Link to original</a> | <a class="ShowInfoWindowOnMap" href="#">Show on Map</a> | <a class="analyze-user" href="#">AnalyzeUser</a></p>' +
									'</div>' +
								'</li>';

			//$("#socialResults").append(instagramElement);
			instagramMarkerOptions.map = map;
			var markerPosition = new google.maps.LatLng(location.latitude, location.longitude);
			instagramMarkerOptions.position = markerPosition;
			var instagramMarker = new google.maps.Marker(instagramMarkerOptions);

			instagramMarkers.push(instagramMarker);

			(function(instagramMarker, instagramElement, instagramId){
				google.maps.event.addListener(instagramMarker, 'click', function() {
					if(lastAnimatedMarker !== undefined && lastAnimatedMarker !== instagramMarker){
						lastAnimatedMarker.setAnimation(null)
					}
					
					lastAnimatedMarker = instagramMarker;
					instagramMarker.setAnimation(google.maps.Animation.BOUNCE);	
					
					if(lastSelectedId !== undefined){
						$('#'+lastSelectedId).remove();
					}

					lastSelectedId = instagramId;

					$('.selected-social-result').append(instagramElement);
					$('.selected-social-result').removeClass('hide');
					$('.close.hide').addClass('close').removeClass('hide')
					$('.close').click(function(){
						if(lastAnimatedMarker !== undefined){
							lastAnimatedMarker.setAnimation(null)
						}
						$('.selected-social-result').addClass('hide');
					});
				});
			})(instagramMarker, instagramElement, instagramId);

			(function(userId){
				$('a.analyze-user').last().click({userId: userId}, function(e){
					userMediaSearch(userId);
				});
			})(userId);
		}
	}
	
	//var markerCluster = new MarkerClusterer(map, instagramMarkers);

	/*enable marker clusterer when doing analysis of user*/
	/*var markererClusterer = new MarkerClusterer(map, instagramMarkers);*/
}