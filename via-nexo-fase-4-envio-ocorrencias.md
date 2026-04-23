# Via Nexo — Fase 4: Envio de Ocorrências pela Comunidade

## Navegação

- [README da documentação](./README.md)
- [Visão geral e planejamento do MVP](./via-nexo-visao-geral.md)
- [Master Spec do MVP](./via-nexo-master-spec.md)
- [Fase anterior: Fase 3 — Mapa Público e Visualização](./via-nexo-fase-3-mapa-publico.md)
- [Próxima fase: Fase 5 — Moderação e Controle Administrativo](./via-nexo-fase-5-moderacao.md)

---

## 1. Visão Geral

**Nome da Funcionalidade/Módulo:** Via Nexo — Fase 4: Envio de Ocorrências pela Comunidade  
**Objetivo Principal:** Implementar o fluxo público de criação de ocorrências no Via Nexo, permitindo que cidadãos registrem problemas urbanos com informações mínimas válidas, localização geográfica e evidência visual. Esta fase deve transformar a participação comunitária em um processo simples, confiável e compatível com a moderação futura, sem introduzir ainda automações complexas ou reputação.

## 2. Histórias de Usuário (User Stories)

A IA usará isso para entender a intenção e testar se o objetivo foi cumprido.

- Como cidadão, eu quero registrar um problema na via com título, descrição, categoria e localização, para que ele apareça no sistema.
- Como cidadão, eu quero anexar uma imagem ao meu relato, para que eu possa fornecer evidência visual.
- Como usuário em celular, eu quero enviar uma ocorrência de forma simples, para que eu consiga contribuir mesmo na rua.
- Como usuário, eu quero saber se meu envio foi concluído com sucesso, para que eu tenha confiança no processo.
- Como sistema, eu quero validar os dados antes do envio, para evitar ocorrências incompletas ou inválidas.
- Como moderador futuro, eu quero receber relatos padronizados, para que a análise e validação sejam consistentes.

## 3. Escopo e Limitações

O que a IA DEVE e NÃO DEVE fazer nesta iteração.

### In-Scope (Dentro do Escopo)

- Criar página pública de envio de ocorrência
- Criar formulário de cadastro de ocorrência
- Permitir preenchimento de título, descrição, categoria e severidade
- Permitir definição de localização por clique no mapa ou entrada controlada de coordenadas
- Permitir seleção de bairro
- Permitir preenchimento opcional de endereço e nome da rua
- Permitir envio de uma imagem
- Integrar com `POST /api/reports`
- Integrar com `POST /api/reports/[id]/images`
- Exibir estados de loading, sucesso e erro
- Aplicar validação no cliente antes do envio
- Tratar fluxo de criação e upload como etapas encadeadas
- Garantir responsividade da interface

### Out-of-Scope (Fora do Escopo - NÃO IMPLEMENTAR)

- Upload múltiplo avançado
- Detecção automática de localização por GPS do navegador como obrigatória
- OCR
- IA para classificar a imagem
- Sugestão automática de categoria
- Deduplicação automática
- Reputação do usuário
- Login social avançado
- Fluxo completo de autenticação visual refinado
- Rascunho automático de ocorrência
- Salvamento offline
- Notificações por e-mail
- Integração com prefeitura
- Moderação automática

## 4. Arquitetura e Stack Tecnológico

Defina as ferramentas exatas para a IA não inventar dependências.

- **Front-end:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Mapa:** Leaflet com React Leaflet
- **Back-end consumido:** API interna criada na Fase 2
- **Validação:** Zod
- **Storage:** Supabase Storage via endpoint da API
- **Base cartográfica:** OpenStreetMap
- **Hospedagem:** Vercel

## 5. Modelagem de Dados (Schema)

Se houver banco de dados, defina as tabelas e colunas exatas.

### Tabelas usadas diretamente nesta fase

- `reports`
- `report_images`
- `neighborhoods`

### Campos obrigatórios no fluxo de criação

#### Tabela: `reports`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| title | Text | Obrigatório |
| description | Text | Obrigatório |
| category | Text | Obrigatório |
| severity | Text | Obrigatório |
| latitude | Numeric(10,7) | Obrigatório |
| longitude | Numeric(10,7) | Obrigatório |
| address | Text | Opcional |
| street_name | Text | Opcional |
| neighborhood_id | UUID | Opcional, mas recomendado |
| is_anonymous | Boolean | Opcional, default false |

