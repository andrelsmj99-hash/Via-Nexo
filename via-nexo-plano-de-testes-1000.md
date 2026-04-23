# Via Nexo — Plano de Testes com 1000 Casos

## 1. Objetivo

Este documento consolida o plano mínimo de QA do Via Nexo com 1000 testes formulados a partir da documentação oficial do projeto.

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
- cenários de cliente, servidor, abuso, concorrência, falha e resiliência

## 3. Observação de versionamento

Este arquivo reúne:
- os 500 testes iniciais do plano original
- mais 500 testes adicionais focados em segurança, falhas, ataques lógicos, concorrência, infraestrutura e resiliência

## 4. Casos 1–500

Os casos 1–500 correspondem ao plano original salvo no repositório em `via-nexo-plano-de-testes-500.md`.

## 5. Casos 501–1000

### A. Segurança de entrada, payload e parsing

501. Enviar `title` com 10.000 caracteres e verificar rejeição ou truncamento controlado.
502. Enviar `description` com volume extremo de texto e verificar limite seguro.
503. Enviar `title` composto apenas por espaços e verificar rejeição.
504. Enviar `description` composta apenas por espaços e verificar rejeição.
505. Enviar `title` com quebras de linha excessivas e verificar sanitização.
506. Enviar `description` com HTML bruto e verificar neutralização na renderização.
507. Enviar `description` com `<script>` e verificar neutralização no front e no back.
508. Enviar `title` com caracteres de controle invisíveis e verificar rejeição.
509. Enviar `category` com diferença apenas de caixa, como `POTHOLE`, e verificar regra explícita.
510. Enviar `severity` com valor numérico em vez de string e verificar rejeição.
511. Enviar `latitude` como string `-23.9` e verificar coerção ou rejeição consistente.
512. Enviar `longitude` como `NaN` serializado e verificar rejeição.
513. Enviar `latitude` como infinito positivo e verificar rejeição.
514. Enviar `longitude` como infinito negativo e verificar rejeição.
515. Enviar payload com campos extras não documentados e verificar rejeição ou descarte explícito.
516. Enviar `is_anonymous` como string `true` e verificar tratamento consistente.
517. Enviar `neighborhood_id` como inteiro e verificar rejeição.
518. Enviar JSON com campos duplicados e verificar parsing seguro.
519. Enviar corpo vazio com `content-type: application/json` e verificar erro correto.
520. Enviar corpo com `content-type` ausente e verificar fallback seguro.
521. Enviar JSON válido com ordem aleatória dos campos e verificar comportamento idêntico.
522. Enviar `notes` administrativas com 50.000 caracteres e verificar proteção.
523. Enviar `status` com whitespace antes/depois e verificar validação estrita.
524. Enviar arrays em campos que deveriam ser escalares e verificar rejeição.
525. Enviar objeto aninhado em `title` e verificar rejeição.
526. Enviar `page = 0` e verificar erro ou normalização explícita.
527. Enviar `limit = 0` e verificar erro ou normalização explícita.
528. Enviar `limit = -1` e verificar rejeição.
529. Enviar `page = -10` e verificar rejeição.
530. Enviar `page = 999999999` e verificar proteção contra abuso.
531. Enviar query string duplicando `category` várias vezes e verificar resolução previsível.
532. Enviar `category` com valor URL-encoded inválido e verificar tratamento seguro.
533. Enviar payload multipart com partes inesperadas além do arquivo e verificar descarte seguro.
534. Enviar multipart sem boundary válido e verificar erro controlado.
535. Enviar arquivo com nome extremamente longo e verificar proteção.
536. Enviar nome de arquivo com path traversal tipo `../../a.png` e verificar neutralização.
537. Enviar `image/jpeg` falso com conteúdo não binário e verificar validação adicional.
538. Enviar arquivo vazio de 0 bytes e verificar rejeição.
539. Enviar arquivo com extensão `.png` mas MIME `application/octet-stream` e verificar política aplicada.
540. Enviar UUID com letras maiúsculas e verificar aceitação ou rejeição consistente.
541. Enviar UUID parcial e verificar rejeição imediata.
542. Enviar rota `/api/reports/%2e%2e` e verificar não resolução indevida.
543. Enviar corpo JSON com campos em unicode exótico e verificar persistência segura.
544. Enviar emoji no `title` e verificar suporte sem quebra.
545. Enviar emoji massivo na `description` e verificar limites.
546. Enviar caracteres RTL/LTR mistos no título e verificar renderização segura.
547. Enviar caracteres nulos `\0` em strings e verificar rejeição.
548. Enviar `confirm` com corpo inesperado e verificar que a rota ignora ou rejeita corretamente.
549. Enviar `GET /api/reports` com corpo JSON e verificar que não altera semântica.
550. Enviar `PATCH /api/reports/[id]/status` com corpo multipart e verificar rejeição adequada.

### B. Segurança HTTP, métodos e cabeçalhos

