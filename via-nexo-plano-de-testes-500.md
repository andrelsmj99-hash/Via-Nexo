# Via Nexo — Plano de Testes com 500 Casos

## 1. Objetivo

Este documento consolida o plano mínimo de QA do Via Nexo com 500 testes formulados a partir da documentação oficial do projeto.

Base documental considerada:
- `README.md`
- `via-nexo-visao-geral.md`
- `via-nexo-master-spec.md`
- `via-nexo-fase-1-banco.md`
- `via-nexo-fase-2-api.md`
- `via-nexo-fase-3-mapa-publico.md`
- `via-nexo-fase-4-envio-ocorrencias.md`
- `via-nexo-fase-5-moderacao.md`

## 2. Escopo

O plano cobre:
- documentação e consistência estrutural
- domínio, enums e constantes
- banco, migration e integridade
- tipos TypeScript e alinhamento com schema
- API pública
- criação de ocorrência e upload
- confirmação comunitária
- API administrativa e autorização
- front público: mapa, filtros, lista, detalhe
- fluxo de envio comunitário
- painel de moderação
- regressão entre fases
- segurança, UX, contratos, bordas e integridade do MVP

## 3. Matriz de Cobertura

| Área | Cobertura necessária | Tipo principal |
|---|---|---|
| Governança documental | source of truth, ordem das fases, links, coerência entre specs | documental / regressão |
| Domínio e enums | roles, categories, status, severity, actions | unitário / documental |
| Banco e migration | tabelas, constraints, FKs, defaults, índices, bucket | integração / schema |
| Tipos e constantes | alinhamento entre TS, schema e spec | unitário / regressão |
| API pública | listagem, detalhe, bairros, filtros, erros | contrato / integração |
| API administrativa | listagem admin, detalhe admin, patch de status, logs | contrato / integração |
| Auth e autorização | autenticação, roles, bloqueios, acesso negado | integração / segurança |
| Upload e storage | MIME, limite, bucket privado, persistência | integração |
| Fluxo comunitário | criação + upload + sucesso parcial | E2E / integração |
| Mapa público | mapa, filtros, popup, cards, detalhe, estados | componente / E2E |
| Moderação | fila, filtros, detalhe, status, feedback | E2E / integração |
| UX e estados | loading, empty, error, success, partial success, access denied | componente / E2E |
| Regressão entre fases | uma fase não invadir escopo da outra | documental / regressão |

## 4. Testes

### Documentação e consistência estrutural

1. Verificar que `README.md` define `via-nexo-master-spec.md` como source of truth.  
2. Verificar que `README.md` contém a ordem de leitura completa.  
3. Verificar que `README.md` contém a ordem de implementação da Fase 1 à Fase 5.  
4. Verificar que `README.md` contém a regra “atualizar spec antes do código”.  
5. Verificar que `via-nexo-visao-geral.md` referencia corretamente as fases 1 a 5.  
6. Verificar que `via-nexo-master-spec.md` referencia corretamente as fases 1 a 5.  
7. Verificar que os nomes reais dos arquivos usados na navegação existem no repositório.  
8. Verificar que a documentação não depende mais da pasta `/specs` como estrutura principal.  
9. Verificar que a ordem oficial de execução é 1 → 2 → 3 → 4 → 5.  
10. Verificar que a construção por fases aparece na visão geral e no master spec.  
11. Verificar que a Fase 1 antecede qualquer API completa.  
12. Verificar que a Fase 2 antecede qualquer interface pública funcional.  
13. Verificar que a Fase 3 antecede o envio comunitário.  
14. Verificar que a Fase 4 antecede a moderação visual.  
15. Verificar que a Fase 5 fecha o MVP funcional.  

### Domínio, enums e constantes

16. Verificar que roles aceitos são apenas `citizen`, `moderator`, `admin`.  
17. Verificar que categories aceitas são apenas `pothole`, `irregular_patch`, `unpaved_road`, `flooding`, `construction`, `poor_signage`.  
18. Verificar que statuses aceitos são apenas `pending`, `under_review`, `confirmed`, `resolved`, `archived`.  
19. Verificar que severities aceitas são apenas `low`, `medium`, `high`, `critical`.  
20. Verificar que ações administrativas aceitas são apenas `approve`, `reject`, `resolve`, `archive`, `reopen`.  
21. Verificar que `constants.ts` centraliza esses enums.  
22. Verificar que valores fora dos enums são rejeitados.  
23. Verificar que o papel padrão do usuário é `citizen`.  
24. Verificar que o status padrão da ocorrência é `pending`.  
25. Verificar que o bucket oficial é `report-images`.  
26. Verificar que tipos MIME aceitos são apenas JPG, PNG e WEBP.  
27. Verificar que o limite de imagem é 5 MB.  
28. Verificar que os tipos TypeScript usam os enums centrais.  
29. Verificar que não existem enums divergentes entre documentação e código.  
30. Verificar que `ReportInsert` não aceita `status` como obrigatório.  