### Tabela de imagem

#### Tabela: `report_images`

| Coluna | Tipo | Restrições / Notas |
| --- | --- | --- |
| report_id | UUID | Obrigatório |
| image_url | Text | Gerado após upload |
| storage_path | Text | Gerado após upload |

### Categorias permitidas

- `pothole`
- `irregular_patch`
- `unpaved_road`
- `flooding`
- `construction`
- `poor_signage`

### Severidades permitidas

- `low`
- `medium`
- `high`
- `critical`

## 6. Contratos de API (Endpoints)

Como o Front-end e o Back-end vão se comunicar.

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

**Descrição:** Enviar imagem para ocorrência já criada

**Payload (Entrada):**

```json
{
  "file": "multipart/form-data"
}
```

**Resposta de Sucesso:**

```json
{
  "data": {
    "id": "uuid",
    "image_url": "https://...",
    "storage_path": "reports/uuid/image.webp"
  }
}
```

### `GET /api/neighborhoods`

**Descrição:** Buscar bairros para popular o seletor

**Payload (Entrada):**

```json
{}
```

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

- O formulário deve exigir `title`, `description`, `category`, `severity`, `latitude` e `longitude`
- O usuário não pode definir `status`
- Toda nova ocorrência criada deve entrar com `status = pending`
- O envio da imagem só pode ocorrer após a criação bem-sucedida da ocorrência
- Se a criação da ocorrência falhar, o upload da imagem não deve ser iniciado
- Se a ocorrência for criada com sucesso e o upload da imagem falhar, a ocorrência deve continuar existindo
- O sistema deve informar com clareza quando a ocorrência foi criada, mas a imagem não foi enviada
- A imagem deve ser opcional nesta fase, exceto se regra futura mudar
- O formulário deve validar enums de categoria e severidade antes de enviar
- A latitude e longitude devem estar dentro de intervalos válidos
- O usuário deve conseguir definir localização por interação com mapa
- O sistema deve permitir envio sem endereço textual, desde que coordenadas estejam válidas
- O front-end não deve inventar campos não previstos no contrato da API
- O fluxo deve ser simples e compreensível em desktop e mobile
- A interface deve reduzir fricção de contribuição sem comprometer qualidade mínima dos dados

## 8. Estrutura de Arquivos

Onde cada novo arquivo deve ser criado ou qual arquivo existente será modificado.

```text
/app
  /report/page.tsx

/components
  ReportForm.tsx
  ReportLocationPicker.tsx
  ReportImageUpload.tsx
  ReportSuccessState.tsx
  ReportErrorState.tsx
  ReportFormField.tsx

/lib
  api.ts
  validations.ts
  constants.ts
  formatters.ts

/types
  report.ts
  neighborhood.ts
  api.ts
```

### Descrição dos arquivos esperados

#### `/app/report/page.tsx`

- Página pública de envio
- Orquestra carregamento de bairros e exibição do formulário

#### `/components/ReportForm.tsx`

- Componente principal do formulário
- Controla estado do envio
- Chama criação da ocorrência e upload da imagem

#### `/components/ReportLocationPicker.tsx`

- Seleção de localização
- Pode usar mapa com clique para marcar ponto
- Deve refletir coordenadas escolhidas

#### `/components/ReportImageUpload.tsx`

- Input de imagem
- Prévia simples opcional
- Validação básica de tipo e tamanho

#### `/components/ReportSuccessState.tsx`

- Feedback visual de sucesso

#### `/components/ReportErrorState.tsx`

- Feedback visual de erro

#### `/components/ReportFormField.tsx`

- Campo reutilizável para padronizar label, erro e input

## 9. Restrições Técnicas

Regras estritas para a implementação.

- Não usar classes; utilizar apenas componentes funcionais
- Todo o código deve ser escrito em TypeScript
- Toda validação de formulário deve usar Zod
- Não criar upload direto ao Supabase no cliente sem passar pela API definida
- Não permitir que o front controle status
- Não criar múltiplas imagens nesta fase
- Não adicionar bibliotecas de formulário se não forem necessárias
- Não criar experiência complexa demais para o MVP
- Não depender de GPS como único método de localização
- Não bloquear o envio caso o endereço textual não exista
- Não expor mensagens de erro técnicas ao usuário final sem tratamento
- Não misturar lógica de mapa, upload e submissão em um único componente gigante
- Não implementar autenticação complexa visual nesta fase
- Não adicionar recursos fora do escopo da contribuição básica

