import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import CookieConsent from './CookieConsent';

interface LayoutProps {
  children: ReactNode;
  onOpenOverlay?: () => void;
}

export default function Layout({ children, onOpenOverlay }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header onOpenOverlay={onOpenOverlay} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
} 
