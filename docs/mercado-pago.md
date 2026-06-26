# Integração Mercado Pago — EPI Controle

## Diagnóstico do estado atual

- O repositório já servia `epi_payment_system.html`, mas a tela simulava Pix, boleto e cartão sem chamar o Mercado Pago.
- O `server.js` era apenas um servidor estático; não existiam endpoints backend para criar pagamentos, assinaturas ou receber webhooks.
- A implementação segura exige backend porque o `MERCADO_PAGO_ACCESS_TOKEN` nunca pode estar no HTML/JavaScript do navegador.

## Arquitetura implementada

```text
Cliente -> epi_payment_system.html -> /api/payments/* no Node.js
Node.js -> Mercado Pago API com ACCESS_TOKEN
Mercado Pago -> /api/payments/webhook -> Node.js confirma status real na API
Node.js/API EPI -> libera company_id/tenant no backend Python
Cliente aprovado -> WEB_APP_URL / Flutter Web
```

## Endpoints criados no website Node.js

- `GET /api/payments/config`: retorna somente `PUBLIC_KEY`, ambiente e URLs públicas.
- `POST /api/payments/create-card-subscription`: cria assinatura com cartão em `/preapproval` usando `card_token_id`.
- `POST /api/payments/create-pix-payment`: cria pagamento Pix avulso em `/v1/payments`.
- `POST /api/payments/create-boleto-payment`: cria boleto avulso em `/v1/payments`.
- `GET /api/payments/status/:paymentId`: consulta status real do pagamento no Mercado Pago.
- `POST /api/payments/webhook`: valida assinatura quando `MERCADO_PAGO_WEBHOOK_SECRET` estiver configurado e confirma o status na API do Mercado Pago.

## Variáveis de ambiente Render

```env
MERCADO_PAGO_ENV=sandbox
MERCADO_PAGO_PUBLIC_KEY=TEST-your-public-key
MERCADO_PAGO_ACCESS_TOKEN=TEST-your-access-token
MERCADO_PAGO_WEBHOOK_SECRET=your-webhook-secret
MP_PREAPPROVAL_PLAN_MONTHLY_ID=<id_plano_mensal>
MP_PREAPPROVAL_PLAN_ANNUAL_ID=<id_plano_anual>
API_BASE_URL=https://epi-controle-app-gupy.onrender.com
WEB_BASE_URL=https://epi-controle-site.onrender.com
WEB_APP_URL=<url_do_flutter_web_quando_publicado>
```

Use credenciais `TEST-` em sandbox e credenciais de produção apenas no serviço de produção.

## Banco de dados recomendado no backend EPI

```sql
CREATE TABLE plans (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  billing_cycle TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  mercado_pago_plan_id TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES plans(id),
  payment_method TEXT NOT NULL,
  mercado_pago_subscription_id TEXT,
  status TEXT NOT NULL,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id),
  mercado_pago_payment_id TEXT UNIQUE,
  payment_method TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL,
  qr_code TEXT,
  qr_code_base64 TEXT,
  boleto_url TEXT,
  paid_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE webhook_events (
  id UUID PRIMARY KEY,
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  external_id TEXT,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Regras multi-tenant

- Toda chamada de checkout deve carregar `company_id`, `user_id`, plano, ciclo e método.
- O webhook deve confirmar pagamento/assinatura no Mercado Pago antes de ativar acesso.
- Pix/boleto mensal liberam 30 dias; Pix/boleto anual liberam 365 dias.
- Cartão recorrente deve manter `mercado_pago_subscription_id` e refletir status `authorized`, `paused` ou `cancelled`.

## Checklist Mercado Pago

1. Criar aplicação no painel Mercado Pago.
2. Configurar credenciais sandbox no Render de teste.
3. Criar Preapproval Plans mensal e anual; salvar IDs em `MP_PREAPPROVAL_PLAN_MONTHLY_ID` e `MP_PREAPPROVAL_PLAN_ANNUAL_ID`.
4. Configurar webhook para `https://epi-controle-site.onrender.com/api/payments/webhook`.
5. Habilitar notificações de `payment` e `preapproval`.
6. Testar com usuários/cartões sandbox e Pix/boleto de teste.
7. Repetir configuração com credenciais de produção no ambiente de produção.

## Plano para produção

- Persistir `payments`, `subscriptions` e `webhook_events` no backend Python/API EPI.
- Trocar o armazenamento em memória do `server.js` por chamadas autenticadas ao backend EPI (`API_BASE_URL`).
- Garantir idempotência por `payment_id`, `preapproval_id` e `external_reference`.
- Monitorar webhooks recusados, chargeback e refund para bloquear/renovar tenants corretamente.

## Checkout Transparente aplicado ao EPI Controle

A tela de pagamento foi ajustada para o modelo de Checkout Transparente: o cliente escolhe plano e meio de pagamento dentro do site, informa os dados necessários sem sair do domínio do EPI Controle e o backend chama as APIs do Mercado Pago para processar a operação.

Diferenciais considerados nesta implementação:

- **Pagamentos online:** cartão, Pix e boleto ficam disponíveis na própria tela de checkout.
- **Integração avançada:** o backend controla criação de pagamentos, assinatura, webhook e consulta de status.
- **Sem redirecionamento obrigatório:** cartão é tokenizado no site; Pix e boleto retornam dados exibíveis no próprio checkout.
- **Personalização total:** a experiência visual continua sendo HTML/CSS/JS do EPI Controle.

Pré-requisitos operacionais:

1. Criar uma aplicação em **Suas integrações** no painel Mercado Pago.
2. Configurar ambiente sandbox e depois produção.
3. Ter chave Pix cadastrada se Pix for ofertado.
4. Configurar os meios cartão, Pix e boleto no painel/conta.
5. Configurar notificações para `payment` e `preapproval` apontando para `/api/payments/webhook`.
6. Testar cartão, Pix e boleto com credenciais sandbox antes de subir credenciais reais.
7. Medir a qualidade da integração e só então migrar `MERCADO_PAGO_ENV` e credenciais para produção.
