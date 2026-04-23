# Via Nexo — Fase 1: Fundação de Dados e Infraestrutura

## Navegação

- [README da documentação](./README.md)
- [Visão geral e planejamento do MVP](./via-nexo-visao-geral.md)
- [Master Spec do MVP](./via-nexo-master-spec.md)
- [Próxima fase: Fase 2 — API e Regras de Negócio](./via-nexo-fase-2-api.md)

---

## 1. Visão Geral

**Nome da Funcionalidade/Módulo:** Via Nexo — Fase 1: Fundação de Dados e Infraestrutura  
**Objetivo Principal:** Estruturar a base técnica do Via Nexo para suportar o MVP com consistência, segurança e escalabilidade inicial. Esta fase deve criar o banco de dados, storage, tipagens, enums e configurações fundamentais que servirão de alicerce para API, mapa público, envio de ocorrências e moderação.

## 2. Histórias de Usuário (User Stories)

A IA usará isso para entender a intenção e testar se o objetivo foi cumprido.

- Como desenvolvedor, eu quero uma estrutura de dados bem definida, para que o sistema possa crescer sem inconsistências.
- Como arquiteto do produto, eu quero entidades e relacionamentos claros, para que as fases seguintes usem uma base confiável.
- Como moderador, eu quero que as ocorrências tenham estados padronizados, para que eu possa gerenciá-las corretamente.
- Como usuário da plataforma, eu quero que minhas contribuições sejam armazenadas com segurança, para que elas possam ser exibidas e validadas depois.
- Como sistema, eu quero separar relatórios, imagens, confirmações e logs, para manter a integridade do domínio e facilitar manutenção futura.

## 3. Escopo e Limitações

O que a IA DEVE e NÃO DEVE fazer nesta iteração.

### In-Scope (Dentro do Escopo)

- Criar a estrutura inicial do projeto conectada ao Supabase
- Definir enums e constantes de domínio
- Criar o schema inicial do banco de dados
- Criar as tabelas principais do MVP
- Criar relacionamentos e constraints
- Definir regras de integridade para dados críticos
- Criar bucket de imagens no Supabase Storage
- Definir tipagens TypeScript do domínio
- Criar camada base de configuração do Supabase no projeto
- Preparar estrutura para autenticação futura via Supabase Auth
- Definir timestamps e regras de atualização de registros
- Padronizar os valores permitidos para categorias, severidades e status

### Out-of-Scope (Fora do Escopo - NÃO IMPLEMENTAR)

- Interface visual do mapa
- Landing page
- Formulário de envio de ocorrência
- Endpoints completos da API
- Upload funcional pela interface
- Painel administrativo visual
- Sistema de reputação
- Deduplicação automática
- Analytics
- Multi-cidade
- IA ou automações inteligentes
- Workflow de moderação avançado

## 4. Arquitetura e Stack Tecnológico

Defina as ferramentas exatas para a IA não inventar dependências.

- **Front-end:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Back-end oficial do produto:** Next.js Route Handlers
- **Banco de Dados:** PostgreSQL via Supabase
- **Storage:** Supabase Storage
- **Autenticação:** Supabase Auth
- **Validação futura:** Zod
- **Hospedagem:** Vercel
- **Mapas futuros:** Leaflet com React Leaflet
- **Base cartográfica futura:** OpenStreetMap

## 5. Modelagem de Dados (Schema)

Se houver banco de dados, defina as tabelas e colunas exatas.

### Regras gerais do schema

- Todas as tabelas devem usar UUID como chave primária
- Todas as tabelas devem possuir `created_at`
- Tabelas mutáveis devem possuir `updated_at`
- Todos os campos críticos devem ter `NOT NULL` quando aplicável
- Valores categóricos devem ser controlados por `CHECK CONSTRAINT` ou por enums PostgreSQL
- Chaves estrangeiras devem ser explícitas
- O schema deve ser preparado para uso com Supabase e consultas futuras pela API

### Tabela: `users`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| id | UUID | Primary Key, vinculado ao usuário autenticado |
| name | Text | Not Null |
| email | Text | Not Null, Unique |
| role | Text | Not Null, valores: citizen, moderator, admin |
| created_at | Timestamp | Default: Now() |

**Notas:**

- Esta tabela representa o perfil de aplicação do usuário
- O `id` deve ser compatível com o usuário autenticado do Supabase Auth
- O papel inicial padrão deve ser `citizen`

### Tabela: `neighborhoods`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| id | UUID | Primary Key, Auto-gerado |
| name | Text | Not Null |
| city | Text | Not Null |
| created_at | Timestamp | Default: Now() |

**Constraints adicionais:**

- `unique(name, city)`

**Notas:**

- Mesmo que o MVP opere em uma cidade principal, a coluna `city` deve existir para evitar rigidez estrutural futura
- Não implementar lógica multi-cidade ainda; apenas manter a modelagem minimamente preparada

