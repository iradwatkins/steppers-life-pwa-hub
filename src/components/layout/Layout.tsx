
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import EnvironmentIndicator from '@/components/dev/EnvironmentIndicator';
import { PWAInstallPrompt, PWAUpdatePrompt, OfflineIndicator } from '@/components/PWAComponents';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <OfflineIndicator />
      <PWAUpdatePrompt />
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <PWAInstallPrompt />
      <EnvironmentIndicator />
    </div>
  );
};

export default Layout;
