/* ============================================================
   EPI CONTROLE — SISTEMA DE INTERNACIONALIZAÇÃO (i18n)
   Arquivo: static/i18n.js
   Versão:  1.0.0
   Idiomas: PT-BR · EN · FR · ES · NO

   ARQUITETURA:
   ─────────────────────────────────────────────────────────────
   Website (/)          → salva locale em localStorage + URL param
        ↓  redirect  /app/?lang=pt
   Sistema (/app/)      → lê localStorage > URL param > navigator
        ↓  aplica
   Tela de login        → já renderiza no idioma correto
   ─────────────────────────────────────────────────────────────
   INTEGRAÇÃO SEM API (recomendada):
   O locale é passado via localStorage['epi_locale'] e também
   via query string ?lang=XX como fallback. Isso evita round-trip
   de API e funciona mesmo antes do login.
   ============================================================ */

// ─────────────────────────────────────────────────────────────
// 1. DICIONÁRIO COMPLETO
// ─────────────────────────────────────────────────────────────
const EPI_TRANSLATIONS = {

  /* ── PORTUGUÊS BRASILEIRO (padrão) ── */
  'pt': {
    _meta: { name: 'Português', flag: '🇧🇷', dir: 'ltr', code: 'pt-BR' },

    // Navegação / Header
    nav_home: 'Início',
    nav_features: 'Recursos',
    nav_solutions: 'Soluções',
    nav_modules: 'Módulos',
    nav_plans: 'Planos',
    nav_company: 'Empresa',
    nav_security: 'Segurança',
    nav_blog: 'Blog',
    nav_contact: 'Contato',
    btn_login: 'Entrar no Sistema',
    btn_demo: 'Solicitar Demonstração',

    // Hero
    hero_badge: '🔒 Plataforma SaaS Enterprise',
    hero_h1: 'Controle completo de EPIs, estoque e conformidade em uma única plataforma.',
    hero_sub: 'Gerencie equipamentos, colaboradores, entregas digitais e auditorias com tecnologia de ponta. Do estoque à assinatura eletrônica, tudo integrado e rastreável.',
    hero_cta_demo: 'Solicitar Demonstração Gratuita',
    hero_cta_login: 'Entrar no Sistema →',
    tag_signature: '✓ Assinatura Digital',
    tag_qrcode: '✓ QR Code Individual',
    tag_ocr: '✓ OCR Inteligente',
    tag_audit: '✓ Auditoria Completa',
    tag_lgpd: '✓ LGPD Compliance',
    tag_multi: '✓ Multiempresa',

    // Stats
    stat_companies: 'Empresas Atendidas',
    stat_users: 'Usuários Ativos',
    stat_epis: 'EPIs Controlados',
    stat_deliveries: 'Entregas Registradas',
    stat_uptime: 'Disponibilidade',

    // Seções
    section_benefits: 'Benefícios',
    section_benefits_title: 'Tudo que sua empresa precisa para gestão eficiente de EPIs',
    section_modules: 'Módulos',
    section_modules_title: 'Plataforma modular e escalável',
    section_plans: 'Planos',
    section_plans_title: 'Escolha o plano ideal para sua empresa',
    section_security: 'Segurança & Compliance',
    section_about: 'Sobre Nós',
    section_faq: 'Perguntas Frequentes',
    section_testimonials: 'Depoimentos',

    // Planos
    plan_popular: '⭐ Mais Popular',
    plan_users_up_to: 'Até',
    plan_users_label: 'usuários',
    plan_consult: 'Sob Consulta',
    plan_cta: 'Começar Agora',
    plan_cta_enterprise: 'Falar com Comercial',
    plan_annual_save: '🎉 2 meses grátis',
    cycle_monthly: 'Mensal',
    cycle_annual: 'Anual',

    // Login (tela do sistema)
    login_title: 'Acesse sua conta',
    login_subtitle: 'EPI Controle — Gestão & Conformidade',
    login_email: 'E-mail',
    login_password: 'Senha',
    login_remember: 'Lembrar acesso',
    login_forgot: 'Esqueci a senha',
    login_btn: 'Entrar',
    login_loading: 'Verificando…',
    login_error_credentials: 'E-mail ou senha incorretos.',
    login_error_generic: 'Erro ao conectar. Tente novamente.',
    login_no_account: 'Não tem conta?',
    login_request_demo: 'Solicitar demonstração',

    // Sistema — geral
    sys_dashboard: 'Dashboard',
    sys_companies: 'Empresas',
    sys_users: 'Usuários',
    sys_units: 'Unidades',
    sys_employees: 'Colaboradores',
    sys_epis: 'EPIs',
    sys_stock: 'Estoque',
    sys_deliveries: 'Entregas',
    sys_reports: 'Relatórios',
    sys_audit: 'Auditoria',
    sys_settings: 'Configurações',
    sys_logout: 'Sair',
    sys_save: 'Salvar',
    sys_cancel: 'Cancelar',
    sys_edit: 'Editar',
    sys_delete: 'Excluir',
    sys_confirm: 'Confirmar',
    sys_search: 'Buscar…',
    sys_filter: 'Filtrar',
    sys_export: 'Exportar',
    sys_loading: 'Carregando…',
    sys_error: 'Ocorreu um erro.',
    sys_success: 'Operação realizada com sucesso!',
    sys_no_data: 'Nenhum registro encontrado.',
    sys_welcome: 'Bem-vindo,',
    sys_language: 'Idioma',

    // Rodapé
    footer_rights: 'Todos os direitos reservados.',
    footer_privacy: 'Política de Privacidade',
    footer_terms: 'Termos de Uso',
    footer_status: 'Todos os sistemas operacionais',
  },

  /* ── ENGLISH ── */
  'en': {
    _meta: { name: 'English', flag: '🇬🇧', dir: 'ltr', code: 'en-US' },

    nav_home: 'Home',
    nav_features: 'Features',
    nav_solutions: 'Solutions',
    nav_modules: 'Modules',
    nav_plans: 'Plans',
    nav_company: 'Company',
    nav_security: 'Security',
    nav_blog: 'Blog',
    nav_contact: 'Contact',
    btn_login: 'Log in to System',
    btn_demo: 'Request a Demo',

    hero_badge: '🔒 Enterprise SaaS Platform',
    hero_h1: 'Complete PPE, inventory, and compliance control in one platform.',
    hero_sub: 'Manage equipment, employees, digital deliveries, and audits with cutting-edge technology. From stock to electronic signature, everything integrated and traceable.',
    hero_cta_demo: 'Request Free Demo',
    hero_cta_login: 'Log in to System →',
    tag_signature: '✓ Digital Signature',
    tag_qrcode: '✓ Individual QR Code',
    tag_ocr: '✓ Smart OCR',
    tag_audit: '✓ Full Audit Trail',
    tag_lgpd: '✓ GDPR Compliant',
    tag_multi: '✓ Multi-company',

    stat_companies: 'Companies Served',
    stat_users: 'Active Users',
    stat_epis: 'PPE Items Tracked',
    stat_deliveries: 'Deliveries Recorded',
    stat_uptime: 'Uptime',

    section_benefits: 'Benefits',
    section_benefits_title: 'Everything your company needs for efficient PPE management',
    section_modules: 'Modules',
    section_modules_title: 'Modular and scalable platform',
    section_plans: 'Plans',
    section_plans_title: 'Choose the right plan for your company',
    section_security: 'Security & Compliance',
    section_about: 'About Us',
    section_faq: 'FAQ',
    section_testimonials: 'Testimonials',

    plan_popular: '⭐ Most Popular',
    plan_users_up_to: 'Up to',
    plan_users_label: 'users',
    plan_consult: 'Contact Us',
    plan_cta: 'Get Started',
    plan_cta_enterprise: 'Talk to Sales',
    plan_annual_save: '🎉 2 months free',
    cycle_monthly: 'Monthly',
    cycle_annual: 'Annual',

    login_title: 'Sign in to your account',
    login_subtitle: 'EPI Controle — Management & Compliance',
    login_email: 'Email',
    login_password: 'Password',
    login_remember: 'Remember me',
    login_forgot: 'Forgot password',
    login_btn: 'Sign In',
    login_loading: 'Verifying…',
    login_error_credentials: 'Incorrect email or password.',
    login_error_generic: 'Connection error. Please try again.',
    login_no_account: "Don't have an account?",
    login_request_demo: 'Request a demo',

    sys_dashboard: 'Dashboard',
    sys_companies: 'Companies',
    sys_users: 'Users',
    sys_units: 'Units',
    sys_employees: 'Employees',
    sys_epis: 'PPE Items',
    sys_stock: 'Stock',
    sys_deliveries: 'Deliveries',
    sys_reports: 'Reports',
    sys_audit: 'Audit',
    sys_settings: 'Settings',
    sys_logout: 'Log out',
    sys_save: 'Save',
    sys_cancel: 'Cancel',
    sys_edit: 'Edit',
    sys_delete: 'Delete',
    sys_confirm: 'Confirm',
    sys_search: 'Search…',
    sys_filter: 'Filter',
    sys_export: 'Export',
    sys_loading: 'Loading…',
    sys_error: 'An error occurred.',
    sys_success: 'Operation completed successfully!',
    sys_no_data: 'No records found.',
    sys_welcome: 'Welcome,',
    sys_language: 'Language',

    footer_rights: 'All rights reserved.',
    footer_privacy: 'Privacy Policy',
    footer_terms: 'Terms of Use',
    footer_status: 'All systems operational',
  },

  /* ── FRANÇAIS ── */
  'fr': {
    _meta: { name: 'Français', flag: '🇫🇷', dir: 'ltr', code: 'fr-FR' },

    nav_home: 'Accueil',
    nav_features: 'Fonctionnalités',
    nav_solutions: 'Solutions',
    nav_modules: 'Modules',
    nav_plans: 'Tarifs',
    nav_company: 'Entreprise',
    nav_security: 'Sécurité',
    nav_blog: 'Blog',
    nav_contact: 'Contact',
    btn_login: 'Accéder au Système',
    btn_demo: 'Demander une Démo',

    hero_badge: '🔒 Plateforme SaaS Enterprise',
    hero_h1: 'Contrôle complet des EPI, des stocks et de la conformité en une seule plateforme.',
    hero_sub: 'Gérez les équipements, les collaborateurs, les livraisons numériques et les audits avec une technologie de pointe. Du stock à la signature électronique, tout est intégré et traçable.',
    hero_cta_demo: 'Demander une Démo Gratuite',
    hero_cta_login: 'Accéder au Système →',
    tag_signature: '✓ Signature Numérique',
    tag_qrcode: '✓ QR Code Individuel',
    tag_ocr: '✓ OCR Intelligent',
    tag_audit: '✓ Audit Complet',
    tag_lgpd: '✓ Conforme RGPD',
    tag_multi: '✓ Multi-entreprise',

    stat_companies: 'Entreprises Clientes',
    stat_users: 'Utilisateurs Actifs',
    stat_epis: 'EPI Contrôlés',
    stat_deliveries: 'Livraisons Enregistrées',
    stat_uptime: 'Disponibilité',

    section_benefits: 'Avantages',
    section_benefits_title: 'Tout ce dont votre entreprise a besoin pour gérer les EPI efficacement',
    section_modules: 'Modules',
    section_modules_title: 'Plateforme modulaire et évolutive',
    section_plans: 'Tarifs',
    section_plans_title: 'Choisissez le plan adapté à votre entreprise',
    section_security: 'Sécurité & Conformité',
    section_about: 'À Propos',
    section_faq: 'FAQ',
    section_testimonials: 'Témoignages',

    plan_popular: '⭐ Le Plus Populaire',
    plan_users_up_to: "Jusqu'à",
    plan_users_label: 'utilisateurs',
    plan_consult: 'Nous Contacter',
    plan_cta: 'Commencer',
    plan_cta_enterprise: 'Contacter les Ventes',
    plan_annual_save: '🎉 2 mois offerts',
    cycle_monthly: 'Mensuel',
    cycle_annual: 'Annuel',

    login_title: 'Connectez-vous à votre compte',
    login_subtitle: 'EPI Controle — Gestion & Conformité',
    login_email: 'E-mail',
    login_password: 'Mot de passe',
    login_remember: 'Se souvenir de moi',
    login_forgot: 'Mot de passe oublié',
    login_btn: 'Se Connecter',
    login_loading: 'Vérification…',
    login_error_credentials: 'E-mail ou mot de passe incorrect.',
    login_error_generic: 'Erreur de connexion. Veuillez réessayer.',
    login_no_account: 'Pas encore de compte ?',
    login_request_demo: 'Demander une démo',

    sys_dashboard: 'Tableau de bord',
    sys_companies: 'Entreprises',
    sys_users: 'Utilisateurs',
    sys_units: 'Unités',
    sys_employees: 'Collaborateurs',
    sys_epis: 'EPI',
    sys_stock: 'Stock',
    sys_deliveries: 'Livraisons',
    sys_reports: 'Rapports',
    sys_audit: 'Audit',
    sys_settings: 'Paramètres',
    sys_logout: 'Déconnexion',
    sys_save: 'Enregistrer',
    sys_cancel: 'Annuler',
    sys_edit: 'Modifier',
    sys_delete: 'Supprimer',
    sys_confirm: 'Confirmer',
    sys_search: 'Rechercher…',
    sys_filter: 'Filtrer',
    sys_export: 'Exporter',
    sys_loading: 'Chargement…',
    sys_error: 'Une erreur est survenue.',
    sys_success: 'Opération réussie !',
    sys_no_data: 'Aucun enregistrement trouvé.',
    sys_welcome: 'Bienvenue,',
    sys_language: 'Langue',

    footer_rights: 'Tous droits réservés.',
    footer_privacy: 'Politique de Confidentialité',
    footer_terms: "Conditions d'Utilisation",
    footer_status: 'Tous les systèmes opérationnels',
  },

  /* ── ESPAÑOL ── */
  'es': {
    _meta: { name: 'Español', flag: '🇪🇸', dir: 'ltr', code: 'es-ES' },

    nav_home: 'Inicio',
    nav_features: 'Recursos',
    nav_solutions: 'Soluciones',
    nav_modules: 'Módulos',
    nav_plans: 'Planes',
    nav_company: 'Empresa',
    nav_security: 'Seguridad',
    nav_blog: 'Blog',
    nav_contact: 'Contacto',
    btn_login: 'Entrar al Sistema',
    btn_demo: 'Solicitar Demo',

    hero_badge: '🔒 Plataforma SaaS Enterprise',
    hero_h1: 'Control completo de EPP, inventario y cumplimiento en una sola plataforma.',
    hero_sub: 'Gestione equipos, colaboradores, entregas digitales y auditorías con tecnología de punta. Desde el inventario hasta la firma electrónica, todo integrado y rastreable.',
    hero_cta_demo: 'Solicitar Demo Gratuita',
    hero_cta_login: 'Entrar al Sistema →',
    tag_signature: '✓ Firma Digital',
    tag_qrcode: '✓ Código QR Individual',
    tag_ocr: '✓ OCR Inteligente',
    tag_audit: '✓ Auditoría Completa',
    tag_lgpd: '✓ Cumplimiento RGPD',
    tag_multi: '✓ Multiempresa',

    stat_companies: 'Empresas Atendidas',
    stat_users: 'Usuarios Activos',
    stat_epis: 'EPP Controlados',
    stat_deliveries: 'Entregas Registradas',
    stat_uptime: 'Disponibilidad',

    section_benefits: 'Beneficios',
    section_benefits_title: 'Todo lo que su empresa necesita para la gestión eficiente de EPP',
    section_modules: 'Módulos',
    section_modules_title: 'Plataforma modular y escalable',
    section_plans: 'Planes',
    section_plans_title: 'Elija el plan ideal para su empresa',
    section_security: 'Seguridad & Cumplimiento',
    section_about: 'Acerca de',
    section_faq: 'Preguntas Frecuentes',
    section_testimonials: 'Testimonios',

    plan_popular: '⭐ Más Popular',
    plan_users_up_to: 'Hasta',
    plan_users_label: 'usuarios',
    plan_consult: 'Consultar',
    plan_cta: 'Comenzar Ahora',
    plan_cta_enterprise: 'Hablar con Ventas',
    plan_annual_save: '🎉 2 meses gratis',
    cycle_monthly: 'Mensual',
    cycle_annual: 'Anual',

    login_title: 'Acceda a su cuenta',
    login_subtitle: 'EPI Controle — Gestión & Cumplimiento',
    login_email: 'Correo electrónico',
    login_password: 'Contraseña',
    login_remember: 'Recordar acceso',
    login_forgot: 'Olvidé mi contraseña',
    login_btn: 'Entrar',
    login_loading: 'Verificando…',
    login_error_credentials: 'Correo o contraseña incorrectos.',
    login_error_generic: 'Error de conexión. Intente nuevamente.',
    login_no_account: '¿No tiene cuenta?',
    login_request_demo: 'Solicitar una demo',

    sys_dashboard: 'Panel',
    sys_companies: 'Empresas',
    sys_users: 'Usuarios',
    sys_units: 'Unidades',
    sys_employees: 'Colaboradores',
    sys_epis: 'EPP',
    sys_stock: 'Inventario',
    sys_deliveries: 'Entregas',
    sys_reports: 'Informes',
    sys_audit: 'Auditoría',
    sys_settings: 'Configuración',
    sys_logout: 'Salir',
    sys_save: 'Guardar',
    sys_cancel: 'Cancelar',
    sys_edit: 'Editar',
    sys_delete: 'Eliminar',
    sys_confirm: 'Confirmar',
    sys_search: 'Buscar…',
    sys_filter: 'Filtrar',
    sys_export: 'Exportar',
    sys_loading: 'Cargando…',
    sys_error: 'Ocurrió un error.',
    sys_success: '¡Operación realizada con éxito!',
    sys_no_data: 'No se encontraron registros.',
    sys_welcome: 'Bienvenido,',
    sys_language: 'Idioma',

    footer_rights: 'Todos los derechos reservados.',
    footer_privacy: 'Política de Privacidad',
    footer_terms: 'Términos de Uso',
    footer_status: 'Todos los sistemas operativos',
  },

  /* ── NORSK (Bokmål) ── */
  'no': {
    _meta: { name: 'Norsk', flag: '🇳🇴', dir: 'ltr', code: 'nb-NO' },

    nav_home: 'Hjem',
    nav_features: 'Funksjoner',
    nav_solutions: 'Løsninger',
    nav_modules: 'Moduler',
    nav_plans: 'Priser',
    nav_company: 'Selskap',
    nav_security: 'Sikkerhet',
    nav_blog: 'Blogg',
    nav_contact: 'Kontakt',
    btn_login: 'Logg inn på System',
    btn_demo: 'Be om Demo',

    hero_badge: '🔒 Enterprise SaaS-plattform',
    hero_h1: 'Komplett kontroll over PVU, lager og samsvar i én plattform.',
    hero_sub: 'Administrer utstyr, ansatte, digitale leveranser og revisjoner med banebrytende teknologi. Fra lager til elektronisk signatur – alt integrert og sporbart.',
    hero_cta_demo: 'Be om gratis demo',
    hero_cta_login: 'Logg inn på System →',
    tag_signature: '✓ Digital Signatur',
    tag_qrcode: '✓ Individuell QR-kode',
    tag_ocr: '✓ Smart OCR',
    tag_audit: '✓ Fullstendig revisjon',
    tag_lgpd: '✓ GDPR-kompatibel',
    tag_multi: '✓ Flerbedrift',

    stat_companies: 'Betjente selskaper',
    stat_users: 'Aktive brukere',
    stat_epis: 'PVU-utstyr kontrollert',
    stat_deliveries: 'Registrerte leveranser',
    stat_uptime: 'Oppetid',

    section_benefits: 'Fordeler',
    section_benefits_title: 'Alt bedriften trenger for effektiv PVU-administrasjon',
    section_modules: 'Moduler',
    section_modules_title: 'Modulær og skalerbar plattform',
    section_plans: 'Priser',
    section_plans_title: 'Velg riktig plan for din bedrift',
    section_security: 'Sikkerhet & Samsvar',
    section_about: 'Om Oss',
    section_faq: 'Vanlige spørsmål',
    section_testimonials: 'Anbefalinger',

    plan_popular: '⭐ Mest Populær',
    plan_users_up_to: 'Opptil',
    plan_users_label: 'brukere',
    plan_consult: 'Kontakt oss',
    plan_cta: 'Kom i gang',
    plan_cta_enterprise: 'Snakk med salg',
    plan_annual_save: '🎉 2 måneder gratis',
    cycle_monthly: 'Månedlig',
    cycle_annual: 'Årlig',

    login_title: 'Logg inn på kontoen din',
    login_subtitle: 'EPI Controle — Administrasjon & Samsvar',
    login_email: 'E-post',
    login_password: 'Passord',
    login_remember: 'Husk meg',
    login_forgot: 'Glemt passord',
    login_btn: 'Logg inn',
    login_loading: 'Verifiserer…',
    login_error_credentials: 'Feil e-post eller passord.',
    login_error_generic: 'Tilkoblingsfeil. Prøv igjen.',
    login_no_account: 'Har du ikke konto?',
    login_request_demo: 'Be om en demo',

    sys_dashboard: 'Oversikt',
    sys_companies: 'Selskaper',
    sys_users: 'Brukere',
    sys_units: 'Enheter',
    sys_employees: 'Ansatte',
    sys_epis: 'PVU',
    sys_stock: 'Lager',
    sys_deliveries: 'Leveranser',
    sys_reports: 'Rapporter',
    sys_audit: 'Revisjon',
    sys_settings: 'Innstillinger',
    sys_logout: 'Logg ut',
    sys_save: 'Lagre',
    sys_cancel: 'Avbryt',
    sys_edit: 'Rediger',
    sys_delete: 'Slett',
    sys_confirm: 'Bekreft',
    sys_search: 'Søk…',
    sys_filter: 'Filtrer',
    sys_export: 'Eksporter',
    sys_loading: 'Laster…',
    sys_error: 'Det oppstod en feil.',
    sys_success: 'Operasjonen ble utført!',
    sys_no_data: 'Ingen poster funnet.',
    sys_welcome: 'Velkommen,',
    sys_language: 'Språk',

    footer_rights: 'Alle rettigheter forbeholdt.',
    footer_privacy: 'Personvernerklæring',
    footer_terms: 'Bruksvilkår',
    footer_status: 'Alle systemer operative',
  },
};

