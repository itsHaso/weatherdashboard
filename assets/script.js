const apiKey = '8706acd2ba2225f4ffe8d85eee0016bf';
var resultOutputEl = document.querySelector('#result-output'); 
var resultContentEl = document.querySelector('#result-content'); 
var searchFormEl = document.querySelector('#search-form');
var searchHistoryEl = document.querySelector('#search-history');
var fiveForecastEl = document.querySelector('#five-forecast');

let searchHistory = [];

function displayDate(day) {
  var todayDate = day.getMonth()+1 + "/" + day.getDate() + "/" + day.getFullYear();
  return todayDate;
}



function printResults(weatherData, i) {
  const day = new Date(weatherData.list[i].dt * 1000 + (weatherData.city.timezone * 1000));
  const todayDate = displayDate(day);

  const date = document.createElement('li');
  date.textContent = todayDate;
  date.classList.add('weatherInfo', 'date');

  const temp = document.createElement('li');
  temp.textContent = `Temp: ${weatherData.list[i].main.temp} ℉`;
  temp.classList.add('weatherInfo');

  const wind = document.createElement('li');
  wind.textContent = `Wind: ${weatherData.list[i].wind.speed} MPH`;
  wind.classList.add('weatherInfo');

  const humidity = document.createElement('li');
  humidity.textContent = `Humidity: ${weatherData.list[i].main.humidity} %`;
  humidity.classList.add('weatherInfo');

  const weatherIcon = document.createElement('li');
  const weatherIconImg = document.createElement('img');
  const iconUrl = `http://openweathermap.org/img/w/${weatherData.list[i].weather[0].icon}.png`;
  weatherIconImg.setAttribute('src', iconUrl);
  weatherIcon.appendChild(weatherIconImg);

  const forecast = document.createElement('ul');
  forecast.classList.add('bg-primary', 'text-white', 'forecast');
  forecast.appendChild(date);
  forecast.appendChild(weatherIcon);
  forecast.appendChild(temp);
  forecast.appendChild(wind);
  forecast.appendChild(humidity);

  resultContentEl.appendChild(forecast);
}

function searchApi(city) {
  resultOutputEl.innerHTML = ""; 
  fiveForecastEl.innerHTML = "";
  resultContentEl.innerHTML = "";

  var queryUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + city
    + "&units=imperial&appid=8706acd2ba2225f4ffe8d85eee0016bf";

  fetch(queryUrl)
    .then(function (response) {
      if (!response.ok) {
        console.log('No results found!');
        resultContentEl.innerHTML = '<h3>No results found, search again!</h3>';
        throw new Error("The data is not available"); 
      }
      return response.json();
    })
    .then(function (data) {
      var day = new Date(data.list[0].dt*1000+(data.city.timezone*1000));
      var todayDate = displayDate(day);

      var weatherHead = document.createElement("ul");
      weatherHead.setAttribute("id", "weatherHead")

      var cityDate = document.createElement('li');
      var temp = document.createElement('li');
      var wind = document.createElement('li');
      var humidity = document.createElement('li');

      var weatherIconImg = document.createElement('img');
      var iconUrl = "http://openweathermap.org/img/w/" + data.list[0].weather[0].icon + ".png";
      weatherIconImg.setAttribute("src", iconUrl);
      weatherIconImg.setAttribute("id", "IconImg");

      cityDate.textContent = data.city.name + " (" + todayDate + ")";
      temp.textContent = "Temp: " + data.list[0].main.temp + " ℉";
      wind.textContent = "Wind: " + data.list[0].wind.speed + " MPH";
      humidity.textContent = "Humidity: " + data.list[0].main.humidity + " %";

      cityDate.setAttribute("id", "cityDate");
      cityDate.setAttribute("style", "")
      temp.setAttribute("class", "weatherInfo");
      wind.setAttribute("class", "weatherInfo");
      humidity.setAttribute("class", "weatherInfo");

      cityDate.appendChild(weatherIconImg);

      weatherHead.appendChild(cityDate);
      weatherHead.appendChild(temp);
      weatherHead.appendChild(wind);
      weatherHead.appendChild(humidity);
      resultOutputEl.appendChild(weatherHead);

      fiveForecastEl.textContent = "5-Day Forecast: ";
    
      for (var i = 8; i < data.list.length; i+=7) { 
        printResults(data, i);
      }

    })
    .catch(function (error) {
      console.error(error); 
    });
}

function renderHistory() {
  searchHistoryEl.innerHTML = "";
  for (var i = searchHistory.length - 1; i >= 0; i--) { 
    var searchedItem = document.createElement("li");
    var searchedCity = searchHistory[i];
    searchedItem.textContent = searchedCity;
    searchedItem.setAttribute("data-index", i);
    searchedItem.setAttribute("class", "searched btn btn-info btn-block bg-gray");
    searchedItem.setAttribute("id", searchedCity);

    var button = document.createElement("button");
    button.setAttribute("class", "delete bg-gray")
    button.textContent = "❌";

    searchedItem.appendChild(button);
    searchHistoryEl.appendChild(searchedItem);
  }
}

function init() {
  var storedHistory = JSON.parse(localStorage.getItem("history"));
  if (storedHistory !== null) {
    searchHistory = storedHistory;
  }

  renderHistory();
}

function storeHistory() {
  localStorage.setItem("history", JSON.stringify(searchHistory));
}
function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function handleSearchFormSubmit(event) {
  event.preventDefault();

  const searchCity = document.querySelector('.form-input').value.trim();

  if (!searchCity) {
    console.log('You need a search input value!');
    return;
  }

  const city = toTitleCase(searchCity);

  if (searchHistory.includes(city)) {
    searchHistorys.splice(searchHistory.indexOf(city), 1);
  }

  searchHistory.push(city);

  searchApi(searchCity);

  document.querySelector('.form-input').value = '';

  storeHistory();
  renderHistory();
}


// Delete search history item when delete button is clicked
searchHistoryEl.addEventListener("click", function (event) {
  var element = event.target;
  if (element.matches(".delete")) {
    var index = element.parentElement.getAttribute("data-index");
    searchHistorys.splice(index, 1);
    console.log(searchHistory)
    storeHistory();
    renderHistory();
  }
});

// Search for city when history item is clicked
searchHistoryEl.addEventListener("click", function (event) {
  var element = event.target;
  if (element.matches(".searched")) {
    var city = element.id;
    searchApi(city);
  }
});

// Handle form submission and initiate search
searchFormEl.addEventListener('submit', handleSearchFormSubmit);

// Initialize page on load
init();