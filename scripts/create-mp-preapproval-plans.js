'use strict';

/*
 * Cria os 6 preapproval plans (3 tiers × mensal/anual) no Mercado Pago,
 * com os preços do site (START/BUSINESS/CORPORATE).
 *
 * Uso (em um ambiente com acesso à internet, ex.: sua máquina ou shell do Render):
 *
 *   MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxxx \
 *   WEB_APP_URL=https://epi-controle-app-gupy.onrender.com/ \
 *   node scripts/create-mp-preapproval-plans.js
 *
 * Ao final, ele imprime as variáveis de ambiente prontas para colar no Render.
 * Requer Node 18+ (fetch nativo).
 */

const MP_API = 'https://api.mercadopago.com';
const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const backUrl =
  process.env.WEB_APP_URL ||
  process.env.WEB_BASE_URL ||
  'https://epi-controle-site.onrender.com/';

// Mesmos preços do site (server.js planCatalog).
const PLAN_CATALOG = {
  START:     { monthly: 297,  annual: 2970 },
  BUSINESS:  { monthly: 597,  annual: 5970 },
  CORPORATE: { monthly: 1297, annual: 12970 },
};

const envKey = (tier, cycle) => `MP_PLAN_${tier}_${cycle.toUpperCase()}_ID`;

async function createPlan(tier, cycle, amount) {
  const isAnnual = cycle === 'annual';
  const payload = {
    reason: `EPI Controle ${tier} ${isAnnual ? 'Anual' : 'Mensal'}`,
    auto_recurring: {
      frequency: isAnnual ? 12 : 1,
      frequency_type: 'months',
      transaction_amount: amount,
      currency_id: 'BRL',
    },
    back_url: backUrl,
  };
  const res = await fetch(`${MP_API}/preapproval_plan`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let data = {};
  if (text) {
    try { data = JSON.parse(text); } catch { data = { message: text.slice(0, 300) }; }
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} — ${data.message || data.error || text}`);
  }
  return data.id;
}

(async () => {
  if (!token) {
    console.error('ERRO: defina MERCADO_PAGO_ACCESS_TOKEN (use o token de produção para planos reais).');
    process.exit(1);
  }
  console.log(`Criando planos no Mercado Pago (back_url=${backUrl})...\n`);

  const envLines = [];
  let failed = 0;
  for (const [tier, cycles] of Object.entries(PLAN_CATALOG)) {
    for (const cycle of ['monthly', 'annual']) {
      const amount = cycles[cycle];
      try {
        const id = await createPlan(tier, cycle, amount);
        envLines.push(`${envKey(tier, cycle)}=${id}`);
        console.log(`✓ ${tier} ${cycle} (R$ ${amount}) -> ${id}`);
      } catch (err) {
        failed++;
        console.error(`✗ ${tier} ${cycle} (R$ ${amount}): ${err.message}`);
      }
    }
  }

  console.log('\n──────────────────────────────────────────────');
  console.log('Variáveis de ambiente (cole no Render → Environment):');
  console.log('──────────────────────────────────────────────');
  console.log(envLines.join('\n'));
  if (failed) {
    console.error(`\n${failed} plano(s) falharam. Verifique o token/credenciais.`);
    process.exit(1);
  }
})();
