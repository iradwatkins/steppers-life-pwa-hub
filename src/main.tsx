import { createRoot } from 'react-dom/client'
import './utils/globalArrayPatch'; // EMERGENCY: Load Array.prototype.map patch first
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