### Banco, migration e integridade

31. Verificar criação da tabela `users`.  
32. Verificar criação da tabela `neighborhoods`.  
33. Verificar criação da tabela `reports`.  
34. Verificar criação da tabela `report_images`.  
35. Verificar criação da tabela `report_confirmations`.  
36. Verificar criação da tabela `moderation_logs`.  
37. Verificar que todas as PKs são UUID.  
38. Verificar FK `reports.user_id -> users.id`.  
39. Verificar FK `reports.neighborhood_id -> neighborhoods.id`.  
40. Verificar FK `report_images.report_id -> reports.id`.  
41. Verificar FK `report_confirmations.report_id -> reports.id`.  
42. Verificar FK `report_confirmations.user_id -> users.id`.  
43. Verificar FK `moderation_logs.report_id -> reports.id`.  
44. Verificar FK `moderation_logs.moderator_id -> users.id`.  
45. Verificar `unique(name, city)` em `neighborhoods`.  
46. Verificar `unique(report_id, user_id)` em `report_confirmations`.  
47. Verificar `reports.status default 'pending'`.  
48. Verificar `reports.is_anonymous default false`.  
49. Verificar `latitude numeric(10,7)`.  
50. Verificar `longitude numeric(10,7)`.  
51. Verificar check de latitude entre -90 e 90.  
52. Verificar check de longitude entre -180 e 180.  
53. Verificar atualização automática de `updated_at` em `reports`.  
54. Verificar índice em `reports.status`.  
55. Verificar índice em `reports.category`.  
56. Verificar índice em `reports.neighborhood_id`.  
57. Verificar índice em `reports.created_at`.  
58. Verificar índice em `report_images.report_id`.  
59. Verificar índice em `report_confirmations.report_id`.  
60. Verificar índice em `moderation_logs.report_id`.  
61. Verificar criação do bucket `report-images`.  
62. Verificar que o bucket não é público.  
63. Verificar que a migration não cria tabelas fora do domínio definido.  
64. Verificar que `reports.user_id` pode ser nulo.  
65. Verificar que `reports.neighborhood_id` pode ser nulo.  

### Tipos e alinhamento com schema

66. Verificar que `types/user.ts` representa `id`, `name`, `email`, `role`, `created_at`.  
67. Verificar que `types/neighborhood.ts` representa `id`, `name`, `city`, `created_at`.  
68. Verificar que `types/report.ts` representa todos os campos de `reports`.  
69. Verificar que `types/report.ts` inclui `ReportImage`.  
70. Verificar que `types/report.ts` inclui `ReportConfirmation`.  
71. Verificar que `types/moderation.ts` representa `ModerationLog`.  
72. Verificar que `ModerationLogInsert` exige `report_id`, `moderator_id`, `action`.  
73. Verificar que os tipos aceitam nulos apenas nos campos documentados como opcionais.  
74. Verificar que os tipos não incluem campos ausentes da spec.  
75. Verificar que `ReportInsert` permite `address` opcional.  
76. Verificar que `ReportInsert` permite `street_name` opcional.  
77. Verificar que `ReportInsert` permite `neighborhood_id` opcional.  
78. Verificar que `ReportInsert` permite `is_anonymous` opcional.  
79. Verificar que `UserInsert` assume role padrão se não enviada.  
80. Verificar alinhamento entre tipos e migration.  

### API pública