551. Chamar `POST /api/reports` com método `GET` e verificar método não permitido.
552. Chamar `GET /api/reports` com método `DELETE` e verificar método não permitido.
553. Chamar `PATCH /api/reports/[id]/status` com método `POST` e verificar método não permitido.
554. Chamar `POST /api/reports/[id]/confirm` com método `PUT` e verificar método não permitido.
555. Chamar `GET /api/neighborhoods` com método `PATCH` e verificar bloqueio.
556. Enviar cabeçalho `Accept` incompatível e verificar resposta previsível.
557. Enviar `content-type: text/plain` para rota JSON e verificar erro controlado.
558. Enviar `origin` suspeita e verificar se não há comportamento indevido no servidor.
559. Enviar `x-forwarded-for` arbitrário e verificar que não concede privilégios.
560. Enviar `authorization` malformado e verificar `UNAUTHORIZED`.
561. Enviar token expirado e verificar bloqueio.
562. Enviar token assinado para outro ambiente e verificar rejeição.
563. Enviar cookie de sessão corrompido e verificar falha segura.
564. Enviar cookie duplicado e verificar resolução previsível.
565. Enviar cabeçalho `host` inesperado e verificar que a rota não muda comportamento crítico.
566. Enviar cabeçalho `x-http-method-override` malicioso e verificar ignorado.
567. Enviar múltiplos cabeçalhos `authorization` e verificar política segura.
568. Tentar cachear resposta administrativa por cabeçalhos indevidos e verificar não exposição.
569. Verificar que endpoints administrativos não retornam conteúdo sensível em redirects.
570. Verificar que erros 401 e 403 não vazam detalhes internos do mecanismo de auth.
571. Verificar que 404 não revela se o ID existe em área administrativa para usuário sem permissão.
572. Verificar que resposta de método inválido inclui status HTTP correto.
573. Verificar que `OPTIONS` não expõe capacidades além do necessário.
574. Verificar que respostas JSON usam `content-type` correto.
575. Verificar que upload grande interrompido no meio não trava o servidor.
576. Enviar `transfer-encoding` inesperado e verificar proteção.
577. Verificar tratamento de `content-length` falso menor que o real.
578. Verificar tratamento de `content-length` falso maior que o real.
579. Enviar requisição chunked incompleta e verificar timeout/erro limpo.
580. Verificar que endpoints públicos não aceitam cabeçalhos administrativos para bypass.
581. Verificar que `PATCH /status` exige sessão real, não apenas cabeçalho forjado de role.
582. Verificar que `GET /api/admin/reports` ignora query tentando injetar role.
583. Verificar que `GET /api/reports` não muda visibilidade com query `include_archived=true` não documentada.
584. Verificar que rotas públicas ignoram parâmetro não documentado `admin=true`.
585. Verificar que resposta de erro mantém formato JSON mesmo com `Accept: text/html`.
586. Verificar que endpoints não fazem open redirect com parâmetros arbitrários.
587. Verificar que rota de upload não aceita cabeçalhos de storage path definidos pelo cliente.
588. Verificar que rate limit futuro pode ser acoplado sem quebrar contrato atual.
589. Verificar que o servidor lida com cabeçalhos gigantes sem crash.
590. Verificar que requisições repetidas e rápidas no mesmo endpoint não esgotam recursos sem resposta adequada.
591. Verificar que logs do servidor não armazenam token completo em caso de erro.
592. Verificar que logs do servidor não armazenam corpo de imagem bruto.
593. Verificar que logs do servidor não armazenam `service_role`.
594. Verificar que mensagens de erro não incluem stack trace em produção.
595. Verificar que o `updated_at` não pode ser definido por cabeçalho ou parâmetro.
596. Verificar que requisições sem user-agent não quebram o servidor.
597. Verificar que user-agent malicioso não altera o fluxo.
598. Verificar que endpoints retornam tempo razoável mesmo com filtros inválidos repetidos.
599. Verificar que compressão HTTP não altera semântica das respostas.
600. Verificar que falha de desserialização não retorna 500 genérico evitável.

### C. Ataques lógicos e bypass de permissão

