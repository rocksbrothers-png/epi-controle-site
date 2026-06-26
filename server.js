'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const publicDir = __dirname;
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';

const routes = new Map([
  ['/', 'index.html'],
  ['/pagamento', 'epi_payment_system.html'],
  ['/i18n-preview', 'i18n_preview.html'],
  ['/app', 'static/index.html'],
  ['/app/', 'static/index.html'],
]);

const publicFiles = new Set([
  'index.html',
  'epi_controle_website.html',
  'epi_payment_system.html',
  'i18n_preview.html',
  'i18n_system.js',
  'Resumo_Gramatica_Ingles_8Ano_COMPLETO_MAIOR.pdf',
  'static/index.html',
  'static/app.js',
  'static/i18n.js',
]);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function send(res, statusCode, body, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(body);
}

function resolvePublicFile(urlPath) {
  const decodedPath = decodeURIComponent(urlPath);
  const requestedPath = routes.get(decodedPath) || decodedPath.replace(/^\/+/, '');

  if (!publicFiles.has(requestedPath)) {
    return null;
  }

  const filePath = path.normalize(path.join(publicDir, requestedPath));

  if (!filePath.startsWith(publicDir + path.sep)) {
    return null;
  }

  return filePath;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/healthz') {
    return send(res, 200, JSON.stringify({ status: 'ok' }), 'application/json; charset=utf-8');
  }

  const filePath = resolvePublicFile(url.pathname);

  if (!filePath) {
    return send(res, 403, 'Acesso negado');
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      return send(res, 404, 'Página não encontrada');
    }

    const extension = path.extname(filePath).toLowerCase();
    send(res, 200, data, contentTypes[extension] || 'application/octet-stream');
  });
});

server.listen(port, host, () => {
  console.log(`EPI Controle site rodando em http://${host}:${port}`);
});
