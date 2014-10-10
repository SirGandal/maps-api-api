var instagramMarkers = [];
var twitterMarkers = [];
var lastAnimatedMarker;
var lastSelectedId;
var lastCircleDrawn;
var lastMarkerDrawn;

function clearElementsOnMap(){
  $("#socialResults").empty();
  if(instagramMarkers.length > 0){
    for(var i in instagramMarkers){
      instagramMarkers[i].setMap(null);
    }
  }

  if(twitterMarkers.length > 0){
    for(var i in twitterMarkers){
      twitterMarkers[i].setMap(null);
    }
  }
  
  if(lastCircleDrawn !== undefined){
    lastCircleDrawn.setMap(null);
  }
  if(lastMarkerDrawn !== undefined){
    lastMarkerDrawn.setMap(null);
  }
}
