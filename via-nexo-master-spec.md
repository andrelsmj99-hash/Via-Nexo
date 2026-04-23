# Via Nexo — Master Spec do MVP

## Navegação

- [README da documentação](./README.md)
- [Visão geral e planejamento do MVP](./via-nexo-visao-geral.md)
- [Fase 1 — Fundação de Dados e Infraestrutura](./via-nexo-fase-1-banco.md)
- [Fase 2 — API e Regras de Negócio](./via-nexo-fase-2-api.md)
- [Fase 3 — Mapa Público e Visualização](./via-nexo-fase-3-mapa-publico.md)
- [Fase 4 — Envio de Ocorrências pela Comunidade](./via-nexo-fase-4-envio-ocorrencias.md)
- [Fase 5 — Moderação e Controle Administrativo](./via-nexo-fase-5-moderacao.md)

---

## 1. Visão Geral

**Nome da Funcionalidade/Módulo:** Via Nexo — Master Spec do MVP  
**Objetivo Principal:** Definir a especificação central do MVP do Via Nexo como fonte única de verdade para produto, arquitetura, dados, API, interface pública, contribuição comunitária e moderação administrativa. Este documento organiza o que o sistema deve fazer, em que ordem deve ser construído e quais regras devem ser seguidas para que a implementação com IA ou desenvolvimento manual aconteça de forma consistente, modular e sem ambiguidades.

## 2. Histórias de Usuário (User Stories)

A IA usará isso para entender a intenção e testar se o objetivo foi cumprido.

- Como visitante, eu quero visualizar ocorrências urbanas em um mapa, para que eu possa entender problemas da malha viária.
- Como cidadão, eu quero registrar uma ocorrência com localização e imagem, para que eu possa contribuir com o mapeamento colaborativo.
- Como usuário, eu quero filtrar ocorrências por categoria, status e bairro, para que eu possa encontrar rapidamente informações relevantes.
- Como usuário, eu quero abrir os detalhes de uma ocorrência, para que eu possa ver contexto, imagem e estágio de validação.
- Como usuário autenticado, eu quero confirmar uma ocorrência já existente, para que eu possa reforçar sua veracidade sem criar duplicidade.
- Como moderador, eu quero revisar e alterar o status das ocorrências, para que o sistema mantenha dados confiáveis.
- Como administrador, eu quero ter acesso controlado ao painel de governança, para que apenas pessoas autorizadas executem ações sensíveis.
- Como sistema, eu quero registrar ações administrativas, para que exista trilha mínima de auditoria.
- Como equipe do produto, eu quero construir tudo por fases, para que o MVP seja implementado com menor risco e menos retrabalho.

## 3. Escopo e Limitações

O que a IA DEVE e NÃO DEVE fazer nesta iteração.

### In-Scope (Dentro do Escopo)

- Criar landing page pública do Via Nexo
- Criar mapa público com visualização de ocorrências
- Criar filtros por categoria, status e bairro
- Exibir detalhe completo de ocorrência
- Permitir criação pública de ocorrência
- Permitir envio de imagem para ocorrência
- Permitir confirmação comunitária de ocorrência
- Criar painel administrativo de moderação
- Permitir alteração de status por moderador/admin
- Registrar logs administrativos
- Estruturar banco, storage, tipos e constantes do domínio
- Implementar API REST interna do MVP
- Garantir responsividade mobile e desktop
- Construir o sistema em fases modulares

### Out-of-Scope (Fora do Escopo - NÃO IMPLEMENTAR)

- Aplicativo mobile nativo
- Navegação estilo Waze
- Roteamento em tempo real
- IA para detecção automática de buracos
- Geoprocessamento avançado
- Heatmaps avançados
- Dashboard analítico complexo
- Workflow multinível de moderação
- Sistema de reputação avançado
- Deduplicação automática por IA
- Integração automática com prefeitura
- Notificações push
- Multi-cidade funcional no MVP
- Gestão avançada de usuários
- Comentários internos complexos
- Exportação de relatórios
- Gamificação
- OCR
- Persistência offline

