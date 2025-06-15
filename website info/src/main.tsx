import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'
import { initBrowserEnv } from './lib/env'
import { ensureIradIsAdmin } from './utils/ensureAdminUser'

// Initialize environment variables
initBrowserEnv();

// Ensure admin user is properly set up
ensureIradIsAdmin().catch(console.error);

// Clean initialization - NO PWA, NO service workers
console.log('🚀 SteppersLife Development Mode - Clean Setup');
console.log('📍 Environment:', import.meta.env.MODE);
console.log('🔗 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);