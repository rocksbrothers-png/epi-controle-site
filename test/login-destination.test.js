'use strict';

/*
 * Gate de regressão — DESTINO DE ENTRADA NO SISTEMA (W1).
 *
 * Contrato: TODA entrada pública de login/acesso ao sistema a partir do
 * website resolve para o SaaS (web app Flutter) e NUNCA para o Corporate.
 *
 * Este teste prova MECANISMO, não texto: carrega o `static/i18n.js` REAL num
 * contexto `vm` (com um shim mínimo de window/document) e executa as funções
 * reais de resolução de destino — `EpiLocaleLink.toApp()` e
 * `EpiLocaleLink.updateLinks()` — sobre os atributos reais extraídos do
 * `index.html`. Se o owner (APP_BASE_URL) ou QUALQUER superfície de entrada
 * voltar a apontar para o Corporate, uma asserção falha.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const SAAS_HOST = 'epi-controle-app-livamobile-web.onrender.com';
const CORP_HOST = 'epi-controle-app-gupy.onrender.com';
const SITE_ORIGIN = 'https://epi-controle-site.onrender.com';

/** Carrega um arquivo i18n de browser num sandbox vm e devolve EpiLocaleLink/EpiI18n.
 *  `entryEls` é a lista devolvida por document.querySelectorAll('[data-epi-app-link]'). */
function loadI18n(relPath, entryEls = []) {
  const code = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  const windowStub = {
    location: { search: '', origin: SITE_ORIGIN, href: '' },
    addEventListener() {},
    dispatchEvent() {},
  };
  const documentStub = {
    readyState: 'loading', // impede o autoInit de rodar applyAll() no load
    addEventListener() {},
    getElementById() { return null; },
    querySelectorAll(sel) { return sel === '[data-epi-app-link]' ? entryEls : []; },
    documentElement: {},
    body: {},
  };
  const sandbox = {
    window: windowStub,
    document: documentStub,
    navigator: { language: 'pt-BR' },
    localStorage: { getItem() { return null; }, setItem() {} },
    URL, URLSearchParams, setTimeout, console,
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(code, sandbox, { filename: relPath });
  return { link: windowStub.EpiLocaleLink, i18n: windowStub.EpiI18n, windowStub };
}

/** Extrai, do HTML, cada tag <button>/<a> que é uma entrada para o app
 *  (tem onclick goToApp OU o atributo data-epi-app-link). Devolve stubs de
 *  elemento compatíveis com updateLinks() (getAttribute + href). */
function extractEntryElements(html) {
  const tags = html.match(/<(?:button|a)\b[^>]*>/gi) || [];
  const els = [];
  for (const tag of tags) {
    const isEntry = /goToApp\s*\(/.test(tag) || /\bdata-epi-app-link\b/.test(tag);
    if (!isEntry) continue;
    const valued = tag.match(/data-epi-app-link\s*=\s*"([^"]*)"/i);
    const bare = /\bdata-epi-app-link(?![\w=-])/i.test(tag);
    // getAttribute semantics: valor explícito; "" se atributo sem valor; null se ausente.
    const appLink = valued ? valued[1] : (bare ? '' : null);
    const i18n = (tag.match(/data-i18n\s*=\s*"([^"]*)"/i) || [])[1] || '';
    const attrs = { 'data-epi-app-link': appLink, 'data-i18n': i18n };
    els.push({
      _tag: tag, _i18n: i18n, _href: null,
      getAttribute(n) { return n in attrs ? attrs[n] : null; },
      set href(v) { this._href = v; },
      get href() { return this._href; },
    });
  }
  return els;
}

const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const loginHtml = fs.readFileSync(path.join(ROOT, 'static/index.html'), 'utf8');

test('T1 — owner EpiLocaleLink.toApp() resolve para o SaaS (não Corporate)', () => {
  const { link } = loadI18n('static/i18n.js');
  const url = new URL(link.toApp('pt'));
  assert.equal(url.host, SAAS_HOST, 'toApp() deve apontar para o web app do SaaS');
  assert.notEqual(url.host, CORP_HOST);
  assert.equal(url.searchParams.get('lang'), 'pt', 'locale deve ser propagado');
});

test('T2/T3/T4 — toda superfície de entrada do index.html resolve para o SaaS', () => {
  const els = extractEntryElements(indexHtml);
  assert.ok(els.length >= 6, `esperadas >=6 superfícies de entrada, achei ${els.length}`);
  // Executa o updateLinks() REAL sobre os elementos reais do index.html.
  const { link } = loadI18n('static/i18n.js', els);
  link.updateLinks();
  for (const el of els) {
    const host = new URL(el.href).host;
    assert.equal(host, SAAS_HOST,
      `superfície de entrada (data-i18n="${el._i18n}") deveria resolver para o SaaS, resolveu para ${host}`);
  }
  // E o caminho do onclick (goToApp → toApp → APP_BASE_URL):
  assert.equal(new URL(link.toApp()).host, SAAS_HOST);
});

test('T5 — NENHUMA superfície de entrada resolve para o Corporate (gupy)', () => {
  const els = extractEntryElements(indexHtml);
  const { link } = loadI18n('static/i18n.js', els);
  link.updateLinks();
  for (const el of els) {
    assert.notEqual(new URL(el.href).host, CORP_HOST,
      `superfície (data-i18n="${el._i18n}") NÃO pode apontar para o Corporate`);
  }
  // Nenhum destino de app Corporate hardcoded nos arquivos runtime:
  for (const f of ['index.html', 'static/i18n.js', 'i18n_system.js', 'static/index.html']) {
    const txt = fs.readFileSync(path.join(ROOT, f), 'utf8');
    // Permitido apenas em comentário de proibição ("NUNCA … -gupy"); como
    // URL/atributo de destino, deve estar ausente.
    assert.ok(!/data-epi-app-link\s*=\s*"[^"]*gupy/i.test(txt),
      `${f}: data-epi-app-link não pode conter a URL do Corporate`);
    assert.ok(!/APP_BASE_URL:\s*'[^']*gupy/i.test(txt),
      `${f}: APP_BASE_URL não pode apontar para o Corporate`);
  }
});

test('T6 — o owner duplicado (i18n_system.js) também aponta para o SaaS', () => {
  const { link } = loadI18n('i18n_system.js');
  assert.equal(new URL(link.toApp('pt')).host, SAAS_HOST);
});

test('T6b — signup/demo permanece no fluxo interno/SaaS, nunca no Corporate', () => {
  // Link "Solicitar demonstração" da tela de login local (/app) é interno (#planos).
  const m = loginHtml.match(/<a[^>]*data-i18n="login_request_demo"[^>]*>/i);
  assert.ok(m, 'link de signup/demo deve existir na tela de login');
  const href = (m[0].match(/href\s*=\s*"([^"]*)"/i) || [])[1] || '';
  assert.ok(href.startsWith('#') || href.startsWith('/'), `signup/demo deve ser interno, é "${href}"`);
  assert.ok(!/gupy/i.test(href), 'signup/demo não pode apontar para o Corporate');
});

test('T7 — navegação interna não relacionada permanece intacta', () => {
  for (const anchor of ['#recursos', '#modulos', '#planos', '#contato']) {
    assert.ok(indexHtml.includes(`href="${anchor}"`), `âncora interna ${anchor} deve permanecer`);
  }
});
