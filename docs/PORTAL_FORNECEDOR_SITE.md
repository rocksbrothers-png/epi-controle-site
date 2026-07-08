# Portal do Fornecedor — papel do site institucional

> Complemento ao plano técnico do módulo de Compras
> (`epi-controle/docs/PLANO_TECNICO_MODULO_COMPRAS.md`). Este repositório
> (site institucional) **não hospeda o portal** — apenas o divulga.

## O que é

O módulo de Compras do Sistema de Controle de EPI terá um **Portal do
Fornecedor** (Nível 2 de integração): a loja de EPI recebe por e-mail um link
tokenizado, abre uma página pública servida pelo backend do sistema e pode:

- ver a solicitação de cotação (RFQ);
- informar preço, prazo e frete por item;
- anexar proposta (PDF);
- confirmar o pedido (PO);
- atualizar o status da entrega.

O acesso é por token com expiração — o fornecedor **não** cria conta e o site
**não** participa da autenticação.

## O que muda neste repositório

Escopo mínimo, sem lógica:

1. **Menu/rodapé:** item "Portal do Fornecedor" com página explicativa
   (o que é, como o fornecedor recebe o link, suporte).
2. **Página de recursos/planos:** citar o módulo de Compras (cotações,
   comparação de preços, pedido de compra, recebimento com QR Code) quando o
   módulo for lançado.
3. **Nenhum formulário de login de fornecedor no site** — o link do portal
   chega sempre por e-mail, apontando direto para o backend
   (`/fornecedor/<token>`).

## Quando implementar

Somente após a Fase F2 do plano técnico (portal em produção no backend).
Até lá, nenhuma alteração é necessária neste repositório.
