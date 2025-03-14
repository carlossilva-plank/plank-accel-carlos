import { Chat } from '@/components/Chat';

export default function ChatPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F1E9]">
      <main className="flex-1">
        <div className="mx-auto max-w-7xl">
          <Chat />
        </div>
      </main>
    </div>
  );
}
