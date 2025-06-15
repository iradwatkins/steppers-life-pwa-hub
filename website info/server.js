import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8085;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React Router routes by serving index.html for all non-file requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log('🚀 PWA Server running at:');
  console.log(`   Local:   http://localhost:${port}/`);
  console.log(`   Network: http://192.168.86.40:${port}/`);
  console.log(`   Staff:   http://192.168.86.40:${port}/staff-install`);
  console.log(`   PWA:     http://192.168.86.40:${port}/pwa/login`);
  console.log('');
  console.log('📱 Share the Network URL with staff for PWA installation');
  console.log('💡 Press Ctrl+C to stop the server');
}); 