// ─────────────────────────────────────────────────────────────
// 2. CLASSE PRINCIPAL — EpiI18n
// ─────────────────────────────────────────────────────────────
class EpiI18n {
  static SUPPORTED = ['pt', 'en', 'fr', 'es', 'no'];
  static DEFAULT   = 'pt';
  static LS_KEY    = 'epi_locale';         // chave no localStorage
  static QS_PARAM  = 'lang';               // query string ?lang=XX

  /** Resolve o locale ativo: URL > localStorage > navigator > default */
  static resolve() {
    // 1. Query string (vindo do website institucional)
    const urlParam = new URLSearchParams(window.location.search).get(this.QS_PARAM);
    if (urlParam && this.SUPPORTED.includes(urlParam)) {
      this.persist(urlParam);              // sincroniza localStorage
      return urlParam;
    }
    // 2. localStorage (escolha prévia do usuário)
    const stored = localStorage.getItem(this.LS_KEY);
    if (stored && this.SUPPORTED.includes(stored)) return stored;
    // 3. Idioma do navegador
    const nav = (navigator.language || '').split('-')[0].toLowerCase();
    if (this.SUPPORTED.includes(nav)) return nav;
    // 4. Padrão
    return this.DEFAULT;
  }

  /** Salva locale e propaga para <html lang=""> */
  static persist(locale) {
    if (!this.SUPPORTED.includes(locale)) return;
    localStorage.setItem(this.LS_KEY, locale);
    document.documentElement.lang = EPI_TRANSLATIONS[locale]?._meta?.code || locale;
  }