## 4. Arquitetura e Stack Tecnológico

Defina as ferramentas exatas para a IA não inventar dependências.

- **Front-end:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Mapa:** Leaflet com React Leaflet
- **Back-end:** Next.js Route Handlers + Supabase
- **Banco de Dados:** PostgreSQL via Supabase
- **Storage:** Supabase Storage
- **Autenticação:** Supabase Auth
- **Validação:** Zod
- **Cliente de dados:** Supabase client SDK
- **Hospedagem:** Vercel
- **Base cartográfica:** OpenStreetMap

## 5. Modelagem de Dados (Schema)

Se houver banco de dados, defina as tabelas e colunas exatas.

### Regras gerais do schema

- Todas as tabelas devem usar UUID como chave primária
- Todas as tabelas devem possuir `created_at`
- Tabelas mutáveis devem possuir `updated_at` quando necessário
- Chaves estrangeiras devem ser explícitas
- Campos críticos devem usar `NOT NULL` quando aplicável
- Enums do domínio devem ser controlados por constraint ou enum PostgreSQL
- O schema deve refletir o domínio real do produto: ocorrência, evidência, confirmação e moderação

### Tabela: `users`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| `id` | UUID | Primary Key, compatível com Supabase Auth |
| `name` | Text | Not Null |
| `email` | Text | Not Null, Unique |
| `role` | Text | Not Null, valores: `citizen`, `moderator`, `admin` |
| `created_at` | Timestamp | Default: Now() |

**Regras:**
- Papel padrão do usuário: `citizen`

### Tabela: `neighborhoods`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| `id` | UUID | Primary Key, Auto-gerado |
| `name` | Text | Not Null |
| `city` | Text | Not Null |
| `created_at` | Timestamp | Default: Now() |

**Constraints adicionais:**
- `unique(name, city)`

### Tabela: `reports`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| `id` | UUID | Primary Key, Auto-gerado |
| `user_id` | UUID | Foreign Key -> `users.id`, Nullable |
| `title` | Text | Not Null |
| `description` | Text | Not Null |
| `category` | Text | Not Null |
| `status` | Text | Not Null |
| `severity` | Text | Not Null |
| `latitude` | Numeric(10,7) | Not Null |
| `longitude` | Numeric(10,7) | Not Null |
| `address` | Text | Nullable |
| `street_name` | Text | Nullable |
| `neighborhood_id` | UUID | Foreign Key -> `neighborhoods.id`, Nullable |
| `is_anonymous` | Boolean | Default: false |
| `created_at` | Timestamp | Default: Now() |
| `updated_at` | Timestamp | Default: Now() |

**Categorias permitidas:**
- `pothole`
- `irregular_patch`
- `unpaved_road`
- `flooding`
- `construction`
- `poor_signage`

**Status permitidos:**
- `pending`
- `under_review`
- `confirmed`
- `resolved`
- `archived`

**Severidades permitidas:**
- `low`
- `medium`
- `high`
- `critical`

**Regras:**
- Toda nova ocorrência deve iniciar com `status = pending`
- Latitude e longitude são obrigatórias
- `user_id` pode ser nulo apenas para envio anônimo controlado

### Tabela: `report_images`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| `id` | UUID | Primary Key, Auto-gerado |
| `report_id` | UUID | Foreign Key -> `reports.id`, Not Null |
| `image_url` | Text | Not Null |
| `storage_path` | Text | Not Null |
| `created_at` | Timestamp | Default: Now() |

### Tabela: `report_confirmations`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| `id` | UUID | Primary Key, Auto-gerado |
| `report_id` | UUID | Foreign Key -> `reports.id`, Not Null |
| `user_id` | UUID | Foreign Key -> `users.id`, Not Null |
| `created_at` | Timestamp | Default: Now() |

**Constraints adicionais:**
- `unique(report_id, user_id)`

**Regra:**
- Um usuário só pode confirmar a mesma ocorrência uma única vez

