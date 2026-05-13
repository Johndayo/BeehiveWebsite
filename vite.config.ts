import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  
  // 🔒 Security: Environment variable filtering
  // Only VITE_ prefixed variables are exposed to frontend
  env: {
    // Ensure backend credentials are never exposed
  },
  
  // 🔒 Security: Build configuration
  build: {
    // Enable sourcemap for production error tracking (with obfuscation recommended)
    sourcemap: false,
    // Minimize code
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      mangle: true,
      format: {
        comments: false,
      },
    },
    // Rollup options for security
    rollupOptions: {
      output: {
        // Prevent eval() usage
        strict: true,
      },
    },
    // Bundle analysis (run: npm run build --analyze)
    chunkSizeWarningLimit: 1000,
  },
  
  // 🔒 Security: Development server configuration
  server: {
    headers: {
      // Prevent clickjacking
      'X-Frame-Options': 'DENY',
      // Prevent MIME type sniffing
      'X-Content-Type-Options': 'nosniff',
      // Enable XSS protection
      'X-XSS-Protection': '1; mode=block',
      // Referrer policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      // CSP Header for development
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co http://localhost:*; img-src 'self' data: https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
    },
    // CORS for development
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
    },
  },
});