601. Tentar atualizar status como usuário autenticado sem registro em `public.users`.
602. Tentar atualizar status com usuário `citizen` e query `role=admin`.
603. Tentar acessar `/api/admin/reports` usando token de outro usuário.
604. Tentar confirmar ocorrência usando sessão parcialmente inválida.
605. Tentar confirmar ocorrência arquivada usando usuário admin e verificar bloqueio ainda assim.
606. Tentar criar ocorrência definindo `user_id` manualmente para outro usuário.
607. Tentar criar ocorrência definindo `moderator_id` no payload e verificar rejeição.
608. Tentar injetar `created_at` no payload de criação e verificar rejeição.
609. Tentar injetar `updated_at` no payload de criação e verificar rejeição.
610. Tentar injetar `storage_path` no payload de imagem e verificar rejeição.
611. Tentar injetar `image_url` no upload e verificar que o servidor define isso.
612. Tentar atualizar status de ocorrência inexistente e verificar ausência de log criado.
613. Tentar atualizar status várias vezes em paralelo e verificar integridade final.
614. Tentar confirmar a mesma ocorrência em paralelo com o mesmo usuário e verificar uma só confirmação.
615. Tentar criar duas ocorrências idênticas em paralelo e verificar comportamento atual documentado.
616. Tentar explorar enum antigo não documentado em `status` e verificar rejeição.
617. Tentar usar ação administrativa sem passar por `PATCH /status` e verificar inexistência de rota alternativa.
618. Tentar acessar imagem privada por URL direta previsível e verificar bloqueio.
619. Tentar inferir presença de ocorrência arquivada pela diferença de erro no público e verificar minimização de vazamento.
620. Tentar usar um `neighborhood_id` válido de outro contexto e verificar aceitação apenas como referência, sem privilégio indevido.
621. Tentar enviar `is_anonymous=false` sem autenticação, quando a política exigir, e verificar regra consistente.
622. Tentar enviar `is_anonymous=true` para ocultar dados e ainda assim forçar exposição do `user_id` no detalhe público.
623. Tentar promover usuário a moderador por alteração local de estado no front e verificar que servidor não confia nisso.
624. Tentar alterar status pelo DevTools do navegador sem chamar API autorizada e verificar impossibilidade.
625. Tentar editar resposta local do front para exibir controles admin e verificar que chamadas reais falham.
626. Tentar usar ID de ocorrência pública em rota admin sem autenticação e verificar bloqueio.
627. Tentar exploração por race condition entre arquivar ocorrência e confirmar ocorrência.
628. Tentar exploração por race condition entre upload de imagem e exclusão lógica/arquivamento.
629. Tentar bypass de filtro público incluindo `status=archived` explicitamente.
630. Tentar obter dados administrativos via erro de serialização no front público.
631. Tentar usar cache do navegador para reabrir conteúdo admin após logout.
632. Tentar usar aba duplicada com sessão vencida em ação administrativa.
633. Tentar repetir `PATCH /status` com replay de requisição antiga e verificar efeito previsível.
634. Tentar confirmar ocorrência usando CSRF hipotético e verificar necessidade de proteção adequada no modelo adotado.
635. Tentar acessar painel admin a partir de deep link após logout.
636. Tentar usar account switching rápido entre citizen e moderator e verificar isolamento correto.
637. Tentar restaurar sessão antiga de moderator invalidada e verificar bloqueio.
638. Tentar upload de imagem em ocorrência de outro usuário e verificar política atual explícita.
639. Tentar deduzir IDs sequenciais e verificar que UUID reduz previsibilidade.
640. Tentar induzir erro 500 para extrair nomes internos de tabelas.
641. Tentar alterar status diretamente no banco via input textual malicioso e verificar ausência de SQL injection.
642. Tentar quebrar `unique(report_id, user_id)` por requisições simultâneas e verificar proteção transacional.
643. Tentar confirmar ocorrência com token válido mas usuário deletado em `public.users`.
644. Tentar acessar admin com usuário autenticado mas role nula/corrompida.
645. Tentar ação admin com role em caixa diferente, como `Moderator`, e verificar rejeição.
646. Tentar criar ocorrência com bairro não existente e verificar erro consistente.
647. Tentar explorar upload para sobrescrever arquivo de outra ocorrência.
648. Tentar explorar nome de arquivo igual para colisão de storage path.
649. Tentar anexar imagem a ocorrência arquivada e verificar política explícita do sistema.
650. Tentar usar upload para armazenar arquivo executável disfarçado e verificar bloqueio.

### D. Concorrência, corrida e idempotência

651. Criar duas ocorrências simultâneas com o mesmo payload e verificar se ambas persistem sem corromper dados.
652. Enviar duas imagens em duas abas para a mesma ocorrência ao mesmo tempo e verificar integridade.
653. Atualizar status para `under_review` e `confirmed` simultaneamente e verificar resultado final consistente.
654. Confirmar ocorrência e arquivá-la simultaneamente e verificar integridade do contador.
655. Buscar detalhe público durante alteração de status e verificar resposta consistente.
656. Buscar listagem pública enquanto uma ocorrência é arquivada e verificar consistência eventual aceitável.
657. Buscar listagem admin enquanto um moderador altera status e outro abre detalhe.
658. Tentar repetir a mesma criação por timeout de cliente e verificar duplicação potencial conhecida.
659. Simular retry automático do cliente em `POST /api/reports` e verificar impacto.
660. Simular retry automático do cliente em `POST /confirm` e verificar proteção por unicidade.
661. Simular retry automático em `PATCH /status` e verificar múltiplos logs ou política definida.
662. Simular perda de conexão após criação de ocorrência mas antes da resposta ao cliente.
663. Simular perda de conexão após upload bem-sucedido mas antes da resposta ao cliente.
664. Simular perda de conexão durante leitura admin paginada.
665. Simular timeout do banco em listagem pública.
666. Simular timeout do banco em detalhe público.
667. Simular timeout do banco em atualização de status.
668. Simular timeout do storage no upload.
669. Simular timeout de obtenção de sessão no painel admin.
670. Verificar comportamento quando duas confirmações de usuários diferentes chegam no mesmo milissegundo.
671. Verificar se contagem de confirmações não regressa após concorrência.
672. Verificar se atualização de status não perde `notes` por escrita concorrente.
673. Verificar se o front admin mostra aviso ou recarrega dados após conflito de atualização.
674. Verificar se seleção atual no painel admin continua válida quando a lista é recarregada.
675. Verificar se filtros do mapa persistem ao recarregar a página.
676. Verificar se filtros admin persistem ao recarregar a página.
677. Verificar comportamento quando a ocorrência selecionada no detalhe é arquivada por outro moderador.
678. Verificar comportamento quando uma imagem é anexada por outro cliente enquanto o detalhe está aberto.
679. Verificar comportamento do front se `confirmations_count` muda enquanto detalhe está aberto.
680. Verificar comportamento do front público se paginação muda por novos inserts simultâneos.
681. Verificar se a listagem pública evita duplicar item ao receber dados atualizados.
682. Verificar se listagem admin evita duplicar item após refetch.
683. Verificar se atualização simultânea de filtros e paginação não gera estado inconsistente.
684. Verificar se o formulário não envia duas vezes ao duplo clique rápido.
685. Verificar se o formulário admin não envia duas vezes ao duplo clique rápido.
686. Verificar se botão de confirmar ocorrência é protegido contra clique duplo.
687. Verificar se upload não é disparado duas vezes por duplo clique.
688. Verificar se um refresh de página no meio do envio não corrompe estado do back.
689. Verificar se navegação para fora da página durante upload não deixa recurso órfão.
690. Verificar se duas abas do painel admin mostram atualização de status após recarga.
691. Verificar se `updated_at` aumenta monotonicamente em alterações sucessivas.
692. Verificar se logs administrativos preservam ordem temporal correta.
693. Verificar se race condition entre `confirmed` e `resolved` não produz status impossível.
694. Verificar se race condition entre `archive` e `reopen` não deixa item invisível indevidamente no admin.
695. Verificar se o mapa continua funcional sob polling ou recargas rápidas.
696. Verificar se backend responde de forma estável sob burst de leituras públicas.
697. Verificar se backend responde de forma estável sob burst de leituras admin autenticadas.
698. Verificar se storage path permanece único sob uploads simultâneos.
699. Verificar se falha parcial não deixa referência de imagem sem arquivo correspondente.
700. Verificar se falha parcial não deixa arquivo órfão sem referência em `report_images`, ou se isso é tratado depois.

