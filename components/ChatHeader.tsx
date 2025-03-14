'use client';

import Image from 'next/image';
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({ subsets: ['latin'] });

interface ChatHeaderProps {
  onLogout: () => Promise<void>;
}

export function ChatHeader({ onLogout }: ChatHeaderProps) {
  return (
    <header className="relative border-b border-[#4CAF50] bg-[#F5F1E9] p-6">
      <div className="absolute inset-0 bg-[url('/patterns/compass-pattern.png')] opacity-5"></div>
      <div className="relative mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative h-12 w-12">
              <Image
                src="/agents/explorer-agent.svg"
                alt="Explorer Logo"
                fill
                className="rounded-full border-2 border-[#4CAF50]"
              />
            </div>
            <div>
              <h1 className={`text-2xl font-bold text-[#2E7D32] ${playfair.className}`}>
                AI Explorer
              </h1>
              <p className="text-sm text-[#4CAF50]">Your guide to discovery and adventure</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative h-4 w-4">
              <Image src="/icons/compass.svg" alt="Compass" fill className="animate-pulse" />
            </div>
            <div className="relative h-4 w-4">
              <Image
                src="/icons/map.svg"
                alt="Map"
                fill
                className="animate-pulse"
                style={{ animationDelay: '0.5s' }}
              />
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 rounded-lg border-2 border-[#4CAF50] bg-[#F5F1E9] px-3 py-1.5 text-[#4CAF50] transition-colors hover:bg-[#4CAF50] hover:text-white"
              title="Sign out"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
