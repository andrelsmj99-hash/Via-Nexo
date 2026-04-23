# Via Nexo — Fase 3: Mapa Público e Visualização

## Navegação

- [README da documentação](./README.md)
- [Visão geral e planejamento do MVP](./via-nexo-visao-geral.md)
- [Master Spec do MVP](./via-nexo-master-spec.md)
- [Fase anterior: Fase 2 — API e Regras de Negócio](./via-nexo-fase-2-api.md)
- [Próxima fase: Fase 4 — Envio de Ocorrências pela Comunidade](./via-nexo-fase-4-envio-ocorrencias.md)

---

## 1. Visão Geral

**Nome da Funcionalidade/Módulo:** Via Nexo — Fase 3: Mapa Público e Visualização  
**Objetivo Principal:** Construir a interface pública inicial do Via Nexo para que qualquer visitante consiga visualizar ocorrências urbanas em um mapa interativo, aplicar filtros, explorar detalhes e compreender rapidamente o estado dos relatos cadastrados. Esta fase deve transformar os dados da API em uma experiência clara, navegável e responsiva, sem depender ainda do fluxo de criação de ocorrências.

## 2. Histórias de Usuário (User Stories)

A IA usará isso para entender a intenção e testar se o objetivo foi cumprido.

- Como visitante, eu quero visualizar as ocorrências em um mapa, para que eu possa entender onde estão os principais problemas.
- Como visitante, eu quero filtrar ocorrências por categoria, status e bairro, para que eu possa analisar recortes específicos.
- Como visitante, eu quero abrir os detalhes de uma ocorrência, para que eu possa ver descrição, imagem e status.
- Como usuário em celular, eu quero navegar pelo mapa e pela lista de ocorrências com clareza, para que eu possa usar a plataforma sem dificuldade.
- Como pessoa interessada no projeto, eu quero entender rapidamente o propósito do Via Nexo na landing page, para que eu saiba para que serve a plataforma.

## 3. Escopo e Limitações

O que a IA DEVE e NÃO DEVE fazer nesta iteração.

### In-Scope (Dentro do Escopo)

- Criar landing page pública inicial do Via Nexo
- Criar página pública de mapa
- Consumir `GET /api/reports`
- Consumir `GET /api/reports/[id]`
- Consumir `GET /api/neighborhoods`
- Exibir ocorrências em mapa com marcadores
- Exibir lista ou cards de ocorrências
- Implementar filtros por categoria, status e bairro
- Implementar visualização de detalhes de ocorrência
- Tratar estados de loading, erro e vazio
- Garantir responsividade para desktop e mobile
- Padronizar marcadores e informações resumidas no mapa

### Out-of-Scope (Fora do Escopo - NÃO IMPLEMENTAR)

- Envio de nova ocorrência
- Upload de imagem pela interface
- Painel administrativo
- Sistema de login completo no front público
- Dashboard estatístico avançado
- Clusterização sofisticada de pontos
- Heatmap
- Comparação temporal
- Busca textual avançada
- Camadas geoespaciais complexas
- Moderação visual
- Gamificação
- Múltiplas cidades

## 4. Arquitetura e Stack Tecnológico

Defina as ferramentas exatas para a IA não inventar dependências.

- **Front-end:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Mapa:** Leaflet com React Leaflet
- **Back-end consumido:** API interna do Next.js definida na Fase 2
- **Validação local de dados:** Zod, quando necessário
- **Base cartográfica:** OpenStreetMap
- **Estilo e organização:** Componentes funcionais, arquitetura modular
- **Hospedagem:** Vercel

## 5. Modelagem de Dados (Schema)

Se houver banco de dados, defina as tabelas e colunas exatas.

### Dados consumidos nesta fase

**Origem principal:**

- `reports`
- `report_images`
- `report_confirmations`
- `neighborhoods`

### Estrutura esperada para listagem de ocorrência

**Objeto resumido consumido do endpoint `GET /api/reports`:**

| Campo | Tipo | Restrições / Notas |
| --- | --- | --- |
| id | UUID | Identificador da ocorrência |
| title | Text | Título resumido |
| description | Text | Descrição resumida ou completa |
| category | Text | Categoria padronizada |
| status | Text | Status atual |
| severity | Text | Severidade |
| latitude | Number | Coordenada obrigatória |
| longitude | Number | Coordenada obrigatória |
| address | Text | Opcional |
| street_name | Text | Opcional |
| neighborhood | Object | `{ id, name }` |
| image_url | Text | Opcional |
| confirmations_count | Number | Contagem de confirmações |
| created_at | Timestamp | Data de criação |
| updated_at | Timestamp | Data de atualização |

### Estrutura esperada para detalhe de ocorrência

**Objeto consumido do endpoint `GET /api/reports/[id]`:**

