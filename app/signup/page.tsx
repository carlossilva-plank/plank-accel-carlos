'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Playfair_Display, Quicksand } from 'next/font/google';
import ExplorerLogo from '@/components/icons/ExplorerLogo';

const playfair = Playfair_Display({ subsets: ['latin'] });
const quicksand = Quicksand({ subsets: ['latin'] });

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const message = searchParams.get('message');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      router.replace('/chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex min-h-screen flex-col items-center justify-center bg-[#F5F1E9] ${quicksand.className}`}
    >
      <div className="absolute inset-0 bg-[url('/patterns/compass-pattern.png')] opacity-5"></div>
      <div className="relative w-full max-w-md space-y-8 rounded-lg border-2 border-[#4CAF50] bg-[#F5F1E9] p-8 shadow-lg">
        <div className="flex flex-col items-center space-y-4">
          <ExplorerLogo />
          <div className="text-center">
            <h2 className={`text-3xl font-bold text-[#2E7D32] ${playfair.className}`}>
              Join the Expedition
            </h2>
            <p className="mt-2 text-sm text-[#4CAF50]">Begin your journey of discovery</p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-500">{error}</div>
          )}
          {message && (
            <div className="rounded-lg bg-green-50 p-3 text-center text-sm text-green-500">
              {message}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#2F4F4F]">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border-2 border-[#4CAF50] bg-[#F5F1E9] px-3 py-2 text-[#2F4F4F] placeholder-[#4CAF50]/50 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#2F4F4F]">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border-2 border-[#4CAF50] bg-[#F5F1E9] px-3 py-2 text-[#2F4F4F] placeholder-[#4CAF50]/50 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                placeholder="Create a password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-lg border-2 border-[#4CAF50] bg-[#4CAF50] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2E7D32] focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-[#4CAF50] hover:text-[#2E7D32]"
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
