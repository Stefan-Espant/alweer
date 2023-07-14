// Importeert express uit de node_modules map
import express, { request, response } from "express";

// Maakt een nieuwe express app
const app = express();

// Importeer de fetch-module
import fetch from 'node-fetch';

// Stel in hoe express gebruikt kan worden
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));

// Importeert de url met weer data
const weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m'

const currentWeatherUrl = weatherUrl + '&current_weather=true'

// Maakt een route voor de overzichtspagina
app.get("/", (request, response) => {
	fetchJson(currentWeatherUrl).then((data) => {
		response.render("index", data);
		console.log(data);
	});
});

// Maakt een route voor de weersverwachtingspagina
app.get("/forecast", (request, response) => {
	fetchJson(currentWeatherUrl).then((data) => {
		response.render("forecast", data);
		console.log(data);
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