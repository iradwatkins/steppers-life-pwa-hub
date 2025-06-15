
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import EnvironmentIndicator from '@/components/dev/EnvironmentIndicator';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <EnvironmentIndicator />
    </div>
  );
};

export default Layout;
