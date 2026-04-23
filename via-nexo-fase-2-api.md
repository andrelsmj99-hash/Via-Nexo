# Via Nexo — Fase 2: API e Regras de Negócio

## Navegação

- [README da documentação](./README.md)
- [Visão geral e planejamento do MVP](./via-nexo-visao-geral.md)
- [Master Spec do MVP](./via-nexo-master-spec.md)
- [Fase anterior: Fase 1 — Fundação de Dados e Infraestrutura](./via-nexo-fase-1-banco.md)
- [Próxima fase: Fase 3 — Mapa Público e Visualização](./via-nexo-fase-3-mapa-publico.md)

---

## 1. Visão Geral

**Nome da Funcionalidade/Módulo:** Via Nexo — Fase 2: API e Regras de Negócio  
**Objetivo Principal:** Implementar a camada de API do Via Nexo para criação, leitura, atualização controlada e confirmação de ocorrências, conectando o banco de dados já estruturado na Fase 1 à lógica de negócio do sistema. Esta fase deve garantir validação consistente, respostas previsíveis, controle de permissões e preparação estável para a interface pública e administrativa.

## 2. Histórias de Usuário (User Stories)

A IA usará isso para entender a intenção e testar se o objetivo foi cumprido.

- Como visitante, eu quero visualizar ocorrências públicas por meio da API, para que o mapa possa exibir informações confiáveis.
- Como cidadão, eu quero criar uma ocorrência com dados válidos, para que minha contribuição seja registrada corretamente.
- Como usuário autenticado, eu quero confirmar uma ocorrência existente, para que eu possa reforçar a relevância e veracidade do relato.
- Como moderador, eu quero alterar o status de uma ocorrência, para que eu possa validar, resolver ou arquivar relatos.
- Como sistema, eu quero validar todos os payloads recebidos, para evitar dados inválidos no banco.
- Como desenvolvedor, eu quero contratos de API previsíveis, para integrar o front-end sem ambiguidade.

## 3. Escopo e Limitações

O que a IA DEVE e NÃO DEVE fazer nesta iteração.

### In-Scope (Dentro do Escopo)

- Implementar endpoints REST do MVP
- Validar payloads com Zod
- Ler ocorrências públicas com filtros
- Retornar detalhe de uma ocorrência
- Listar ocorrências administrativas para moderação
- Retornar detalhe administrativo de uma ocorrência
- Criar nova ocorrência
- Associar imagem a ocorrência
- Confirmar ocorrência existente
- Atualizar status de ocorrência por moderador/admin
- Listar bairros
- Padronizar respostas de sucesso e erro
- Aplicar regras mínimas de autorização
- Registrar logs de moderação em mudanças de status
- Garantir integridade entre API e schema da Fase 1

### Out-of-Scope (Fora do Escopo - NÃO IMPLEMENTAR)

- Interface visual do mapa
- Landing page
- Dashboard analítico
- Sistema de reputação
- Deduplicação automática
- Busca textual avançada
- Geocodificação automática
- Upload múltiplo sofisticado
- Notificações
- Versionamento de ocorrência
- Workflow multinível de moderação
- API pública externa documentada para terceiros

## 4. Arquitetura e Stack Tecnológico

Defina as ferramentas exatas para a IA não inventar dependências.

- **Front-end futuro:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Back-end/API:** Next.js Route Handlers
- **Banco de Dados:** PostgreSQL via Supabase
- **Storage:** Supabase Storage
- **Autenticação:** Supabase Auth
- **Validação:** Zod
- **Cliente de acesso aos dados:** Supabase client SDK
- **Formato de resposta:** JSON
- **Hospedagem:** Vercel

## 5. Modelagem de Dados (Schema)

Se houver banco de dados, defina as tabelas e colunas exatas.

### Tabelas utilizadas nesta fase

- `users`
- `neighborhoods`
- `reports`
- `report_images`
- `report_confirmations`
- `moderation_logs`

### Campos de maior impacto na API