81. `GET /api/reports` sem filtros retorna sucesso com `data[]` e `meta`.  
82. `GET /api/reports` ordena por `created_at desc`.  
83. `GET /api/reports` não retorna ocorrências arquivadas.  
84. `GET /api/reports` aceita filtro por `category`.  
85. `GET /api/reports` aceita filtro por `status`.  
86. `GET /api/reports` aceita filtro por `severity`.  
87. `GET /api/reports` aceita filtro por `neighborhood_id`.  
88. `GET /api/reports` aceita `page`.  
89. `GET /api/reports` aceita `limit`.  
90. `GET /api/reports` retorna `confirmations_count`.  
91. `GET /api/reports` retorna `image_url` principal quando existir.  
92. `GET /api/reports` com query inválida retorna `VALIDATION_ERROR`.  
93. `GET /api/reports/[id]` com id existente retorna detalhe completo.  
94. `GET /api/reports/[id]` retorna `images[]`.  
95. `GET /api/reports/[id]` retorna `confirmations_count`.  
96. `GET /api/reports/[id]` não expõe ocorrência arquivada.  
97. `GET /api/reports/[id]` com id inexistente retorna `NOT_FOUND`.  
98. `GET /api/neighborhoods` retorna bairros em ordem alfabética.  
99. `GET /api/neighborhoods` expõe apenas `id` e `name`.  
100. `GET /api/reports` não quebra quando `address` estiver ausente.  
101. `GET /api/reports` não quebra quando `image_url` estiver ausente.  
102. `GET /api/reports/[id]` não quebra quando `images` vier vazio.  
103. `GET /api/reports/[id]` não expõe identidade do autor publicamente.  
104. `GET /api/reports` não expõe `email` ou `role` do autor.  
105. `GET /api/reports` mantém consistência entre filtros e paginação.  

### Criação de ocorrência e upload

106. `POST /api/reports` com payload válido cria ocorrência.  
107. `POST /api/reports` força `status = pending`.  
108. `POST /api/reports` ignora ou rejeita `status` enviado pelo cliente.  
109. `POST /api/reports` exige `title`.  
110. `POST /api/reports` exige `description`.  
111. `POST /api/reports` exige `category`.  
112. `POST /api/reports` exige `severity`.  
113. `POST /api/reports` exige `latitude`.  
114. `POST /api/reports` exige `longitude`.  
115. `POST /api/reports` rejeita `category` inválida.  
116. `POST /api/reports` rejeita `severity` inválida.  
117. `POST /api/reports` rejeita latitude fora do intervalo.  
118. `POST /api/reports` rejeita longitude fora do intervalo.  
119. `POST /api/reports` permite criação sem endereço textual.  
120. `POST /api/reports` permite criação sem bairro.  
121. `POST /api/reports` aceita envio anônimo controlado.  
122. `POST /api/reports/[id]/images` exige ocorrência existente.  
123. `POST /api/reports/[id]/images` aceita `image/jpeg`.  
124. `POST /api/reports/[id]/images` aceita `image/png`.  
125. `POST /api/reports/[id]/images` aceita `image/webp`.  
126. `POST /api/reports/[id]/images` rejeita MIME inválido.  
127. `POST /api/reports/[id]/images` rejeita arquivo acima de 5 MB.  
128. `POST /api/reports/[id]/images` salva no bucket privado correto.  
129. `POST /api/reports/[id]/images` cria registro em `report_images`.  
130. Falha no upload não remove ocorrência já criada.  

### Confirmação comunitária

131. `POST /api/reports/[id]/confirm` exige autenticação.  
132. `POST /api/reports/[id]/confirm` cria confirmação válida para usuário autenticado.  
133. `POST /api/reports/[id]/confirm` incrementa `confirmations_count`.  
134. `POST /api/reports/[id]/confirm` impede confirmação duplicada.  
135. `POST /api/reports/[id]/confirm` retorna `CONFLICT` em duplicidade.  
136. `POST /api/reports/[id]/confirm` não permite confirmação em arquivada.  
137. `POST /api/reports/[id]/confirm` retorna `NOT_FOUND` se não existir.  
138. Usuários diferentes podem confirmar a mesma ocorrência uma vez cada.  
139. A confirmação não altera o status automaticamente.  
140. A confirmação não cria log administrativo.  

### API administrativa e autorização

