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
	console.log('chuj')
	let apiKey = loadAPIKey('open_weather.json')
	let currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
	
	let resp = await fetch(currentWeatherURL)
					.then(res => res.json())
					.catch(er => console.log(er))
	console.log(resp)

}
// lon W/E
// lat N/S
getWeather('19.94', '50.06')