import { Chat } from '@/components/Chat';

export default function ChatPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <main className="flex-1">
        <div className="mx-auto max-w-7xl">
          <Chat />
        </div>
      </main>
    </div>
  );
}
