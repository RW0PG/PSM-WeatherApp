const fetch = require('node-fetch')
const fs = require('fs')


let loadAPIKey = (keyFile) => {
	data = fs.readFileSync('./api_keys/' + keyFile)
    return JSON.parse(data)
}

async function fetchAsync (url) {
	let response = await fetch(url);
	let data = await response.json();
	return data;
  }

let getWeather = async (lon, lat) => {
	let apiKey = loadAPIKey('open_weather.json')
	let currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
	
	let resp = await fetch(currentWeatherURL)
					.then(res => res.json())
					.catch(er => console.log(er))
	console.log(resp)

}
// lon W/E
// lat N/S
getWeather('20.3569396', '49.5861020000000046')


function handleMap() {
	// Create the script tag, set the appropriate attributes
	let apiKey = loadAPIKey('google_maps.json')
	var script = document.createElement('script');
	script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
	script.defer = true;
	script.async = true;

	// Attach your callback function to the `window` object
	window.initMap = function() {
	// JS API is loaded and available
	};

	// Append the 'script' element to 'head'
	document.head.appendChild(script);
      
}