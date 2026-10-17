import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'web', 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
  const urlPath = req.url ? req.url.split('?')[0] : '/';

  // Healthcheck endpoint
  if (urlPath === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      app: 'Blinka Autonomous Accounts Payable & Treasury Agent (YC F26)',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    }));
    return;
  }

  // API MCP Tool discovery endpoint
  if (urlPath === '/api/mcp-status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      server: 'blinka-mcp-server',
      protocol: 'Model Context Protocol (MCP) v1.0',
      status: 'ONLINE',
      toolsCount: 11,
      tools: [
        'blinka_list_accounts',
        'blinka_get_account',
        'blinka_list_transactions',
        'blinka_list_counterparties',
        'blinka_create_counterparty',
        'blinka_create_payout_method',
        'blinka_approve_payout_method',
        'blinka_create_transfer',
        'blinka_reconcile_invoice',
        'blinka_evaluate_payment_policy',
        'blinka_execute_vendor_payout',
      ],
      legalEntity: 'Acme Global Ventures LLC (Portage Bank FDIC)',
    }));
    return;
  }

  // Static file resolution
  let filePath = path.join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath);

  // Security: Prevent path traversal
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA fallback to index.html
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        return;
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
      });
      res.end(content);
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🏦 Blinka Autonomous AP & Treasury Web Server`);
  console.log(`📡 Listening on 0.0.0.0:${PORT}`);
  console.log(`📁 Serving dist from: ${DIST_DIR}`);
  console.log(`====================================================`);
});
