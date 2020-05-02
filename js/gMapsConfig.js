var map;

function initAutocomplete() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 50.0647, lng: 19.9450},
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
    resp['lat'] = lat
    resp['lon'] = lon
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
                window.location.replace('./mainPage.html');
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
    let cityLat = weather.lat
    let cityLon = weather.lon
    let city = weather.city.name
    let cityId = weather.city.id
    let cityTemp = Math.round(weather.list[0].main.temp)
    Date.prototype.timeNow = function () {
        return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes()
    }
    let rmArgs = [cityLat, cityLon]
    var datetime = new Date().timeNow();
    let iconCode = weather.list[0].weather[0].icon
    let iconUrl = `<img src="images/weather-icons/`+iconCode+`.png"id="weatherImg">`
    document.querySelector('#places').innerHTML = document.querySelector('#places').innerHTML + `<br>` + `
    <div class="card bg-dark text-white">
        <div class="container-fluid">
            <div class="row">
                <div class="col-sm-6">
                    <h5 class="card-title" onclick=getDetails(`+cityId+`)>`+city+`</h5>
                    <p id="time">(`+datetime+`)</p>
                    <p class="card-text-ls">`+cityTemp+'°C' + `</p>
                </div>
                <div class="col-sm-4">
                    `+iconUrl+`<br>
                </div>
                <img src="images/x-button.png" id="x-button" onclick="removeLocation(`+rmArgs+`)">
            </div>
     </div> 
    ` 
}


async function rmDoc(doc) {
    await doc.ref.delete().then(() => {
        console.log('Done')
    })
}


function removeLocation(cityLat, cityLon) {
    firebase.auth().onAuthStateChanged(user => {
        if(user) {
            db.collection("favorite_locations")
            .where("userId", "==", user.uid)
            .where("latitude", "==", cityLat) 
            .where("longitude", "==", cityLon)
            .get()
            .then(querySnapshot => {
                
                querySnapshot.forEach(async (doc) => {
                    if (doc.data().latitude == cityLat && doc.data().longitude == cityLon) {
                        await rmDoc(doc)
                        await new Promise(r => setTimeout(r, 1)).then(function() {
                            window.location.reload()
                        })
                    }
                })
            })
            .then(function() {
                console.log("Document successfully deleted!")
            })
            .catch(function(error) {
                console.log("Error deleting documents: ", error);
            })
        }
    })
    
}

var currentCity;

function getDetails(cityId) {
    window.location.replace('./details.html?cityId='+cityId)
}

