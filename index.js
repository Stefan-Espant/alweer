// Importeert express uit de node_modules map
import express from "express";
import fetch from "node-fetch";
import translate from "google-translate-api";

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

async function fetchCoordinates(place) {
  const locationUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${place}&count=1&language=en&format=json`;

  try {
    const response = await fetch(locationUrl);
    const data = await response.json();

    // Controleer of er resultaten zijn
    if (data.results && data.results.length > 0) {
      const latitude = data.results[0].latitude;
      const longitude = data.results[0].longitude;
      const country = data.results[0].country;
      return { latitude, longitude, country };
    } else {
      throw new Error("Geen resultaten gevonden voor de opgegeven plaats.");
    }
  } catch (error) {
    console.error("Fout bij het ophalen van coördinaten:", error);
    throw error;
  }
}


// Maakt een route voor de overzichtspagina
app.get("/", (request, response) => {
  response.render("index");
});

app.get("/forecast", async (request, response) => {
  const place = request.query.place;

  try {
    const { latitude, longitude, country } = await fetchCoordinates(place);

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,dewpoint_2m,apparent_temperature,precipitation_probability,precipitation,weathercode,surface_pressure,cloudcover,visibility,windspeed_10m,soil_temperature_6cm,soil_moisture_27_81cm&daily=sunrise,sunset,uv_index_max`;

    const currentWeatherUrl =
      weatherUrl +
      "&current_weather=true&timezone=Europe%2FBerlin&forecast_days=1";

    const currentWeather = await fetchJson(currentWeatherUrl);

    const time = currentWeather.hourly.time[0].split("T")[1];
    const sunriseTime = currentWeather.daily.sunrise[0].split("T")[1];
    const sunsetTime = currentWeather.daily.sunset[0].split("T")[1];
    const precipitation = currentWeather.hourly.precipitation;
    const apparentTemperature = currentWeather.hourly.apparent_temperature;
    const precipitationProbability =
      currentWeather.hourly.precipitation_probability;
    const surfacePressure = currentWeather.hourly.surface_pressure;
    const surfaceTemperature = currentWeather.hourly.soil_temperature_6cm;
    const visibility = currentWeather.hourly.visibility;
    const soilMoisture = currentWeather.hourly.soil_moisture_27_81cm;

    response.render("forecast", {
      time: time,
      sunriseTime: sunriseTime,
      sunsetTime: sunsetTime,
      precipitation: precipitation,
      apparent_temperature: apparentTemperature,
      precipitation_probability: precipitationProbability,
      surface_pressure: surfacePressure,
      surface_temperature: surfaceTemperature,
      current_weather: currentWeather.current_weather,
      visibility: visibility,
      soilMoisture: soilMoisture,
      hourly: currentWeather.hourly,
      daily: currentWeather.daily,
      place: place,
      country: country, // Toegevoegde variabele country
      getTime: getTime // Pass the getTime function to the template
    });
    console.log(weatherUrl)
  } catch (error) {
    // Handle error
    console.error(error);
    response.status(500).send("Geen resultaten gevonden voor de opgegeven plaats.");
  }
});

// Stelt het poortnummer in waar express op gaat luisteren
app.set("port", process.env.PORT || 8000);

// Start express op, haal het ingestelde poortnummer op
app.listen(app.get("port"), function () {
  // Toon een bericht in de console en geef het poortnummer door
  console.log(
    `Application started on http://localhost:${app.get("port")}`
  );
});

async function fetchJson(url, payload = {}) {
  return await fetch(url, payload)
    .then((response) => response.json())
    .catch((error) => error);
}
