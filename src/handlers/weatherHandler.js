const { getWeatherData } = require('../services/weatherService');
const db = require('../utils/db');

// Fetch weather data
module.exports.getWeather = async (event) => {
  try {
    // Retrieve lat and lon from query parameters
    const { lat, lon } = event.queryStringParameters || {};

    if (!lat || !lon) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Latitude and longitude are required.' }),
      };
    }

    const keys = {
      openWeather: process.env.OPENWEATHER_API_KEY,
      weatherAPI: process.env.WEATHERAPI_API_KEY,
      weatherStack: process.env.WEATHERSTACK_API_KEY,
    };

    // Fetch weather data
    const weatherData = await getWeatherData(lat, lon, keys);
    const savedProviders = await db.getSavedProviders();

    // Mark saved providers and sort the response
    const response = weatherData.map((data) => ({
      ...data,
      pinned: savedProviders.includes(data.provider),
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(response.sort((a, b) => b.pinned - a.pinned)),
    };
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error.' }),
    };
  }
};

// Toggle pin
module.exports.togglePin = async (event) => {
  const { provider } = JSON.parse(event.body);
  await db.toggleProvider(provider);
  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
