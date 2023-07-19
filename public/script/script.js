// // Vernieuw de pagina met een tijdsinterval van 1 minuut (60000 milliseconden)
// setInterval(function() {
//   location.reload();
// }, 60000);

// document.addEventListener('DOMContentLoaded', function () {
//   const searchButton = document.querySelector('#searchbutton');
//   searchButton.addEventListener('click', fetchResults);

//   async function fetchResults(event) {
//     event.preventDefault(); // Voorkom standaardgedrag van formulierverzending

//     const searchInput = document.querySelector('#search');
//     const inputValue = searchInput.value.trim();

//     if (inputValue.length > 0) {
//       const resultsUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${inputValue}&count=10&language=en&format=json`;

//       try {
//         const response = await fetch(resultsUrl);
//         const data = await response.json();

//         const results = data.results;

//         const ul = document.querySelector('#places');
//         ul.innerHTML = '';

//         results.forEach(result => {
//           const li = document.createElement('li');
//           li.textContent = `${result.name}, ${result.country}`;
//           ul.appendChild(li);
//         });
//       } catch (error) {
//         console.error('Fout bij het ophalen van plaatsen:', error);
//       }
//     }
//   }
// });

