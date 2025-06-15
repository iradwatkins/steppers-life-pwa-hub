/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Clean development configuration - NO PWA, NO service workers
export default defineConfig(({ mode }) => ({
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    target: 'es2020',
    minify: 'esbuild',
    esbuild: {
      keepNames: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui-components': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', 'lucide-react'],
          'supabase': ['@supabase/supabase-js'],
          'charts': ['recharts'],
          'utils': ['date-fns', 'clsx', 'tailwind-merge']
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },
  base: '/',
  plugins: [
    react(),
    mode === 'development' && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
  define: {
    // Ensure environment variables are properly defined
    'process.env.NODE_ENV': JSON.stringify(mode)
  }
}));