# Contrato da API de Pagamentos (backend Python)

O website (`epi-controle-site`) é apenas frontend. Toda a lógica sensível do
Mercado Pago (com `MERCADO_PAGO_ACCESS_TOKEN`) deve ficar no **backend Python**.

O frontend descobre para onde chamar via `GET /api/payments/config` (servido
pelo Node), que retorna `payments_api_base`. Quando essa variável
(`PAYMENTS_API_BASE`) apontar para o backend Python, **todas as chamadas de
pagamento abaixo passam a ir para o Python**, no mesmo caminho `/api/payments/*`.

> Enquanto `PAYMENTS_API_BASE` estiver vazio, o site usa os endpoints locais do
> `server.js` (Node). Defina-o para a URL do Python só depois que os endpoints
> abaixo estiverem prontos lá.

## Variáveis de ambiente (backend Python)

| Variável | Uso |
|---|---|
| `MERCADO_PAGO_ACCESS_TOKEN` | Token secreto — **só no backend**, nunca no site |
| `MERCADO_PAGO_PUBLIC_KEY` | Devolvida ao frontend para o SDK do cartão |
| `MERCADO_PAGO_ENV` | `sandbox` ou `production` |
| `MERCADO_PAGO_WEBHOOK_SECRET` | Validação da assinatura `x-signature` do webhook |
| `WEB_BASE_URL` | Origem do site (CORS + `notification_url` do webhook) |
| `WEB_APP_URL` | Para onde redirecionar após pagamento aprovado |

## CORS

O site (`WEB_BASE_URL`, ex. `https://epi-controle-site.onrender.com`) chama o
backend Python em outra origem. O backend **deve** responder com:

```
Access-Control-Allow-Origin: <WEB_BASE_URL>
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

e tratar requisições `OPTIONS` (preflight) dos POST com `Content-Type: application/json`.

## Endpoints

### `GET /api/payments/config`
Resposta:
```json
{
  "public_key": "APP_USR-...",
  "mercado_pago_env": "production",
  "web_app_url": "https://epi-controle-app-gupy.onrender.com/"
}
```
Nunca incluir o Access Token.

### `POST /api/payments/create-card-subscription`
Body enviado pelo frontend:
```json
{
  "payer_name": "Maria Silva",
  "payer_email": "maria@empresa.com",
  "payer_document": "12345678901",
  "company_name": "Empresa LTDA",
  "company_id": "12345678901",
  "user_id": "maria@empresa.com",
  "plan_type": "START|BUSINESS|CORPORATE",
  "billing_cycle": "monthly|annual",
  "card_token_id": "<token gerado pelo MercadoPago.js no browser>"
}
```
Resposta esperada:
```json
{ "subscription_id": "abc", "status": "authorized", "init_point": "https://...", "web_app_url": "..." }
```
O frontend trata `status === "authorized"` como aprovado.

### `POST /api/payments/create-pix-payment`
Body: igual ao de cartão, **sem** `card_token_id`.
Resposta esperada (campos usados pelo frontend):
```json
{
  "payment_id": "123",
  "status": "pending",
  "qr_code": "00020126...",
  "qr_code_base64": "iVBORw0KGgo...",
  "web_app_url": "..."
}
```

### `POST /api/payments/create-boleto-payment`
Body: igual ao de Pix.
Resposta esperada:
```json
{ "payment_id": "123", "status": "pending", "boleto_url": "https://...", "due_date": "2026-07-01T...", "web_app_url": "..." }
```

### `GET /api/payments/status/{payment_id}`
Resposta esperada (mínimo):
```json
{ "payment_id": "123", "status": "approved|pending|rejected|cancelled|refunded|charged_back" }
```
O frontend faz polling a cada 8s até um estado terminal.

### `POST /api/payments/webhook`
Recebe as notificações do Mercado Pago. Deve:
1. Validar a assinatura `x-signature` (HMAC-SHA256 do manifest
   `id:<data.id minúsculo>;request-id:<x-request-id>;ts:<ts>;` com o
   `MERCADO_PAGO_WEBHOOK_SECRET`).
2. Responder **HTTP 200** em até 22s (consultar o recurso de forma assíncrona).
3. Consultar `GET /v1/payments/{id}` (ou `/preapproval/{id}`) e atualizar o banco.

## Persistência (banco)

Salvar, no mínimo: `company_id`, `plan_id` (ou `plan_type`+`billing_cycle`),
`payer_email`, `payment_method` (card/pix/boleto), `status`, além de
`payment_id`/`subscription_id` e timestamps. Atualizar `status` quando o webhook
chegar, e liberar o acesso do tenant (`company_id`) quando `status == approved`.