### E. Falhas de infraestrutura e dependências

701. Simular indisponibilidade do Supabase DB na listagem pública.
702. Simular indisponibilidade do Supabase DB no detalhe público.
703. Simular indisponibilidade do Supabase DB na criação de ocorrência.
704. Simular indisponibilidade do Supabase DB na confirmação comunitária.
705. Simular indisponibilidade do Supabase DB na atualização de status.
706. Simular indisponibilidade do Supabase Storage no upload.
707. Simular indisponibilidade do Supabase Auth no acesso admin.
708. Simular variável `NEXT_PUBLIC_SUPABASE_URL` ausente.
709. Simular variável `NEXT_PUBLIC_SUPABASE_ANON_KEY` ausente.
710. Simular variável `SUPABASE_SERVICE_ROLE_KEY` ausente em operação que depende dela.
711. Verificar que falhas de env produzem erro claro em ambiente de desenvolvimento.
712. Verificar que falhas de env não vazam segredos em produção.
713. Simular bucket inexistente no upload e verificar erro controlado.
714. Simular tabela `report_images` inacessível após upload concluído.
715. Simular tabela `moderation_logs` inacessível durante patch de status.
716. Simular falha ao criar log administrativo após mudança de status e verificar atomicidade desejada.
717. Simular falha ao contar confirmações na listagem pública.
718. Simular falha ao carregar bairros no formulário público.
719. Simular falha ao carregar bairros no painel admin.
720. Simular falha ao buscar detalhe público com listagem ainda funcional.
721. Simular falha ao buscar detalhe admin com lista ainda funcional.
722. Simular falha de rede no cliente durante carregamento do mapa.
723. Simular falha de rede no cliente durante carregamento da landing.
724. Simular falha de rede no cliente durante submissão do formulário.
725. Simular falha de rede no cliente durante atualização de status.
726. Simular resposta lenta da API pública e verificar loading persistente adequado.
727. Simular resposta lenta da API admin e verificar loading persistente adequado.
728. Simular resposta pública parcial sem `meta.total` e verificar fallback do front.
729. Simular resposta de detalhe sem `images` e verificar robustez do front.
730. Simular resposta admin sem `notes` e verificar robustez.
731. Simular JSON inválido retornado pela API e verificar erro no cliente.
732. Simular desconexão entre criação da ocorrência e navegação do usuário.
733. Simular perda de sessão enquanto painel está aberto.
734. Simular renovação de sessão no meio de uma ação administrativa.
735. Simular mudança de role do usuário entre duas requisições consecutivas.
736. Simular rollback do banco após tentativa de patch de status.
737. Simular storage retornando URL inválida após upload.
738. Simular criação de bucket sem permissões corretas.
739. Simular índice ausente e avaliar degradação aceitável da paginação.
740. Simular crescimento de dados e verificar que queries ainda obedecem filtros corretamente.
741. Simular retorno duplicado do banco e verificar deduplicação eventual no front.
742. Simular ocorrência com bairro removido posteriormente.
743. Simular ocorrência com usuário removido posteriormente.
744. Simular falha de serialização de data no front.
745. Simular timezone inesperado em `created_at` e `updated_at`.
746. Simular clock skew entre serviços e verificar tolerância.
747. Simular deploy com versão de front antiga contra API nova compatível.
748. Simular deploy com API indisponível por alguns segundos.
749. Simular recarga do Vercel/SSR durante requisição crítica.
750. Simular cold start impactando experiência e verificar feedback adequado.