### Tabela: `moderation_logs`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| `id` | UUID | Primary Key, Auto-gerado |
| `report_id` | UUID | Foreign Key -> `reports.id`, Not Null |
| `moderator_id` | UUID | Foreign Key -> `users.id`, Not Null |
| `action` | Text | Not Null |
| `notes` | Text | Nullable |
| `created_at` | Timestamp | Default: Now() |

**Ações sugeridas:**
- `approve`
- `reject`
- `resolve`
- `archive`
- `reopen`

## 6. Contratos de API (Endpoints)

Como o Front-end e o Back-end vão se comunicar.

### Padrão global de sucesso

```json
{
  "data": {}
}
```

### Padrão global de erro

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": []
  }
}
```

### `GET /api/reports`
- **Descrição:** Listar ocorrências públicas com filtros opcionais
- **Query Params:**
  - `category`
  - `status`
  - `severity`
  - `neighborhood_id`
  - `limit`
  - `page`
- **Regras:**
  - Não retornar ocorrências arquivadas em rota pública
  - Ordenar por `created_at desc`
  - Retornar contagem de confirmações
  - Retornar imagem principal quando existir

### `GET /api/reports/[id]`
- **Descrição:** Retornar detalhes completos de uma ocorrência
- **Regras:**
  - Não retornar ocorrência arquivada na visualização pública
  - Incluir imagens
  - Incluir contagem de confirmações
  - Retornar 404 quando não existir

### `GET /api/admin/reports`
- **Descrição:** Listar ocorrências administrativas para moderação
- **Regras:**
  - Exige autenticação
  - Apenas `moderator` ou `admin`
  - Pode retornar ocorrências arquivadas

### `GET /api/admin/reports/[id]`
- **Descrição:** Retornar detalhe administrativo de uma ocorrência
- **Regras:**
  - Exige autenticação
  - Apenas `moderator` ou `admin`
  - Pode retornar ocorrências arquivadas

### `POST /api/reports`
- **Descrição:** Criar nova ocorrência
- **Payload (Entrada):**
```json
{
  "title": "Buraco grande em cruzamento",
  "description": "Buraco profundo próximo à esquina",
  "category": "pothole",
  "severity": "high",
  "latitude": -23.9600000,
  "longitude": -46.3900000,
  "address": "Rua Exemplo, 123",
  "street_name": "Rua Exemplo",
  "neighborhood_id": "uuid",
  "is_anonymous": false
}
```
- **Regras:**
  - `title`, `description`, `category`, `severity`, `latitude`, `longitude` são obrigatórios
  - Cliente não pode definir `status`
  - Status inicial deve ser `pending`

### `POST /api/reports/[id]/images`
- **Descrição:** Associar imagem a uma ocorrência existente
- **Regras:**
  - Tipos aceitos: `image/jpeg`, `image/png`, `image/webp`
  - Tamanho máximo sugerido: 5 MB
  - 1 arquivo por requisição

### `POST /api/reports/[id]/confirm`
- **Descrição:** Confirmar comunitariamente uma ocorrência
- **Regras:**
  - Exige autenticação
  - Um usuário não pode confirmar duas vezes
  - Não permitir confirmação em ocorrência arquivada

### `PATCH /api/reports/[id]/status`
- **Descrição:** Atualizar status de uma ocorrência
- **Payload (Entrada):**
```json
{
  "status": "confirmed",
  "notes": "Ocorrência validada por imagem e múltiplas confirmações"
}
```
- **Regras:**
  - Exige autenticação
  - Apenas `moderator` ou `admin`
  - Deve atualizar `updated_at`
  - Deve gerar registro em `moderation_logs`

### `GET /api/neighborhoods`
- **Descrição:** Listar bairros disponíveis
- **Regras:**
  - Ordenar alfabeticamente
  - Expor apenas `id` e `name`

## 7. Regras de Negócio

A lógica que deve ser seguida pela implementação.

- Toda nova ocorrência deve iniciar com status `pending`
- O cliente nunca pode definir `status`
- Toda entrada deve ser validada antes de tocar o banco
- Category, severity, status e role devem seguir enums oficiais do sistema
- Um usuário só pode confirmar a mesma ocorrência uma vez
- Ocorrências arquivadas não aparecem nas rotas públicas
- Apenas moderador/admin pode alterar status
- Toda alteração administrativa deve gerar log
- O upload de imagem só acontece após a ocorrência existir
- Se o upload falhar, a ocorrência criada permanece válida
- O sistema deve ser utilizável sem endereço textual, desde que latitude e longitude sejam válidas
- O front público não deve expor dados sensíveis do autor
- O painel administrativo deve ter acesso restrito
- A implementação deve seguir ordem modular por fases
- Nenhuma fase deve depender de gambiarra estrutural da fase seguinte

## 8. Estrutura de Arquivos

Onde cada novo arquivo deve ser criado ou qual arquivo existente será modificado.

```text
/specs
  via-nexo-master-spec.md
  mvp-via-nexo-fase-1-banco.md
  mvp-via-nexo-fase-2-api.md
  mvp-via-nexo-fase-3-mapa-publico.md
  mvp-via-nexo-fase-4-envio-ocorrencias.md
  mvp-via-nexo-fase-5-moderacao.md

