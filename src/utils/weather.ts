import { toast } from 'react-hot-toast';

if (!import.meta.env.VITE_WEATHER_API_KEY) {
  throw new Error('Missing environment variable: VITE_WEATHER_API_KEY');
}

interface WeatherData {
  temperature: string;
  error?: string;
}

export async function getWeather(): Promise<WeatherData> {
  try {
    // Get user's location
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    // Create the URL for the OpenWeatherMap API
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    const { latitude, longitude } = position.coords;
    // this is the URL for the OpenWeatherMap API should be moved to the proxy server, otherwise it will be exposed to the API KEY
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=imperial&appid=${apiKey}`;

    // Fetch weather data
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();
    const temperature = `${Math.round(data.main.temp)}°F`;

    return { temperature };
  } catch (error) {
    console.error('Error fetching weather:', error);
    toast.error('Failed to fetch weather data');
    return { temperature: '70°F', error: 'Failed to fetch weather data' };
  }
}