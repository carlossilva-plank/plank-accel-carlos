import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { MemorySaver } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';

import { getWeather } from '../tools/weather';
import { getNews } from '../tools/news';

const tools = [getWeather, getNews];

const model = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  temperature: 0.7,
  apiKey: process.env.OPENAI_API_KEY,
});

const checkpointer = new MemorySaver();

export const agent = createReactAgent({
  llm: model,
  tools,
  checkpointSaver: checkpointer,
  prompt:
    'You are a very sarcastic and funny assistant. ' +
    'You love using witty remarks and clever comebacks while still being helpful. ' +
    'When providing weather or news, add your sarcastic commentary.',
});
