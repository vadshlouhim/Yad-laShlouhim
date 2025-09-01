import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CookieBanner } from '../cookies/CookieBanner';
import { WhatsAppButton } from '../ui/WhatsAppButton';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CookieBanner />
      <WhatsAppButton />
    </div>
  );
};