import express from "express";
import fetch from "node-fetch";
import path from "path";
import ejs from "ejs";

const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));

function getTime(dateTimeString) {
  const dateTime = new Date(dateTimeString);
  const time = dateTime.toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "numeric",
  });
  return time;
}

async function fetchCoordinates(place) {
  const locationUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${place}&count=1&language=en&format=json`;

  try {
    const response = await fetch(locationUrl);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const latitude = data.results[0].latitude;
      const longitude = data.results[0].longitude;
      const admin1 = data.results[0].admin1;
      const country = data.results[0].country;
      return { latitude, longitude, admin1 ,country };
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

  const searchTerm = request.query.place; // Verander 'name' naar 'place'

  // Maak een verzoek naar de externe API
  fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${searchTerm}&count=50&language=nl&format=json`)
    .then(response => response.json())
    .then(data => {
      response.render('index', { results: data.results || [] });
    })
    .catch(error => {
      console.log(error);
      response.render('error');
    });
});

app.get("/forecast", async (request, response) => {
  const name = request.query.name;

  try {
    const { latitude, longitude, admin1 , country } = await fetchCoordinates(name);

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,dewpoint_2m,apparent_temperature,precipitation_probability,precipitation,weathercode,surface_pressure,cloudcover,visibility,windspeed_10m,soil_temperature_6cm,soil_moisture_27_81cm&daily=sunrise,sunset,uv_index_max&language=nl`;

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

    const viewsDir = path.resolve("./views");
    response.render(path.join(viewsDir, "forecast.ejs"), {
      time,
      sunriseTime,
      sunsetTime,
      precipitation,
      apparent_temperature: apparentTemperature,
      precipitation_probability: precipitationProbability,
      surface_pressure: surfacePressure,
      surface_temperature: surfaceTemperature,
      current_weather: currentWeather.current_weather,
      visibility,
      soilMoisture,
      hourly: currentWeather.hourly,
      daily: currentWeather.daily,
      name,
      admin1,
      country,
      getTime,
    });
  } catch (error) {
    console.error(error);
    response
      .status(500)
      .send("Geen resultaten gevonden voor de opgegeven plaats.");
  }
});

app.listen(8000, () => {
  console.log("Server gestart op http://localhost:8000");
});

async function fetchJson(url, payload = {}) {
  return await fetch(url, payload).then((response) => response.json());
}
