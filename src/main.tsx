// NUCLEAR ARRAY PROTECTION - MUST BE FIRST
import './utils/arrayProtection';

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