### F. Storage, imagens e mídia

751. Verificar que uma imagem válida pequena faz upload sem perda de metadados.
752. Verificar que imagem no limite exato de 5 MB é tratada conforme política.
753. Verificar que imagem com 5 MB + 1 byte é rejeitada.
754. Verificar que imagem com nome unicode preserva operação segura.
755. Verificar que storage path não usa diretamente o nome fornecido pelo cliente de forma insegura.
756. Verificar que upload repetido da mesma imagem gera caminhos distintos ou política definida.
757. Verificar que exclusão lógica de ocorrência não apaga imagem física sem política explícita.
758. Verificar que arquivamento não torna o arquivo publicamente acessível.
759. Verificar que a imagem de ocorrência arquivada continua acessível apenas por mecanismo administrativo adequado.
760. Verificar que o detalhe público não tenta carregar signed URL vencida sem fallback.
761. Verificar que o front lida com imagem quebrada usando placeholder.
762. Verificar que popup do mapa não trava com imagem ausente.
763. Verificar que lista pública não fica desalinhada por imagem muito alta/larga.
764. Verificar que painel admin não quebra com múltiplas imagens futuras.
765. Verificar que ordem de imagens no detalhe é consistente.
766. Verificar que metadado `storage_path` nunca é exibido ao usuário comum sem necessidade.
767. Verificar que `image_url` inválida não quebra SSR ou renderização.
768. Verificar que upload cancela corretamente no cliente.
769. Verificar que upload cancelado não deixa UI em loading infinito.
770. Verificar que erro de upload deixa a UI pronta para nova tentativa.
771. Verificar que nova tentativa de upload após falha funciona.
772. Verificar que submissão sem imagem não tenta inicializar componentes pesados de mídia desnecessariamente.
773. Verificar que front aceita preview opcional sem depender dela para envio.
774. Verificar que preview não tenta executar conteúdo SVG não permitido, se SVG for bloqueado.
775. Verificar que upload de conteúdo binário com MIME forjado é barrado.
776. Verificar que upload de arquivo ZIP disfarçado de imagem é barrado.
777. Verificar que upload de arquivo com dupla extensão não contorna validação.
778. Verificar que upload de imagem extremamente grande em dimensão, mas comprimida, não degrada UI sem tratamento.
779. Verificar que erros de CORS ou acesso privado não vazam segredos na mensagem ao usuário.
780. Verificar que storage path não permite enumeração simples de outras imagens.
781. Verificar que uma imagem associada ao report errado não é persistida silenciosamente.
782. Verificar que upload sem `report_id` válido nunca cria referência solta.
783. Verificar que caminho do bucket permanece `report-images`, sem fallback silencioso para bucket público.
784. Verificar que falha de leitura de imagem no detalhe público não impede texto da ocorrência de aparecer.
785. Verificar que falha de leitura de imagem no admin não impede ação administrativa.
786. Verificar que resposta do upload não inclui segredos internos de storage.
787. Verificar que upload concorrente não sobrescreve referência anterior indevidamente.
788. Verificar que backend aceita apenas 1 arquivo por requisição conforme spec.
789. Verificar que enviar múltiplos arquivos em uma requisição gera erro claro.
790. Verificar que endpoint de upload não cria ocorrência automaticamente quando `id` não existe.
791. Verificar que endpoint de upload não altera `status` da ocorrência.
792. Verificar que endpoint de upload não altera `updated_at` sem política explícita, ou o faz de maneira consistente se adotado.
793. Verificar que storage privado continua compatível com futura mediação por rota de servidor.
794. Verificar que detalhe público não tenta resolver imagem privada por acesso direto inseguro.
795. Verificar que painel admin pode exibir imagem mesmo sob política privada controlada.
796. Verificar que URLs expiradas podem ser renovadas em modelo futuro sem mudar contrato textual principal.
797. Verificar que upload em conexão lenta não dispara timeout prematuro indevido.
798. Verificar que erro de checksum ou arquivo truncado não gera registro falso de imagem.
799. Verificar que sucesso do upload e falha na gravação do banco é tratado claramente.
800. Verificar que falha no storage antes da gravação do banco não deixa registro de imagem inconsistente.

### G. Cliente, UI e comportamento humano inesperado

