// EMERGENCY INLINE PATCH - Applied before ANY imports
console.log('🚨 APPLYING INLINE EMERGENCY PATCH');
const originalMap = Array.prototype.map;
Array.prototype.map = function(this: any, ...args: any[]) {
  if (this == null) {
    console.error('🚨 INLINE PATCH: map() on null/undefined:', this);
    console.trace('Inline patch stack trace');
    return [];
  }
  if (typeof this !== 'object' || typeof this.length !== 'number') {
    console.error('🚨 INLINE PATCH: map() on non-array:', this);
    return [];
  }
  try {
    return originalMap.apply(this, args);
  } catch (error) {
    console.error('🚨 INLINE PATCH: map() error:', error);
    return [];
  }
};
console.log('🛡️ INLINE PATCH APPLIED');

import { createRoot } from 'react-dom/client'
import './utils/globalArrayPatch'; // EMERGENCY: Load Array.prototype.map patch first
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
