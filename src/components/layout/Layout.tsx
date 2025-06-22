
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import EnvironmentIndicator from '@/components/dev/EnvironmentIndicator';
import NavigationTest from '@/components/dev/NavigationTest';
import { PWAInstallPrompt, PWAUpdatePrompt, OfflineIndicator } from '@/components/PWAComponents';
import { useLocationChange } from '@/utils/navigationFix';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocationChange();
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <OfflineIndicator />
      <PWAUpdatePrompt />
      <Header key={`header-${location.pathname}`} />
      <main className="flex-1" key={`main-${location.pathname}`}>
        {children}
      </main>
      <Footer />
      <PWAInstallPrompt />
      <EnvironmentIndicator />
      <NavigationTest />
    </div>
  );
};

export default Layout;
