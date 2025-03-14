'use client';

import { useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import { Quicksand, Playfair_Display } from 'next/font/google';
import { useRouter } from 'next/navigation';

import { ChatHeader } from './ChatHeader';
import { Button } from './ui/Button';

import { SendIcon } from './icons/SendIcon';
import { LoadingIcon } from './icons/LoadingIcon';
import { SummarizeIcon } from './icons/SummarizeIcon';
import { DeleteIcon } from './icons/DeleteIcon';

import VoiceRecorder from '@/lib/voice/VoiceRecorder';
import TextToSpeech from '@/lib/voice/TextToSpeech';

const quicksand = Quicksand({ subsets: ['latin'] });
const playfair = Playfair_Display({ subsets: ['latin'] });

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
    name: 'Explorer',
    image: '/agents/explorer-agent.svg',
    description: 'Adventurous explorer with a passion for discovery and storytelling',
  },
};

export function Chat() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: submitMessage,
    isLoading,
    setMessages,
    setInput,
    append,
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        handleSubmit(e);
      }
    }
  };

  const handleSummarize = async () => {
    append({ role: 'user', content: 'Please summarize our conversation so far.' });
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to logout');
      }

      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className={`flex h-screen flex-col bg-[#F5F1E9] ${quicksand.className}`}>
      <ChatHeader onLogout={handleLogout} />
      <div className="flex-1 space-y-4 overflow-y-auto p-4" ref={chatContainerRef}>
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex items-center justify-between rounded-lg bg-[#E8F5E9] p-4 transition-all duration-300 ease-out">
              <div className="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="#4CAF50"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                  />
                </svg>
                <span className="text-sm text-[#2E7D32]">Ready to explore</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="#4CAF50"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.171-.879-1.172-2.303 0-3.182C10.536 7.719 11.768 7.5 12 7.5c1.45 0 2.9.439 4.003 1.318"
                  />
                </svg>
                <span className="text-sm text-[#2E7D32]">Ask anything</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {(messages as Array<any>).map((message, index) => {
              const curAgentData = agentInfo[message.agent as keyof typeof agentInfo];

              return (
                <div
                  key={index}
                  className={`animate-fade-in flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'border-l-4 border-[#4CAF50] bg-[#2E7D32] text-white shadow-[0_4px_8px_rgba(46,125,50,0.2)]'
                        : 'border-2 border-[#4CAF50] bg-[#F5F1E9] text-[#2F4F4F]'
                    } relative shadow-lg`}
                  >
                    {message.role === 'assistant' && curAgentData && (
                      <div className="absolute -top-6 left-2 flex items-center space-x-2 rounded-full border border-[#4CAF50] bg-[#F5F1E9] px-2 py-1">
                        <Image
                          src={curAgentData.image}
                          alt={curAgentData.name}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                        <span
                          className={`text-sm font-medium text-[#4CAF50] ${playfair.className}`}
                        >
                          {curAgentData.name}
                        </span>
                        <TextToSpeech text={message.content} />
                      </div>
                    )}
                    <div
                      className={`prose ${
                        message.role === 'user'
                          ? `prose-invert ${quicksand.className} text-lg`
                          : `prose-[#2F4F4F] ${quicksand.className}`
                      } max-w-none`}
                    >
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className="relative rounded-lg border-2 border-[#4CAF50] bg-[#F5F1E9] p-4 shadow-lg">
                  <div className="absolute -top-6 left-2 flex items-center space-x-2 rounded-full border border-[#4CAF50] bg-[#F5F1E9] px-2 py-1">
                    <Image
                      src="/agents/explorer-agent.svg"
                      alt="Explorer"
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    <span className={`text-sm font-medium text-[#4CAF50] ${playfair.className}`}>
                      Explorer
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <LoadingIcon />
                    <div className="flex justify-start">
                      <div className="rounded-xl bg-transparent px-4 py-2.5 text-gray-800">
                        <div className="flex space-x-2">
                          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500" />
                          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 delay-100" />
                          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 delay-200" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className=" bg-transparent p-4">
        <div className="flex w-full flex-col space-y-2 rounded-2xl bg-[#E6E1D5] p-2 shadow-lg">
          <div className="relative flex w-full">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className={`max-h-40 w-full resize-none overflow-hidden rounded-xl bg-transparent p-3 text-gray-700 transition focus:outline-none focus:ring-0 ${quicksand.className}`}
              rows={1}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 transform">
              <VoiceRecorder onRecordingComplete={(text) => setInput(text)} />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex space-x-2">
              <Button
                type="button"
                onClick={handleSummarize}
                variant="summarize"
                disabled={isLoading || messages.length === 0}
                title="Summarize conversation"
                className="rounded-xl bg-blue-500 px-3 py-2 text-white shadow-md transition hover:bg-blue-600"
              >
                <SummarizeIcon />
              </Button>

              <Button
                type="button"
                onClick={() => setMessages([])}
                variant="delete"
                disabled={isLoading || messages.length === 0}
                title="Clear chat history"
                className="rounded-xl bg-red-500 px-3 py-2 text-white shadow-md transition hover:bg-red-600"
              >
                <DeleteIcon />
              </Button>
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              disabled={isLoading}
              title="Send message"
              className="rounded-xl bg-green-500 px-4 py-2 text-white shadow-md transition hover:bg-green-600"
            >
              {isLoading ? <LoadingIcon /> : <SendIcon />}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
