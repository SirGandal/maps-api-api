var map;
var drawingManager;
var polyOptions = {
  strokeColor: '#FF0000',
  strokeOpacity: 1.0,
  strokeWeight: 3
};
var customPushPinIcon = {
  url: "http://openclipart.org/image/800px/svg_to_png/169046/1332525054.png",
  scaledSize: new google.maps.Size(20, 30),
  origin: new google.maps.Point(0,0),
  anchor: new google.maps.Point(10, 30)
};
var markerOptions = {
  icon: customPushPinIcon,
  animation: google.maps.Animation.DROP,
  zIndex: 1,
};
var circleOptions = {
  fillColor: '#000000',
  fillOpacity: 0.1,
  strokeWeight: 1,
  clickable: true,
  zIndex: 1,
  editable: false,
  draggable: false
};
var poly = new google.maps.Polyline(polyOptions);
google.maps.event.addDomListener(window, 'load', initialize);

window.onload = function(){
  document.getElementById("areaOfInterestButton").onclick = function () {
    clearElementsOnMap();
    drawingManager.setOptions({
      drawingMode: google.maps.drawing.OverlayType.CIRCLE
    });
  };

  document.getElementById("aroundMeButton").onclick = function () {
    clearElementsOnMap();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position){
        var location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        var geocoder = new google.maps.Geocoder();

        var locationMarkerOptions = markerOptions;
        locationMarkerOptions.map = map;
        locationMarkerOptions.position = location;
        var marker = new google.maps.Marker(locationMarkerOptions);
        drawCircleOnMap(location, 1000);

        lastMarkerDrawn = marker;

        instagramSearch(location.lat(), location.lng(), 1000);
      });
    } else {
      alert("geolocation not supported in this browser");
    }
  };
};

function initialize() {
  var mapOptions = {
    center: new google.maps.LatLng(48.428482, -123.370628),
    zoom: 13
  };
  map = new google.maps.Map(document.getElementById("map-canvas"),
    mapOptions);
/*
  google.maps.event.addDomListener(document.getElementById('control-ui'), 'click', function() {
    clearElementsOnMap();
    drawingManager.setOptions({
      drawingMode: google.maps.drawing.OverlayType.CIRCLE
    });
  });

  var controlDiv = document.getElementById('map-controls');
  controlDiv.index = 1;
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);*/

  poly.setMap(map);

  drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.CIRCLE,
    drawingControl: false,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [
      google.maps.drawing.OverlayType.MARKER,
      google.maps.drawing.OverlayType.CIRCLE
      ]
    },

    markerOptions:  markerOptions,

    circleOptions: circleOptions
  });

  drawingManager.setMap(map);

  google.maps.event.addListener(drawingManager, 'circlecomplete', function(circle) {
    drawingManager.setDrawingMode(null);
    var c = new google.maps.Circle(circle);
    lastCircleDrawn = circle;
    instagramSearch(circle.center.lat(), circle.center.lng(), circle.radius);
    twitterSearch(circle.center.lat(), circle.center.lng(), circle.radius);
  });

  google.maps.event.addListener(drawingManager, 'markercomplete', function(marker) {
    lastMarkerDrawn = marker;
    drawingManager.setDrawingMode(null);
    drawCircleOnMap(marker.getPosition(), parseInt(document.getElementById("dropPinRadius").value, 10));
    instagramSearch(marker.getPosition().lat(), marker.getPosition().lng(), parseInt(document.getElementById("dropPinRadius").value, 10));
  });
}

function drawCircleOnMap(center, radius){
  var drawCircleOptions = circleOptions;
  drawCircleOptions.map = map;
  drawCircleOptions.center = center;
  drawCircleOptions.radius = radius;

  var pushPinCircle = new google.maps.Circle(drawCircleOptions);
  lastCircleDrawn = pushPinCircle;
}