'use client';

import { useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import ReactMarkdown from 'react-markdown';

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
  } = useChat({
    api: '/api/chat',
    onResponse: async (response) => {
      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      let result = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                result += data.content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = result;
                  } else {
                    newMessages.push({
                      id: Date.now().toString(),
                      role: 'assistant',
                      content: result,
                    });
                  }
                  return newMessages;
                });
                // Scroll to top of last message for assistant responses
                lastMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                textareaRef.current?.focus();
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }
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

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col">
      <div
        ref={chatContainerRef}
        className="mt-4 flex-1 space-y-4 overflow-y-auto px-4 sm:px-6 lg:px-8"
      >
        {messages.map((message, index) => (
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
                <ReactMarkdown
                  components={{
                    div: ({ node, ...props }) => (
                      <div
                        {...props}
                        className="prose prose-sm dark:prose-invert max-w-none [&>*]:my-1"
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
                    ul: ({ node, ...props }) => <ul {...props} className="list-inside list-disc" />,
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
              )}
            </div>
          </div>
        ))}
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
          <form onSubmit={handleSubmit} className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="max-h-[200px] min-h-[44px] flex-1 resize-none overflow-y-auto rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="self-center rounded-xl bg-blue-500 px-6 py-3 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
