// Importeert express uit de node_modules map
import express from "express";
import fetch from "node-fetch";

const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));

function getTime(dateTimeString) {
  const dateTime = new Date(dateTimeString);
  const time = dateTime.toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "numeric"
  });
  return time;
}

// Importeert de url met weer data
const weatherUrl =
	"https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=4.5569&hourly=temperature_2m,dewpoint_2m,apparent_temperature,precipitation_probability,precipitation,weathercode,surface_pressure,cloudcover,visibility,windspeed_10m,soil_temperature_6cm,soil_moisture_27_81cm&daily=sunrise,sunset,uv_index_max";

const currentWeatherUrl =
	weatherUrl + "&current_weather=true&timezone=Europe%2FBerlin&forecast_days=1";

// Maakt een route voor de overzichtspagina
app.get("/", (request, response) => {
	fetchJson(currentWeatherUrl).then((data) => {
		response.render("index");
	});
});

app.get("/forecast", async (request, response) => {
    const currentWeather = await fetchJson(currentWeatherUrl);
  
    const time = currentWeather.hourly.time[0].split("T")[1];
    const sunriseTime = currentWeather.daily.sunrise[0].split("T")[1];
    const sunsetTime = currentWeather.daily.sunset[0].split("T")[1];
    const precipitation = currentWeather.hourly.precipitation;
    const apparentTemperature = currentWeather.hourly.apparent_temperature;
    const precipitationProbability = currentWeather.hourly.precipitation_probability;
    const surfacePressure = currentWeather.hourly.surface_pressure;
    const surfaceTemperature = currentWeather.hourly.soil_temperature_6cm;
    const visibility = currentWeather.hourly.visibility;
    const soilMoisture = currentWeather.hourly.soil_moisture_27_81cm;
  
    response.render("forecast", {
      time: time,
      sunriseTime: sunriseTime,
      sunsetTime: sunsetTime,
      precipitation: currentWeather.precipitation,
      apparent_temperature: currentWeather.apparentTemperature,
      precipitation_probability: precipitationProbability,
      surface_pressure: surfacePressure,
      surface_temperature: surfaceTemperature,
      current_weather: currentWeather.current_weather,
      visibility: visibility,
      soilMoisture: soilMoisture,
      hourly: currentWeather.hourly,
      daily: currentWeather.daily,
      getTime: getTime // Pass the getTime function to the template
    });
    
  });

// Stelt het poortnummer in waar express op gaat luisteren
app.set("port", process.env.PORT || 8000);

// Start express op, haal het ingestelde poortnummer op
app.listen(app.get("port"), function () {
	// Toon een bericht in de console en geef het poortnummer door
	console.log(
		`Application started on http://localhost:${app.get(
			"port"
		)}`
	);
});

async function fetchJson(url, payload = {}) {
	return await fetch(url, payload)
		.then((response) => response.json())
		.catch((error) => error);
}