| Campo | Tipo | Restrições / Notas |
| --- | --- | --- |
| id | UUID | Identificador |
| title | Text | Obrigatório |
| description | Text | Obrigatório |
| category | Text | Obrigatório |
| status | Text | Obrigatório |
| severity | Text | Obrigatório |
| latitude | Number | Obrigatório |
| longitude | Number | Obrigatório |
| address | Text | Opcional |
| street_name | Text | Opcional |
| neighborhood | Object | `{ id, name }` |
| images | Array | Lista de imagens |
| confirmations_count | Number | Número de confirmações |
| created_at | Timestamp | Obrigatório |
| updated_at | Timestamp | Obrigatório |

## 6. Contratos de API (Endpoints)

Como o Front-end e o Back-end vão se comunicar.

### `GET /api/reports`

**Descrição:** Buscar lista de ocorrências públicas com filtros

**Query Params aceitos:**

- `category`
- `status`
- `severity`
- `neighborhood_id`
- `page`
- `limit`

**Payload (Entrada):**

```json
{}
```

**Exemplo de chamada com filtro:**

```json
{
  "category": "pothole",
  "status": "confirmed",
  "neighborhood_id": "uuid"
}
```

**Resposta de Sucesso:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Buraco grande em cruzamento",
      "description": "Buraco profundo próximo à esquina",
      "category": "pothole",
      "status": "confirmed",
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
      "updated_at": "2026-03-28T11:00:00Z"
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

**Descrição:** Buscar detalhes completos de uma ocorrência

**Payload (Entrada):**

```json
{}
```

**Resposta de Sucesso:**

```json
{
  "data": {
    "id": "uuid",
    "title": "Buraco grande em cruzamento",
    "description": "Buraco profundo próximo à esquina",
    "category": "pothole",
    "status": "confirmed",
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

### `GET /api/neighborhoods`

**Descrição:** Buscar lista de bairros para popular filtro

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
    },
    {
      "id": "uuid",
      "name": "Japuí"
    }
  ]
}
```

## 7. Regras de Negócio

A lógica que deve ser seguida pela implementação.

- O mapa público deve exibir apenas ocorrências retornadas pela API pública
- O front-end não deve tentar inferir dados que não existam no contrato da API
- Filtros aplicados na interface devem refletir diretamente parâmetros do endpoint
- A listagem e o mapa devem permanecer consistentes entre si
- A ocorrência selecionada no mapa deve poder abrir visualização detalhada
- O sistema deve tratar ausência de imagem sem quebrar layout
- O sistema deve tratar ausência de bairro ou endereço sem quebrar layout
- Estados de carregamento devem ser explícitos
- Estados de erro devem ser legíveis e amigáveis
- Estado vazio deve informar que não há ocorrências para os filtros aplicados
- O mapa não deve depender de autenticação para leitura pública
- A landing page deve comunicar claramente a proposta do Via Nexo
- A página pública deve priorizar clareza e confiança, não excesso de elementos visuais
- Em telas pequenas, a navegação deve continuar funcional mesmo com espaço reduzido
- O detalhe da ocorrência deve ser suficiente para consulta pública sem exigir painel administrativo

## 8. Estrutura de Arquivos

Onde cada novo arquivo deve ser criado ou qual arquivo existente será modificado.

```text
/app
  /page.tsx
  /map/page.tsx
  /reports/[id]/page.tsx

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

/lib
  api.ts
  constants.ts
  formatters.ts

/types
  report.ts
  neighborhood.ts
  api.ts
```

### Descrição dos arquivos esperados

#### `/app/page.tsx`

- Landing page pública do Via Nexo
- Explica propósito do projeto
- Direciona para a página do mapa

#### `/app/map/page.tsx`

- Página principal de visualização pública das ocorrências
- Orquestra filtros, mapa e lista

#### `/app/reports/[id]/page.tsx`

- Página pública de detalhe da ocorrência
- Consome `GET /api/reports/[id]`

#### `/components/MapView.tsx`

- Renderiza mapa com marcadores
- Recebe lista de ocorrências
- Controla foco em ocorrência selecionada

#### `/components/MapMarkerPopup.tsx`

- Popup resumido de cada marcador

#### `/components/FilterBar.tsx`

- Filtros por categoria, status e bairro

#### `/components/ReportCard.tsx`

- Card resumido de uma ocorrência

#### `/components/ReportList.tsx`

- Lista de cards ao lado ou abaixo do mapa

#### `/components/ReportDetails.tsx`

- Exibe detalhe completo da ocorrência

#### `/components/LandingHero.tsx`

- Bloco principal da landing

#### `/components/LandingSection.tsx`

- Seções explicativas institucionais

#### `/components/EmptyState.tsx`

