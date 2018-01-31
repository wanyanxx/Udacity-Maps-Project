var initialPlaces = [
    { title: 'Park Ave Penthouse', location: { lat: 40.7713024, lng: -73.9632393 }, id: 1 },
    { title: 'Chelsea Loft', location: { lat: 40.7444883, lng: -73.9949465 }, id: 2 },
    { title: 'Union Square Open Floor Plan', location: { lat: 40.7347062, lng: -73.9895759 }, id: 3 },
    { title: 'East Village Hip Studio', location: { lat: 40.7281777, lng: -73.984377 }, id: 4 },
    { title: 'TriBeCa Artsy Bachelor Pad', location: { lat: 40.7195264, lng: -74.0089934 }, id: 5 },
    { title: 'Chinatown Homey Space', location: { lat: 40.7180628, lng: -73.9961237 }, id: 6 }
];
var Place = function (data) {
    this.title = data.title;
    this.location = data.location;
    this.id = data.id;
}

function toggleBounce(marker) {
    if (marker.getAnimation !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}

var PlaceViewModel = function () {
    var self = this;
    var map;
    var infowindow = new google.maps.InfoWindow();
    this.places = ko.observableArray();
    self.markerList = ko.observableArray();
    this.id = ko.observableArray();
    this.searchText = ko.observable('');
    //获取place列表
    this.placeList = ko.observableArray();
    initialPlaces.forEach(function (placeItem) {
        self.placeList.push(new Place(placeItem))
    })
    this.filter = function () {
        var inputText = this.searchText();
        if (inputText != '') {
            self.placeList([]);
            for (var i = 0; i < initialPlaces.length; i++) {
                if (initialPlaces[i].title == inputText) {
                    self.placeList.push(initialPlaces[i]);
                    for (var j = 0; j < self.markerList().length; j++) {
                        if (initialPlaces[i].id !== self.markerList()[j].id) {
                            self.markerList()[j].setVisible(false);
                        }
                    }
                }
            }
        } else if (inputText == '') {
            self.placeList([]);
            initialPlaces.forEach(function (placeItem) {
                self.placeList.push(new Place(placeItem))
            })
            for (let i = 0; i < self.markerList().length; i++) {
                self.markerList()[i].setVisible(true);
            }
        }
    }
    //点击place列表，使得marker跳动并显示infowindow
    this.placeClick = function (place) {
        for (var i = 0; i < self.markerList().length; i++) {
            if (self.markerList()[i].id == place.id) {
                var that = self.markerList()[i];
                self.markerList()[i].setAnimation(google.maps.Animation.BOUNCE);
                showInfowindow(that, infowindow);
                setTimeout(function () {
                    that.setAnimation(null);
                }.bind(that), 1400)
            }
        }
    };

    function addItemMarkers(place) {
        var position = place.location;
        var title = place.title;
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
        });
        // self.markers.push(marker);
        marker.addListener("click", function () {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            showInfowindow(marker, infowindow);
            setTimeout(function () {
                marker.setAnimation(null);
            }.bind(marker), 1400)
        });
    }

    function initMap() {
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 40.7413549, lng: -73.9980244 },
            zoom: 13,
        });
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
                        document.getElementById('pano'), panoOptions);
                } else {
                    infowindow.setContent('div' + marker.title + '</div>' + '<div>No Street View Found</div>');
                }
            }
            streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
            infowindow.open(map, marker);
        };
    };
    function addMarkers(places) {
        var myObservableArray = ko.observableArray();
        places.forEach(function (place) {
            var position = place.location;
            var title = place.title;
            var marker = new google.maps.Marker({
                map: map,
                position: position,
                title: title,
                animation: google.maps.Animation.DROP,
                id: place.id,
            });
            self.markerList.push(marker);
            marker.addListener("click", function () {
                marker.setAnimation(google.maps.Animation.BOUNCE);
                showInfowindow(marker, infowindow);
                setTimeout(function () {
                    marker.setAnimation(null);
                }.bind(marker), 1400)
            });
        })
    }


    //显示地图
    initMap();
    //显示markers
    addMarkers(initialPlaces);
}
function initPage() {
    ko.applyBindings(new PlaceViewModel());
}
//错误提示