141. `GET /api/admin/reports` exige autenticação.  
142. `GET /api/admin/reports` bloqueia `citizen`.  
143. `GET /api/admin/reports` permite `moderator`.  
144. `GET /api/admin/reports` permite `admin`.  
145. `GET /api/admin/reports` pode retornar arquivadas.  
146. `GET /api/admin/reports` aceita filtros por status.  
147. `GET /api/admin/reports` aceita filtros por category.  
148. `GET /api/admin/reports` aceita filtros por severity.  
149. `GET /api/admin/reports` aceita filtros por neighborhood_id.  
150. `GET /api/admin/reports` aceita paginação.  
151. `GET /api/admin/reports/[id]` exige autenticação.  
152. `GET /api/admin/reports/[id]` bloqueia `citizen`.  
153. `GET /api/admin/reports/[id]` permite ver arquivada.  
154. `GET /api/admin/reports/[id]` retorna imagens e contexto de moderação.  
155. `PATCH /api/reports/[id]/status` exige autenticação.  
156. `PATCH /api/reports/[id]/status` bloqueia `citizen`.  
157. `PATCH /api/reports/[id]/status` permite `moderator`.  
158. `PATCH /api/reports/[id]/status` permite `admin`.  
159. `PATCH /api/reports/[id]/status` rejeita status inválido.  
160. `PATCH /api/reports/[id]/status` atualiza `updated_at`.  
161. `PATCH /api/reports/[id]/status` cria `moderation_logs`.  
162. `PATCH /api/reports/[id]/status` persiste `notes` quando enviadas.  
163. `PATCH /api/reports/[id]/status` funciona sem `notes`.  
164. `PATCH /api/reports/[id]/status` retorna erro estruturado em permissão insuficiente.  
165. `PATCH /api/reports/[id]/status` não permite ação em id inexistente.  
166. `PATCH /api/reports/[id]/status` não permite role implícita sem registro em `public.users`.  
167. `GET /api/admin/reports` não vaza dados desnecessários fora do escopo da moderação.  
168. `GET /api/admin/reports/[id]` exibe contexto suficiente para revisão.  
169. O mapeamento entre status novo e `action` de log é semanticamente coerente.  
170. A rota administrativa mantém resposta consistente para futuro painel.  

### Front público — mapa e visualização

171. Landing page renderiza nome Via Nexo.  
172. Landing page renderiza explicação curta do propósito.  
173. Landing page renderiza CTA para mapa.  
174. Página `/map` carrega sem autenticação.  
175. `MapView` renderiza marcadores com base em `GET /api/reports`.  
176. Clique em marcador abre popup.  
177. Popup mostra resumo útil da ocorrência.  
178. `FilterBar` altera filtro por categoria.  
179. `FilterBar` altera filtro por status.  
180. `FilterBar` altera filtro por bairro.  
181. Lista visual permanece consistente com os filtros do mapa.  
182. Estado `loading` aparece durante carregamento.  
183. Estado `error` aparece em falha de API.  
184. Estado `empty` aparece sem resultados.  
185. Card não quebra sem imagem.  
186. Card não quebra sem endereço.  
187. Página de detalhe renderiza título.  
188. Página de detalhe renderiza descrição.  
189. Página de detalhe renderiza categoria, status e severidade.  
190. Página de detalhe renderiza confirmações.  
191. Página de detalhe renderiza imagens quando existirem.  
192. Página de detalhe exibe fallback sem imagem.  
193. Em mobile, mapa e lista continuam utilizáveis.  
194. Em desktop, mapa e lista mantêm hierarquia clara.  
195. A interface pública não mostra controles administrativos.  

### Fluxo de envio comunitário

196. Página `/report` carrega formulário.  
197. Página `/report` carrega bairros.  
198. Formulário bloqueia envio sem título.  
199. Formulário bloqueia envio sem descrição.  
200. Formulário bloqueia envio sem categoria.  
201. Formulário bloqueia envio sem severidade.  
202. Formulário bloqueia envio sem coordenadas válidas.  
203. `ReportLocationPicker` atualiza latitude/longitude ao clicar no mapa.  
204. Entrada manual de coordenadas atualiza o estado do formulário.  
205. Seleção de bairro é opcional.  
206. Endereço é opcional.  
207. Nome da rua é opcional.  
208. Upload de imagem é opcional.  
209. Fluxo envia primeiro `POST /api/reports`.  
210. Com `report_id` e imagem presente, chama `POST /api/reports/[id]/images`.  
211. Sem imagem, encerra com sucesso apenas na criação.  
212. Se criação falhar, upload não inicia.  
213. Se criação funcionar e upload falhar, UI mostra sucesso parcial.  
214. Estado de loading aparece durante submissão.  
215. Estado de success aparece em criação bem-sucedida.  
216. Estado de partial success aparece em falha de upload após criação.  
217. Estado de error aparece em falha de criação.  
218. Em mobile, o formulário continua utilizável.  
219. Mensagem de erro de imagem inválida é compreensível.  
220. Mensagem de erro de arquivo acima de 5 MB é compreensível.  

### Painel de moderação

