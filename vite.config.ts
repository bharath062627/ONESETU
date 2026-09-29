import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { handleMarketApiRequest } from './src/server/marketApiRouter';
import { handleAuthApiRequest } from './src/server/authApiRouter';

function backendApiPlugin(): Plugin {
  return {
    name: 'backend-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/api/market')) {
          const [urlPath, queryString] = req.url.split('?');
          const query: Record<string, string> = {};
          if (queryString) {
            new URLSearchParams(queryString).forEach((val, key) => {
              query[key] = val;
            });
          }
          const response = handleMarketApiRequest(urlPath, req.method || 'GET', query);
          res.statusCode = response.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(response.data));
        } else if (req.url && (req.url.startsWith('/api/auth') || req.url.startsWith('/api/admin'))) {
          const [urlPath] = req.url.split('?');
          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });
          req.on('end', () => {
            let body = {};
            if (bodyStr) {
              try {
                body = JSON.parse(bodyStr);
              } catch {}
            }
            const response = handleAuthApiRequest(urlPath, req.method || 'GET', body, req.headers as any);
            res.statusCode = response.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(response.data));
          });
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), backendApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
