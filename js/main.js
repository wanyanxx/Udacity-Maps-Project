var initialPlaces = [
    { title: 'Park Ave Penthouse', location: { lat: 40.7713024, lng: -73.9632393 } },
    { title: 'Chelsea Loft', location: { lat: 40.7444883, lng: -73.9949465 } },
    { title: 'Union Square Open Floor Plan', location: { lat: 40.7347062, lng: -73.9895759 } },
    { title: 'East Village Hip Studio', location: { lat: 40.7281777, lng: -73.984377 } },
    { title: 'TriBeCa Artsy Bachelor Pad', location: { lat: 40.7195264, lng: -74.0089934 } },
    { title: 'Chinatown Homey Space', location: { lat: 40.7180628, lng: -73.9961237 } }
];
var Place = function (data) {
    this.title = data.title;
    this.location = data.location;
}
var PlaceViewModel = function () {
    var self = this;
    var map;
    var infoWindow;
    this.places = ko.observableArray([]);
    this.markers = ko.observableArray([]);

    this.searchText = ko.observable('');

    //获取place列表
    this.placeList = ko.observableArray([]);
    initialPlaces.forEach(function (placeItem) {
        self.placeList.push(new Place(placeItem))
    })
    //点击place列表，使得marker跳动并显示infowindow
    this.currentPlace = ko.observable(this.placeList()[0]);
    this.placeClick = function (item) {
        var currentMarkerId = item.id;
        self.markers().forEach(function (item) {
            if (currentMarkerId == item.id) {
                item.marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function () {
                    item.marker.setAnimation(null);
                }, 1400);
                showInfowindow(item.id, item.marker);
            }
        })
    };
    //search place
    this.search = function () { };
    //reset
    this.reset = function () { };
    function initMap() {
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 40.7413549, lng: -73.9980244 },
            zoom: 13
        });
        var infowindow = new google.maps.InfoWindow();
        
    }

    function showInfowindow(marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent('');
            infowindow.open(map, marker);

            var streetViewService = new google.maps.StreetViewService();
            var radius = 50;
            function getStreetView(data, status) {
                if (status == google.maps.StreetViewStatus.OK) {
                    var nearStreetViewLocation = data.location.latLng;
                    var heading = google.maps.geometry.spherical.computeHeading(
                        nearStreetViewLocation, marker.position
                    );
                    infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                    var panoOptions = {
                        position: nearStreetViewLocation,
                        pov: {
                            heading: heading,
                            pitch: 30.
                        }
                    };
                    var panorama = new google.maps.StreetViewPanorama(
                        document.getElementById('pano'), panoramaOptions);
                } else {
                    infowindow.setContent('div' + marker.title + '</div>' + '<div>No Street View Found</div>');
                }
            }
            streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
            infowindow.open(map, marker);
        };
    };
    function addMarkers(places) {
        places.forEach(function (place) {
            var position = place.location;
            var title = place.title;
            var marker = new google.maps.Marker({
                map: map,
                position: position,
                title: title,
                animation: google.maps.Animation.DROP,
                
            });
            self.markers.push(marker);
            marker.addListener("click", function () {
                var that = this;
                that.setAnimation(google.maps.Animation.BOUNCE);

                setTimeout(function () {
                    marker.setAnimation(null);
                }, 1400);
                showInfowindow(this, infowindow);
            });
        })
    }
    //显示地图
    initMap();
    //显示markers
    addMarkers(initialPlaces);
};
function initPage() {
    ko.applyBindings(new PlaceViewModel());
}
//错误提示