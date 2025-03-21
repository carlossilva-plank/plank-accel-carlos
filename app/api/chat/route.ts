// import { wor } from '@/lib/agent/setup';

// import { getMultiAgentGraph } from '@/lib/agent/ma';
import { graph } from '@/lib/agent/teste';
import { routerWorkflow } from '@/lib/agent/multi-agent-graph';
import { createDataStreamResponse } from 'ai';
import {
  isAIMessageChunk,
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages.at(-1)?.content;

  const state = await routerWorkflow.invoke(
    { input: lastMessage, messages },
    { configurable: { thread_id: '1' } }
  );
  console.log(state, 'state');

  return new Response(
    JSON.stringify({
      outputs: state.outputs,
      decision: state.decision,
      combinedOutputs: state.combinedOutputs,
    })
  );
}

// export async function POST(req: Request) {
//   const { messages } = await req.json();
//   const lastMessage = messages.at(-1)?.content;

//   const state = await routerWorkflow.stream({ input: lastMessage, messages });
//   console.log(state, 'state');

//   return new Response(JSON.stringify(state), {
//     headers: {
//         'Content-Type': 'text/event-stream',
//         'Cache-Control': 'no-cache',
//         'Connection': 'keep-alive',
//     },
// });

// return createDataStreamResponse({
//   async execute(dataStream) {
//     for await (const chunk of state) {
//       console.log('chunk', chunk);
//       dataStream.write(`0:${JSON.stringify(chunk)}`);
//     }
//   },
// });

// return new Response(
//   JSON.stringify({
//     outputs: state.outputs,
//     decision: state.decision,
//     combinedOutputs: state.combinedOutputs,
//   })
// );
// }

// export async function POST(req: Request) {
//   const { messages } = await req.json();
//   const lastMessage = messages.at(-1)?.content;

//   const state = await routerWorkflow.stream({ input: lastMessage, messages });
//   console.log(state, 'state');

//   return createDataStreamResponse({
//     async execute(dataStream) {
//       try {
//         for await (const chunk of state) {
//           // console.log(chunk, typeof chunk, 'chunk');
//           if (chunk && typeof chunk === 'object') {
//             // Handle the state object
//             if ('output' in chunk) {
//               dataStream.write(
//                 `0:${JSON.stringify({
//                   content: chunk.output,
//                   role: 'assistant',
//                   agent: chunk.decision || 'general',
//                 })}\n`
//               );
//             }
//           }
//         }
//       } catch (error) {
//         console.error('Error in stream:', error);
//         dataStream.write(
//           `0:${JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })}\n`
//         );
//       }
//     },
//   });
// }
