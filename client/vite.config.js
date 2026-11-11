import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const DEFAULT_BACKEND_URL = 'https://civillink.jobaleengineering.com';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = (env.VITE_BACKEND_URL || env.BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/api\/?$/, '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target,
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
  };
});
