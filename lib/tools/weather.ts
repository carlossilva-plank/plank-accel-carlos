import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const getWeather = tool(
  async ({ location }) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
      );
      if (!response.ok) throw new Error('Weather API error');
      const data = await response.json();
      return `The current weather in ${location} is ${data.main.temp}°C with ${data.weather[0].description}`;
    } catch (error) {
      return `Sorry, I couldn't get the weather for ${location}`;
    }
  },
  {
    name: 'get_weather',
    description: 'Get current weather information for a specific location',
    schema: z.object({
      location: z.string().describe('The location to get weather for'),
    }),
  }
);
