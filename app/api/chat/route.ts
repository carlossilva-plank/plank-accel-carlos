// import { wor } from '@/lib/agent/setup';

// import { getMultiAgentGraph } from '@/lib/agent/ma';
import { routerWorkflow } from '@/lib/agent/ma-test';
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
  console.log(messages, 'messages');
  const lastMessage = messages.at(-1)?.content;

  const state = await routerWorkflow.invoke({ input: lastMessage, messages });
  console.log(state, 'state');

  return new Response(JSON.stringify({ output: state.output, decision: state.decision }));
}

// export async function POST(req: Request) {
//   const { messages } = await req.json();

//   const state = await routerWorkflow.invoke({ input: messages });
//   console.log(state.output);

//   return new Response(state.output);

//   const graph = await getMultiAgentGraph();
//   const res = await graph.invoke({ messages });
//   console.log(res);

//   return new Response(res.messages.at(-1)?.content.toString() ?? '');

//   const streamResult = await graph.stream({ messages }, { streamMode: 'messages' });
//   let result = '';
//   for await (const [message, _metadata] of streamResult) {
//     if (isAIMessageChunk(message) && !(message instanceof AIMessage)) {
//       console.log(message.content);
//       result += message.content;
//     }
//   }
//   console.log(result, 'result');
//   return new Response(result);

//   return createDataStreamResponse({
//     async execute(dataStream) {
//       try {
//         for await (const [message, _metadata] of streamResult) {
//           if (isAIMessageChunk(message) && !(message instanceof AIMessage)) {
//             console.log(message.content, 'message');
//             dataStream.write(
//               `0:${JSON.stringify({ content: message.content, role: 'assistant' })}\n`
//             );
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