### Tabela: `reports`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| id | UUID | Primary Key, Auto-gerado |
| user_id | UUID | Foreign Key -> users.id, Nullable |
| title | Text | Not Null |
| description | Text | Not Null |
| category | Text | Not Null |
| status | Text | Not Null |
| severity | Text | Not Null |
| latitude | Numeric(10,7) | Not Null |
| longitude | Numeric(10,7) | Not Null |
| address | Text | Nullable |
| street_name | Text | Nullable |
| neighborhood_id | UUID | Foreign Key -> neighborhoods.id, Nullable |
| is_anonymous | Boolean | Default: false |
| created_at | Timestamp | Default: Now() |
| updated_at | Timestamp | Default: Now() |

**Valores permitidos para `category`:**

- `pothole`
- `irregular_patch`
- `unpaved_road`
- `flooding`
- `construction`
- `poor_signage`

**Valores permitidos para `status`:**

- `pending`
- `under_review`
- `confirmed`
- `resolved`
- `archived`

**Valores permitidos para `severity`:**

- `low`
- `medium`
- `high`
- `critical`

**Notas:**

- `user_id` pode ser nulo apenas se o sistema permitir envio anônimo controlado
- `status` deve iniciar por padrão como `pending`
- `updated_at` deve ser atualizado automaticamente sempre que o registro sofrer alteração
- Não armazenar geolocalização em formato textual como fonte primária; latitude e longitude são obrigatórias

### Tabela: `report_images`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| id | UUID | Primary Key, Auto-gerado |
| report_id | UUID | Foreign Key -> reports.id, Not Null |
| image_url | Text | Not Null |
| storage_path | Text | Not Null |
| created_at | Timestamp | Default: Now() |

**Notas:**

- Uma ocorrência pode possuir múltiplas imagens
- O campo `storage_path` deve guardar a referência interna do arquivo no Supabase Storage
- O campo `image_url` deve guardar a URL pública ou assinada conforme estratégia futura

### Tabela: `report_confirmations`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| id | UUID | Primary Key, Auto-gerado |
| report_id | UUID | Foreign Key -> reports.id, Not Null |
| user_id | UUID | Foreign Key -> users.id, Not Null |
| created_at | Timestamp | Default: Now() |

**Constraints adicionais:**

- `unique(report_id, user_id)`

**Notas:**

- Um usuário só pode confirmar uma mesma ocorrência uma única vez
- Confirmação não substitui moderação; apenas reforça sinal comunitário

### Tabela: `moderation_logs`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| id | UUID | Primary Key, Auto-gerado |
| report_id | UUID | Foreign Key -> reports.id, Not Null |
| moderator_id | UUID | Foreign Key -> users.id, Not Null |
| action | Text | Not Null |
| notes | Text | Nullable |
| created_at | Timestamp | Default: Now() |

**Valores sugeridos para `action`:**

- `approve`
- `reject`
- `resolve`
- `archive`
- `reopen`

**Notas:**

- Toda alteração administrativa futura deve gerar log
- Esta tabela existe desde a Fase 1 para evitar retrabalho posterior

## 6. Contratos de API (Endpoints)

Como o Front-end e o Back-end vão se comunicar.

Nesta fase não devem ser implementados endpoints completos.

Apenas a infraestrutura necessária para suportá-los futuramente deve ser preparada.

### Pré-contratos previstos para fases seguintes

#### `GET /api/reports`

**Descrição:** Listar ocorrências públicas

#### `GET /api/reports/[id]`

**Descrição:** Detalhar uma ocorrência

#### `POST /api/reports`

**Descrição:** Criar nova ocorrência

#### `POST /api/reports/[id]/images`

**Descrição:** Enviar imagem para ocorrência

#### `POST /api/reports/[id]/confirm`

**Descrição:** Confirmar ocorrência

#### `PATCH /api/reports/[id]/status`

**Descrição:** Atualizar status via moderação

#### `GET /api/neighborhoods`

**Descrição:** Listar bairros

### Regra desta fase

- Não implementar regras HTTP completas ainda
- Apenas estruturar banco, tipos, constantes e configuração para que esses endpoints sejam construídos na próxima fase

## 7. Regras de Negócio

A lógica que deve ser seguida pela implementação.

- Toda ocorrência deve ter categoria, severidade, status, latitude e longitude válidos
- Toda ocorrência criada futuramente deve iniciar com status `pending`
- `report_confirmations` deve impedir duplicidade por usuário e ocorrência
- Apenas usuários com papel `moderator` ou `admin` poderão futuramente gerar registros em `moderation_logs`
- O bucket de imagens deve existir antes da implementação do upload
- O sistema deve usar valores padronizados para `category`, `status` e `severity`
- O projeto deve centralizar esses valores em constantes reutilizáveis
- A tabela `reports` deve aceitar `user_id` nulo apenas para suportar envio anônimo controlado
- A integridade relacional deve ser garantida por foreign keys
- O banco deve estar preparado para consultas públicas e administrativas futuras
- A modelagem deve evitar decisões temporárias que quebrem a expansão natural do produto
- O projeto deve possuir tipagens de domínio alinhadas ao schema real do banco

## 8. Estrutura de Arquivos

Onde cada novo arquivo deve ser criado ou qual arquivo existente será modificado.