221. Página `/admin` bloqueia usuário não autenticado.  
222. Página `/admin` mostra `AccessDeniedState` para role insuficiente.  
223. Página `/admin` exibe fila administrativa para `moderator/admin`.  
224. `AdminReportFilters` filtra por status.  
225. `AdminReportFilters` filtra por categoria.  
226. `AdminReportFilters` filtra por severidade.  
227. `AdminReportFilters` filtra por bairro.  
228. `AdminReportDetails` exibe contexto suficiente.  
229. `AdminStatusActionForm` oferece apenas statuses válidos.  
230. Envio do formulário administrativo chama `PATCH /api/reports/[id]/status`.  
231. UI mostra feedback de sucesso após atualização.  
232. UI mostra feedback de erro em falha.  
233. UI mostra loading durante atualização.  
234. UI mostra empty state quando não houver ocorrências.  
235. Painel continua funcional em telas menores.  
236. Painel não exibe controles para usuários comuns.  
237. Painel exibe imagem quando existir.  
238. Painel exibe fallback quando não houver imagem.  
239. Painel exibe datas de criação e atualização.  
240. Painel reflete novo status após atualização.  

### Regressão entre fases e proteção de escopo

241. Fase 1 não implementa UI pública.  
242. Fase 1 não implementa endpoints completos.  
243. Fase 2 não implementa páginas visuais.  
244. Fase 2 não implementa componentes React do mapa.  
245. Fase 3 não implementa criação de ocorrência.  
246. Fase 3 não implementa painel administrativo.  
247. Fase 4 não implementa analytics avançados.  
248. Fase 4 não implementa moderação administrativa.  
249. Fase 5 não implementa workflow multinível.  
250. Fase 5 não implementa exclusão física de ocorrência.  

### Testes documentais de critérios de aceitação

251. Verificar que cada fase possui seção de critérios de aceitação.  
252. Verificar que cada fase possui seção de escopo.  
253. Verificar que cada fase possui seção de out-of-scope.  
254. Verificar que cada fase possui seção de arquitetura e stack.  
255. Verificar que cada fase possui seção de regras de negócio.  
256. Verificar que cada fase possui seção de estrutura de arquivos.  
257. Verificar que cada fase possui seção de restrições técnicas.  
258. Verificar que cada fase possui seção de entregáveis esperados.  
259. Verificar que cada fase possui “regra de ouro”.  
260. Verificar que cada fase aponta para a anterior e/ou próxima na navegação.  

### Testes de links e navegação documental

261. Link do README para master spec funciona.  
262. Link do README para visão geral funciona.  
263. Link do README para fase 1 funciona.  
264. Link do README para fase 2 funciona.  
265. Link do README para fase 3 funciona.  
266. Link do README para fase 4 funciona.  
267. Link do README para fase 5 funciona.  
268. Navegação da visão geral para fase 1 funciona.  
269. Navegação da visão geral para fase 2 funciona.  
270. Navegação da visão geral para fase 3 funciona.  
271. Navegação da visão geral para fase 4 funciona.  
272. Navegação da visão geral para fase 5 funciona.  
273. Navegação do master spec para fase 1 funciona.  
274. Navegação do master spec para fase 2 funciona.  
275. Navegação do master spec para fase 3 funciona.  
276. Navegação do master spec para fase 4 funciona.  
277. Navegação do master spec para fase 5 funciona.  
278. Navegação entre fases adjacentes funciona.  
279. Não há links quebrados para nomes antigos de arquivos.  
280. Não há referências residuais obrigatórias à pasta `/specs`.  

### Testes de segurança e exposição de dados

281. API pública não expõe e-mail de usuário.  
282. API pública não expõe role do usuário.  
283. API pública não expõe `user_id` de forma indevida quando `is_anonymous = true`.  
284. Painel administrativo exige autenticação antes de exibir dados.  
285. Bucket privado não pode ser tratado como público pelo front.  
286. Upload não usa `service_role` no cliente.  
287. `service_role` não é exposta em código cliente.  
288. Operações administrativas são restritas ao servidor confiável.  
289. A leitura pública de imagens não assume acesso irrestrito ao bucket.  
290. A estratégia futura de signed URL ou mediação por servidor permanece possível.  

### Testes de UX e mensagens

291. Mensagem de sucesso completo no envio é clara.  
292. Mensagem de sucesso parcial no envio é clara.  
293. Mensagem de erro de submissão é clara.  
294. Mensagem de erro de imagem é clara.  
295. Mensagem de acesso negado ao painel é clara.  
296. Mensagem de erro operacional do painel é clara.  
297. Mensagem de sucesso de atualização de status é clara.  
298. Estado vazio do mapa é compreensível.  
299. Estado vazio do painel é compreensível.  
300. Estados de loading não deixam o usuário sem feedback.  

