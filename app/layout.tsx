import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { MailProvider } from '@/context/MailContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Dr. Abo Elfath — Mail Manager',
  description: 'Personal mail management system for Dr. Abo Elfath — organize, archive, and manage important correspondence.',
  keywords: ['mail', 'email manager', 'correspondence', 'Dr. Abo Elfath'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <MailProvider>
          {children}
        </MailProvider>
      </body>
    </html>
  );
}