#### Tabela: `reports`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| id | UUID | Primary Key |
| user_id | UUID | Nullable para envio anônimo controlado |
| title | Text | Not Null |
| description | Text | Not Null |
| category | Text | Not Null |
| status | Text | Not Null, default pending |
| severity | Text | Not Null |
| latitude | Numeric(10,7) | Not Null |
| longitude | Numeric(10,7) | Not Null |
| address | Text | Nullable |
| street_name | Text | Nullable |
| neighborhood_id | UUID | Nullable |
| is_anonymous | Boolean | Default false |
| created_at | Timestamp | Default Now() |
| updated_at | Timestamp | Default Now() |

#### Tabela: `report_images`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| id | UUID | Primary Key |
| report_id | UUID | Foreign Key -> reports.id |
| image_url | Text | Not Null |
| storage_path | Text | Not Null |
| created_at | Timestamp | Default Now() |

#### Tabela: `report_confirmations`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| id | UUID | Primary Key |
| report_id | UUID | Foreign Key -> reports.id |
| user_id | UUID | Foreign Key -> users.id |
| created_at | Timestamp | Default Now() |
| unique(report_id, user_id) | Constraint | Impede confirmação duplicada |

#### Tabela: `moderation_logs`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| id | UUID | Primary Key |
| report_id | UUID | Foreign Key -> reports.id |
| moderator_id | UUID | Foreign Key -> users.id |
| action | Text | Not Null |
| notes | Text | Nullable |
| created_at | Timestamp | Default Now() |

## 6. Contratos de API (Endpoints)

Como o Front-end e o Back-end vão se comunicar.

### Padrão global de resposta

**Resposta de sucesso:**

```json
{
  "data": {}
}
```

**Resposta de erro:**

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

**Descrição:** Listar ocorrências públicas não arquivadas com filtros opcionais

**Query Params (Entrada):**

- `category` (string, opcional)
- `status` (string, opcional)
- `neighborhood_id` (uuid, opcional)
- `severity` (string, opcional)
- `limit` (number, opcional, default 50, máximo 100)
- `page` (number, opcional, default 1)

**Payload (Entrada):**

```json
{}
```

**Regras:**

- Não retornar ocorrências com `status = archived`
- Ordenar por `created_at desc`
- Incluir contagem de confirmações
- Incluir imagem principal quando existir
- Se filtro inválido for enviado, retornar erro de validação

**Resposta de Sucesso:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Buraco grande em cruzamento",
      "description": "Buraco profundo próximo à esquina",
      "category": "pothole",
      "status": "pending",
      "severity": "high",
      "latitude": -23.9600000,
      "longitude": -46.3900000,
      "address": "Rua Exemplo, 123",
      "street_name": "Rua Exemplo",
      "neighborhood": {
        "id": "uuid",
        "name": "Centro"
      },
      "image_url": "https://...",
      "confirmations_count": 3,
      "created_at": "2026-03-28T10:00:00Z",
      "updated_at": "2026-03-28T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 1
  }
}
```

### `GET /api/reports/[id]`

**Descrição:** Retornar os detalhes completos de uma ocorrência pública

**Payload (Entrada):**

```json
{}
```

**Regras:**

- Não retornar ocorrência arquivada em rota pública
- Incluir lista de imagens
- Incluir contagem de confirmações
- Retornar `404` se a ocorrência não existir

**Resposta de Sucesso:**

```json
{
  "data": {
    "id": "uuid",
    "title": "Buraco grande em cruzamento",
    "description": "Buraco profundo próximo à esquina",
    "category": "pothole",
    "status": "under_review",
    "severity": "high",
    "latitude": -23.9600000,
    "longitude": -46.3900000,
    "address": "Rua Exemplo, 123",
    "street_name": "Rua Exemplo",
    "neighborhood": {
      "id": "uuid",
      "name": "Centro"
    },
    "images": [
      {
        "id": "uuid",
        "image_url": "https://..."
      }
    ],
    "confirmations_count": 3,
    "created_at": "2026-03-28T10:00:00Z",
    "updated_at": "2026-03-28T11:00:00Z"
  }
}
```

### `GET /api/admin/reports`

**Descrição:** Listar ocorrências para moderação no painel administrativo

**Query Params (Entrada):**

- `status` (string, opcional)
- `category` (string, opcional)
- `neighborhood_id` (uuid, opcional)
- `severity` (string, opcional)
- `limit` (number, opcional, default 50, máximo 100)
- `page` (number, opcional, default 1)

**Payload (Entrada):**

```json
{}
```

**Regras:**

- Exige usuário autenticado
- Apenas `moderator` ou `admin`
- Pode retornar ocorrências arquivadas
- Pode retornar demais registros necessários para moderação
- Ordenar por `created_at desc`

**Resposta de Sucesso:**

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 0
  }
}
```

