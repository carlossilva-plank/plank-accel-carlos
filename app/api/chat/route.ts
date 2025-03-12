import { agent } from '@/lib/agent/setup';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await agent.invoke(
          {
            messages: messages.map((msg: any) => ({
              role: msg.role,
              content: msg.content,
            })),
          },
          { configurable: { thread_id: Date.now().toString() } }
        );

        const response = result.messages.at(-1)?.content;

        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify({ content: response })}\n\n`)
        );
        controller.close();
      } catch (error) {
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