### Testes de integração entre áreas

301. Ocorrência criada na Fase 4 aparece depois na listagem pública.  
302. Ocorrência criada com status `pending` aparece adequadamente na fila administrativa.  
303. Ocorrência atualizada para `confirmed` muda na API pública.  
304. Ocorrência atualizada para `archived` some da API pública.  
305. Ocorrência `archived` continua acessível na API administrativa.  
306. Imagem anexada aparece no detalhe da ocorrência.  
307. Confirmação comunitária atualiza o contador no detalhe.  
308. Confirmação comunitária atualiza o contador na listagem.  
309. Alteração de status gera log e permanece consistente no painel.  
310. Bairro selecionado no envio pode ser usado nos filtros depois.  

### Testes de compatibilidade com a “decisão pendente”

311. Sistema funciona sem trigger automática entre `auth.users` e `public.users`.  
312. A documentação não afirma que essa sincronização já existe.  
313. Rotas que dependem de role falham com segurança se `public.users` não estiver provisionado.  
314. Fase 1 não cria automação oculta de sincronização.  
315. A existência da decisão pendente não impede criação de ocorrência pública.  

### Testes de erros estruturados

316. Erros de validação usam `VALIDATION_ERROR`.  
317. Erros de autenticação usam `UNAUTHORIZED`.  
318. Erros de autorização usam `FORBIDDEN`.  
319. Itens não encontrados usam `NOT_FOUND`.  
320. Duplicidade de confirmação usa `CONFLICT`.  
321. Falha de upload usa `UPLOAD_ERROR`.  
322. Erro inesperado usa `INTERNAL_ERROR`.  
323. Todo erro retorna objeto `error.code`.  
324. Todo erro retorna objeto `error.message`.  
325. Erros de validação retornam `details` quando aplicável.  

### Testes de contratos de resposta

326. Toda resposta de sucesso segue `{ "data": ... }`.  
327. Listagem pública inclui `meta.page`.  
328. Listagem pública inclui `meta.limit`.  
329. Listagem pública inclui `meta.total`.  
330. Listagem admin inclui metadados compatíveis.  
331. Detalhe público não retorna `meta` indevida.  
332. Detalhe admin não retorna formato divergente do padrão.  
333. `POST /api/reports` retorna `id`, `status`, `created_at`.  
334. `POST /api/reports/[id]/images` retorna `id`, `image_url`, `storage_path`.  
335. `PATCH /api/reports/[id]/status` retorna `id`, `status`, `updated_at`.  

### Testes de estados faltantes e bordas

336. Sistema lida com ocorrência sem bairro.  
337. Sistema lida com ocorrência sem endereço.  
338. Sistema lida com ocorrência sem rua.  
339. Sistema lida com ocorrência sem imagem.  
340. Sistema lida com ocorrência sem confirmações.  
341. Sistema lida com fila administrativa vazia.  
342. Sistema lida com bairro inexistente em filtro sem quebrar.  
343. Sistema lida com paginação além da última página.  
344. Sistema lida com arquivo de imagem corrompido.  
345. Sistema lida com atualização de status para o mesmo valor atual.  

### Testes de componentes administrativos

346. `AdminReportTable` renderiza colunas principais.  
347. `AdminReportTable` mostra status atual visualmente.  
348. `AdminReportFilters` mantém estado após interação.  
349. `AdminReportDetails` atualiza quando outra ocorrência é selecionada.  
350. `AdminStatusActionForm` bloqueia submit sem status válido.  
351. `AdminStatusActionForm` aceita nota opcional vazia.  
352. `AdminLoadingState` aparece no painel.  
353. `AdminErrorState` aparece no painel.  
354. `AdminEmptyState` aparece no painel.  
355. `AccessDeniedState` aparece para role insuficiente.  

### Testes de componentes públicos

356. `LandingHero` renderiza título e CTA.  
357. `LandingSection` renderiza seções explicativas.  
358. `MapMarkerPopup` exibe resumo da ocorrência.  
359. `ReportCard` exibe informações essenciais.  
360. `ReportList` renderiza múltiplos cards.  
361. `ReportDetails` exibe detalhe completo.  
362. `LoadingState` é reutilizável.  
363. `ErrorState` é reutilizável.  
364. `EmptyState` é reutilizável.  
365. `FilterBar` reflete opções vindas da spec.  

### Testes de componentes do envio