### `GET /api/admin/reports/[id]`

**Descrição:** Retornar os detalhes completos de uma ocorrência para moderação

**Payload (Entrada):**

```json
{}
```

**Regras:**

- Exige usuário autenticado
- Apenas `moderator` ou `admin`
- Pode retornar ocorrências arquivadas
- Retornar `404` se a ocorrência não existir

**Resposta de Sucesso:**

```json
{
  "data": {}
}
```

### `POST /api/reports`

**Descrição:** Criar uma nova ocorrência

**Payload (Entrada):**

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

**Regras:**

- `title`, `description`, `category`, `severity`, `latitude`, `longitude` são obrigatórios
- `status` não pode vir do cliente
- `status` inicial deve ser sempre `pending`
- se `is_anonymous = true`, a API pode armazenar `user_id`, mas não deve expor publicamente identidade depois
- `latitude` deve estar entre `-90` e `90`
- `longitude` deve estar entre `-180` e `180`
- `category` e `severity` devem respeitar os enums do domínio

**Resposta de Sucesso:**

```json
{
  "data": {
    "id": "uuid",
    "status": "pending",
    "created_at": "2026-03-28T10:00:00Z"
  }
}
```

### `POST /api/reports/[id]/images`

**Descrição:** Associar imagem a uma ocorrência existente

**Payload (Entrada):**

```json
{
  "file": "multipart/form-data"
}
```

**Regras:**

- A ocorrência deve existir
- O arquivo deve ser imagem válida
- Tipos aceitos inicialmente: `image/jpeg`, `image/png`, `image/webp`
- O arquivo deve ser salvo no Supabase Storage
- Após upload bem-sucedido, criar registro em `report_images`
- Limite inicial sugerido: 1 arquivo por requisição
- Tamanho máximo sugerido: `5 MB`

**Resposta de Sucesso:**

```json
{
  "data": {
    "id": "uuid",
    "image_url": "https://...",
    "storage_path": "reports/uuid/imagem.webp"
  }
}
```

### `POST /api/reports/[id]/confirm`

**Descrição:** Confirmar comunitariamente uma ocorrência

**Payload (Entrada):**

```json
{}
```

**Regras:**

- Exige usuário autenticado
- A ocorrência deve existir
- Um usuário só pode confirmar uma vez
- Não permitir confirmação em ocorrência arquivada
- Retornar conflito em caso de confirmação duplicada

**Resposta de Sucesso:**

```json
{
  "data": {
    "report_id": "uuid",
    "confirmations_count": 4
  }
}
```

### `PATCH /api/reports/[id]/status`

**Descrição:** Atualizar status de uma ocorrência

**Payload (Entrada):**

```json
{
  "status": "confirmed",
  "notes": "Ocorrência validada por imagem e múltiplas confirmações"
}
```

**Regras:**

- Exige usuário autenticado
- Apenas `moderator` ou `admin`
- Status permitido: `pending`, `under_review`, `confirmed`, `resolved`, `archived`
- Toda alteração deve atualizar `updated_at`
- Toda alteração deve gerar registro em `moderation_logs`
- Retornar `403` se usuário não tiver permissão

**Resposta de Sucesso:**

```json
{
  "data": {
    "id": "uuid",
    "status": "confirmed",
    "updated_at": "2026-03-28T12:00:00Z"
  }
}
```

### `GET /api/neighborhoods`

**Descrição:** Listar bairros disponíveis para filtro e cadastro

**Payload (Entrada):**

```json
{}
```

**Regras:**

