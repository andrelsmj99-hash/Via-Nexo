# Via Nexo — Visão Geral e Planejamento do MVP

## Navegação

- [README da documentação](./README.md)
- [Master Spec do MVP](./via-nexo-master-spec.md)
- [Fase 1 — Fundação de Dados e Infraestrutura](./via-nexo-fase-1-banco.md)
- [Fase 2 — API e Regras de Negócio](./via-nexo-fase-2-api.md)
- [Fase 3 — Mapa Público e Visualização](./via-nexo-fase-3-mapa-publico.md)
- [Fase 4 — Envio de Ocorrências pela Comunidade](./via-nexo-fase-4-envio-ocorrencias.md)
- [Fase 5 — Moderação e Controle Administrativo](./via-nexo-fase-5-moderacao.md)

---

## 1. Visão Geral

**Nome da Funcionalidade/Módulo:** Via Nexo — Planejamento de Implementação do MVP por Fases  
**Objetivo Principal:** Organizar a execução do MVP do Via Nexo em fases modulares e validadas, reduzindo risco técnico, evitando retrabalho e garantindo que cada etapa seja construída sobre uma base consistente. Esta spec define a ordem correta de implementação para banco de dados, API, interface pública e painel administrativo.

## 2. Histórias de Usuário (User Stories)

A IA usará isso para entender a intenção e testar se o objetivo foi cumprido.

- Como arquiteto do sistema, eu quero dividir o desenvolvimento em fases claras, para que a implementação seja organizada e validável.
- Como desenvolvedor, eu quero construir primeiro a fundação de dados, para que as próximas camadas do sistema não fiquem inconsistentes.
- Como usuário final, eu quero usar uma plataforma estável e simples, para que eu consiga reportar problemas sem fricção.
- Como moderador, eu quero ter uma interface mínima de controle, para que eu possa validar relatos com segurança.
- Como gestor do produto, eu quero validar o MVP com o menor número de funcionalidades necessárias, para que eu possa testar adesão real antes de expandir.

## 3. Escopo e Limitações

O que a IA DEVE e NÃO DEVE fazer nesta iteração.

### In-Scope (Dentro do Escopo)

- Definir a ordem oficial de implementação do MVP
- Separar o projeto em fases independentes e cumulativas
- Definir entregáveis por fase
- Definir critérios de conclusão por fase
- Definir dependências entre as fases
- Garantir que cada fase possa ser validada antes da próxima

### Out-of-Scope (Fora do Escopo - NÃO IMPLEMENTAR)

- Construção do sistema completo em uma única etapa
- Adição de funcionalidades futuras fora do MVP
- Refinamentos visuais avançados antes da fundação estar pronta
- Otimizações prematuras
- Analytics complexos
- Recursos de expansão multi-cidade
- IA para classificação ou detecção automática

## 4. Arquitetura e Stack Tecnológico

Defina as ferramentas exatas para a IA não inventar dependências.

- **Front-end:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Mapa:** Leaflet com React Leaflet
- **Back-end:** Next.js Route Handlers
- **Banco de Dados:** PostgreSQL via Supabase
- **Armazenamento de Arquivos:** Supabase Storage
- **Autenticação:** Supabase Auth
- **Hospedagem:** Vercel
- **Geolocalização/Base cartográfica:** OpenStreetMap
- **Validação de dados:** Zod
- **ORM/Query Layer:** Supabase client SDK

## 5. Modelagem de Dados (Schema)

Se houver banco de dados, defina as tabelas e colunas exatas.

### Tabela: `users`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| id | UUID | Primary Key, vinculado ao Auth |
| name | Text | Not Null |
| email | Text | Unique, Not Null |
| role | Text | Not Null, valores: citizen, moderator, admin |
| created_at | Timestamp | Default: Now() |

### Tabela: `neighborhoods`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| id | UUID | Primary Key, Auto-gerado |
| name | Text | Not Null |
| city | Text | Not Null |
| created_at | Timestamp | Default: Now() |

**Constraints adicionais:**

- `unique(name, city)`

