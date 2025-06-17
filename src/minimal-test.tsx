import React from 'react';
import { createRoot } from 'react-dom/client';

// Minimal test component with zero dependencies
const MinimalTest = () => {
  const [message, setMessage] = React.useState('App Loading...');

  React.useEffect(() => {
    setMessage('✅ React is working!');
    
    // Test basic array operations
    try {
      const testArray = [1, 2, 3];
      const mapped = testArray.map(x => x * 2);
      console.log('✅ Array.map works:', mapped);
      
      // Test potential undefined array
      const maybeUndefined: any = undefined;
      try {
        const result = maybeUndefined?.map?.((x: any) => x) || [];
        console.log('✅ Safe array handling works:', result);
      } catch (e) {
        console.error('❌ Unsafe array handling failed:', e);
      }
      
    } catch (e) {
      console.error('❌ Array operations failed:', e);
      setMessage('❌ Array operations failed');
    }
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h1>🧪 Minimal Test Page</h1>
      <p><strong>Status:</strong> {message}</p>
      
      <div style={{ 
        background: '#f0f0f0', 
        padding: '15px', 
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <h3>Test Results:</h3>
        <p>✅ React components render</p>
        <p>✅ useState works</p>
        <p>✅ useEffect works</p>
        <p>Check browser console for array operation results</p>
      </div>

      <div style={{ 
        background: '#e8f5e8', 
        padding: '15px', 
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <h3>Next Steps:</h3>
        <p>If you see this page without errors, the core React app works.</p>
        <p>The issue is likely in complex components, routing, or data loading.</p>
      </div>
    </div>
  );
};

// Completely bypass the main App.tsx
createRoot(document.getElementById("root")!).render(<MinimalTest />);