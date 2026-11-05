import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CMS_STORAGE_FILE = path.resolve(__dirname, 'cmsLandingPage.json');

export function cmsDevMiddleware() {
  return {
    name: 'cms-landing-sync-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];

        // Landing Page CMS Endpoints
        if (url === '/api/v1/cms/landing-page' || url === '/api/cms/landing-page') {
          if (req.method === 'GET') {
            try {
              if (fs.existsSync(CMS_STORAGE_FILE)) {
                const raw = fs.readFileSync(CMS_STORAGE_FILE, 'utf-8');
                const content = JSON.parse(raw);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: true,
                    message: 'Landing page CMS configuration retrieved successfully.',
                    data: content,
                    errors: null,
                  })
                );
                return;
              }
            } catch (err) {
              console.error('[CMS Middleware] Read error:', err);
            }
          } else if (req.method === 'PUT' || req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                const payload = JSON.parse(body);
                fs.writeFileSync(CMS_STORAGE_FILE, JSON.stringify(payload, null, 2), 'utf-8');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: true,
                    message: 'Landing page CMS configuration updated successfully.',
                    data: payload,
                    errors: null,
                  })
                );
                return;
              } catch (err) {
                console.error('[CMS Middleware] Write error:', err);
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, message: 'Invalid JSON payload' }));
                return;
              }
            });
            return;
          }
        }

        next();
      });
    },
  };
}
