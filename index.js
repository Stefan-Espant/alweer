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
	"https://api.open-meteo.com/v1/forecast?latitude=52.26&longitude=4.5569&hourly=temperature_2m,dewpoint_2m,rain,visibility,windspeed_10m,winddirection_10m&daily=sunrise,sunset&current_weather=true&timezone=Europe%2FBerlin&forecast_days=1";

const currentWeatherUrl =
	weatherUrl + "&current_weather=true";

// Maakt een route voor de overzichtspagina
app.get("/", (request, response) => {
	fetchJson(weatherUrl).then((data) => {
		response.render("index");
	});
});

// Maakt een route voor de weersverwachtingspagina
app.get("/forecast", async (request, response) => {
    const currentWeather = await fetchJson(currentWeatherUrl);
    const hourlyWeather = await fetchJson(weatherUrl);
  
    if (!currentWeather || !hourlyWeather) {
      // Error handling if the data cannot be fetched
      response.render("error");
      return;
    }
    const time = currentWeather.hourly.time[0].split("T")[1];
  
    const sunriseTime = currentWeather.daily.sunrise[0].split("T")[1];
    const sunsetTime = currentWeather.daily.sunset[0].split("T")[1];
  
    const surfacePressure = currentWeather.hourly.surface_pressure;
  
    response.render("forecast", {
      time: time,
      sunriseTime: sunriseTime,
      sunsetTime: sunsetTime,
      surfacePressure: hourlyWeather.hourly.surface_pressure,
      current_weather: currentWeather.current_weather,
      hourly: hourlyWeather.hourly,
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