### Tabela: `reports`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| id | UUID | Primary Key, Auto-gerado |
| user_id | UUID | Foreign Key -> users.id, Nullable no envio anônimo controlado |
| title | Text | Not Null |
| description | Text | Not Null |
| category | Text | Not Null, valores permitidos definidos pela aplicação |
| status | Text | Not Null, valores: pending, under_review, confirmed, resolved, archived |
| severity | Text | Not Null, valores: low, medium, high, critical |
| latitude | Numeric(10,7) | Not Null |
| longitude | Numeric(10,7) | Not Null |
| address | Text | Nullable |
| street_name | Text | Nullable |
| neighborhood_id | UUID | Foreign Key -> neighborhoods.id |
| is_anonymous | Boolean | Default: false |
| created_at | Timestamp | Default: Now() |
| updated_at | Timestamp | Default: Now() |

### Tabela: `report_images`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| id | UUID | Primary Key, Auto-gerado |
| report_id | UUID | Foreign Key -> reports.id, Not Null |
| image_url | Text | Not Null |
| storage_path | Text | Not Null |
| created_at | Timestamp | Default: Now() |

### Tabela: `report_confirmations`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| id | UUID | Primary Key, Auto-gerado |
| report_id | UUID | Foreign Key -> reports.id, Not Null |
| user_id | UUID | Foreign Key -> users.id, Not Null |
| created_at | Timestamp | Default: Now() |
| unique(report_id, user_id) | Constraint | Um usuário só pode confirmar uma vez |

### Tabela: `moderation_logs`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| id | UUID | Primary Key, Auto-gerado |
| report_id | UUID | Foreign Key -> reports.id, Not Null |
| moderator_id | UUID | Foreign Key -> users.id, Not Null |
| action | Text | Not Null, ex: approve, reject, resolve, archive |
| notes | Text | Nullable |
| created_at | Timestamp | Default: Now() |

## 6. Contratos de API (Endpoints)

Como o Front-end e o Back-end vão se comunicar.

### `GET /api/reports`

**Descrição:** Listar ocorrências públicas com filtros opcionais

**Payload (Entrada):**

```json
{}
```

**Resposta de Sucesso:**

```json
{
  "data": []
}
```

### `GET /api/reports/[id]`

**Descrição:** Retornar detalhes completos de uma ocorrência

**Payload (Entrada):**

```json
{}
```

**Resposta de Sucesso:**

```json
{
  "data": {}
}
```

### `GET /api/admin/reports`

**Descrição:** Listar ocorrências para moderação no painel administrativo

**Payload (Entrada):**

```json
{}
```

### `GET /api/admin/reports/[id]`

**Descrição:** Retornar detalhes completos de uma ocorrência para moderação

**Payload (Entrada):**

```json
{}
```

### `POST /api/reports`

**Descrição:** Criar uma nova ocorrência

**Payload (Entrada):**

```json
{
  "title": "string",
  "description": "string",
  "category": "pothole",
  "severity": "high",
  "latitude": -23.96,
  "longitude": -46.39,
  "address": "string",
  "street_name": "string",
  "neighborhood_id": "uuid",
  "is_anonymous": false
}
```

**Resposta de Sucesso:**

```json
{
  "data": {
    "id": "uuid",
    "status": "pending"
  }
}
```

### `POST /api/reports/[id]/images`

**Descrição:** Enviar imagem vinculada a uma ocorrência

**Payload (Entrada):**

```json
{
  "file": "multipart/form-data"
}
```

### `POST /api/reports/[id]/confirm`

**Descrição:** Confirmar uma ocorrência existente

**Payload (Entrada):**

```json
{}
```

### `PATCH /api/reports/[id]/status`

**Descrição:** Atualizar o status de uma ocorrência

**Payload (Entrada):**

```json
{
  "status": "confirmed",
  "notes": "string"
}
```

### `GET /api/neighborhoods`

**Descrição:** Listar bairros disponíveis

**Payload (Entrada):**

```json
{}
```

## 7. Regras de Negócio

A lógica que deve ser seguida pela implementação.

- O desenvolvimento deve seguir a ordem das fases definidas nesta spec
- Nenhuma fase pode depender de funcionalidades não concluídas da fase seguinte
- Cada fase deve ser validada antes do início da próxima
- A Fase 1 é obrigatória antes de qualquer API ou interface
- A Fase 2 depende da existência do schema e das regras de acesso da Fase 1
- A Fase 3 depende de endpoints testados e estáveis da Fase 2
- A Fase 4 depende do fluxo principal do usuário já funcional
- A Fase 5 depende do painel administrativo e da autenticação mínima já operacionais
- As rotas públicas `GET /api/reports` e `GET /api/reports/[id]` não devem retornar ocorrências arquivadas
- As rotas administrativas `GET /api/admin/reports` e `GET /api/admin/reports/[id]` podem retornar ocorrências arquivadas e demais registros necessários para moderação