```text
/app
  /api
    # ainda sem implementação funcional nesta fase

/components
  # nenhum componente obrigatório nesta fase

/lib
  supabase.ts
  constants.ts

/types
  report.ts
  user.ts
  neighborhood.ts
  moderation.ts

/supabase
  # opcional, se o projeto usar pasta para SQL/migrations
  migrations/
```

### Descrição dos arquivos esperados

#### `/lib/supabase.ts`

- Inicialização do client do Supabase
- Leitura de variáveis de ambiente
- Export reutilizável para fases futuras

#### `/lib/constants.ts`

- Arrays e tipos literais com:
- categorias
- severidades
- status
- roles

#### `/types/report.ts`

- Tipos e interfaces do domínio de ocorrência
- Tipos para criação, leitura e resumo

#### `/types/user.ts`

- Tipos de usuário e papel

#### `/types/neighborhood.ts`

- Tipos de bairro

#### `/types/moderation.ts`

- Tipos ligados à moderação e logs

#### `/supabase/migrations/`

- Scripts SQL ou migrations formais para criar schema e constraints

## 9. Restrições Técnicas

Regras estritas para a implementação.

- Não usar classes; utilizar apenas funções, objetos e tipos
- Todo o código desta fase deve ser escrito em TypeScript e SQL
- Não implementar interface visual nesta fase
- Não implementar componentes React desnecessários
- Não criar mocks como substituto do schema real
- Não adicionar bibliotecas fora da stack definida
- Não usar nomes genéricos ou ambíguos para enums e colunas
- Não duplicar regras de domínio em múltiplos lugares; centralizar em constantes e tipagens
- Não deixar valores categóricos soltos no código
- Não iniciar API antes do schema estar consistente
- Não criar estrutura multi-cidade funcional nesta fase
- Não implementar automações de moderação
- Não usar campos JSON para dados que possuem estrutura relacional clara
- Não omitir constraints importantes de unicidade e integridade

## 10. Critérios de Aceitação

Condições objetivas para considerar a funcionalidade pronta.

- O projeto possui configuração base do Supabase funcional
- As tabelas `users`, `neighborhoods`, `reports`, `report_images`, `report_confirmations` e `moderation_logs` foram criadas
- Todas as tabelas possuem chaves primárias UUID
- Os relacionamentos entre as tabelas estão definidos corretamente
- Os campos críticos possuem restrições adequadas
- Os valores permitidos de `category`, `status`, `severity` e `role` estão padronizados
- O campo `status` de `reports` possui valor padrão `pending`
- Existe constraint impedindo confirmação duplicada da mesma ocorrência pelo mesmo usuário
- O bucket de imagens foi criado no Supabase Storage
- O projeto possui tipos TypeScript coerentes com o schema
- O arquivo `constants.ts` centraliza os enums operacionais do domínio
- A estrutura está pronta para a implementação da Fase 2 sem retrabalho estrutural

## 11. Próxima Iteração Planejada

O que poderá ser feito depois, mas não agora.

- Implementar os endpoints da API
- Criar schemas Zod para payloads
- Definir regras de acesso para ações administrativas
- Implementar leitura pública de ocorrências
- Implementar criação de ocorrência
- Implementar upload de imagem
- Implementar confirmação comunitária

## 12. Entregáveis Esperados da IA nesta Fase

O que a IA deve gerar quando receber esta spec.

- Script SQL ou migration para criar todas as tabelas
- Constraints e foreign keys
- Índices básicos para consultas futuras
- Configuração base do client Supabase
- Arquivo de constantes de domínio
- Arquivos de tipagem TypeScript
- Estrutura limpa e modular pronta para a Fase 2

## 13. Índices Recomendados

Para melhorar consultas futuras sem otimização excessiva.

### Criar índices para

- `reports.status`
- `reports.category`
- `reports.neighborhood_id`
- `reports.created_at`
- `report_confirmations.report_id`
- `report_images.report_id`
- `moderation_logs.report_id`

### Não fazer nesta fase

- índices geoespaciais avançados
- otimizações específicas de analytics
- materialized views

## 14. Observações de Implementação

Diretrizes extras para evitar interpretação errada pela IA.

- Priorizar clareza sobre sofisticação
- O schema deve ser simples, explícito e legível
- Não antecipar recursos não utilizados no MVP imediato
- Preparar base sólida sem inflar a complexidade
- Toda decisão estrutural deve favorecer manutenção e expansão controlada
- O banco deve refletir o domínio real do produto Via Nexo: ocorrência, evidência, confirmação e moderação

## 15. Regra de Ouro desta Fase

Antes de iniciar a Fase 2, o schema, storage, constantes e tipagens devem estar concluídos e consistentes. Nenhuma rota da API deve ser implementada sobre estrutura provisória.

## Decisão Pendente

A sincronização entre `auth.users` e `public.users` não será implementada na Fase 1.
A estratégia oficial será definida em fase posterior, junto com autenticação e controle administrativo.
Até lá, a modelagem deve apenas manter compatibilidade estrutural com `auth.users`, sem triggers automáticas.
