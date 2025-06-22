// NUCLEAR ARRAY PROTECTION - MUST BE FIRST
import './utils/arrayProtection';
// EXTENSION INTERFERENCE PROTECTION
import './utils/extensionProtection';
// NAVIGATION FIX UTILITY
import { debugNavigation } from './utils/navigationFix';

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize navigation debugging in development
debugNavigation();

createRoot(document.getElementById("root")!).render(<App />);