- Retornar lista ordenada alfabeticamente
- Expor apenas `id` e `name`

**Resposta de Sucesso:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Centro"
    }
  ]
}
```

## 7. Regras de Negócio

A lógica que deve ser seguida pela implementação.

- Toda entrada deve ser validada antes de acessar o banco
- Nenhum enum de domínio pode ser aceito fora da lista oficial definida em `constants.ts`
- O cliente não pode definir o status inicial de uma ocorrência
- Toda ocorrência nova deve ser criada com `status = pending`
- Apenas moderadores e administradores podem alterar status
- Toda mudança administrativa deve gerar log em `moderation_logs`
- Apenas usuários autenticados podem confirmar ocorrências
- Um usuário não pode confirmar a mesma ocorrência duas vezes
- Ocorrências arquivadas não devem aparecer nas rotas públicas
- As rotas administrativas `GET /api/admin/reports` e `GET /api/admin/reports/[id]` podem retornar ocorrências arquivadas e demais registros necessários para moderação
- O retorno de listagem deve ser otimizado para consumo do mapa público
- O retorno de detalhe deve incluir imagens e contagem de confirmações
- O sistema deve evitar exposição pública de dados sensíveis do autor da ocorrência
- `updated_at` deve ser atualizado sempre que houver mudança relevante
- A API deve retornar erros previsíveis e estruturados
- O upload de imagem deve criar vínculo explícito com a ocorrência
- O endpoint de imagem não deve criar ocorrência; apenas complementar uma já existente

## 8. Estrutura de Arquivos

Onde cada novo arquivo deve ser criado ou qual arquivo existente será modificado.

```text
/app
  /api
    /admin
      /reports
        route.ts
      /reports/[id]
        route.ts
    /reports
      route.ts
    /reports/[id]
      route.ts
    /reports/[id]/images
      route.ts
    /reports/[id]/confirm
      route.ts
    /reports/[id]/status
      route.ts
    /neighborhoods
      route.ts

/lib
  supabase.ts
  constants.ts
  validations.ts
  api.ts
  auth.ts

/types
  report.ts
  user.ts
  neighborhood.ts
  moderation.ts
  api.ts