801. Usuário abre o mapa antes de a API responder e imediatamente troca filtros repetidamente.
802. Usuário clica 20 vezes no mesmo marcador rapidamente.
803. Usuário navega do mapa para detalhe e volta usando back do navegador.
804. Usuário recarrega a página de detalhe várias vezes rapidamente.
805. Usuário abre 30 abas da mesma ocorrência.
806. Usuário tenta enviar ocorrência e fecha a aba na metade.
807. Usuário muda de orientação do celular no meio do formulário.
808. Usuário perde conectividade em mobile no meio do envio.
809. Usuário volta a ter conectividade após erro e tenta reenviar.
810. Usuário preenche tudo e apaga só as coordenadas antes do submit.
811. Usuário cola coordenadas com vírgula decimal em vez de ponto e verificar tratamento.
812. Usuário tenta digitar latitude no campo de longitude e vice-versa.
813. Usuário deixa o formulário aberto por horas antes de enviar.
814. Usuário troca de bairro várias vezes antes do submit.
815. Usuário seleciona ponto no mapa e depois altera manualmente coordenadas.
816. Usuário tenta navegar para `/admin` por curiosidade sem login.
817. Usuário autenticado como citizen tenta `/admin` após ter visto outro moderador usar.
818. Moderador abre painel, perde permissão e tenta atualizar status sem recarregar.
819. Moderador abre detalhe, outra pessoa arquiva a ocorrência, ele tenta confirmar ação antiga.
820. Usuário usa navegador antigo com suporte parcial a recursos e verificar degradação mínima.
821. Usuário com JavaScript lento vê loading adequado em vez de layout quebrado.
822. Usuário usa zoom de navegador elevado e verificar legibilidade mínima.
823. Usuário usa teclado virtual cobrindo metade da tela do formulário mobile.
824. Usuário submete formulário com teclado Enter repetidamente.
825. Usuário tenta arrastar arquivo inválido para o componente de imagem.
826. Usuário tenta colar imagem da área de transferência onde não há suporte e verificar fallback.
827. Usuário abre detalhe por link direto com rede ruim.
828. Usuário compartilha link de ocorrência arquivada e outro visitante abre.
829. Usuário altera filtros enquanto a lista está vazia e depois volta para um conjunto com dados.
830. Usuário rola muito a lista e troca filtro antes do término do fetch.
831. Usuário usa botão voltar do navegador após sucesso de envio.
832. Usuário reenvia a mesma ocorrência por achar que a primeira falhou.
833. Usuário muda idioma do navegador e verificar que o sistema não quebra textos essenciais.
834. Usuário com fonte grande do sistema operacional ainda consegue ler painel.
835. Usuário toca em elementos próximos demais no mobile e verificar usabilidade.
836. Usuário clica no CTA da landing várias vezes e verificar navegação consistente.
837. Usuário chega ao mapa por link direto sem passar pela landing.
838. Usuário chega ao detalhe por link direto sem contexto de listagem.
839. Usuário usa refresh enquanto um modal/pop-up do mapa está aberto.
840. Usuário com bloqueador de recursos externos ainda vê o fallback do mapa ou erro compreensível.
841. Usuário com conexão de alta latência não vê conteúdo “pular” sem controle.
842. Usuário tem cookies desabilitados e tenta área admin.
843. Usuário alterna entre dark/light do sistema e verificar que UI não se torna ilegível, se aplicável.
844. Moderador tenta aplicar filtro e atualizar status antes do fim do carregamento.
845. Moderador abre duas ocorrências e confunde contexto; verificar clareza do item selecionado.
846. Usuário tenta copiar conteúdo do detalhe e compartilhar sem quebrar layout.
847. Usuário acessa URL de ocorrência com caracteres estranhos após copy/paste incorreto.
848. Usuário abandona formulário após erro e retorna depois; verificar estado previsível.
849. Usuário envia ocorrência sem imagem e depois tenta anexar em iteração futura; sistema atual deve falhar de forma coerente se isso não existir ainda.
850. Usuário interpreta sucesso parcial e verifica se a mensagem evita falsa impressão de erro total.

### H. Observabilidade, logs e diagnósticos

