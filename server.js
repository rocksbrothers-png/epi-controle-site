'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const publicDir = __dirname;
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';
const MP_API = 'https://api.mercadopago.com';

const config = {
  mercadoPagoPublicKey: process.env.MERCADO_PAGO_PUBLIC_KEY || '',
  mercadoPagoAccessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
  mercadoPagoWebhookSecret: process.env.MERCADO_PAGO_WEBHOOK_SECRET || '',
  mercadoPagoEnv: process.env.MERCADO_PAGO_ENV || 'sandbox',
  apiBaseUrl: process.env.API_BASE_URL || 'https://epi-controle-app-gupy.onrender.com',
  webBaseUrl: process.env.WEB_BASE_URL || `http://localhost:${port}`,
  webAppUrl: process.env.WEB_APP_URL || '/app/',
  monthlyPreapprovalPlanId: process.env.MP_PREAPPROVAL_PLAN_MONTHLY_ID || '',
  annualPreapprovalPlanId: process.env.MP_PREAPPROVAL_PLAN_ANNUAL_ID || '',
};

const localPayments = new Map();
const localSubscriptions = new Map();
const webhookEvents = [];

const planCatalog = {
  START: { name: 'START', monthly: 297, annual: 2970 },
  BUSINESS: { name: 'BUSINESS', monthly: 597, annual: 5970 },
  CORPORATE: { name: 'CORPORATE', monthly: 1297, annual: 12970 },
};

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

function sendJson(res, statusCode, data) {
  send(res, statusCode, JSON.stringify(data), 'application/json; charset=utf-8');
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload muito grande'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); } catch { reject(new Error('JSON inválido')); }
    });
    req.on('error', reject);
  });
}

function requireMpToken() {
  if (!config.mercadoPagoAccessToken) {
    const error = new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado no backend');
    error.statusCode = 500;
    throw error;
  }
}

function getPlan(planType) {
  const plan = planCatalog[String(planType || '').toUpperCase()];
  if (!plan) {
    const error = new Error('Plano inválido');
    error.statusCode = 400;
    throw error;
  }
  return plan;
}

function getAmount(planType, cycle) {
  const plan = getPlan(planType);
  return cycle === 'annual' ? plan.annual : plan.monthly;
}

function validateTenantPayload(body) {
  if (!body.payer_email || !String(body.payer_email).includes('@')) {
    const error = new Error('payer_email é obrigatório');
    error.statusCode = 400;
    throw error;
  }
  if (!body.company_id) {
    const error = new Error('company_id é obrigatório para liberar acesso multi-tenant');
    error.statusCode = 400;
    throw error;
  }
}