- Estado vazio padronizado

#### `/components/ErrorState.tsx`

- Estado de erro padronizado

#### `/components/LoadingState.tsx`

- Estado de carregamento padronizado

## 9. Restrições Técnicas

Regras estritas para a implementação.

- Não usar classes; utilizar apenas componentes funcionais
- Todo o código deve ser escrito em TypeScript
- O mapa deve usar Leaflet com React Leaflet
- Não adicionar bibliotecas de mapa fora da stack definida
- Não implementar criação de ocorrência nesta fase
- Não implementar ações administrativas nesta fase
- Não duplicar regras de filtros fora da estrutura definida
- Não depender de dados mockados como base principal
- Não usar dados estáticos no lugar da API real, exceto fallback temporário local durante desenvolvimento
- Não criar componentes gigantes; separar responsabilidades
- Não acoplar lógica de fetch diretamente em muitos componentes pequenos sem necessidade
- Não expor dados sensíveis do usuário autor
- Não implementar visual excessivamente complexo antes da funcionalidade central estar pronta
- A interface deve ser responsiva
- A interface deve funcionar com dados ausentes de imagem e endereço

## 10. Critérios de Aceitação

Condições objetivas para considerar a funcionalidade pronta.

- A landing page do Via Nexo está funcional
- Existe uma página pública de mapa
- O mapa exibe as ocorrências retornadas pela API
- Os marcadores podem ser clicados
- O popup do marcador exibe resumo útil
- Existe lista visual de ocorrências associada ao mapa
- O usuário consegue filtrar por categoria
- O usuário consegue filtrar por status
- O usuário consegue filtrar por bairro
- O estado vazio é exibido corretamente quando não há resultados
- O estado de erro é exibido corretamente em falha de carregamento
- O estado de loading é exibido durante carregamento
- A página de detalhe da ocorrência funciona
- O layout funciona em desktop e mobile
- O front está pronto para coexistir com a Fase 4 sem retrabalho estrutural

## 11. Próxima Iteração Planejada

O que poderá ser feito depois, mas não agora.

- Construir formulário público de nova ocorrência
- Permitir seleção de localização pelo mapa
- Permitir envio de imagem pela interface
- Criar fluxo público de contribuição

## 12. Entregáveis Esperados da IA nesta Fase

O que a IA deve gerar quando receber esta spec.

- Página inicial pública do projeto
- Página de mapa funcional
- Página de detalhe de ocorrência
- Componentes reutilizáveis de mapa, filtros, cards e estados
- Integração com endpoints da Fase 2
- Experiência responsiva básica e consistente
- Estrutura modular pronta para receber Fase 4

## 13. Comportamento Esperado da Interface

Detalhes para evitar ambiguidade na execução.

### Landing page

**Deve conter:**

- nome Via Nexo
- frase curta explicando o propósito
- botão principal para acessar o mapa
- seção explicando como o projeto funciona
- seção explicando que o mapa é colaborativo
- chamada para futura participação da comunidade

### Página de mapa

**Deve conter:**

- cabeçalho simples
- barra de filtros
- mapa principal
- lista de ocorrências
- feedback visual de carregamento
- mensagem de vazio quando não houver resultados

### Detalhe da ocorrência

**Deve conter:**

- título
- categoria
- status
- severidade
- descrição
- endereço ou rua, quando disponível
- bairro, quando disponível
- imagens, quando disponíveis
- número de confirmações
- data de criação e atualização

## 14. Estados de Interface Obrigatórios

Para manter previsibilidade e boa UX.

### Loading

- Deve aparecer ao carregar mapa/lista
- Deve aparecer ao carregar detalhe da ocorrência

### Empty

- Deve informar claramente que não há ocorrências com os filtros aplicados

### Error

- Deve informar falha ao buscar dados
- Deve permitir tentativa de recarregar, se aplicável

### Sem imagem

- Deve exibir placeholder simples ou bloco neutro

### Sem endereço

- Deve exibir texto alternativo como `Endereço não informado`

## 15. Organização Visual Recomendada

Guia para a IA não criar algo aleatório.

### Desktop

- mapa ocupando área principal
- lista lateral ou abaixo do mapa
- filtros no topo

### Mobile

- filtros no topo
- mapa com altura adaptada
- lista abaixo do mapa
- cards empilhados verticalmente

### Estilo

- visual limpo
- foco em legibilidade
- hierarquia clara de informação
- sem excesso de cores
- status e severidade devem ser compreensíveis visualmente

## 16. Regra de Ouro desta Fase

Antes de iniciar a Fase 4, a visualização pública deve estar estável, clara e conectada à API real. O usuário precisa conseguir entender o valor do Via Nexo apenas navegando pela landing page, pelo mapa e pelos detalhes de uma ocorrência.