366. `ReportForm` controla estado de submissão corretamente.  
367. `ReportFormField` exibe label, input e erro.  
368. `ReportLocationPicker` permite selecionar ponto.  
369. `ReportImageUpload` aceita arquivo válido.  
370. `ReportImageUpload` rejeita arquivo inválido.  
371. `ReportSuccessState` renderiza sucesso completo.  
372. `ReportErrorState` renderiza erro amigável.  
373. `ReportForm` exibe erro por campo inválido.  
374. `ReportForm` desabilita botão durante submissão.  
375. `ReportForm` limpa ou mantém estado conforme UX definida após sucesso.  

### Testes de persistência e rastreabilidade

376. Criação de ocorrência persiste `created_at`.  
377. Atualização de status persiste `updated_at`.  
378. Upload persiste `storage_path`.  
379. Upload persiste `image_url`.  
380. Confirmação persiste `created_at`.  
381. Log de moderação persiste `created_at`.  
382. Log de moderação persiste `moderator_id`.  
383. Log de moderação persiste `report_id`.  
384. Log de moderação persiste `notes` quando enviadas.  
385. Log de moderação persiste `action` coerente.  

### Testes de regressão de documentação vs implementação

386. Nenhum endpoint implementado fora da Fase 2 aparece como requisito obrigatório antes da fase correta.  
387. Nenhuma UI administrativa é exigida antes da Fase 5.  
388. Nenhum formulário público é exigido antes da Fase 4.  
389. Nenhuma visualização pública depende de comportamento administrativo.  
390. A Fase 3 consome apenas endpoints já definidos na Fase 2.  
391. A Fase 4 consome apenas endpoints já definidos na Fase 2.  
392. A Fase 5 consome apenas endpoints já definidos na Fase 2.  
393. A Fase 1 não depende de UI.  
394. A Fase 2 não depende de componentes visuais.  
395. O master spec continua coerente com as fases individuais.  

### Testes de prioridade operacional do MVP

396. Usuário consegue entender valor do produto só pela landing e mapa.  
397. Usuário consegue consultar detalhe da ocorrência sem login.  
398. Usuário consegue contribuir com nova ocorrência sem fluxo excessivamente complexo.  
399. Moderador consegue revisar fila mínima sem dashboard avançado.  
400. MVP permanece funcional sem analytics, IA ou integrações externas.  

### Testes extras de robustez

401. API suporta ocorrência com descrição longa dentro do limite aceito.  
402. API rejeita payload vazio em `POST /api/reports`.  
403. API rejeita JSON malformado.  
404. API rejeita `neighborhood_id` malformado.  
405. API rejeita `id` malformado em rotas paramétricas.  
406. `uuidParamSchema` bloqueia ids inválidos.  
407. `reportListQuerySchema` bloqueia query inválida.  
408. `reportStatusUpdateSchema` bloqueia status inválido.  
409. `reportCreateSchema` bloqueia payload incompleto.  
410. Upload sem arquivo retorna erro adequado.  

### Testes de paginação e filtros

411. `GET /api/reports` com `limit` padrão usa valor documentado.  
412. `GET /api/reports` com `limit` acima do máximo aplica teto ou rejeita conforme regra.  
413. `GET /api/admin/reports` com `limit` padrão usa valor documentado.  
414. Filtro combinado por categoria + status funciona na API pública.  
415. Filtro combinado por bairro + severidade funciona na API pública.  
416. Filtro combinado por status + categoria funciona no admin.  
417. Paginação pública não duplica registros entre páginas.  
418. Paginação admin não duplica registros entre páginas.  
419. Filtro vazio retorna conjunto base sem erro.  
420. Filtro inválido retorna erro estruturado, não fallback silencioso.  

### Testes de acessibilidade mínima e clareza

421. Controles principais do formulário têm label visível.  
422. Controles principais do painel têm label visível.  
423. Botões principais têm texto compreensível.  
424. Estado de erro não depende só de cor.  
425. Status/severidade não dependem só de cor.  
426. CTA da landing é identificável em mobile.  
427. Cards do mapa têm hierarquia textual clara.  
428. Tabela/lista administrativa tem informação legível.  
429. Empty states explicam o que aconteceu.  
430. Access denied explica restrição de forma clara.  

### Testes de estabilidade do fluxo completo