851. Verificar que erro de validação é logado sem dados sensíveis completos.
852. Verificar que erro de autenticação é logado com contexto mínimo útil.
853. Verificar que erro de autorização registra rota e usuário, sem expor segredos.
854. Verificar que falha de upload registra causa técnica sem vazar conteúdo binário.
855. Verificar que falha de banco registra operação afetada.
856. Verificar que log de aplicação distingue erros públicos de erros admin.
857. Verificar que logs permitem correlacionar request-id, se adotado.
858. Verificar que tempo de resposta lento é detectável por métricas futuras.
859. Verificar que criação de ocorrência pode ser auditada sem exibir PII indevida em logs.
860. Verificar que atualização de status pode ser auditada por `moderator_id`.
861. Verificar que falha ao gravar `moderation_logs` não passa despercebida.
862. Verificar que logs diferenciam erro do cliente e erro do servidor.
863. Verificar que erros 4xx e 5xx não recebem o mesmo tratamento observacional.
864. Verificar que upload cancelado pelo usuário não é logado como erro crítico.
865. Verificar que timeout do storage é distinguido de falha de validação.
866. Verificar que repetição suspeita de confirmações pode ser observada futuramente.
867. Verificar que bursts de criação podem ser observados sem afetar usuários normais.
868. Verificar que ausência de `public.users` em rota admin é observável.
869. Verificar que falhas de env são detectáveis rapidamente por logs de boot.
870. Verificar que mudanças de status deixam rastro suficiente para auditoria futura.
871. Verificar que listagem pública lenta por volume de dados é observável.
872. Verificar que paginação admin lenta é observável.
873. Verificar que filtro inválido recorrente pode ser detectado como mau uso.
874. Verificar que uploads com MIME inválido podem ser monitorados como possível abuso.
875. Verificar que tentativas repetidas de acesso admin sem permissão podem ser contadas futuramente.
876. Verificar que a aplicação consegue diferenciar falha do Supabase Auth de falha do DB.
877. Verificar que a aplicação consegue diferenciar falha do DB de falha do Storage.
878. Verificar que logs não duplicam eventos de sucesso por retry interno.
879. Verificar que o front não mostra mensagens de observabilidade internas ao usuário.
880. Verificar que o usuário recebe mensagem amigável enquanto o sistema mantém detalhe técnico apenas nos logs.
881. Verificar que erro de imagem inválida no cliente não gera log de servidor desnecessário antes do submit.
882. Verificar que requests abortadas pelo cliente não poluem métricas como falhas do servidor.
883. Verificar que ação administrativa bem-sucedida pode ser vinculada ao log funcional e ao `moderation_logs`.
884. Verificar que falhas consecutivas no painel não deixam o moderador sem orientação.
885. Verificar que o sistema não registra o conteúdo completo de `description` em logs de erro sem necessidade.
886. Verificar que `notes` administrativas não vazam em logs públicos.
887. Verificar que detalhes de conexão do Supabase não são mostrados ao cliente.
888. Verificar que stack traces não aparecem no JSON de erro.
889. Verificar que monitoramento futuro de saúde das rotas pode ser adicionado sem quebrar contrato.
890. Verificar que o sistema preserva separação entre logging funcional e auditoria de domínio.
891. Verificar que ações de moderação ficam auditáveis mesmo sem analytics.
892. Verificar que o volume de logs não explode com filtros e polling públicos.
893. Verificar que erros repetidos de upload não deixam ruído impossível de analisar.
894. Verificar que um único incidente de infra pode ser rastreado através das áreas afetadas.
895. Verificar que eventos de criação, confirmação e moderação podem ser reconstruídos cronologicamente.
896. Verificar que falhas de render no cliente podem ser distinguidas de falhas de API.
897. Verificar que mensagens de erro do front são consistentes com códigos de erro da API.
898. Verificar que eventuais retries automáticos não geram observações contraditórias.
899. Verificar que a observabilidade suporta diagnóstico de race conditions.
900. Verificar que a observabilidade suporta diagnóstico de regressões entre fases.

### I. Regras de negócio avançadas e cenários ambíguos

901. Verificar política para ocorrência `pending` sem imagem mas com várias confirmações.
902. Verificar política para ocorrência `resolved` ainda com alta severidade histórica.
903. Verificar política para ocorrência `archived` que já teve confirmações altas.
904. Verificar se moderador pode mover diretamente de `pending` para `resolved`, se permitido.
905. Verificar se moderador pode mover de `archived` para `confirmed`, se permitido.
906. Verificar se `reopen` implica status específico documentado ou apenas ação de log.
907. Verificar se ocorrência anônima continua administrável normalmente.
908. Verificar se detalhe admin distingue claramente envio anônimo de envio identificado.
909. Verificar se uma ocorrência sem bairro pode ser administrada sem problemas.
910. Verificar se uma ocorrência sem rua pode ser administrada sem problemas.
911. Verificar se uma ocorrência com imagem mas sem endereço continua útil no fluxo público.
912. Verificar se `confirmations_count = 0` não gera label enganosa no UI.
913. Verificar se `severity = critical` recebe a mesma renderização de contrato sem regra escondida.
914. Verificar se filtros por status no mapa incluem somente valores documentados.
915. Verificar se filtros do admin não incluem ações que não são statuses.
916. Verificar se `notes` administrativas não aparecem no detalhe público.
917. Verificar se `moderation_logs` não são expostos ao público.
918. Verificar se um bairro removido não quebra histórico de ocorrências antigas.
919. Verificar se uma ocorrência com coordenadas no limite do intervalo é aceita.
920. Verificar se uma ocorrência na mesma coordenada de outra é exibida sem colapso funcional básico.
921. Verificar se o mapa suporta marcadores sobrepostos minimamente sem quebrar interação.
922. Verificar se várias ocorrências no mesmo bairro filtram corretamente.
923. Verificar se várias ocorrências da mesma categoria com statuses diferentes filtram corretamente.
924. Verificar se um moderador consegue entender diferença entre `under_review` e `confirmed` no painel.
925. Verificar se usuário público consegue entender diferença entre `confirmed` e `resolved`.
926. Verificar se a UI usa rótulos compreensíveis para status técnicos.
927. Verificar se o formulário evita linguagem ambígua sobre “envio anônimo”, se presente.
928. Verificar se o sistema lida com ocorrência criada sem imagem e sem confirmações, mas ainda válida.
929. Verificar se imagem obrigatória não é inferida erroneamente pelo front.
930. Verificar se bairro obrigatório não é inferido erroneamente pelo front.
931. Verificar se mapa não tenta reverse geocoding não documentado.
932. Verificar se o front não tenta classificar categoria automaticamente.
933. Verificar se o painel não assume analytics não existentes para priorização.
934. Verificar se ordenação admin por `created_at` continua mesmo após mudanças de status.
935. Verificar se prioridade visual de `pending` e `under_review` não altera a query além do documentado.
936. Verificar se landing não promete integração com prefeitura que não existe no MVP.
937. Verificar se landing não promete navegação estilo Waze, fora de escopo.
938. Verificar se mensagens públicas não prometem validação automática por IA.
939. Verificar se a documentação não induz o time a implementar recurso fora do MVP.
940. Verificar se detalhe público não mostra dado de moderador.
941. Verificar se uma ocorrência muito antiga continua visível conforme status e filtros.
942. Verificar se um status recém-alterado é refletido após refresh simples.
943. Verificar se o painel deixa claro quando uma ação foi concluída versus apenas enviada.
944. Verificar se mudança de status para `archived` não remove o item da lista admin atual indevidamente sem feedback.
945. Verificar se filtro admin por `archived` funciona após arquivamento recém-feito.
946. Verificar se a lista pública não mostra `notes` internas por acidente.
947. Verificar se o front não tenta usar `moderation_action` como filtro público.
948. Verificar se o detalhe público não exibe `is_anonymous` de forma confusa para o visitante.
949. Verificar se o admin consegue ver informação suficiente mesmo quando o envio foi anônimo.
950. Verificar se a ausência da sincronização automática de usuários não cria regra ambígua escondida no front.

