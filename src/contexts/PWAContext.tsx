
import React, { createContext, useContext } from 'react';
import { usePWA } from '@/hooks/usePWA';

type PWAContextType = ReturnType<typeof usePWA>;

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pwaHook = usePWA();

  return (
    <PWAContext.Provider value={pwaHook}>
      {children}
    </PWAContext.Provider>
  );
};

export const usePWAContext = () => {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWAContext must be used within a PWAProvider');
  }
  return context;
};
