import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const DEFAULT_BACKEND_URL = 'https://civillink.jobaleengineering.com';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: DEFAULT_BACKEND_URL.replace(/\/api\/?$/, ''),
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
        },
      },
    },
  },
});