## 10. Critérios de Aceitação

Condições objetivas para considerar a funcionalidade pronta.

- Existe uma página pública de envio de ocorrência
- O usuário consegue preencher título, descrição, categoria e severidade
- O usuário consegue selecionar localização válida
- O usuário consegue escolher bairro, quando disponível
- O usuário consegue informar endereço e nome da rua opcionalmente
- O usuário consegue anexar uma imagem válida
- O sistema valida os campos obrigatórios antes do envio
- O sistema cria a ocorrência com sucesso via `POST /api/reports`
- O sistema envia imagem via `POST /api/reports/[id]/images`
- O sistema informa sucesso completo quando ocorrência e imagem são enviados
- O sistema informa sucesso parcial quando ocorrência é criada e imagem falha
- O sistema informa erro quando a criação da ocorrência falha
- A interface funciona em desktop e mobile
- A fase fica pronta para ser conectada à moderação da Fase 5 sem retrabalho estrutural

## 11. Próxima Iteração Planejada

O que poderá ser feito depois, mas não agora.

- Construir painel administrativo de moderação
- Adicionar controle de acesso para moderadores
- Permitir alteração de status pela interface
- Exibir fila de ocorrências pendentes
- Registrar ações administrativas visualmente

## 12. Entregáveis Esperados da IA nesta Fase

O que a IA deve gerar quando receber esta spec.

- Página pública de envio de ocorrência
- Formulário completo com validação
- Componente de seleção de localização
- Componente de upload de imagem
- Fluxo encadeado de criação + upload
- Feedbacks de loading, sucesso, erro e sucesso parcial
- Estrutura modular e pronta para integração com Fase 5

## 13. Comportamento Esperado do Formulário

Detalhes para evitar ambiguidade na implementação.

### Campos mínimos obrigatórios

- Título
- Descrição
- Categoria
- Severidade
- Latitude
- Longitude

### Campos opcionais

- Endereço
- Nome da rua
- Bairro
- Imagem
- Envio anônimo, caso já esteja habilitado no produto

### UX esperada

- Labels claras
- Mensagens de erro abaixo do campo
- Botão de envio com estado desabilitado durante submissão
- Feedback claro ao final
- Layout simples e objetivo
- Em mobile, campos empilhados verticalmente

### Fluxo de submissão

- Validar dados no cliente
- Enviar `POST /api/reports`
- Receber `report_id`
- Se houver imagem, enviar `POST /api/reports/[id]/images`
- Exibir resultado final

## 14. Estados de Interface Obrigatórios

Para manter previsibilidade e boa UX.

### Loading

- Durante busca de bairros
- Durante submissão da ocorrência
- Durante upload da imagem

### Error

- Erro ao carregar bairros
- Erro ao criar ocorrência
- Erro ao enviar imagem
- Erro de validação de formulário

### Success

- Ocorrência criada com sucesso
- Ocorrência criada com sucesso e imagem enviada

### Partial Success

- Ocorrência criada com sucesso, mas imagem não enviada

## 15. Regras de Mensageria ao Usuário

Para evitar respostas confusas da interface.

### Sucesso completo

**Exemplo:**

- "Sua ocorrência foi enviada com sucesso."
- "A evidência visual também foi anexada."

### Sucesso parcial

**Exemplo:**

- "Sua ocorrência foi criada com sucesso, mas a imagem não pôde ser enviada."
- "Você poderá tentar anexar uma imagem depois, em iteração futura."

### Erro de submissão

**Exemplo:**

- "Não foi possível enviar sua ocorrência agora."
- "Revise os campos e tente novamente."

### Erro de imagem

**Exemplo:**

- "A imagem precisa estar em formato JPG, PNG ou WEBP."
- "A imagem excede o tamanho máximo permitido."

## 16. Regra de Ouro desta Fase

Antes de iniciar a Fase 5, o fluxo público de contribuição deve estar claro, funcional e confiável. Um cidadão comum deve conseguir registrar uma ocorrência com o mínimo de atrito e com feedback suficiente para confiar que sua contribuição entrou no sistema.
