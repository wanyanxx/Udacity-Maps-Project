var map;
var markers = [];
function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom: 13
    });
    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    var locations =[
      {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
      {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
      {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
      {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
      {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
      {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
    ];
    for(var i = 0; i < locations.length; i++){
      var position = locations[i].location;
      var title = locations[i].title;
      var marker = new google.maps.Marker({
          map:map,
          position:position,
          title:title,
          animation:google.maps.Animation.DROP,
          id:i
      });
      markers.push(marker);
      bounds.extend(markers[i].position);
      marker.addListener('click',function(){
        populateInfowindow(this,largeInfowindow);
      });
    }  
    map.fitBounds(bounds);
}
function populateInfowindow(marker,infowindow){
  if(infowindow.marker != marker){
      infowindow.marker = marker;
      infowindow.setContent(marker.title+marker.position);
      infowindow.open(map,marker);
      infowindow.addListener('closeclick',function(){
          infowindow.setMarker = null;
      });
      var streetViewService = new google.maps.StreetViewService();
      var radius =500;
      function getStreetView(data,status){
        if(status == google.maps.StreetViewStatus.OK){
            var nearStreetViewLocation = data.location.latLng;
            var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation,marker.position
            );
            infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
            var panoOptions = {
                position:nearStreetViewLocation,
                pov:{
                    heading:heading,
                    pitch:30.
                }
            };
            var panorama = new google.maps.StreetViewPanorama(
              document.getElementById('pano'), panoramaOptions);
            }else{
                infowindow.setContent('div'+marker.title+'</div>'+'<div>No Street View Found</div>');
        }
    }
    streetViewService.getPanoramaByLocation(marker.position,radius,getStreetView);
    infowindow.open(map,marker);
  };
};     
        
