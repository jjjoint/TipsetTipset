import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Stryktipsanalys',
  description: 'Lokal Stryktipset-analys med sannolikhetsmodellering',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </body>
    </html>
  );
}
