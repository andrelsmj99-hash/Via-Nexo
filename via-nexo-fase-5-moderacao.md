# Via Nexo — Fase 5: Moderação e Controle Administrativo

## Navegação

- [README da documentação](./README.md)
- [Visão geral e planejamento do MVP](./via-nexo-visao-geral.md)
- [Master Spec do MVP](./via-nexo-master-spec.md)
- [Fase anterior: Fase 4 — Envio de Ocorrências pela Comunidade](./via-nexo-fase-4-envio-ocorrencias.md)

---

## 1. Visão Geral

**Nome da Funcionalidade/Módulo:** Via Nexo — Fase 5: Moderação e Controle Administrativo  
**Objetivo Principal:** Implementar a camada mínima de governança do Via Nexo, permitindo que moderadores e administradores revisem, validem, resolvam e arquivem ocorrências com segurança e rastreabilidade. Esta fase deve criar um painel administrativo funcional, com controle de acesso, atualização de status e registro de ações, garantindo confiança nos dados públicos sem introduzir ainda workflows complexos.

## 2. Histórias de Usuário (User Stories)

A IA usará isso para entender a intenção e testar se o objetivo foi cumprido.

- Como moderador, eu quero visualizar ocorrências pendentes e em revisão, para que eu possa decidir o que fazer com elas.
- Como moderador, eu quero alterar o status de uma ocorrência, para que eu possa validá-la, resolvê-la ou arquivá-la.
- Como moderador, eu quero registrar observações ao alterar um status, para que exista contexto administrativo.
- Como administrador, eu quero ter controle de acesso ao painel, para que apenas pessoas autorizadas executem ações sensíveis.
- Como sistema, eu quero registrar logs de moderação, para que exista histórico auditável das decisões.
- Como visitante da plataforma, eu quero confiar que os dados públicos passaram por algum nível de governança.

## 3. Escopo e Limitações

O que a IA DEVE e NÃO DEVE fazer nesta iteração.

### In-Scope (Dentro do Escopo)

- Criar página administrativa do Via Nexo
- Exigir autenticação para acesso administrativo
- Restringir acesso por papel (`moderator` e `admin`)
- Listar ocorrências para revisão
- Filtrar ocorrências por status, categoria e bairro no painel
- Permitir alteração de status
- Permitir inclusão opcional de observação administrativa
- Exibir informações principais da ocorrência no painel
- Integrar com `PATCH /api/reports/[id]/status`
- Exibir feedback de sucesso e erro ao moderador
- Exibir fila útil de ocorrências pendentes, em revisão, confirmadas e resolvidas
- Garantir registro de ação administrativa via `moderation_logs`

### Out-of-Scope (Fora do Escopo - NÃO IMPLEMENTAR)

- Workflow multinível de aprovação
- Sistema completo de permissões granular por ação
- Exclusão física de ocorrências
- Edição completa de ocorrência pelo admin
- Painel analítico avançado
- Gestão de usuários
- Sistema de denúncias de abuso
- Comentários públicos administrativos
- Atribuição de ocorrência a moderador específico
- SLA automático
- Moderação em lote
- Exportação de relatórios
- Sistema de tickets interno
- Integração com prefeitura
- Auditoria visual avançada

## 4. Arquitetura e Stack Tecnológico

Defina as ferramentas exatas para a IA não inventar dependências.

- **Front-end:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Back-end consumido:** API interna criada na Fase 2
- **Autenticação:** Supabase Auth
- **Banco de Dados:** PostgreSQL via Supabase
- **Validação:** Zod, quando necessário
- **Hospedagem:** Vercel
- **Controle de sessão:** camada simples baseada em usuário autenticado e role de aplicação

## 5. Modelagem de Dados (Schema)

Se houver banco de dados, defina as tabelas e colunas exatas.

### Tabelas usadas diretamente nesta fase

- `users`
- `reports`
- `neighborhoods`
- `moderation_logs`
- `report_images`
- `report_confirmations`

### Campos centrais no painel

#### Tabela: `users`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| `id` | UUID | Primary Key |
| `name` | Text | Obrigatório |
| `email` | Text | Obrigatório |
| `role` | Text | Obrigatório, valores: `citizen`, `moderator`, `admin` |

#### Tabela: `reports`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| `id` | UUID | Primary Key |
| `title` | Text | Obrigatório |
| `description` | Text | Obrigatório |
| `category` | Text | Obrigatório |
| `status` | Text | Obrigatório |
| `severity` | Text | Obrigatório |
| `latitude` | Numeric(10,7) | Obrigatório |
| `longitude` | Numeric(10,7) | Obrigatório |
| `address` | Text | Opcional |
| `street_name` | Text | Opcional |
| `neighborhood_id` | UUID | Opcional |
| `is_anonymous` | Boolean | Default false |
| `created_at` | Timestamp | Obrigatório |
| `updated_at` | Timestamp | Obrigatório |