431. Fluxo público completo: criar ocorrência sem imagem.  
432. Fluxo público completo: criar ocorrência com imagem.  
433. Fluxo público completo: criar ocorrência e depois visualizar no mapa.  
434. Fluxo público completo: abrir detalhe da ocorrência recém-criada.  
435. Fluxo de confirmação: autenticar, confirmar e ver contador aumentar.  
436. Fluxo administrativo completo: autenticar como moderador, abrir fila, revisar detalhe, alterar status.  
437. Fluxo administrativo completo: arquivar ocorrência e confirmar ocultação pública.  
438. Fluxo administrativo completo: confirmar existência do log.  
439. Fluxo de erro completo: falha de criação não gera upload.  
440. Fluxo de erro completo: falha de upload mantém ocorrência válida.  

### Testes de consistência entre status e visibilidade

441. `pending` aparece no mapa se a regra pública assim permitir.  
442. `under_review` aparece no mapa se a regra pública assim permitir.  
443. `confirmed` aparece no mapa.  
444. `resolved` aparece no mapa se a regra pública assim permitir.  
445. `archived` não aparece no mapa.  
446. `archived` não abre detalhe público.  
447. `archived` abre detalhe administrativo.  
448. Mudança de `confirmed` para `archived` some da listagem pública.  
449. Mudança de `archived` para `reopen` volta ao fluxo administrativo compatível.  
450. O log administrativo acompanha a mudança de status correspondente.  

### Testes finais de integridade do MVP

451. O MVP pode operar sem multi-cidade funcional.  
452. O MVP pode operar sem IA.  
453. O MVP pode operar sem OCR.  
454. O MVP pode operar sem reputação.  
455. O MVP pode operar sem notificações push.  
456. O MVP pode operar sem integração com prefeitura.  
457. O MVP pode operar sem dashboard analítico.  
458. O MVP pode operar sem workflow multinível.  
459. O MVP pode operar sem moderação em lote.  
460. O MVP ainda entrega valor com mapa + envio + moderação mínima.  

### Testes de regressão de código e spec

461. Alterar enum em código sem atualizar spec é detectado como falha.  
462. Alterar contrato de API sem atualizar spec é detectado como falha.  
463. Alterar papel/role sem atualizar spec é detectado como falha.  
464. Alterar payload do formulário sem atualizar spec é detectado como falha.  
465. Alterar status permitido sem atualizar spec é detectado como falha.  
466. Alterar estrutura de arquivos obrigatória sem atualizar spec é detectado como falha.  
467. Alterar bucket de imagens sem atualizar spec é detectado como falha.  
468. Alterar tamanho máximo de imagem sem atualizar spec é detectado como falha.  
469. Alterar regras de visibilidade pública sem atualizar spec é detectado como falha.  
470. Alterar o fluxo de fases sem atualizar spec é detectado como falha.  

### Testes de manutenção e expansão controlada

471. A base suporta futura deduplicação sem quebrar schema atual.  
472. A base suporta futura expansão multi-cidade sem quebrar `neighborhoods`.  
473. A base suporta futura entrega controlada de imagens privadas.  
474. A base suporta futura gestão de usuários sem quebrar `users`.  
475. A base suporta futura auditoria visual usando `moderation_logs`.  
476. A base suporta futura priorização por confirmações.  
477. A base suporta futura fila por severidade.  
478. A base suporta futura evolução de filtros públicos.  
479. A base suporta futura evolução de filtros administrativos.  
480. A base suporta futura automação sem comprometer o MVP atual.  

### Testes documentais finais de completude

481. Master spec cobre produto, arquitetura, dados, API, UI pública, envio e moderação.  
482. Visão geral cobre ordem de implementação e dependências entre fases.  
483. Fase 1 cobre banco, storage, tipos e constantes.  
484. Fase 2 cobre contratos e regras de API.  
485. Fase 3 cobre mapa, filtros, cards, detalhe e estados.  
486. Fase 4 cobre formulário, localização, upload e feedback.  
487. Fase 5 cobre painel, filtros, detalhe, status e acesso negado.  
488. README resume corretamente o conjunto documental.  
489. A documentação toda permite derivar casos positivos, negativos e de borda.  
490. A documentação toda permite derivar testes automatizados e manuais.  

### Testes globais de pronto para execução

491. Existe cobertura mínima para documentação.  
492. Existe cobertura mínima para banco.  
493. Existe cobertura mínima para API.  
494. Existe cobertura mínima para UI pública.  
495. Existe cobertura mínima para envio comunitário.  
496. Existe cobertura mínima para moderação.  
497. Existe cobertura mínima para auth/autorização.  
498. Existe cobertura mínima para erros e estados de interface.  
499. Existe cobertura mínima para regressão entre fases.  
500. O conjunto de testes cobre o sistema inteiro de ponta a ponta.  
