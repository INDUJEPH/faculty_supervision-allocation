import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ command }) => ({
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxy request:', {
              url: req.url,
              method: req.method,
              headers: req.headers,
            });
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Proxy response:', {
              url: req.url,
              method: req.method,
              status: proxyRes.statusCode,
              headers: proxyRes.headers,
            });
          });
        },
      }
    }
  },
  define: {
    'process.env': {},
    global: {},
  },
  plugins: [
    react(),
    command === 'serve' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));        