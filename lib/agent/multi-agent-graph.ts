import { END, Annotation, StateGraph, START } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import { MemorySaver } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { z } from 'zod';

import { getWeather } from '../tools/weather';
import { getNews } from '../tools/news';

import { personality } from '../utils/personality';
import { RunnableConfig } from '@langchain/core/runnables';

const llm = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  temperature: 0.7,
  apiKey: process.env.OPENAI_API_KEY,
});

// Multiple agents
const routeSchema = z.object({
  steps: z
    .array(z.enum(['general', 'weather', 'news']))
    .describe('Agents required for this request'),
});

const sharedCheckpointer = new MemorySaver();

// Router agent
const router = llm.withStructuredOutput(routeSchema).withConfig({
  configurable: {
    checkpointer: sharedCheckpointer,
  },
});

// Graph State
const StateAnnotation = Annotation.Root({
  input: Annotation<string>,
  decision: Annotation<string[]>,
  outputs: Annotation<string[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  combinedOutputs: Annotation<string>({
    reducer: (x, y) => x + y,
    default: () => '',
  }),
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
});

// Agents
const weatherAgent = createReactAgent({
  llm,
  tools: [getWeather],
  checkpointer: new MemorySaver(),
  stateModifier: new SystemMessage('You are an expert weather reporter.' + personality),
});

const newsAgent = createReactAgent({
  llm,
  tools: [getNews],
  checkpointer: new MemorySaver(),
  stateModifier: new SystemMessage('You are a news reporter.' + personality),
});

const generalAgent = createReactAgent({
  llm,
  tools: [],
  checkpointer: sharedCheckpointer,
  stateModifier: new SystemMessage('You are an expert about everything.' + personality),
});

// Nodes
async function weatherNode(state: typeof StateAnnotation.State, config?: RunnableConfig) {
  const result = await weatherAgent.invoke(state, {
    ...config,
    configurable: {
      thread_id: Date.now().toString(),
    },
  });
  return { outputs: [result.messages[result.messages.length - 1].content] };
}

async function newsNode(state: typeof StateAnnotation.State, config?: RunnableConfig) {
  const result = await newsAgent.invoke(state, {
    ...config,
    configurable: {
      thread_id: Date.now().toString(),
    },
  });
  return { outputs: [result.messages[result.messages.length - 1].content] };
}

async function generalNode(state: typeof StateAnnotation.State, config?: RunnableConfig) {
  const result = await generalAgent.invoke(state, {
    ...config,
    configurable: {
      thread_id: Date.now().toString(),
    },
  });
  return { outputs: [result.messages[result.messages.length - 1].content] };
}

// Router LLM
async function llmCallRouter(state: typeof StateAnnotation.State) {
  const decision = await router.invoke([
    new SystemMessage(
      "You are a routing expert. Determine which agent(s) should respond to the user's request:\n" +
        "- 'weather' if the request involves weather.\n" +
        "- 'news' if the request involves news.\n" +
        "- 'general' for anything else.\n" +
        'You can choose multiple agents if needed.'
    ),
    new HumanMessage(state.input),
  ]);

  return { decision: decision.steps };
}

// Aggregation
async function aggregateResponses(state: typeof StateAnnotation.State) {
  if (state.outputs.length === 1) {
    return { output: state.outputs[0], combinedOutputs: state.outputs[0] };
  }

  const combinationPrompt = new SystemMessage(
    'You are an expert at combining texts. Here are responses from multiple sources:\n\n' +
      state.outputs.join('\n\n') +
      '\n\nGenerate a concise combination that captures the key points.'
  );

  const combinedOutputs = await llm.invoke([combinationPrompt]);
  return { output: state.outputs, combinedOutputs: combinedOutputs.content };
}

// Route Agents based on decisions
function routeAgents(state: typeof StateAnnotation.State) {
  const edges = [];
  if (state.decision.includes('weather')) edges.push('weatherAgent');
  if (state.decision.includes('news')) edges.push('newsAgent');
  if (state.decision.includes('general')) edges.push('generalAgent');
  return edges;
}

const routerWorkflow = new StateGraph(StateAnnotation)
  .addNode('weatherAgent', weatherNode)
  .addNode('newsAgent', newsNode)
  .addNode('generalAgent', generalNode)
  .addNode('llmCallRouter', llmCallRouter)
  .addNode('aggregateResponses', aggregateResponses)
  .addEdge(START, 'llmCallRouter')
  .addConditionalEdges('llmCallRouter', routeAgents, ['weatherAgent', 'newsAgent', 'generalAgent'])
  .addEdge('weatherAgent', 'aggregateResponses')
  .addEdge('newsAgent', 'aggregateResponses')
  .addEdge('generalAgent', 'aggregateResponses')
  .addEdge('aggregateResponses', END)
  .compile();

export { routerWorkflow };
