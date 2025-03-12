import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const getNews = tool(
  async ({ topic }) => {
    try {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&sortBy=publishedAt&pageSize=3&apiKey=${process.env.NEWS_API_KEY}`
      );
      if (!response.ok) throw new Error('News API error');
      const data = await response.json();
      return data.articles
        .map((article: any) => `${article.title}\n${article.description}`)
        .join('\n\n');
    } catch (error) {
      return `Sorry, I couldn't find news about ${topic}`;
    }
  },
  {
    name: 'get_news',
    description: 'Get latest news about a specific topic',
    schema: z.object({
      topic: z.string().describe('The topic to get news about'),
    }),
  }
);