/app
  /page.tsx
  /map/page.tsx
  /report/page.tsx
  /reports/[id]/page.tsx
  /admin/page.tsx
  /api
    /admin
      /reports/route.ts
      /reports/[id]/route.ts
    /reports/route.ts
    /reports/[id]/route.ts
    /reports/[id]/images/route.ts
    /reports/[id]/confirm/route.ts
    /reports/[id]/status/route.ts
    /neighborhoods/route.ts

/components
  MapView.tsx
  MapMarkerPopup.tsx
  FilterBar.tsx
  ReportCard.tsx
  ReportList.tsx
  ReportDetails.tsx
  LandingHero.tsx
  LandingSection.tsx
  EmptyState.tsx
  ErrorState.tsx
  LoadingState.tsx
  ReportForm.tsx
  ReportLocationPicker.tsx
  ReportImageUpload.tsx
  ReportSuccessState.tsx
  ReportErrorState.tsx
  ReportFormField.tsx
  AdminReportTable.tsx
  AdminReportFilters.tsx
  AdminReportDetails.tsx
  AdminStatusActionForm.tsx
  AdminEmptyState.tsx
  AdminErrorState.tsx
  AdminLoadingState.tsx
  AccessDeniedState.tsx

/lib
  supabase.ts
  constants.ts
  validations.ts
  api.ts
  auth.ts
  formatters.ts

/types
  report.ts
  user.ts
  neighborhood.ts
  moderation.ts
  api.ts

/supabase
  migrations/
