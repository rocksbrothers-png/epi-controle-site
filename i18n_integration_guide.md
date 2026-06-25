# Integração i18n — EPI Controle
## Guia de Implementação Completo

---

## 1. Estrutura de Arquivos

```
static/
├── i18n.js          ← NOVO (arquivo gerado)
├── app.js           ← patches abaixo
└── index.html       ← patches abaixo

website/
└── index.html       ← patches abaixo
```

---

## 2. Como funciona a comunicação Website → Sistema

```
Usuário no website clica "Entrar no Sistema"
        ↓
EpiLocaleLink.goToApp()  →  /app/?lang=pt
        ↓
Sistema (index.html) carrega i18n.js
        ↓
EpiI18n.resolve():
  1. Lê ?lang=pt  da URL           ✓ persiste no localStorage
  2. (ou) lê epi_locale do localStorage
  3. (ou) lê navigator.language
        ↓
EpiI18n.apply('pt')  →  traduz toda a tela de login
        ↓
Usuário loga → sistema continua em PT
```

**Sem API necessária.** O locale viaja via `localStorage` + query string.
O backend não precisa saber o idioma — é 100% frontend.

---

## 3. Patch — `static/index.html` (tela de login)

Adicionar **antes de `</head>`**:
```html
<!-- i18n: carregar ANTES do app.js -->
<script src="/i18n.js?v=20260608-01"></script>
```

Adicionar seletor de idioma no header de login:
```html
<!-- Dentro do card de login, no topo -->
<div id="login-lang-selector" style="text-align:right; margin-bottom:1rem;"></div>
```

Nos campos de login, adicionar atributos `data-i18n`:
```html
<h2 data-i18n="login_title">Acesse sua conta</h2>
<p  data-i18n="login_subtitle">EPI Controle — Gestão & Conformidade</p>

<label for="email" data-i18n="login_email">E-mail</label>
<input id="email" type="email"
       data-i18n="login_email"
       data-i18n-attr="placeholder"
       placeholder="E-mail" />

<label for="password" data-i18n="login_password">Senha</label>
<input id="password" type="password"
       data-i18n="login_password"
       data-i18n-attr="placeholder"
       placeholder="Senha" />

<label>
  <input type="checkbox" />
  <span data-i18n="login_remember">Lembrar acesso</span>
</label>

<a href="#" data-i18n="login_forgot">Esqueci a senha</a>

<button type="submit" id="login-btn" data-i18n="login_btn">Entrar</button>

<p>
  <span data-i18n="login_no_account">Não tem conta?</span>
  <a href="/#planos" data-i18n="login_request_demo">Solicitar demonstração</a>
</p>
```

Inicializar seletor no final do `<body>`:
```html
<script>
  // Renderiza seletor de idioma no login
  EpiLangSelector.render('#login-lang-selector', {
    style: 'pills',
    showFlag: true,
    showName: true,
  });
</script>
```

---

## 4. Patch — `static/app.js`

### 4a. Carregar i18n no início do app (após DOMContentLoaded)

Encontrar onde o app inicializa (geralmente `document.addEventListener('DOMContentLoaded', ...)`)
e adicionar:

```javascript
// ── i18n init ──────────────────────────────────────────────
// Aplica idioma salvo/detectado (já feito pelo auto-init do i18n.js,
// mas re-aplica aqui caso o app.js sobrescreva o DOM)
const _locale = EpiI18n.current();
EpiI18n.apply(_locale);

// Renderiza seletor no header do sistema
EpiLangSelector.render('#app-lang-selector', {
  style: 'dropdown',
  showFlag: true,
  showName: true,
});

// Quando idioma mudar, re-renderiza labels dinâmicos
window.addEventListener('epi:locale-changed', ({ detail }) => {
  EpiI18n.apply(detail.locale);
  // Re-renderiza seletor com novo locale ativo
  EpiLangSelector.render('#app-lang-selector', { style: 'dropdown' });
  // Se o seu app usa funções de render dinâmico, chamar aqui:
  // renderSidebar();
  // renderDashboardLabels();
});
// ───────────────────────────────────────────────────────────
```

### 4b. Usar traduções nos textos gerados dinamicamente

Sempre que o `app.js` gerar HTML com texto fixo, substituir por `t('chave')`:

```javascript
// ANTES:
el.textContent = 'Carregando…';
errorMsg.textContent = 'Ocorreu um erro.';
noData.textContent = 'Nenhum registro encontrado.';

// DEPOIS:
el.textContent = t('sys_loading');
errorMsg.textContent = t('sys_error');
noData.textContent = t('sys_no_data');
```

### 4c. Sidebar / Menu

```javascript
// Substituir strings hardcoded do menu lateral por t():
const MENU_ITEMS = [
  { key: 'sys_dashboard', icon: '📊', section: 'dashboard' },
  { key: 'sys_companies', icon: '🏢', section: 'companies' },
  { key: 'sys_users',     icon: '👤', section: 'users' },
  { key: 'sys_units',     icon: '🏭', section: 'units' },
  { key: 'sys_employees', icon: '👷', section: 'employees' },
  { key: 'sys_epis',      icon: '🦺', section: 'epis' },
  { key: 'sys_stock',     icon: '📦', section: 'stock' },
  { key: 'sys_deliveries',icon: '📤', section: 'deliveries' },
  { key: 'sys_reports',   icon: '📈', section: 'reports' },
  { key: 'sys_audit',     icon: '🔎', section: 'audit' },
  { key: 'sys_settings',  icon: '⚙️', section: 'settings' },
];

function renderSidebar() {
  const ul = document.getElementById('sidebar-menu');
  ul.innerHTML = MENU_ITEMS.map(item => `
    <li>
      <a href="#" onclick="navigate('${item.section}')">
        ${item.icon} ${t(item.key)}
      </a>
    </li>
  `).join('');
}

// Chamar renderSidebar() tanto no init quanto no epi:locale-changed
```

