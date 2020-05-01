var map;

function initAutocomplete() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -33.8688, lng: 151.2195},
        zoom: 13,
        mapTypeId: 'roadmap'
    });

    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();
        
        if (places.length == 0) {
        return;
        }

        // Clear out the old markers.
        markers.forEach(function(marker) {
        marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
        if (!place.geometry) {
            console.log("Returned place contains no geometry");
            return;
        }
        var icon = {
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25)
        };

        // Create a marker for each place.
        markers.push(new google.maps.Marker({
            map: map,
            icon: icon,
            title: place.name,
            position: place.geometry.location
        }));

        if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
        } else {
            bounds.extend(place.geometry.location);
        }
        let weather = getWeather(place.geometry.location.lng(), place.geometry.location.lat())
        });
        map.fitBounds(bounds);
    });

    var infoWindow;

    infoWindow = new google.maps.InfoWindow;

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        console.log('lat', pos.lat, 'lng', pos.lng)
        infoWindow.setPosition(pos);
        infoWindow.setContent('Location found.');
        infoWindow.open(map);
        map.setCenter(pos);
        }, function() {
        handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ? 'Error: The Geolocation service failed.' : 'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}

let getWeather = async (lon, lat) => {
	let currentWeatherURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=b03accfd92a0ca5f70a918b8f9b725b4`
	
	let resp = await fetch(currentWeatherURL)
					.then(res => res.json())
					.catch(er => console.log(er))
    return resp
}

function addLocation(){

    let form = document.getElementById('locationButton');

    lat = map.getCenter().lat()
    lon = map.getCenter().lng()

    firebase.auth().onAuthStateChanged(user => {

        if(user.uid) {
            db.collection("favorite_locations")
                .add({latitude: lat, longitude:lon, userId: user.uid})
                .then(function() {
                console.log("Document successfully written ");
                alert('Location added succesfully');
                window.location.replace('./index.html');
            })
            .catch(function(error) {
                console.error("Error writing document: ", error);
            });
        } else {
            console.log("User not logged in");  
        }
        })
    
}

var firebaseLat
var firebaseLon

let weathers = []
function getLocation() {


    firebase.auth().onAuthStateChanged(user => {
        
        if(user) {
            db.collection("favorite_locations").where("userId", "==", user.uid)
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(async (doc) => {
                    //console.log(doc.id, " => ", doc.data());
                    firebaseLat = doc.data().latitude
                    firebaseLon = doc.data().longitude
                    weathers.push(getWeather(firebaseLon, firebaseLat))
                })
                return Promise.all(weathers).then(function(values) {
                    let alreadyPresent = []
                    let filtered = values.filter((value) => {
                        if (alreadyPresent.indexOf(value.city.id) == -1) {
                            alreadyPresent.push(value.city.id)
                            return true
                        } else {
                            return false
                        }                    
                    })
                    return filtered
                  });
            })
            .then((weathers) => {
                weathers.map(injectWeather)
            })
            .catch(function(error) {
                console.log("Error getting documents: ", error);
            })
        }
        
    })
}

function injectWeather(weather) {
    let city = weather.city.name
    let cityId = weather.city.id
    let cityTemp = Math.round(weather.list[0].main.temp)
    Date.prototype.timeNow = function () {
        return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes()
    }
    var datetime = new Date().timeNow();
    let iconCode = weather.list[0].weather[0].icon
    let iconUrl = `<img src="images/weather-icons/`+iconCode+`.png"id="weatherImg">`
    document.querySelector('#places').innerHTML = document.querySelector('#places').innerHTML + `<br>` + `
    <div class="card bg-dark text-white" onclick=getDetails(`+cityId+`)>
        <div class="container-fluid">
            <div class="row">
                <div class="col-sm-6">
                    <h5 class="card-title">`+city+`</h5>
                    <p id="time">(`+datetime+`)</p>
                    <p class="card-text-ls">`+cityTemp+'°C' + `</p>
                </div>
                <div class="col-sm-4">
                    `+iconUrl+`<br>
                </div>
                <img src="images/x-button.png" id="x-button">
            </div>
     </div> 
    ` 
}

function injectDetails(weather) {

}

var currentCity;

function getDetails(cityId) {
    console.log('asdasd')
    window.location.replace('./details.html?cityId='+cityId)
}

function showDetails() {
    firebase.auth().onAuthStateChanged(user => {
        
        if(user) {
            db.collection("favorite_locations").where("userId", "==", user.uid)
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(async (doc) => {
                    //console.log(doc.id, " => ", doc.data());
                    firebaseLat = doc.data().latitude
                    firebaseLon = doc.data().longitude
                    weathers.push(getWeather(firebaseLon, firebaseLat))
                })
                return Promise.all(weathers).then(function(values) {
                    let alreadyPresent = []
                    let filtered = values.filter((value) => {
                        if (alreadyPresent.indexOf(value.city.id) == -1) {
                            alreadyPresent.push(value.city.id)
                            return true
                        } else {
                            return false
                        }                    
                    })
                    return filtered
                  });
            })
            .then((weathers) => {
                weathers.filter((weather) => {
                    console.log(window.location.search.split('=')[1])
                    currentCity = window.location.search.split('=')[1]
                    // console.log('1', weather.city.id)
                    // console.log('2', currentCity)
                    if (weather.city.id == currentCity) {
                        console.log(weather)
                        document.querySelector('#places').innerHTML = document.querySelector('#places').innerHTML + `<br>` + `
                        <div class="card bg-dark text-white">
                            <h5 class="card-title">`+ weather.city.name + `</h5>
                            <p class="card-text">Jakieś randomowe cardsy, trzeba by zrobic conditional rendering z reacta</p>
                            <p class="card-text">Trzeba to jakoś wykminić żeby to tylko pojawiało się dopiero po dodaniu pogody</p>
                        </div>`
                        console.log(weather.city.name)
                    }
                })
            })
            .catch(function(error) {
                console.log("Error getting documents: ", error);
            })
        }
        
    })
}