### J. Testes sistêmicos finais, abuso extremo e resiliência global

951. Simular ataque de scraping na listagem pública e verificar estabilidade básica.
952. Simular grande volume de acessos ao detalhe da mesma ocorrência.
953. Simular bots tentando enviar muitas ocorrências inválidas seguidas e verificar comportamento controlado.
954. Simular bots tentando confirmar muitas ocorrências sem autenticação.
955. Simular bots tentando acessar `/admin` repetidamente sem credenciais.
956. Simular usuários legítimos e abusivos misturados no mesmo período e verificar que o sistema ainda atende leitura pública.
957. Simular base com 100.000 ocorrências e validar paginação básica.
958. Simular base com 100.000 confirmações e validar contagem correta.
959. Simular base com muitas imagens por ocorrência futura e validar que a UI atual não colapsa.
960. Simular base com muitos bairros e validar seletor utilizável.
961. Simular falha parcial em cascata: DB lento + Storage indisponível.
962. Simular falha parcial em cascata: Auth instável + painel aberto.
963. Simular deploy parcial onde front novo encontra API antiga compatível.
964. Simular deploy parcial onde front antigo encontra API nova compatível.
965. Verificar que erro em uma rota pública não derruba outras rotas públicas.
966. Verificar que erro em uma rota admin não derruba listagem pública.
967. Verificar que falha de upload não afeta navegação do mapa.
968. Verificar que falha do painel não afeta landing pública.
969. Verificar que o cliente se recupera após refresh depois de uma falha grave.
970. Verificar que o servidor se recupera após timeout transitório do banco.
971. Verificar que comportamento sob erro continua coerente com a documentação.
972. Verificar que comportamento sob abuso não produz corrupção de dados.
973. Verificar que comportamento sob concorrência não viola unicidade crítica.
974. Verificar que comportamento sob falha de rede não expõe estado falso de sucesso.
975. Verificar que comportamento sob falha de rede não expõe estado falso de erro irreversível.
976. Verificar que o sistema mantém integridade mínima mesmo sem automações avançadas.
977. Verificar que o sistema continua útil mesmo sem todos os recursos não-MVP.
978. Verificar que as interfaces não entram em loop de retry infinito.
979. Verificar que o backend não entra em loop de retry interno infinito.
980. Verificar que mensagens ao usuário permanecem humanas e claras sob falha extrema.
981. Verificar que o sistema nunca trata requisição maliciosa como ação administrativa legítima.
982. Verificar que o sistema nunca exibe dado privado por acidente em resposta pública.
983. Verificar que o sistema nunca promove usuário por estado local do cliente.
984. Verificar que o sistema nunca depende da ordem visual do front para aplicar regra crítica.
985. Verificar que o sistema nunca depende de campo opcional para manter integridade central.
986. Verificar que o sistema nunca quebra completamente por falta de imagem.
987. Verificar que o sistema nunca quebra completamente por falta de bairro.
988. Verificar que o sistema nunca quebra completamente por falta de endereço.
989. Verificar que o sistema nunca quebra completamente por falta de confirmações.
990. Verificar que o sistema nunca quebra completamente por ocorrência arquivada em link público.
991. Verificar que o sistema mantém a regra “spec antes do código” como critério de regressão organizacional.
992. Verificar que novas mudanças futuras podem ser comparadas contra os 1.000 testes sem ambiguidade.
993. Verificar que a soma dos testes cobre cliente, servidor, infraestrutura, segurança e UX.
994. Verificar que existe cobertura de abuso intencional e erro acidental.
995. Verificar que existe cobertura de falha parcial e falha total.
996. Verificar que existe cobertura de concorrência, corrida e retry.
997. Verificar que existe cobertura de autorização, privacidade e exposição de dados.
998. Verificar que existe cobertura de contrato, persistência e observabilidade.
999. Verificar que existe cobertura de comportamento humano realista e malicioso.
1000. Verificar que este segundo bloco realmente amplia a suíte anterior sem repetir os 500 casos já definidos.