  /** Obtém texto traduzido, com fallback PT */
  static t(key, locale) {
    const loc = locale || this.resolve();
    return EPI_TRANSLATIONS[loc]?.[key]
        || EPI_TRANSLATIONS[this.DEFAULT]?.[key]
        || key;
  }

  /** Aplica traduções a todos os elementos com data-i18n="key" */
  static apply(locale) {
    locale = locale || this.resolve();
    this.persist(locale);
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const attr = el.getAttribute('data-i18n-attr'); // ex: "placeholder"
      const text = this.t(key, locale);
      if (attr) el.setAttribute(attr, text);
      else el.textContent = text;
    });
    // dir RTL/LTR (futuro árabe, etc.)
    document.documentElement.dir = EPI_TRANSLATIONS[locale]?._meta?.dir || 'ltr';
    // Dispara evento para que app.js possa reagir
    window.dispatchEvent(new CustomEvent('epi:locale-changed', { detail: { locale } }));
  }

  /** Muda idioma e reaaplica — chamado pelo seletor */
  static change(locale) {
    if (!this.SUPPORTED.includes(locale)) return;
    this.apply(locale);
    // Remove ?lang da URL para não conflitar em recargas futuras
    const url = new URL(window.location.href);
    url.searchParams.delete(this.QS_PARAM);
    window.history.replaceState({}, '', url.toString());
  }

  /** Metadados de todos os idiomas (para montar o seletor) */
  static all() {
    return this.SUPPORTED.map(code => ({
      code,
      ...EPI_TRANSLATIONS[code]._meta,
    }));
  }

  /** Retorna o locale atual */
  static current() { return this.resolve(); }
}

