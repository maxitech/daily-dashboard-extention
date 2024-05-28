import '../style.css';
import getWeather from '../api/weatherify/getWeather';
import getLocation from '../api/weatherify/getLocation';
import generateWeatherCard from '../helpers/weatherify/generateMarkup';
import { Location } from '../lib/types';
import { CurrentWeatherData } from '../lib/types';
import generateButton from '../helpers/weatherify/generateButtonMarkup';

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY as string;

function handleInput() {
  const form = document.querySelector<HTMLFormElement>('#form');
  const input = document.querySelector<HTMLInputElement>('#location-input');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    if (input?.value == '' || input?.value == null) return;

    const location = input.value;

    requestLocation(location);
    input.value = '';
  });
}

async function requestLocation(location: string) {
  try {
    const locationData = (await getLocation(location)) as Location[];
    const { lat, lon, display_name } = locationData[0];
    requestWeather({ lat, lon, display_name });
    // requestForecastWeather({ lat, lon, display_name });
    return { lat, lon, display_name };
  } catch (error) {
    console.error('Try again!', error);
  }
}

async function requestWeather({ lat, lon, display_name }: Location) {
  const url: string = `https://api.openweathermap.org/data/2.5/weather?lat=${Number(
    lat
  )}&lon=${Number(lon)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=de`;
  try {
    const response = (await getWeather(url)) as any;
    const weather: CurrentWeatherData = {
      description: response.weather[0].description,
      icon: response.weather[0].icon,
      temp: response.main.temp,
      name: display_name,
    };
    generateWeatherCard(weather);
    toggleButtonVisibility(weather);
    handleSetDefaultLocationClick(weather);
  } catch (error) {
    console.error('Try again!', error);
  }
}

// async function requestForecastWeather({ lat, lon, display_name }: Location) {
//   const url = `https://api.openweathermap.org/data/2.5/forecast/?lat=${Number(
//     lat
//   )}&lon=${Number(lon)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=de`;
//   try {
//     const response = (await getWeather(url)) as any;

//     console.log(response);
//   } catch (error) {
//     console.error('Try again!', error);
//   }
// }

function updateLocalStorage(weatherData: CurrentWeatherData) {
  const storedWeatherData = localStorage.getItem('weather');
  const parsedStoredWeatherData: CurrentWeatherData | null = storedWeatherData
    ? JSON.parse(storedWeatherData)
    : null;

  if (
    !parsedStoredWeatherData ||
    JSON.stringify(parsedStoredWeatherData) !== JSON.stringify(weatherData.name)
  ) {
    localStorage.setItem('weather', JSON.stringify(weatherData.name));
    console.log('update local storage');
  }
}

function toggleButtonVisibility(weatherData: CurrentWeatherData) {
  if (!weatherData) return;
  const app = document.querySelector<HTMLDivElement>('#app');
  let setDefaultLocationButton = document.querySelector<HTMLButtonElement>(
    '#default-location-button'
  );

  const location = weatherData.name;
  const storedWeatherData = localStorage.getItem('weather');
  const storedLocation: string | null = storedWeatherData
    ? JSON.parse(storedWeatherData)
    : null;

  if (!setDefaultLocationButton)
    setDefaultLocationButton = generateButton(
      'Set as default location',
      'default-location-button'
    );

  if (storedLocation && location === storedLocation) return;

  if (app && !app.contains(setDefaultLocationButton)) {
    app.appendChild(setDefaultLocationButton);
  }
}

function handleSetDefaultLocationClick(weather: CurrentWeatherData) {
  let setDefaultLocationButton = document.querySelector<HTMLButtonElement>(
    '#default-location-button'
  );
  if (!setDefaultLocationButton) return;

  setDefaultLocationButton.disabled = false;

  // Clone the button to remove the event listener
  const clonedButton = setDefaultLocationButton.cloneNode(
    true
  ) as HTMLButtonElement;
  setDefaultLocationButton.parentNode?.replaceChild(
    clonedButton,
    setDefaultLocationButton
  );
  setDefaultLocationButton = clonedButton;

  setDefaultLocationButton.addEventListener('click', () => {
    updateLocalStorage(weather);
    console.log('default location set');
    setDefaultLocationButton.disabled = true;
  });
}

export function init() {
  handleInput();
  const storedWeatherData = localStorage.getItem('weather');
  if (!storedWeatherData) {
    requestLocation('Berlin');
  }
  if (storedWeatherData) {
    requestLocation(JSON.parse(storedWeatherData));
  }
}

// !!! BUG !!!
// !If location gets set as default location the button gets disabled but should enabled if new location is searcht which is not the same as set in storage
// todo: feature
// button to click to see the weather forecast for the next 7 days
// data should displayed in small boxes with day/date, weather icon, max temp and min temp

// step 1: create a button
// step 2: eventlistener on button that calls a function to fetch the data
// step 3: create a function that fetches the data´
// step 4: create a function that displays the data (creates markup for the boxes that will display the data)
