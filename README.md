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

## Desenvolvimento Local

### Pré-requisitos

- Node.js 20+
- PostgreSQL 15+

### Setup

```bash
# 1. Clone e instale as dependências
git clone <repo-url>
cd Via-Nexo
npm install

# 2. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com sua DATABASE_URL, NEXTAUTH_SECRET e NEXTAUTH_URL

# 3. Aplique as migrations no banco
psql -U <user> -d <database> -f supabase/migrations/20260328220000_via_nexo_phase_1_foundation.sql
psql -U <user> -d <database> -f supabase/migrations/20260329000000_standalone_postgres.sql

# 4. Crie um usuário administrador inicial (substitua os valores)
psql -U <user> -d <database> -c "
INSERT INTO public.users (name, email, role, password_hash)
VALUES ('Admin', 'admin@example.com', 'admin', '\$2b\$10\$HASH_GERADO_COM_BCRYPT');
"
# Para gerar o hash: node -e \"const b=require('bcryptjs');b.hash('suasenha',10).then(console.log)\"

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.  
O painel administrativo fica em `/admin` — faça login em `/login` com as credenciais criadas acima.

### Testes

```bash
npm test               # executa todos os testes
npm run test:coverage  # executa com relatório de cobertura
npx tsc --noEmit       # verifica tipos TypeScript
```

---

## Decisão Técnica: Autenticação

O projeto usa **NextAuth v5 (Auth.js)** com `CredentialsProvider` contra a tabela `public.users`.
A estratégia de Supabase Auth foi descartada na migração para PostgreSQL auto-hospedado.
Senhas são armazenadas como hashes bcrypt no campo `password_hash`.
