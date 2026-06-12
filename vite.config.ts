import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const supabaseUrl = env.VITE_SUPABASE_URL?.replace(/\/+$/, '');
  const defaultProxyTarget = 'http://localhost:54321';

  if (!supabaseUrl) {
    console.warn(
      '[vite.config] VITE_SUPABASE_URL is not defined. Falling back to',
      defaultProxyTarget,
      'for /api proxy target. Set VITE_SUPABASE_URL in .env.local to your Supabase project URL.'
    );
  }

  return {
    plugins: [react()],

    // Performance & SEO optimization
    optimizeDeps: {
      exclude: ['lucide-react'],
      include: ['react', 'react-dom'],
    },

    // 🔒 Security: Build configuration + Performance optimization
    build: {
      // Enable sourcemap for production error tracking (with obfuscation recommended)
      sourcemap: false,

      // Minimize code with terser
      minify: 'terser',

      // Performance: Code splitting strategy for better caching
      rollupOptions: {
        output: {
          // Prevent eval() usage
          strict: true,
          // Code splitting for better caching and parallelization
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react')) {
                return 'vendor-react';
              }
              return 'vendor';
            }
            if (id.includes('src/components')) {
              return 'components';
            }
            if (id.includes('src/pages')) {
              return 'pages';
            }
          },
          entryFileNames: 'js/[name].[hash].js',
          chunkFileNames: 'js/[name].[hash].js',
          assetFileNames: (assetInfo) => {
            const filename = assetInfo.name || 'asset';
            const info = filename.split('.');
            const ext = info[info.length - 1];
            if (/png|jpe?g|gif|svg/.test(ext)) {
              return `images/[name].[hash][extname]`;
            } else if (/woff|woff2|eot|ttf|otf/.test(ext)) {
              return `fonts/[name].[hash][extname]`;
            } else if (ext === 'css') {
              return `css/[name].[hash][extname]`;
            }
            return `assets/[name].[hash][extname]`;
          },
        },
      },

      // Performance: Optimize build output
      reportCompressedSize: true,
      chunkSizeWarningLimit: 500,
      cssCodeSplit: true,

      // Target modern browsers for better compatibility
      target: 'esnext',
    },

    // 🔒 Security: Development server configuration
    server: {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co http://localhost:*; img-src 'self' data: https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
        'Vary': 'Accept-Encoding',
      },
      cors: {
        origin: ['http://localhost:5173', 'http://localhost:3000'],
        credentials: true,
      },
      proxy: {
        '/api': {
          target: 'https://hrxefopvcxhowrzyaqpz.supabase.co/functions/v1/api-gateway',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
      middlewareMode: false,
    },
  };
});
