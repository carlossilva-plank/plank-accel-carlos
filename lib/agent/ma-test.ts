import { END, Annotation, StateGraph, START } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import { MemorySaver } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { RunnableConfig, Runnable } from '@langchain/core/runnables';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { z } from 'zod';

import { getWeather } from '../tools/weather';
import { getNews } from '../tools/news';

import { personality } from '../utils/personality';

const llm = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  temperature: 0.7,
  apiKey: process.env.OPENAI_API_KEY,
});

// Schema for structured output to use as routing logic
const routeSchema = z.object({
  step: z.enum(['general', 'weather', 'news']).describe('The next step in the routing process'),
});

const sharedCheckpointer = new MemorySaver();

// Augment the LLM with schema for structured output
const router = llm.withStructuredOutput(routeSchema).withConfig({
  configurable: {
    checkpointer: sharedCheckpointer,
  },
});

// Graph state
const StateAnnotation = Annotation.Root({
  input: Annotation<string>,
  decision: Annotation<string>,
  output: Annotation<string>,
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
});

// Nodes
// Weather Agent
const weatherAgent = createReactAgent({
  llm,
  tools: [getWeather],
  checkpointer: new MemorySaver(),
  // checkpointer: sharedCheckpointer,
  stateModifier: new SystemMessage('You are an expert weather reporter.' + personality),
});

async function weatherNode(state: typeof StateAnnotation.State, config?: RunnableConfig) {
  const result = await weatherAgent.invoke(state, {
    ...config,
    configurable: {
      thread_id: Date.now().toString(),
    },
  });
  const lastMessage = result.messages[result.messages.length - 1];

  return { output: lastMessage.content };
}

const newsAgent = createReactAgent({
  llm,
  tools: [getNews],
  // checkpointer: sharedCheckpointer,
  checkpointer: new MemorySaver(),
  stateModifier: new SystemMessage('You are a news reporter.' + personality),
});

// News Agent
async function newsNode(state: typeof StateAnnotation.State, config?: RunnableConfig) {
  const result = await newsAgent.invoke(state, {
    ...config,
    configurable: {
      thread_id: Date.now().toString(),
    },
  });
  const lastMessage = result.messages[result.messages.length - 1];

  return { output: lastMessage.content };
}

const generalAgent = createReactAgent({
  llm,
  tools: [],
  checkpointer: sharedCheckpointer,
  stateModifier: new SystemMessage('You are an expert about everything.' + personality),
});

async function generalNode(state: typeof StateAnnotation.State, config?: RunnableConfig) {
  const result = await generalAgent.invoke(state, {
    ...config,
    configurable: {
      thread_id: Date.now().toString(),
    },
  });
  const lastMessage = result.messages[result.messages.length - 1];

  return { output: lastMessage.content };
}

async function llmCallRouter(state: typeof StateAnnotation.State) {
  // Route the input to the appropriate node
  const decision = await router.invoke([
    new SystemMessage(
      "You are a routing expert. Analyze the user's request and route it to the appropriate creative agent:\n" +
        "- For any request that involves weather (e.g., 'what is the weather in a given city', 'tell me about the temperature in a given city'): route to 'weather'\n" +
        "- For any request related to news (e.g., 'give me information about something', 'tell me what is going on at a given place', 'tell me what is happening in the world'): route to 'news'\n" +
        "- For any other requests: route to 'general'\n" +
        "Choose the most appropriate option based on the user's request."
    ),
    new HumanMessage(state.input),
  ]);

  return { decision: decision.step };
}

// Conditional edge function to route to the appropriate node
function routeDecision(state: typeof StateAnnotation.State) {
  // Return the node name you want to visit next
  if (state.decision === 'weather') {
    return 'weatherAgent';
  } else if (state.decision === 'news') {
    return 'newsAgent';
  } else {
    return 'generalAgent';
  }
}

// Build workflow
const routerWorkflow = new StateGraph(StateAnnotation)
  .addNode('weatherAgent', weatherNode)
  .addNode('newsAgent', newsNode)
  .addNode('generalAgent', generalNode)
  .addNode('llmCallRouter', llmCallRouter)
  .addEdge(START, 'llmCallRouter')
  .addConditionalEdges('llmCallRouter', routeDecision, [
    'weatherAgent',
    'newsAgent',
    'generalAgent',
  ])
  .addEdge('weatherAgent', END)
  .addEdge('newsAgent', END)
  .addEdge('generalAgent', END)
  .compile();

export { routerWorkflow };
