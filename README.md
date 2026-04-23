# Via Nexo — Documentação SDD

## Visão Geral

O Via Nexo é um MVP de mapeamento colaborativo da malha urbana. A documentação SDD deste diretório organiza produto, arquitetura, dados, API, interface pública, contribuição comunitária e moderação administrativa para orientar a implementação com IA e desenvolvimento manual.

## Objetivo da Documentação

- Centralizar as specs do MVP em um conjunto coerente de documentos
- Definir a ordem correta de leitura e implementação
- Reduzir ambiguidade antes do desenvolvimento
- Servir como base de decisão para código, revisão e evolução do produto

## Source of Truth Principal

O documento principal é [via-nexo-master-spec.md](./via-nexo-master-spec.md). Ele deve ser tratado como a referência central para arquitetura, domínio, API, fases e regras do MVP.

## Ordem de Leitura

1. [README.md](./README.md)
2. [via-nexo-master-spec.md](./via-nexo-master-spec.md)
3. [via-nexo-visao-geral.md](./via-nexo-visao-geral.md)
4. [via-nexo-fase-1-banco.md](./via-nexo-fase-1-banco.md)
5. [via-nexo-fase-2-api.md](./via-nexo-fase-2-api.md)
6. [via-nexo-fase-3-mapa-publico.md](./via-nexo-fase-3-mapa-publico.md)
7. [via-nexo-fase-4-envio-ocorrencias.md](./via-nexo-fase-4-envio-ocorrencias.md)
8. [via-nexo-fase-5-moderacao.md](./via-nexo-fase-5-moderacao.md)

## Ordem de Implementação

1. [Fase 1 — Fundação de Dados e Infraestrutura](./via-nexo-fase-1-banco.md)
2. [Fase 2 — API e Regras de Negócio](./via-nexo-fase-2-api.md)
3. [Fase 3 — Mapa Público e Visualização](./via-nexo-fase-3-mapa-publico.md)
4. [Fase 4 — Envio de Ocorrências pela Comunidade](./via-nexo-fase-4-envio-ocorrencias.md)
5. [Fase 5 — Moderação e Controle Administrativo](./via-nexo-fase-5-moderacao.md)

## Resumo dos Arquivos

- [via-nexo-master-spec.md](./via-nexo-master-spec.md): fonte central de verdade do MVP, com escopo, stack, schema, endpoints, regras, fases e diretrizes de execução.
- [via-nexo-visao-geral.md](./via-nexo-visao-geral.md): documento de planejamento por fases, com objetivos, dependências, entregáveis e critérios de conclusão do MVP.
- [via-nexo-fase-1-banco.md](./via-nexo-fase-1-banco.md): detalha fundação de dados, storage, tipagens, enums, constraints e preparação do Supabase.
- [via-nexo-fase-2-api.md](./via-nexo-fase-2-api.md): detalha contratos de API, validação com Zod, autorização mínima e integração com banco/storage.
- [via-nexo-fase-3-mapa-publico.md](./via-nexo-fase-3-mapa-publico.md): detalha landing page, mapa público, filtros, lista, detalhe e estados de interface.
- [via-nexo-fase-4-envio-ocorrencias.md](./via-nexo-fase-4-envio-ocorrencias.md): detalha formulário público de contribuição, seleção de localização, upload de imagem e feedbacks.
- [via-nexo-fase-5-moderacao.md](./via-nexo-fase-5-moderacao.md): detalha painel administrativo, controle de acesso, revisão de ocorrências e atualização de status.

## Regra Operacional

Antes de alterar o código, atualizar a spec correspondente. O código deve refletir a versão mais recente da documentação.

## Inconsistências Encontradas

Nenhuma inconsistência remanescente identificada nesta revisão de harmonização controlada.

## Decisão Pendente

A sincronização entre `auth.users` e `public.users` não será implementada na Fase 1.
A estratégia oficial será definida em fase posterior, junto com autenticação e controle administrativo.
Até lá, a modelagem deve apenas manter compatibilidade estrutural com `auth.users`, sem triggers automáticas.
