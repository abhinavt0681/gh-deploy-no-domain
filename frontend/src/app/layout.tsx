import '@/styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Grace Harbor Analytics',
  description: 'Real estate market analytics for Massachusetts properties',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
} 