## 8. Estrutura de Arquivos

Onde cada novo arquivo deve ser criado ou qual arquivo existente será modificado.

```text
/specs
  README.md
  via-nexo-visao-geral.md
  via-nexo-master-spec.md
  via-nexo-fase-1-banco.md
  via-nexo-fase-2-api.md
  via-nexo-fase-3-mapa-publico.md
  via-nexo-fase-4-envio-ocorrencias.md
  via-nexo-fase-5-moderacao.md

/app
  /api
  /map
  /report
  /admin
  /page.tsx

/components
/lib
/types
```

## 9. Restrições Técnicas

Regras estritas para a implementação.

- Não implementar todas as telas antes da base de dados estar pronta
- Não criar mocks permanentes como substituto do banco real
- Não iniciar moderação antes do fluxo de criação e leitura de ocorrência estar estável
- Não criar dependências fora da stack definida
- Não misturar regras de negócio no componente visual quando puderem ficar em camada própria
- Não avançar de fase sem critérios mínimos de validação
- Não adicionar funcionalidades fora do escopo da fase atual

## 10. Critérios de Aceitação

Condições objetivas para considerar a funcionalidade pronta.

- Existe uma ordem formal de execução do MVP
- Cada fase possui objetivos claros
- Cada fase possui dependências explícitas
- Cada fase possui entregáveis definidos
- Cada fase possui critérios de conclusão
- A implementação pode ser iniciada sem ambiguidades estruturais

## 11. Próxima Iteração Planejada

O que poderá ser feito depois, mas não agora.

- Transformar cada fase abaixo em uma spec individual detalhada
- Criar checklist técnico de implementação por arquivo
- Criar backlog do MVP com prioridade MoSCoW
- Criar critérios de teste por endpoint e por tela

## 12. Fases Oficiais de Implementação do MVP

### [Fase 1 — Fundação de Dados e Infraestrutura](./via-nexo-fase-1-banco.md)

**Objetivo:** Construir a base estrutural do sistema antes de qualquer interface funcional.

**Entregáveis:**

- Projeto Supabase criado
- Tabelas definidas no banco
- Relacionamentos e constraints aplicados
- Buckets de storage configurados
- Regras iniciais de acesso definidas
- Tipagens iniciais do domínio criadas em TypeScript
- Arquivo de constantes criado com enums de categorias, severidades e status

**Arquivos principais esperados:**

- `/lib/supabase.ts`
- `/lib/constants.ts`
- `/types/report.ts`
- `/types/user.ts`
- `/types/neighborhood.ts`

**Validação da fase:**

- É possível inserir e consultar registros manualmente no banco
- As tabelas estão consistentes com a spec
- Os valores permitidos de status, categoria e severidade estão padronizados
- O storage de imagens está pronto para uso

**Não implementar nesta fase:**

- telas públicas
- mapa
- formulários completos
- painel admin

### [Fase 2 — API e Regras de Negócio](./via-nexo-fase-2-api.md)

**Objetivo:** Criar a camada de comunicação e validação do sistema.

**Entregáveis:**

- Endpoint para listar ocorrências
- Endpoint para detalhar ocorrência
- Endpoint administrativo para listar ocorrências
- Endpoint administrativo para detalhar ocorrência
- Endpoint para criar ocorrência
- Endpoint para upload de imagem
- Endpoint para confirmar ocorrência
- Endpoint para atualizar status
- Endpoint para listar bairros
- Schemas Zod para validação de entrada
- Regras de permissão para ações administrativas

**Arquivos principais esperados:**

- `/app/api/reports/route.ts`
- `/app/api/reports/[id]/route.ts`
- `/app/api/admin/reports/route.ts`
- `/app/api/admin/reports/[id]/route.ts`
- `/app/api/reports/[id]/images/route.ts`
- `/app/api/reports/[id]/confirm/route.ts`
- `/app/api/reports/[id]/status/route.ts`
- `/app/api/neighborhoods/route.ts`
- `/lib/validations.ts`

