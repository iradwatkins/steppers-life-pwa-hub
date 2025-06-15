import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Users, BookOpen, User } from 'lucide-react';

const BottomNavPWA = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Calendar, label: 'Events', path: '/events' },
    { icon: BookOpen, label: 'Classes', path: '/classes' },
    { icon: Users, label: 'Community', path: '/community' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-card border-t border-border-default z-50 bottom-nav-mobile">
      <div className="grid grid-cols-5 h-16">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors px-1 ${
                isActive 
                  ? 'text-brand-primary' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavPWA;