```

## 9. Restrições Técnicas

Regras estritas para a implementação.

- Não usar classes
- Todo o projeto deve ser escrito em TypeScript
- Toda validação deve usar Zod
- O mapa deve usar Leaflet com React Leaflet
- O storage deve usar Supabase Storage
- A autenticação deve usar Supabase Auth
- Não adicionar bibliotecas fora da stack definida sem necessidade explícita
- Não implementar recursos fora do escopo do MVP
- Não usar mocks permanentes como substituto do banco/API real
- Não expor dados sensíveis em rotas públicas
- Não permitir controle de status pelo cliente comum
- Não iniciar fases posteriores sem base consistente das fases anteriores

## 10. Critérios de Aceitação

Condições objetivas para considerar a funcionalidade pronta.

- O schema principal do banco foi criado
- O bucket de imagens foi criado
- As tipagens do domínio estão alinhadas ao schema
- A API do MVP está funcional
- A listagem pública de ocorrências funciona
- O detalhe da ocorrência funciona
- A landing page pública funciona
- O mapa público exibe ocorrências reais
- Os filtros funcionam
- O envio de ocorrência funciona
- O upload de imagem funciona
- A confirmação comunitária funciona
- O painel administrativo funciona
- A alteração de status funciona
- Os logs administrativos são gerados
- O sistema está responsivo em desktop e mobile
- O MVP pode ser entregue sem retrabalho estrutural

## 11. Próxima Iteração Planejada

O que poderá ser feito depois, mas não agora.

- Deduplicação automática de relatos
- Camadas por tipo de pavimentação
- Histórico temporal por rua/trecho
- Dashboard por bairro
- Integração com canais oficiais
- Multi-cidade
- Sistema de reputação
- Busca textual avançada
- Heatmap
- Exportação de dados
- Notificações

## 12. Fases Oficiais de Implementação

### Fase 1 — Fundação de Dados e Infraestrutura
**Objetivo:** criar banco, storage, enums, tipos e base de integração com Supabase

### Fase 2 — API e Regras de Negócio
**Objetivo:** implementar os endpoints do MVP com validação, permissões e contratos previsíveis

### Fase 3 — Mapa Público e Visualização
**Objetivo:** permitir leitura pública do sistema via landing page, mapa, lista e detalhe

### Fase 4 — Envio de Ocorrências pela Comunidade
**Objetivo:** permitir contribuição pública com formulário, localização e imagem

### Fase 5 — Moderação e Controle Administrativo
**Objetivo:** garantir governança mínima do sistema

## 13. Índices Recomendados

Criar índices para:
- `reports.status`
- `reports.category`
- `reports.neighborhood_id`
- `reports.created_at`
- `report_images.report_id`
- `report_confirmations.report_id`
- `moderation_logs.report_id`

Não implementar nesta fase:
- índices geoespaciais avançados
- materialized views
- otimizações de analytics

## 14. Constantes do Domínio

### Roles
- `citizen`
- `moderator`
- `admin`

### Categories
- `pothole`
- `irregular_patch`
- `unpaved_road`
- `flooding`
- `construction`
- `poor_signage`

### Status
- `pending`
- `under_review`
- `confirmed`
- `resolved`
- `archived`

### Severity
- `low`
- `medium`
- `high`
- `critical`

## 15. Regras de UX Obrigatórias

### Estados obrigatórios
- loading
- erro
- vazio
- sucesso
- sucesso parcial
- acesso negado

### Regras de interface
- layout responsivo
- hierarquia visual clara
- linguagem simples
- filtros legíveis
- ausência de imagem não pode quebrar layout
- ausência de endereço não pode quebrar layout
- mobile deve ser tratado como uso real, não só adaptação estética

## 16. Entregáveis Esperados da IA

O que a IA deve produzir ao receber esta master spec.

- migrations e schema do banco
- bucket e integração com storage
- tipagens do domínio
- constantes oficiais do sistema
- endpoints da API
- páginas públicas
- componentes de mapa e visualização
- formulário de envio
- painel administrativo
- helpers de autenticação, validação e resposta
- estrutura pronta para expansão controlada

## 17. Regra de Ouro do Projeto

Antes de corrigir, expandir ou refatorar qualquer funcionalidade, a spec correspondente deve ser atualizada primeiro. O código sempre deve refletir a versão mais recente da especificação.

## 18. Resumo Executivo do Produto

O Via Nexo é uma plataforma colaborativa de mapeamento urbano focada em tornar visível, verificável e acionável o estado real da malha viária. O MVP permite visualizar ocorrências no mapa, registrar novos relatos com evidência visual, confirmar relatos existentes e moderar o ciclo de validação por meio de um painel administrativo simples.

## 19. Ordem Recomendada de Uso com IA

1. Usar esta Master Spec como source of truth
2. Executar Fase 1 integralmente
3. Validar Fase 1 antes de iniciar Fase 2
4. Executar Fase 2 integralmente
5. Validar Fase 2 antes de iniciar Fase 3
6. Repetir o mesmo processo até a Fase 5
7. Em caso de bug ou mudança, atualizar a spec antes do código

## 20. Regra Final de Execução

O Via Nexo não deve ser implementado como um sistema monolítico improvisado. Ele deve ser construído por fases, com contratos claros, validação contínua e respeito estrito à spec. A qualidade do produto depende mais da precisão da especificação do que da velocidade de geração de código.