**Validação da fase:**

- Endpoints respondem corretamente
- Endpoints administrativos respondem corretamente
- Payloads inválidos retornam erro controlado
- Status inicial da ocorrência é sempre `pending`
- Usuário não consegue confirmar a mesma ocorrência duas vezes
- Apenas moderador/admin consegue alterar status

**Não implementar nesta fase:**

- refinamento visual
- dashboard avançado
- filtros sofisticados de mapa no front

### [Fase 3 — Mapa Público e Visualização](./via-nexo-fase-3-mapa-publico.md)

**Objetivo:** Permitir que qualquer visitante visualize as ocorrências em um mapa interativo.

**Entregáveis:**

- Página pública principal
- Página de mapa
- Componente de mapa com marcadores
- Camada de carregamento de ocorrências
- Filtros por categoria, bairro e status
- Cards ou painéis com resumo das ocorrências
- Tela de detalhes da ocorrência

**Arquivos principais esperados:**

- `/app/page.tsx`
- `/app/map/page.tsx`
- `/components/MapView.tsx`
- `/components/FilterBar.tsx`
- `/components/ReportCard.tsx`
- `/components/ReportDetails.tsx`

**Validação da fase:**

- Usuário consegue abrir o mapa
- Usuário consegue visualizar marcadores
- Usuário consegue aplicar filtros
- Usuário consegue abrir detalhes da ocorrência
- Dados exibidos correspondem aos dados da API

**Não implementar nesta fase:**

- submissão de ocorrência
- painel administrativo
- métricas complexas

### [Fase 4 — Envio de Ocorrências pela Comunidade](./via-nexo-fase-4-envio-ocorrencias.md)

**Objetivo:** Permitir que usuários criem relatos com informação suficiente para uso público e moderação.

**Entregáveis:**

- Página de envio de ocorrência
- Formulário com validação
- Seleção de categoria
- Definição de severidade
- Geolocalização por clique no mapa ou coordenada
- Upload de imagem
- Mensagem de sucesso e tratamento de erros

**Arquivos principais esperados:**

- `/app/report/page.tsx`
- `/components/ReportForm.tsx`

**Validação da fase:**

- Usuário consegue preencher e enviar ocorrência
- Campos obrigatórios são validados
- Imagem pode ser enviada com sucesso
- Ocorrência aparece no sistema após criação
- Ocorrência nova entra com status `pending`

**Não implementar nesta fase:**

- reputação
- denúncias automáticas duplicadas
- autoaprovação inteligente

### [Fase 5 — Moderação e Controle Administrativo](./via-nexo-fase-5-moderacao.md)

**Objetivo:** Criar a camada mínima de confiança e governança do sistema.

**Entregáveis:**

- Página administrativa
- Tabela/lista de ocorrências para moderação
- Alteração de status
- Registro de ação em moderation logs
- Visualização das ocorrências pendentes
- Controle mínimo de acesso para moderadores

**Arquivos principais esperados:**

- `/app/admin/page.tsx`
- `/components/AdminReportTable.tsx`

**Validação da fase:**

- Moderador consegue acessar o painel
- Moderador consegue alterar status da ocorrência
- A ação fica registrada em log
- Ocorrências pendentes podem ser revisadas
- Usuário comum não acessa ações administrativas

**Não implementar nesta fase:**

- analytics complexos
- auditoria visual avançada
- workflow multinível de aprovação

## 13. Ordem Oficial de Execução

1. [Fase 1 — Fundação de Dados e Infraestrutura](./via-nexo-fase-1-banco.md)
2. [Fase 2 — API e Regras de Negócio](./via-nexo-fase-2-api.md)
3. [Fase 3 — Mapa Público e Visualização](./via-nexo-fase-3-mapa-publico.md)
4. [Fase 4 — Envio de Ocorrências pela Comunidade](./via-nexo-fase-4-envio-ocorrencias.md)
5. [Fase 5 — Moderação e Controle Administrativo](./via-nexo-fase-5-moderacao.md)

## 14. Regra de Ouro do Projeto

Antes de corrigir ou expandir qualquer funcionalidade futura, a spec correspondente deve ser atualizada primeiro. O código sempre deve refletir a spec mais recente.