```

### Descrição dos arquivos esperados

#### `/app/api/reports/route.ts`

- Implementa `GET` para listagem e `POST` para criação

#### `/app/api/reports/[id]/route.ts`

- Implementa `GET` para detalhe

#### `/app/api/admin/reports/route.ts`

- Implementa `GET` para listagem administrativa

#### `/app/api/admin/reports/[id]/route.ts`

- Implementa `GET` para detalhe administrativo

#### `/app/api/reports/[id]/images/route.ts`

- Implementa `POST` para upload e associação de imagem

#### `/app/api/reports/[id]/confirm/route.ts`

- Implementa `POST` para confirmação comunitária

#### `/app/api/reports/[id]/status/route.ts`

- Implementa `PATCH` para alteração de status

#### `/app/api/neighborhoods/route.ts`

- Implementa `GET` de bairros

#### `/lib/validations.ts`

- Schemas Zod para query params, payloads e ids

#### `/lib/api.ts`

- Helpers padronizados para resposta JSON e tratamento de erro

#### `/lib/auth.ts`

- Helpers para obter usuário atual e verificar role

#### `/types/api.ts`

- Tipos de resposta padronizada da API

## 9. Restrições Técnicas

Regras estritas para a implementação.

- Todo endpoint deve ser escrito em TypeScript
- Toda validação deve ser feita com Zod
- Não acessar banco sem validação prévia dos dados de entrada
- Não usar classes
- Não criar lógica de negócio relevante diretamente no componente visual
- Não aceitar `any` nos tipos da API
- Não retornar erros genéricos sem estrutura mínima
- Não confiar em payload enviado pelo cliente para campos controlados pelo sistema
- Não expor e-mail, role ou identidade do autor em rotas públicas
- Não permitir alteração de status por usuário comum
- Não implementar endpoints fora desta spec
- Não implementar lógica de busca textual avançada nesta fase
- Não adicionar dependências fora da stack definida sem necessidade explícita
- Não usar rotas RPC do Supabase como substitutas desta API
- Não pular logs de moderação em mudanças administrativas

## 10. Critérios de Aceitação

Condições objetivas para considerar a funcionalidade pronta.

- O endpoint `GET /api/reports` retorna ocorrências públicas com filtros válidos
- O endpoint `GET /api/reports/[id]` retorna os detalhes completos de uma ocorrência
- O endpoint `GET /api/admin/reports` retorna ocorrências para moderação com controle de acesso
- O endpoint `GET /api/admin/reports/[id]` retorna detalhe administrativo com controle de acesso
- O endpoint `POST /api/reports` cria ocorrência com status inicial `pending`
- O endpoint `POST /api/reports/[id]/images` salva imagem no storage e registra no banco
- O endpoint `POST /api/reports/[id]/confirm` exige autenticação e impede duplicidade
- O endpoint `PATCH /api/reports/[id]/status` exige role adequada
- Toda alteração de status gera log em `moderation_logs`
- O endpoint `GET /api/neighborhoods` retorna bairros ordenados
- Payloads inválidos retornam erro estruturado
- IDs inexistentes retornam erro apropriado
- Ocorrências arquivadas não aparecem nas rotas públicas
- A API está pronta para ser consumida pela Fase 3 sem retrabalho estrutural

## 11. Próxima Iteração Planejada

O que poderá ser feito depois, mas não agora.

- Construir mapa público consumindo `GET /api/reports`
- Construir filtros visuais por bairro, categoria e status
- Construir tela de detalhe de ocorrência
- Construir landing page do projeto
- Consumir listagem e detalhe diretamente na interface pública

## 12. Entregáveis Esperados da IA nesta Fase

O que a IA deve gerar quando receber esta spec.

- Implementação de todos os route handlers previstos
- Schemas Zod de entrada e query params
- Helpers reutilizáveis de erro e autenticação
- Integração com Supabase para leitura e escrita
- Tratamento padronizado de respostas JSON
- Tipos auxiliares da camada de API
- Lógica de autorização mínima para moderação
- Lógica de gravação de logs de moderação

## 13. Schemas de Validação Esperados

Estruturas que devem existir em `validations.ts`.

### `reportCreateSchema`

**Campos obrigatórios:**

- `title`
- `description`
- `category`
- `severity`
- `latitude`
- `longitude`

**Campos opcionais:**

- `address`
- `street_name`
- `neighborhood_id`
- `is_anonymous`

### `reportStatusUpdateSchema`

**Campos:**

- `status` obrigatório
- `notes` opcional

### `reportListQuerySchema`

**Campos opcionais:**

- `category`
- `status`
- `severity`
- `neighborhood_id`
- `page`
- `limit`

### `uuidParamSchema`

**Campos:**

- `id`

### `imageUploadValidation`

**Regras:**

- tipo MIME permitido
- tamanho máximo
- presença obrigatória do arquivo

## 14. Códigos de Erro Recomendados

Para tornar a API previsível.

**Valores sugeridos para `error.code`:**

- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `CONFLICT`
- `UPLOAD_ERROR`
- `INTERNAL_ERROR`

**Exemplo:**

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Você não possui permissão para alterar o status desta ocorrência"
  }
}
```

## 15. Observações de Implementação

Diretrizes extras para evitar interpretação errada pela IA.

- Priorizar previsibilidade e legibilidade da API
- A listagem deve ser pensada para alimentar mapa e cards
- O detalhe deve ser suficiente para uma página/modal de ocorrência
- O endpoint de confirmação não deve alterar status automaticamente
- O endpoint de status deve ser estritamente administrativo
- O upload deve ser tratado como complemento da ocorrência, não como fluxo isolado de criação
- Sempre que possível, encapsular regras repetidas em helpers simples
- A API deve nascer pequena, clara e firme, sem antecipar complexidades que ainda não existem

## 16. Regra de Ouro desta Fase

Antes de iniciar a Fase 3, todos os endpoints do MVP devem estar funcionais, com validação consistente, regras de permissão aplicadas e respostas previsíveis. O front-end não deve depender de comportamento implícito ou improvisado da API.