#### Tabela: `moderation_logs`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| `id` | UUID | Primary Key |
| `report_id` | UUID | Foreign Key -> `reports.id` |
| `moderator_id` | UUID | Foreign Key -> `users.id` |
| `action` | Text | Obrigatório |
| `notes` | Text | Opcional |
| `created_at` | Timestamp | Obrigatório |

### Status permitidos

- `pending`
- `under_review`
- `confirmed`
- `resolved`
- `archived`

### Ações administrativas esperadas

- `approve`
- `reject`
- `resolve`
- `archive`
- `reopen`

**Observação:**  
Mesmo que o endpoint aceite apenas troca de status, o log deve refletir ação administrativa semanticamente coerente com o status aplicado.

## 6. Contratos de API (Endpoints)

Como o Front-end e o Back-end vão se comunicar.

### `GET /api/admin/reports`

**Descrição:** Buscar ocorrências para a fila administrativa

**Query Params aceitos no painel:**

- `status`
- `category`
- `severity`
- `neighborhood_id`
- `page`
- `limit`

**Payload (Entrada):**

```json
{}
```

**Uso nesta fase:**
- alimentar tabela/lista administrativa
- compor filtros do painel
- mostrar fila por status

### `GET /api/admin/reports/[id]`

**Descrição:** Buscar detalhes completos de uma ocorrência para revisão

**Payload (Entrada):**

```json
{}
```

**Uso nesta fase:**
- exibir dados completos para análise
- exibir imagens e metadados principais

### `PATCH /api/reports/[id]/status`

**Descrição:** Atualizar status da ocorrência via ação administrativa

**Payload (Entrada):**

```json
{
  "status": "confirmed",
  "notes": "Ocorrência validada por imagem e múltiplas confirmações"
}
```

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

**Regras:**
- exige autenticação
- exige role `moderator` ou `admin`
- deve registrar `moderation_logs`
- deve retornar erro estruturado em caso de permissão insuficiente

### `GET /api/neighborhoods`

**Descrição:** Listar bairros para popular filtros do painel

**Payload (Entrada):**

```json
{}
```

## 7. Regras de Negócio

A lógica que deve ser seguida pela implementação.

- Apenas usuários autenticados com papel `moderator` ou `admin` podem acessar o painel
- Usuários comuns não devem visualizar ações administrativas
- A listagem administrativa deve priorizar ocorrências com `pending` e `under_review`
- A alteração de status deve ser explícita e intencional
- Toda alteração de status deve gerar log administrativo
- A observação administrativa deve ser opcional, mas disponível
- O painel deve exibir contexto suficiente para tomada de decisão
- O moderador deve conseguir entender o que está analisando sem sair da área administrativa
- O painel não deve expor dados sensíveis desnecessários
- O sistema deve preservar a consistência entre status exibido no painel e status persistido no banco
- O front-end não deve permitir ações fora dos status válidos
- O sistema deve refletir imediatamente, ou por recarga controlada, a nova situação após alteração
- O painel deve continuar funcional em telas menores, mesmo que com layout simplificado
- O acesso administrativo deve falhar de forma segura quando o usuário não estiver autenticado ou não tiver papel adequado

## 8. Estrutura de Arquivos

Onde cada novo arquivo deve ser criado ou qual arquivo existente será modificado.

```text
/app
  /admin/page.tsx

/components
  AdminReportTable.tsx
  AdminReportFilters.tsx
  AdminReportDetails.tsx
  AdminStatusActionForm.tsx
  AdminEmptyState.tsx
  AdminErrorState.tsx
  AdminLoadingState.tsx
  AccessDeniedState.tsx

/lib
  api.ts
  auth.ts
  constants.ts
  validations.ts
  formatters.ts

/types
  report.ts
  moderation.ts
  user.ts
  api.ts
```

### Descrição dos arquivos esperados

#### `/app/admin/page.tsx`

- Página principal do painel administrativo
- Verifica sessão e papel do usuário
- Orquestra filtros, lista e detalhe

#### `/components/AdminReportTable.tsx`

- Lista ou tabela de ocorrências administrativas
- Exibe colunas principais

#### `/components/AdminReportFilters.tsx`

- Filtros por status, categoria, severidade e bairro

#### `/components/AdminReportDetails.tsx`

- Painel de detalhe da ocorrência selecionada
- Exibe descrição, localização, imagem e metadados

#### `/components/AdminStatusActionForm.tsx`

- Formulário para alterar status
- Campo opcional de observação
- Disparo do `PATCH /api/reports/[id]/status`

#### `/components/AdminEmptyState.tsx`

- Estado vazio padronizado do painel

#### `/components/AdminErrorState.tsx`

- Estado de erro padronizado do painel

#### `/components/AdminLoadingState.tsx`

