let getWeather = async (lon, lat) => {
	let currentWeatherURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=b03accfd92a0ca5f70a918b8f9b725b4`
	
	let resp = await fetch(currentWeatherURL)
					.then(res => res.json())
					.catch(er => console.log(er))
	console.log(resp)
}