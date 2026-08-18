import { defineConfig, loadEnv } from 'vite';

import { applyWhatsappNumber, resolveWhatsappNumber } from './shared/whatsapp.js';

function injectWhatsappNumber(number) {
  return {
    name: 'inject-whatsapp-number',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return applyWhatsappNumber(html, number);
      }
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const whatsappNumber = resolveWhatsappNumber(env.WHATSAPP_NUMBER);

  return {
    root: '.',
    publicDir: 'public',
    plugins: [injectWhatsappNumber(whatsappNumber)],
    build: {
      outDir: 'dist',
      minify: 'terser',
      terserOptions: {
        compress: { drop_console: false, drop_debugger: true },
        format: { comments: false }
      },
      rollupOptions: {
        input: {
          main: './index.html',
          error: './error.html'
        }
      }
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true
        }
      }
    }
  };
});