### 4d. Botão de logout

```javascript
// Onde você renderiza o botão de logout:
document.getElementById('btn-logout').textContent = t('sys_logout');
// ou com data-i18n no HTML:
// <button id="btn-logout" data-i18n="sys_logout">Sair</button>
```

---

## 5. Patch — Website institucional (`website/index.html`)

### 5a. Carregar i18n.js

```html
<!-- No <head>, antes de qualquer script que use texto -->
<script src="/i18n.js?v=20260608-01"></script>
```

### 5b. Seletor no header do website

```html
<!-- Dentro do .header-ctas, antes dos botões existentes -->
<div id="website-lang-selector"></div>

<button class="btn-ghost"
        data-epi-app-link="/app/"
        onclick="EpiLocaleLink.goToApp()">
  Solicitar Demo
</button>

<button class="btn-primary"
        data-epi-app-link="/app/"
        onclick="EpiLocaleLink.goToApp()">
  Entrar no Sistema →
</button>
```

### 5c. Atributos data-i18n nas seções

Substituir textos estáticos principais:

```html
<!-- Header -->
<nav>
  <a href="#recursos"   data-i18n="nav_features">Recursos</a>
  <a href="#modulos"    data-i18n="nav_modules">Módulos</a>
  <a href="#planos"     data-i18n="nav_plans">Planos</a>
  <a href="#sobre"      data-i18n="nav_company">Empresa</a>
  <a href="#seguranca"  data-i18n="nav_security">Segurança</a>
  <a href="#contato"    data-i18n="nav_contact">Contato</a>
</nav>

<!-- Hero -->
<div class="hero-badge"><span data-i18n="hero_badge">🔒 Plataforma SaaS Enterprise</span></div>
<h1 data-i18n="hero_h1">Controle completo de EPIs…</h1>
<p  data-i18n="hero_sub">Gerencie equipamentos…</p>
<button data-i18n="hero_cta_demo">Solicitar Demonstração Gratuita</button>

<!-- Stats -->
<div class="stat-label" data-i18n="stat_companies">Empresas Atendidas</div>
<div class="stat-label" data-i18n="stat_users">Usuários Ativos</div>
<div class="stat-label" data-i18n="stat_epis">EPIs Controlados</div>
<div class="stat-label" data-i18n="stat_deliveries">Entregas Registradas</div>
<div class="stat-label" data-i18n="stat_uptime">Disponibilidade</div>

<!-- Planos -->
<div class="pop-badge" data-i18n="plan_popular">⭐ Mais Popular</div>
<button class="btn-plan" data-i18n="plan_cta">Começar Agora</button>

<!-- Rodapé -->
<a data-i18n="footer_privacy">Política de Privacidade</a>
<a data-i18n="footer_terms">Termos de Uso</a>
<div data-i18n="footer_status">Todos os sistemas operacionais</div>
```

### 5d. Inicializar seletor no website

```html
<!-- Final do <body> do website -->
<script>
  EpiLangSelector.render('#website-lang-selector', {
    style: 'dropdown',  // ou 'pills'
    showFlag: true,
    showName: true,
  });

  // Garantir que os links "Entrar" sempre levem para /app/?lang=XX
  EpiLocaleLink.updateLinks();
</script>
```

---

## 6. Adicionar novo idioma (ex: Árabe)

```javascript
// Em i18n.js, adicionar ao EPI_TRANSLATIONS:
'ar': {
  _meta: { name: 'العربية', flag: '🇸🇦', dir: 'rtl', code: 'ar-SA' },
  login_title: 'تسجيل الدخول',
  // ... demais chaves
},

// Em EpiI18n.SUPPORTED, adicionar 'ar':
static SUPPORTED = ['pt', 'en', 'fr', 'es', 'no', 'ar'];
```

O sistema RTL é automático via `document.documentElement.dir`.

---

## 7. Checklist de Deploy

```
[ ] Fazer upload de i18n.js em static/
[ ] Adicionar <script src="/i18n.js"> no index.html ANTES do app.js
[ ] Adicionar <div id="login-lang-selector"> no card de login
[ ] Adicionar data-i18n="..." nos elementos do login
[ ] Adicionar <div id="app-lang-selector"> no header do sistema
[ ] Adicionar data-i18n="..." nos elementos do website
[ ] Substituir strings hardcoded no app.js por t('chave')
[ ] Testar troca de idioma no website → redireciona para /app/?lang=XX
[ ] Testar que o sistema já abre em PT/EN/FR/ES/NO corretamente
[ ] git add static/i18n.js static/index.html static/app.js
[ ] git commit -m "feat(i18n): sistema de tradução PT/EN/FR/ES/NO"
[ ] git push
```

---

## 8. Exemplo de teste rápido no browser

```javascript
// Console do browser — testar sem deploy:
EpiI18n.change('en');    // muda para inglês
EpiI18n.change('no');    // muda para norueguês
EpiI18n.change('fr');    // muda para francês
EpiI18n.change('es');    // muda para espanhol
EpiI18n.change('pt');    // volta para português

t('sys_dashboard')       // retorna "Dashboard" / "Tableau de bord" / etc.
EpiI18n.current()        // retorna locale ativo
EpiLocaleLink.toApp()    // retorna "/app/?lang=pt" (ou atual)
```
