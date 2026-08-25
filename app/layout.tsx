import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: 'CRMS – Crime Management System',
  description: 'Crime Record Management System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="flex h-screen bg-gray-50 text-gray-900 antialiased overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