- Estado de carregamento padronizado do painel

#### `/components/AccessDeniedState.tsx`

- Mensagem clara para usuário sem acesso autorizado

## 9. Restrições Técnicas

Regras estritas para a implementação.

- Não usar classes; utilizar apenas componentes funcionais
- Todo o código deve ser escrito em TypeScript
- Não permitir acesso ao painel sem validação de autenticação
- Não permitir ação administrativa sem verificação de role
- Não permitir atualização de status por meios alternativos no front
- Não implementar edição completa de ocorrência nesta fase
- Não implementar exclusão física de registros
- Não adicionar bibliotecas extras de data grid complexa sem necessidade
- Não misturar lógica de autorização e rendering de UI de forma desorganizada
- Não exibir dados sensíveis desnecessários
- Não criar workflow de moderação que ultrapasse o escopo desta fase
- Não adicionar analytics ou relatórios gerenciais nesta etapa
- Não depender de mocks permanentes em vez da API real

## 10. Critérios de Aceitação

Condições objetivas para considerar a funcionalidade pronta.

- Existe uma página administrativa funcional
- Usuário não autenticado não acessa o painel administrativo
- Usuário com role inadequada recebe bloqueio de acesso
- Moderador/admin consegue visualizar ocorrências no painel
- Moderador/admin consegue filtrar a lista por status
- Moderador/admin consegue filtrar a lista por categoria
- Moderador/admin consegue filtrar a lista por bairro
- Moderador/admin consegue abrir os detalhes de uma ocorrência
- Moderador/admin consegue alterar o status de uma ocorrência
- O painel permite adicionar nota administrativa opcional
- A alteração de status persiste corretamente no banco
- A alteração de status gera registro em `moderation_logs`
- O painel exibe estados de loading, erro e vazio
- A interface funciona em desktop e mobile
- A fase conclui o MVP funcional do Via Nexo sem retrabalho estrutural

## 11. Próxima Iteração Planejada

O que poderá ser feito depois, mas não agora.

- Histórico visual de moderação por ocorrência
- Moderação em lote
- Dashboard com métricas por status e bairro
- Gestão de usuários e permissões
- Fila priorizada por severidade e confirmações
- Comentários internos administrativos
- Integração com protocolo externo
- SLA de resposta e acompanhamento

## 12. Entregáveis Esperados da IA nesta Fase

O que a IA deve gerar quando receber esta spec.

- Página administrativa protegida
- Lista/tabela de ocorrências
- Filtros administrativos
- Painel de detalhe da ocorrência
- Formulário de alteração de status
- Tratamento de acesso negado
- Integração com endpoint de atualização de status
- Fluxo claro de revisão e moderação
- Estrutura pronta para evoluções administrativas futuras

## 13. Comportamento Esperado do Painel

Detalhes para evitar ambiguidade na implementação.

### Visão principal

Deve conter:
- título do painel
- resumo simples do propósito da área
- filtros administrativos
- lista ou tabela de ocorrências
- indicação visual do status atual
- possibilidade de selecionar uma ocorrência para revisar

### Detalhe administrativo

Deve conter:
- título
- descrição
- categoria
- status atual
- severidade
- endereço ou rua, quando houver
- bairro, quando houver
- coordenadas, se necessário
- imagem ou imagens, quando houver
- confirmações, quando houver
- datas de criação e atualização

### Ação administrativa

Deve conter:
- seletor de novo status
- campo opcional de observação
- botão de confirmar alteração
- feedback de sucesso ou erro

## 14. Estados de Interface Obrigatórios

Para manter previsibilidade e boa UX.

### Loading

- durante carregamento do painel
- durante carregamento do detalhe
- durante atualização de status

### Error

- erro ao buscar ocorrências
- erro ao buscar detalhe
- erro ao atualizar status

### Empty

- nenhuma ocorrência encontrada com os filtros aplicados

### Access Denied

- usuário sem autenticação
- usuário autenticado sem papel suficiente

### Success

- status atualizado com sucesso

## 15. Regras de Mensageria ao Moderador

Para evitar respostas confusas da interface.

### Sucesso

**Exemplo:**
- “Status da ocorrência atualizado com sucesso.”
- “A ação foi registrada no histórico administrativo.”

### Erro de permissão

**Exemplo:**
- “Você não possui permissão para executar esta ação.”

### Erro operacional

**Exemplo:**
- “Não foi possível atualizar o status da ocorrência agora.”
- “Tente novamente em instantes.”

### Acesso negado

**Exemplo:**
- “Esta área é restrita a moderadores e administradores.”

## 16. Regra de Ouro desta Fase

Antes de considerar o MVP concluído, o painel administrativo deve permitir governança real sobre os relatos: acesso controlado, revisão clara, atualização de status e registro auditável. O Via Nexo só se torna confiável quando contribuição pública e moderação mínima funcionam juntas.
