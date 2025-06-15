import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNavPWA from './BottomNavPWA';

const AppLayout = () => {
  return (
    <div className="app-layout flex flex-col min-h-screen bg-background-main">
      <Header />
      <main className="main-content flex-grow main-content-with-bottom-nav">
        <Outlet />
      </main>
      <BottomNavPWA />
    </div>
  );
};

export default AppLayout;