async function mercadoPagoRequest(endpoint, options = {}) {
  requireMpToken();
  const response = await fetch(`${MP_API}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.mercadoPagoAccessToken}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': options.idempotencyKey || crypto.randomUUID(),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const error = new Error(data.message || data.error || 'Erro Mercado Pago');
    error.statusCode = response.status;
    error.details = data;
    throw error;
  }
  return data;
}

function webhookUrl() {
  return `${config.webBaseUrl.replace(/\/$/, '')}/api/payments/webhook`;
}

function buildExternalReference({ company_id, user_id, plan_type, cycle }) {
  return JSON.stringify({ company_id, user_id: user_id || null, plan_type, cycle });
}

async function createCardSubscription(body) {
  validateTenantPayload(body);
  if (!body.card_token_id) {
    const error = new Error('card_token_id é obrigatório');
    error.statusCode = 400;
    throw error;
  }
  const cycle = body.billing_cycle === 'annual' ? 'annual' : 'monthly';
  const plan = getPlan(body.plan_type);
  const preapprovalPlanId = cycle === 'annual' ? config.annualPreapprovalPlanId : config.monthlyPreapprovalPlanId;
  const payload = {
    reason: `EPI Controle ${plan.name} ${cycle === 'annual' ? 'Anual' : 'Mensal'}`,
    external_reference: buildExternalReference({ ...body, plan_type: plan.name, cycle }),
    payer_email: body.payer_email,
    card_token_id: body.card_token_id,
    back_url: config.webAppUrl,
    notification_url: webhookUrl(),
    status: 'authorized',
  };
  if (preapprovalPlanId) payload.preapproval_plan_id = preapprovalPlanId;
  else {
    payload.auto_recurring = {
      frequency: cycle === 'annual' ? 12 : 1,
      frequency_type: 'months',
      transaction_amount: getAmount(plan.name, cycle),
      currency_id: 'BRL',
    };
  }
  const subscription = await mercadoPagoRequest('/preapproval', { method: 'POST', body: JSON.stringify(payload) });
  localSubscriptions.set(String(subscription.id), { ...subscription, company_id: body.company_id, user_id: body.user_id || null });
  return {
    subscription_id: subscription.id,
    status: subscription.status,
    init_point: subscription.init_point,
    web_app_url: config.webAppUrl,
  };
}

async function createPixPayment(body) {
  validateTenantPayload(body);
  const cycle = body.billing_cycle === 'annual' ? 'annual' : 'monthly';
  const plan = getPlan(body.plan_type);
  const payment = await mercadoPagoRequest('/v1/payments', {
    method: 'POST',
    body: JSON.stringify({
      transaction_amount: getAmount(plan.name, cycle),
      description: `EPI Controle ${plan.name} ${cycle === 'annual' ? 'Anual' : 'Mensal'}`,
      payment_method_id: 'pix',
      payer: { email: body.payer_email, first_name: body.payer_name || undefined },
      external_reference: buildExternalReference({ ...body, plan_type: plan.name, cycle }),
      notification_url: webhookUrl(),
      metadata: { company_id: body.company_id, user_id: body.user_id || null, plan_type: plan.name, billing_cycle: cycle },
    }),
  });
  localPayments.set(String(payment.id), payment);
  return normalizePayment(payment);
}

async function createBoletoPayment(body) {
  validateTenantPayload(body);
  const cycle = body.billing_cycle === 'annual' ? 'annual' : 'monthly';
  const plan = getPlan(body.plan_type);
  const payment = await mercadoPagoRequest('/v1/payments', {
    method: 'POST',
    body: JSON.stringify({
      transaction_amount: getAmount(plan.name, cycle),
      description: `EPI Controle ${plan.name} ${cycle === 'annual' ? 'Anual' : 'Mensal'}`,
      payment_method_id: 'bolbradesco',
      payer: { email: body.payer_email, first_name: body.payer_name || undefined },
      external_reference: buildExternalReference({ ...body, plan_type: plan.name, cycle }),
      notification_url: webhookUrl(),
      date_of_expiration: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: { company_id: body.company_id, user_id: body.user_id || null, plan_type: plan.name, billing_cycle: cycle },
    }),
  });
  localPayments.set(String(payment.id), payment);
  return normalizePayment(payment);
}

function normalizePayment(payment) {
  const tx = payment.point_of_interaction?.transaction_data || {};
  return {
    payment_id: payment.id,
    status: payment.status,
    status_detail: payment.status_detail,
    payment_method_id: payment.payment_method_id,
    amount: payment.transaction_amount,
    qr_code: tx.qr_code,
    qr_code_base64: tx.qr_code_base64,
    ticket_url: tx.ticket_url || payment.transaction_details?.external_resource_url,
    boleto_url: tx.ticket_url || payment.transaction_details?.external_resource_url,
    due_date: payment.date_of_expiration,
    web_app_url: config.webAppUrl,
  };
}

async function getPaymentStatus(paymentId) {
  if (!paymentId) {
    const error = new Error('paymentId obrigatório');
    error.statusCode = 400;
    throw error;
  }
  const payment = await mercadoPagoRequest(`/v1/payments/${encodeURIComponent(paymentId)}`, { method: 'GET' });
  localPayments.set(String(payment.id), payment);
  return normalizePayment(payment);
}

function isValidWebhook(req, body) {
  if (!config.mercadoPagoWebhookSecret) return true;
  const signature = req.headers['x-signature'];
  const requestId = req.headers['x-request-id'];
  if (!signature || !requestId) return false;
  const parts = Object.fromEntries(String(signature).split(',').map(part => part.split('=').map(v => v.trim())));
  const dataId = body?.data?.id || body?.id || '';
  const manifest = `id:${dataId};request-id:${requestId};ts:${parts.ts};`;
  const expected = crypto.createHmac('sha256', config.mercadoPagoWebhookSecret).update(manifest).digest('hex');
  const received = parts.v1 || '';
  return received.length === expected.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received, 'utf8'));
}

async function processWebhook(req, body) {
  if (!isValidWebhook(req, body)) {
    const error = new Error('Assinatura do webhook inválida');
    error.statusCode = 401;
    throw error;
  }
  const eventType = body.type || body.topic || body.action;
  const externalId = body?.data?.id || body.id;
  webhookEvents.push({ provider: 'mercado_pago', event_type: eventType, external_id: externalId, payload: body, created_at: new Date().toISOString() });
  if ((eventType === 'payment' || body.topic === 'payment') && externalId) {
    const payment = await getPaymentStatus(externalId);
    return { received: true, processed: true, payment_status: payment.status };
  }
  if ((eventType === 'preapproval' || String(body.action || '').startsWith('updated')) && externalId) {
    const subscription = await mercadoPagoRequest(`/preapproval/${encodeURIComponent(externalId)}`, { method: 'GET' });
    localSubscriptions.set(String(subscription.id), subscription);
    return { received: true, processed: true, subscription_status: subscription.status };
  }
  return { received: true, processed: false };
}

function resolvePublicFile(urlPath) {
  const decodedPath = decodeURIComponent(urlPath);
  const requestedPath = routes.get(decodedPath) || decodedPath.replace(/^\/+/, '');
  if (!publicFiles.has(requestedPath)) return null;
  const filePath = path.normalize(path.join(publicDir, requestedPath));
  if (!filePath.startsWith(publicDir + path.sep)) return null;
  return filePath;
}

async function handleApi(req, res, url) {
  try {
    if (req.method === 'GET' && url.pathname === '/api/payments/config') {
      return sendJson(res, 200, {
        public_key: config.mercadoPagoPublicKey,
        mercado_pago_env: config.mercadoPagoEnv,
        api_base_url: config.apiBaseUrl,
        web_app_url: config.webAppUrl,
      });
    }
    if (req.method === 'GET' && url.pathname.startsWith('/api/payments/status/')) {
      return sendJson(res, 200, await getPaymentStatus(url.pathname.split('/').pop()));
    }
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Método não permitido' });
    const body = await readJson(req);
    if (url.pathname === '/api/payments/create-card-subscription') return sendJson(res, 200, await createCardSubscription(body));
    if (url.pathname === '/api/payments/create-pix-payment') return sendJson(res, 200, await createPixPayment(body));
    if (url.pathname === '/api/payments/create-boleto-payment') return sendJson(res, 200, await createBoletoPayment(body));
    if (url.pathname === '/api/payments/webhook') return sendJson(res, 200, await processWebhook(req, body));
    return sendJson(res, 404, { error: 'Endpoint não encontrado' });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, { error: error.message, details: error.details });
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/healthz') return sendJson(res, 200, { status: 'ok' });
  if (url.pathname.startsWith('/api/payments/')) return handleApi(req, res, url);
  const filePath = resolvePublicFile(url.pathname);
  if (!filePath) return send(res, 403, 'Acesso negado');
  fs.readFile(filePath, (error, data) => {
    if (error) return send(res, 404, 'Página não encontrada');
    send(res, 200, data, contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream');
  });
});

server.listen(port, host, () => {
  console.log(`EPI Controle site rodando em http://${host}:${port}`);
});
