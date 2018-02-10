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
    });

    this.url = ko.observable("img/menu1.png");
    this.isShowing = ko.observable(true);
    this.hidden = function () {
        self.isShowing(!self.isShowing());
        if (self.url() == 'img/menu1.png') {
            self.url('img/menu.png');
        } else {
            self.url('img/menu1.png');
        }
    }


    this.filter = function () {
        infowindow.close();
        var inputText = this.searchText().toLocaleLowerCase();
        if (inputText != '') {
            self.placeList([]);
            for (var i = 0; i < initialPlaces.length; i++) {
                console.log('1');
                var placeItemTitle = initialPlaces[i].title.toLocaleLowerCase();
                if (placeItemTitle.indexOf(inputText) !== -1) {
                    self.placeList.push(initialPlaces[i]);
                    self.markerList()[i].marker.setVisible(true);
                } else {
                    console.log(self.markerList()[i].title);
                    self.markerList()[i].marker.setVisible(false);
                }
            }
        } else {
            self.placeList([]);
            initialPlaces.forEach(function (placeItem) {
                self.placeList.push(new Place(placeItem))
            });
            self.markerList().forEach(function (place) {
                place.marker.setVisible(true);
            });
        }
    }


    //点击place列表，使得marker跳动并显示infowindow
    this.placeClick = function (place) {

        for (var i = 0; i < self.markerList().length; i++) {
            var marker = self.markerList()[i].marker;
            if (marker.id == place.id) {
                var that = marker;
                marker.setAnimation(google.maps.Animation.BOUNCE);
                showInfowindow(that, infowindow);
                setTimeout(function () {
                    that.setAnimation(null);
                }.bind(that), 1400)
            }
        }
    };

    function initMap() {
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 40.7413549, lng: -73.9980244 },
            zoom: 13,
        });

        infowindow = new google.maps.InfoWindow({ maxWidth: 300 });
        self.places(initialPlaces);
        //显示markers
        addMarkers(initialPlaces);
    }

    function showInfowindow(placeItem, infowindow) {
        //var wikipediaUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + encodeURIComponent(placeItem.title) + '&format=json&callback=wikiCallback&profile=fuzzy';
        var wikipediaUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + placeItem + '&format=json&callback=wikiCallback';
        //错误提示
        /* var wikiRequestTimeout = setTimeout(function () {
            infowindow.setContent('failed to get wikipedia resource');
        }, 6000); */
        infowindow.open(map, placeItem);
        $.ajax({
            url: wikipediaUrl,
            dataType: "jsonp",
            success: function (response) {
                var wikiElem = '';
                var articleList = response[1];
                if (articleList.length != 0) {
                    for (var i = 0; i < articleList.length; i++) {
                        var articleStr = articleList[i];
                        var url = 'https://en.wikipedia.org/wiki/' + articleStr;
                        wikiElem += '<li><a href="' + url + '">' + articleStr + '</a></li>';
                    };
                    infowindow.setContent('<div>' + placeItem.title + '</div><h3>Wikipedia Links</h3><ul>' + wikiElem + '</ul>');
                } else {
                    infowindow.setContent('div' + placeItem.title + '</div>' + '<h3>No Wikipedia Link Found</h3>')
                }
                //clearTimeout(wikiRequestTimeout);
            },
            timeout: 6000,
            error: function () {
                infowindow.setContent('Failed to get wikipedia resource');
            }
        })
    }

    function addMarkers(places) {
        var myObservableArray = ko.observableArray();
        places.forEach(function (place) {
            var position = place.location;
            var title = place.title;
            var id = place.id;
            var marker = new google.maps.Marker({
                map: map,
                position: position,
                title: title,
                animation: google.maps.Animation.DROP,
                id: id,
            });
            self.markerList.push({ marker: marker });
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

}

function initPage() {
    ko.applyBindings(new PlaceViewModel());
}
var mapErrorHandler = function () {
    alert('Failed to load the Google map,plaese try again!');
}