// ─────────────────────────────────────────────────────────────
// 3. SELETOR DE IDIOMA — injeta HTML automaticamente
// ─────────────────────────────────────────────────────────────
class EpiLangSelector {
  /**
   * Cria e injeta o seletor num elemento-alvo.
   * @param {string|HTMLElement} target  — selector CSS ou elemento
   * @param {object} opts
   *   opts.style: 'dropdown' | 'pills' | 'minimal'  (default: 'dropdown')
   *   opts.showFlag: boolean (default: true)
   *   opts.showName: boolean (default: true)
   */
  static render(target, opts = {}) {
    const el = typeof target === 'string'
      ? document.querySelector(target)
      : target;
    if (!el) return;

    const style   = opts.style   ?? 'dropdown';
    const showFlag = opts.showFlag ?? true;
    const showName = opts.showName ?? true;
    const current  = EpiI18n.current();
    const langs    = EpiI18n.all();

    if (style === 'pills') {
      el.innerHTML = langs.map(l => `
        <button
          class="epi-lang-pill ${l.code === current ? 'active' : ''}"
          onclick="EpiI18n.change('${l.code}')"
          title="${l.name}"
          aria-label="${l.name}"
        >
          ${showFlag ? l.flag : ''}
          ${showName ? `<span>${l.code.toUpperCase()}</span>` : ''}
        </button>
      `).join('');
    }
    else if (style === 'minimal') {
      // Apenas bandeira + código, sem dropdown
      el.innerHTML = langs.map(l => `
        <button
          class="epi-lang-min ${l.code === current ? 'active' : ''}"
          onclick="EpiI18n.change('${l.code}')"
          title="${l.name}"
        >${l.flag}</button>
      `).join('');
    }
    else {
      // DROPDOWN (padrão)
      const curr = langs.find(l => l.code === current);
      el.innerHTML = `
        <div class="epi-lang-dropdown" id="epi-lang-dd">
          <button class="epi-lang-dd-btn" onclick="EpiLangSelector.toggleDd()" aria-haspopup="true">
            ${showFlag ? curr.flag : ''} ${showName ? curr.name : curr.code.toUpperCase()}
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style="margin-left:4px">
              <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
          <ul class="epi-lang-dd-menu" role="menu" id="epi-lang-menu">
            ${langs.map(l => `
              <li role="menuitem">
                <button
                  class="epi-lang-dd-item ${l.code === current ? 'active' : ''}"
                  onclick="EpiI18n.change('${l.code}'); EpiLangSelector.closeDd(); EpiLangSelector.refresh('${target}')"
                >
                  ${showFlag ? l.flag : ''} ${l.name}
                </button>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    // Injetar CSS apenas uma vez
    if (!document.getElementById('epi-i18n-styles')) {
      const s = document.createElement('style');
      s.id = 'epi-i18n-styles';
      s.textContent = `
        /* Pills */
        .epi-lang-pill {
          display:inline-flex;align-items:center;gap:4px;padding:5px 10px;
          border:1.5px solid rgba(255,255,255,.25);border-radius:20px;
          background:transparent;color:#fff;font-size:12px;font-weight:600;
          cursor:pointer;transition:.2s;font-family:inherit;
        }
        .epi-lang-pill.active { background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.6); }
        .epi-lang-pill:hover:not(.active) { background:rgba(255,255,255,.08); }

        /* Minimal */
        .epi-lang-min {
          background:none;border:none;font-size:1.2rem;cursor:pointer;
          opacity:.5;transition:.2s;padding:2px 4px;border-radius:4px;
        }
        .epi-lang-min.active { opacity:1;background:rgba(255,255,255,.1); }
        .epi-lang-min:hover { opacity:1; }

        /* Dropdown */
        .epi-lang-dropdown { position:relative;display:inline-block; }
        .epi-lang-dd-btn {
          display:inline-flex;align-items:center;gap:6px;padding:7px 12px;
          border:1.5px solid rgba(255,255,255,.25);border-radius:8px;
          background:transparent;color:#fff;font-size:13px;font-weight:600;
          cursor:pointer;font-family:inherit;transition:.2s;white-space:nowrap;
        }
        .epi-lang-dd-btn:hover { background:rgba(255,255,255,.08); }
        .epi-lang-dd-menu {
          position:absolute;right:0;top:calc(100% + 6px);
          background:#fff;border:1px solid #e2e8f0;border-radius:10px;
          box-shadow:0 8px 24px rgba(0,0,0,.12);min-width:150px;
          list-style:none;overflow:hidden;z-index:9999;
          display:none;
        }
        .epi-lang-dd-menu.open { display:block; }
        .epi-lang-dd-item {
          width:100%;padding:9px 14px;text-align:left;background:none;
          border:none;font-size:13px;color:#2C2C2A;cursor:pointer;
          font-family:inherit;display:flex;align-items:center;gap:8px;
          transition:.15s;
        }
        .epi-lang-dd-item:hover { background:#EFF6FF;color:#185FA5; }
        .epi-lang-dd-item.active { font-weight:700;color:#185FA5;background:#E6F1FB; }

        /* Dark-mode fallback for dropdown */
        @media (prefers-color-scheme: dark) {
          .epi-lang-dd-menu { background:#1e293b;border-color:#334155; }
          .epi-lang-dd-item { color:#e2e8f0; }
          .epi-lang-dd-item:hover { background:#334155;color:#93c5fd; }
          .epi-lang-dd-item.active { background:#1e3a5f;color:#60a5fa; }
        }
      `;
      document.head.appendChild(s);
    }
  }

  static toggleDd() {
    document.getElementById('epi-lang-menu')?.classList.toggle('open');
  }
  static closeDd() {
    document.getElementById('epi-lang-menu')?.classList.remove('open');
  }
  static refresh(target) {
    setTimeout(() => EpiLangSelector.render(target), 50);
  }
}

// Fechar dropdown ao clicar fora
document.addEventListener('click', e => {
  if (!e.target.closest('.epi-lang-dropdown')) EpiLangSelector.closeDd();
});

// ─────────────────────────────────────────────────────────────
// 4. INTEGRAÇÃO WEBSITE → SISTEMA (redirecionamento com locale)
// ─────────────────────────────────────────────────────────────
const EpiLocaleLink = {
  /**
   * Gera URL do sistema com o locale embutido.
   * Usar nos botões "Entrar no Sistema" e "Solicitar Demo" do website.
   *
   * Exemplo:
   *   EpiLocaleLink.toApp()   → "/app/?lang=pt"
   *   EpiLocaleLink.toApp('en') → "/app/?lang=en"
   */
  toApp(locale) {
    const loc = locale || EpiI18n.current();
    return `/app/?${EpiI18n.QS_PARAM}=${loc}`;
  },

  /** Redireciona para o sistema mantendo o idioma */
  goToApp(locale) {
    window.location.href = this.toApp(locale);
  },

  /** Atualiza todos os links [data-epi-app-link] da página */
  updateLinks() {
    const locale = EpiI18n.current();
    document.querySelectorAll('[data-epi-app-link]').forEach(el => {
      const base = el.getAttribute('data-epi-app-link') || '/app/';
      const url  = new URL(base, window.location.origin);
      url.searchParams.set(EpiI18n.QS_PARAM, locale);
      el.href = url.toString();
    });
  },
};

// ─────────────────────────────────────────────────────────────
// 5. AUTO-INIT
// ─────────────────────────────────────────────────────────────
(function autoInit() {
  // Aplica locale assim que o DOM estiver pronto
  const applyAll = () => {
    const locale = EpiI18n.resolve();
    EpiI18n.apply(locale);
    EpiLocaleLink.updateLinks();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAll);
  } else {
    applyAll();
  }

  // Quando idioma muda, atualiza links dinamicamente
  window.addEventListener('epi:locale-changed', () => EpiLocaleLink.updateLinks());
})();

// Expõe globalmente (compatível com app.js sem módulos ES)
window.EpiI18n         = EpiI18n;
window.EpiLangSelector = EpiLangSelector;
window.EpiLocaleLink   = EpiLocaleLink;
window.t               = (key) => EpiI18n.t(key); // atalho global: t('sys_save')