function showDetails() {
    firebase.auth().onAuthStateChanged(user => {
        
        if(user) {
            db.collection("favorite_locations").where("userId", "==", user.uid)
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(async (doc) => {
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
                    currentCity = window.location.search.split('=')[1]
                    if (weather.city.id == currentCity) {

                        Date.prototype.timeNow = function () {
                            return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes()
                        }

                        let data = new Date();
                        let datetime = data.timeNow();
                        let currentDate = data.toJSON().slice(0,10).replace(/-/g,'/');
                        let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        let day = days[data.getDay()];
                        let twoDayMore = () => {
                            if (data.getDay() > 5) { return days[(data.getDay()+2) - 7]; }
                            else { return days[data.getDay()+2]}
                        }

                        let currentTemperature = Math.round(weather.list[0].main.temp)
                        let humidityValue = weather.list[0].main.humidity;
                        let pressureValue = weather.list[0].main.pressure;
                        let windSpeed = Math.round(weather.list[0].wind.speed);
                        let weatherIconCurrent = weather.list[0].weather[0].icon;

                        let sunset = () => {
                            let sunsetTime = new Date(weather.city.sunset * 1000);
                            return sunsetTime.timeNow();
                        }


                        let nightTemperature = () => {
                            let currentHour;
                            let counter = 0;
                            let night = [];
                            while (night.length < 1){
                                currentHour = weather.list[counter].dt_txt.substring(11,13);
                                if(currentHour == '00'){
                                    night.push(Math.round(weather.list[counter].main.temp));
                                    night.push(Math.round(weather.list[counter+8].main.temp));
                                    night.push(Math.round(weather.list[counter+16].main.temp));
                                }
                                counter++;
                            }
                            return night;
                        }
                        let nightTemp = nightTemperature();

                        let nextDayTemp = () => {
                            let currentHour;
                            let counter = 0;
                            let hours = [];
                            while (hours.length < 1){
                                currentHour = weather.list[counter].dt_txt.substring(11,13);
                                if(currentHour == '12'){
                                    hours.push(counter);
                                    hours.push(counter+8);
                                    hours.push(counter+16);
                                }
                                counter++;
                            }
                            if (weather.list[0].dt_txt.substring(11,13)  <= '12') {
                                hours.shift();
                            } else {
                                hours.pop();
                            }
                            return hours;
                        }
                        let nextDayHours = nextDayTemp();
                        let tempTommorow = Math.round(weather.list[nextDayHours[0]].main.temp);
                        let iconTommorow= weather.list[nextDayHours[0]].weather[0].icon;
                        let tempTwoDay = Math.round(weather.list[nextDayHours[1]].main.temp);
                        let iconTwoDay = weather.list[nextDayHours[1]].weather[0].icon;
                        document.querySelector('#details').innerHTML = document.querySelector('#details').innerHTML + `
                        <div class="container-fluid">
                            <div class="col mx-auto">
                                <div class="text-center">
                                    <h1 id="placeId">` + weather.city.name + `</h1>
                                </div>     
                            </div><br><br>
                        </div>
                        <div class="container-fluid">
                            <p1 class="dateSpecific">Time: ` + datetime + `</p1><br>
                            <p1 class="dateSpecific">Date: ` + currentDate + `</p1>
                        </div>
                        <div class="container-fluid">
                            <div id="mainCardDetails" class="card bg-dark">
                                <div class="row">
                                    <div class="col-2">
                                        <img class= "weatherIconSizeFromApi" src="images/weather-icons/` + weatherIconCurrent + `.png">
                                    </div>
                                    <div class="col-7">
                                        <p class="dayOfWeek"> ` + day + ` </p>
                                    </div>
                                    <div class="col-3">
                                        <p class="detailsTemperature"><span class="nightTemperature">(`+ nightTemp[0] +`°) </span>` + currentTemperature + `<span class="celciusTemperature">°C</span></p>
                                    </div>
                                </div>
                                <div class="row" id="WeatherImages">
                                    <div class="col mx-auto">
                                        <div class="text-center">
                                            <img class= "weatherIconSize" src="images/weather-icons/rain_chance.png">
                                        </div>
                                        
                                        
                                    </div>
                                    <div class="col mx-auto" >
                                        <div class="text-center">
                                            <img class= "weatherIconSize" src="images/weather-icons/humidity.png">
                                        </div>
                                    </div>
                                    <div class="col mx-auto">
                                        <div class="text-center">
                                            <img class= "weatherIconSize" src="images/weather-icons/wind.png">
                                        </div>
                                    </div>
                                    <div class="col mx-auto">
                                        <div class="text-center">
                                            <img class= "weatherIconSize" src="images/weather-icons/sunset.png">
                                        </div>
                                    </div>
                                    <div class="col mx-auto">
                                        <div class="text-center">
                                            <img class= "weatherIconSize" src="images/weather-icons/pressure.png">
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col mx-auto">
                                        <div class="text-center">
                                            <p class="weatherIconText">Rain chance</p>
                                        </div>
                                    </div>
                                    <div class="col mx-auto">
                                        <div class="text-center">
                                            <p class="weatherIconText">Humidity</p>
                                        </div>
                                    </div>
                                    <div class="col mx-auto">
                                        <div class="text-center">
                                            <p class="weatherIconText">Wind speed</p>
                                        </div>
                                    </div>
                                    <div class="col mx-auto">
                                        <div class="text-center">
                                            <p class="weatherIconText">Sunset</p>
                                        </div>
                                    </div>
                                    <div class="col mx-auto">
                                        <div class="text-center">
                                            <p class="weatherIconText">Pressure</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col mx-auto text-center">
                                        <div class="text-center">
                                            <p class="weatherIconTextValue">`+ windSpeed +`%</p>
                                        </div>
                                    </div>
                                    <div class="col mx-auto text-center">
                                        <div class="text-center">
                                            <p class="weatherIconTextValue">`+ humidityValue +`%</p>
                                        </div>
                                    </div>
                                    <div class="col mx-auto text-center">
                                        <div class="text-center">
                                            <p class="weatherIconTextValue"> `+ windSpeed +`km/h</p>
                                        </div>
                                    </div>
                                    <div class="col mx-auto text-center">
                                        <div class="text-center">
                                            <p class="weatherIconTextValue">` + sunset() + `</p>
                                        </div>
                                    </div>
                                    <div class="col mx-auto text-center">
                                        <div class="text-center">
                                            <p class="weatherIconTextValue">`+ pressureValue +`hPa</p>
                                        </div>
                                    </div>
                                    <hr class="line">
                                </div>
                            </div>
                        </div>
                        <div class="container-fluid">
                            <div id="mainCardDetails" class="card bg-dark">
                                <div class="row">
                                    <div class="col-2">
                                        <img class= "weatherIconSizeFromApi" src="images/weather-icons/`+  iconTommorow + `.png">
                                    </div>
                                    <div class="col-7">
                                        <p class="dayOfWeek">Tomorrow</p>
                                    </div>
                                    <div class="col-3">
                                        <p class="detailsTemperature"><span class="nightTemperature">(`+ nightTemp[1] +`°) </span>` + tempTommorow + `<span class="celciusTemperature">°C</span></p>
                                    </div>
                                    <hr class="line">
                                </div>
                            </div>
                        </div>
                        <div class="container-fluid">
                            <div id="mainCardDetails" class="card bg-dark">
                                <div class="row">
                                    <div class="col-2">
                                        <img class= "weatherIconSizeFromApi" src="images/weather-icons/`+  iconTwoDay + `.png">
                                    </div>
                                    <div class="col-7">
                                        <p class="dayOfWeek">`+ twoDayMore() + `</p>
                                    </div>
                                    <div class="col-3">
                                        <p class="detailsTemperature"><span class="nightTemperature">(`+ nightTemp[2] +`°) </span>` + tempTwoDay + `<span class="celciusTemperature">°C</span></p>
                                        
                                    </div>
                                    <hr class="line">
                                </div>
                            </div>
                        </div>
                        `
                    }
                })
            })
            .catch(function(error) {
                console.log("Error getting documents: ", error);
            })
        }
        
    })
}
