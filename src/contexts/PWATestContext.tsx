import React, { createContext, useContext, useState } from 'react';

interface PWATestContextType {
  forceRefresh: boolean;
  setForceRefresh: (value: boolean) => void;
}

const PWATestContext = createContext<PWATestContextType | undefined>(undefined);

export const PWATestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [forceRefresh, setForceRefresh] = useState(false);

  return (
    <PWATestContext.Provider value={{ forceRefresh, setForceRefresh }}>
      {children}
    </PWATestContext.Provider>
  );
};

export const usePWATest = (): PWATestContextType => {
  const context = useContext(PWATestContext);
  if (!context) {
    throw new Error('usePWATest must be used within a PWATestProvider');
  }
  return context;
};