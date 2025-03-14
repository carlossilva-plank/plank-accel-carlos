import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chat AI',
  description: 'Your AI-powered exploration companion',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
