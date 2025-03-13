'use client';

import { useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import ReactMarkdown from 'react-markdown';
import { routerWorkflow } from '@/lib/agent/ma-test';
import Image from 'next/image';

interface AgentInfo {
  name: string;
  image: string;
  description: string;
}

interface ExtendedMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agent: AgentInfo;
}

const agentInfo = {
  weather: {
    name: 'Weather Agent',
    image: '/agents/weather-agent.svg',
    description: 'Expert weather reporter with a sarcastic sense of humor',
  },
  news: {
    name: 'News Agent',
    image: '/agents/news-agent.svg',
    description: 'Sarcastic news reporter with a witty personality',
  },
  general: {
    name: 'Wizard',
    image: '/agents/wizard-agent.svg',
    description: 'Magical wizard with a sarcastic sense of humor',
  },
};

export function Chat() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: submitMessage,
    isLoading,
    setMessages,
    setInput,
  } = useChat({
    api: '/api/chat',
    onFinish: (message) => {
      console.log('onFinish', message);
    },
    onResponse: async (response) => {
      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const { value } = await reader.read();
      const newMessage = new TextDecoder().decode(value);

      const messageObject = JSON.parse(newMessage);

      setMessages((prev) => {
        return [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: messageObject.output,
            agent: messageObject.decision,
          } as ExtendedMessage,
        ];
      });
      return;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !input.trim()) return;

    setTimeout(() => {
      chatContainerRef.current?.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }, 100);

    await submitMessage(e);
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        handleSubmit(e);
      }
    }
  };

  const handleSummarize = async () => {
    // Set the input value to the summary request
    setInput('Please summarize our conversation so far.');

    // Create a synthetic form event
    const formEvent = {
      preventDefault: () => {},
    } as React.FormEvent;

    // Use the same handleSubmit function that's used for manual submissions
    setTimeout(() => {
      handleSubmit(formEvent);
    }, 100);
  };

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col">
      <div
        ref={chatContainerRef}
        className="mt-4 flex-1 space-y-4 overflow-y-auto px-4 sm:px-6 lg:px-8"
      >
        {(messages as Array<any>).map((message, index) => {
          const curAgentData = agentInfo[message.agent as keyof typeof agentInfo];

          return (
            <div
              key={message.id}
              ref={index === messages.length - 1 ? lastMessageRef : undefined}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-2.5 ${
                  message.role === 'user' ? 'bg-blue-400 text-white' : 'bg-gray-100 text-gray-800'
                } whitespace-pre-wrap`}
              >
                {message.role === 'user' ? (
                  message.content
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="relative h-8 w-8 overflow-hidden rounded-full">
                        <Image
                          src={curAgentData.image || '/agents/wizard-agent.svg'}
                          alt={curAgentData.name || 'Wizard'}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">
                          {curAgentData.name || 'Wizard'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {curAgentData.description ||
                            'Magical wizard with a sarcastic sense of humor'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <ReactMarkdown
                        components={{
                          div: ({ node, ...props }) => (
                            <div
                              {...props}
                              className="prose prose-sm max-w-none dark:prose-invert [&>*]:my-1"
                            />
                          ),
                          a: ({ node, ...props }) => (
                            <a
                              {...props}
                              className="text-blue-500 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul {...props} className="list-inside list-disc" />
                          ),
                          code: ({ node, ...props }) => (
                            <code {...props} className="rounded bg-gray-200 px-1 py-0.5" />
                          ),
                          h1: ({ node, ...props }) => (
                            <h1 {...props} className="my-1 text-xl font-bold" />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2 {...props} className="my-1 text-lg font-bold" />
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-xl bg-gray-100 px-4 py-2.5 text-gray-800">
              <div className="flex space-x-2">
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 delay-100" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border-t border-gray-50 bg-white py-4">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="flex items-center justify-center gap-2">
            <div className="max-w-2xl flex-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="max-h-[200px] min-h-[44px] w-full resize-none overflow-y-auto rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col items-center gap-2">
              <button
                type="submit"
                className="w-[140px] rounded-xl bg-blue-500 px-6 py-3 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMessages([])}
                  className="w-[68px] rounded-xl bg-gray-100 px-6 py-3 text-gray-500 hover:bg-red-100 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-300 disabled:hover:bg-gray-50 disabled:hover:text-gray-300"
                  title="Clear chat history"
                  disabled={isLoading || messages.length === 0}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleSummarize}
                  className="w-[68px] rounded-xl bg-gray-100 px-6 py-3 text-gray-500 hover:bg-green-100 hover:text-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-300 disabled:hover:bg-gray-50 disabled:hover:text-gray-300"
                  title="Summarize conversation"
                  disabled={isLoading || messages.length === 0}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
