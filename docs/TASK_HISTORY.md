# Histórico de Tarefas e Implementações

Este arquivo mantém o histórico de tarefas resolvidas e o status de implementação do projeto Batuara.net.

**Última atualização:** 2026.07.08
**Escopo:** mudanças implementadas, deploy local, RBAC, WhatsApp OCI, recorrência/lembretes, contato WhatsApp, troubleshooting e validações recentes

## ✅ Tarefas Resolvidas (Sessão 2026-07-08 - Validação E2E real por Claude)

Validação feita com envio/recebimento real de WhatsApp via túnel SSH até a instância `batuara-casa` na OCI (não apenas leitura de código ou testes automatizados).

### RBAC
- [x] Login de Admin confirmado ponta a ponta no navegador (`/dashboard` sem erro de RBAC).
- [x] Criado usuário Editor de teste, confirmado acesso liberado a rotas Editor e **bloqueio real (403)** em rotas Admin-only (`/users`); menu lateral escondendo itens Admin-only corretamente. Usuário de teste removido após validação.
- [x] Corrigido bug crítico de regressão: `role` retornado pelo backend como string (`"Admin"`) e comparado como número no frontend (`ProtectedRoute.tsx`, `utils/roles.ts`) — normalizado via `normalizeUserRole` em `AuthContext.tsx` e `UsersPage.tsx`.

### Login de Filho da Casa por WhatsApp (Fase 3)
- [x] E2E real completo: solicitação de código pelo número `11975747470`, código `222613` recebido de verdade no WhatsApp, login validado, perfil carregado com dados reais (nome, e-mail, endereço).
- [x] Máscara de telefone confirmada funcionando em tempo real no campo de login.
- [x] Escrita de 5 testes automatizados novos para `MemberAuthService` (happy path, código errado, expirado, limite de tentativas, não-enumeração) — cobertura que não existia antes.

### Bug encontrado e corrigido: migration local não aplicada
- [x] `20260708130000_AddRecurringContributionAndWhatsAppContact` nunca havia sido aplicada ao banco local (só existia no código), causando 500 em `/api/members/me`, `/api/house-members` e `/api/contact-messages`. Aplicado manualmente o SQL idempotente (mesmo do `deploy-rolling.sh`) para destravar a validação local. **Atenção no deploy real:** confirmar que a Step 3.5 do `deploy-rolling.sh` realmente aplica essa migration na OCI, já que testes automatizados com EF InMemory não pegam esse tipo de dessincronia de schema.

### Resposta por WhatsApp a mensagens de contato — 2 bugs reais encontrados e corrigidos
- [x] **Bug 1:** `ContactMessageService.SendWhatsAppResponseAsync` marcava a mensagem como "Respondida" mesmo quando o envio era um no-op silencioso (`WhatsApp:Enabled=false` não lançava exceção). Corrigido: `SendTextAsync` agora lança `InvalidOperationException` explícita nesse caso, e o service captura e retorna erro sem marcar como respondida.
- [x] **Bug 2:** allowlist nunca batia com o telefone real porque `NormalizeToEvolutionNumber` não adicionava o código do país (`55`), enquanto `AllowedRecipients` estava configurado com `55`. Corrigido usando `PhoneNumberNormalizer.NormalizeBrazilMobile` nos dois lados da comparação.
- [x] E2E real confirmado após o fix: mensagem de teste criada pelo PublicWebsite com opt-in, resposta enviada pelo Admin, **recebida de verdade no WhatsApp** (confirmado por print do usuário), status mudou para "Respondida" com histórico correto.
- [x] 33 testes de backend passando no total (`dotnet test "Batuara.sln" -c Release`), incluindo os novos testes de `ContactMessageServiceTests` cobrindo os dois bugs.

### Pendências reais remanescentes
- [ ] Rodar o deploy real na OCI e confirmar que a Step 3.5 (migrations) aplica as duas migrations pendentes sem erro.
- [ ] Trocar número temporário `5511975747470` por chip dedicado da Casa quando disponível.
- [ ] Revisar logs da Evolution API antes de produção para evitar conteúdo sensível.
- [ ] E2E de contribuição recorrente (marcar como paga e confirmar geração automática do mês seguinte) ainda não foi validado manualmente no navegador, só por teste automatizado.

## ✅ Tarefas Resolvidas (Sessão 2026-07-08 - Recorrência, Lembretes e Handoff)

### Contribuições recorrentes e lembrete WhatsApp
- [x] Transformar switches de contribuição recorrente/lembrete em campos reais persistidos.
- [x] Implementar geração automática da próxima mensalidade recorrente ao marcar contribuição recorrente como paga.
- [x] Implementar `ContributionReminderProcessor` e hosted service com throttling conservador.
- [x] Manter `ContributionReminders.Enabled=false` por padrão para evitar disparos automáticos sem decisão operacional.
- [x] Adicionar testes de recorrência e envio condicional de lembrete.

### Contato público com resposta WhatsApp
- [x] Adicionar opt-in no PublicWebsite para resposta por WhatsApp.
- [x] Exigir telefone com DDD quando o visitante solicitar resposta por WhatsApp.
- [x] Implementar endpoint admin para enviar resposta por WhatsApp e marcar mensagem como resolvida.
- [x] Atualizar tipos, DTOs, validators, service e UI administrativa.

### Deploy, migrations e validações
- [x] Criar migration `20260708130000_AddRecurringContributionAndWhatsAppContact`.
- [x] Alinhar `BatuaraDbContextModelSnapshot` com campos e índices novos.
- [x] Atualizar deploy rolling com migration idempotente e envs de WhatsApp/lembrete.
- [x] Normalizar scripts de deploy para LF e validar com `bash -n`.
- [x] Rodar `dotnet test "Batuara.sln" -c Release` via SDK container: 33 testes passaram.
- [x] Rodar `dotnet build "src/Backend/Batuara.API/Batuara.API.csproj" -c Release` via SDK container: passou.
- [x] Rodar `npm run build` em AdminDashboard e PublicWebsite: ambos passaram com warnings antigos.
- [x] Validar `docker compose -f "scripts/docker/docker-compose.production.yml" config --quiet` com envs dummy.
- [x] Rebuildar `api`, `admindashboard` e `publicwebsite` via `docker-compose.local.yml`.
- [x] Subir serviços locais e confirmar `healthy` para API, AdminDashboard e PublicWebsite.

### Pendências operacionais para a próxima ferramenta
- [ ] Revisar `git status` e preparar commit sem arquivos temporários.
- [ ] Não incluir `.claude/`, `docs/.~lock.Plano de Testes Batuara.xlsx#` nem `scripts/output/`.
- [ ] Avaliar se docs novos, planilha de testes e `scripts/import_house_members.py` devem entrar no commit.
- [ ] Executar E2E manual de contribuição recorrente; login WhatsApp e resposta de contato já foram validados com envio/recebimento real.
- [ ] Revisar logs da Evolution API antes de produção.

## ✅ Tarefas Resolvidas (Sessão 2026-07-08 - Evolution API, RBAC e WhatsApp)

### Evolution API na OCI
- [x] Instalar/subir Evolution API self-hosted na OCI em compose separado.
- [x] Manter Evolution API/Manager sem exposição pública, bindado somente em `127.0.0.1:8085`.
- [x] Validar acesso administrativo via túnel SSH local `127.0.0.1:18085 -> 127.0.0.1:8085`.
- [x] Parear instância definitiva `batuara-casa` via Manager/QR.
- [x] Confirmar `GET /instance/connectionState/batuara-casa` retornando `open`.
- [x] Enviar mensagens reais usando `batuara-casa`.
- [x] Confirmar recebimento nos celulares `5511975747470` e `5511995384032`.

### RBAC e Filho da Casa
- [x] Implementar RBAC/multiadmin no AdminDashboard.
- [x] Alinhar roles `Admin=1`, `Editor=2`, `Viewer=3`, `Member=4` no backend/frontend.
- [x] Implementar login de Filho da Casa por WhatsApp e autosserviço restrito em código.
- [x] Criar/aplicar localmente migration `20260708020346_AddMemberLoginCodes`.
- [x] Validar build backend via Docker, testes backend, build AdminDashboard e containers locais healthy.

### Pendências remanescentes
- [x] Executar E2E completo do login WhatsApp/autosserviço com a API local/ambiente configurado para `batuara-casa`.
- [ ] Aplicar migrations `20260708020346_AddMemberLoginCodes` e `20260708130000_AddRecurringContributionAndWhatsAppContact` nos demais ambientes no deploy.
- [ ] Revisar logs/configuração da Evolution API antes de produção.
- [ ] Trocar número temporário `5511975747470` por chip dedicado da Casa quando disponível.

## ✅ Tarefas Resolvidas (Sessão Anterior - Autenticação e UI)

### Análise do Projeto
- [x] Analisar documentação inicial
    - [x] Ler README.md
    - [x] Ler agent.md
- [x] Explorar estrutura do projeto
    - [x] Identificar tecnologias utilizadas
    - [x] Analisar estrutura de diretórios
- [x] Resumir entendimento do projeto

### Verificação e Teste de Autenticação
- [x] Verificar implementação de Auth no AdminDashboard
    - [x] Procurar serviços de API e chamadas de login
    - [x] Verificar gerenciamento de estado de auth (Context/Store)
    - [x] Verificar proteção de rotas
- [x] Validar fluxo de autenticação
    - [x] Inicializar API Backend
- [x] Inicializar AdminDashboard
- [x] Inicializar PublicWebsite
- [x] Corrigir erro de CORS para acesso via IP
- [x] Melhorar UI/UX do AdminDashboard (Header e Cards)
- [x] Validar correções visuais no navegador
- [x] Corrigir erro de conexão com banco de dados (Docker)
- [x] Corrigir erro de constraint no login (Refresh Token)
- [x] Testar login manualmente
- [x] Corrigir banco de dados e autenticação
    - [x] Aplicar migrations e criar tabelas
    - [x] Criar usuário admin via seed
    - [x] Testar endpoint de login
    - [x] Corrigir constraint NOT NULL em refresh_tokens
- [x] Inicializar todos os serviços e corrigir login via IP
    - [x] Iniciar API Backend (porta 3003)
    - [x] Iniciar AdminDashboard (porta 3001)
    - [x] Iniciar PublicWebsite (porta 3000)
    - [x] Corrigir configuração de URL da API no AdminDashboard
    - [x] Adicionar IP 172.17.144.113 ao CORS da API
- [x] Melhorar UI/UX do AdminDashboard Desktop
    - [x] Melhorar distribuição dos cards com breakpoints responsivos

## 📋 Confirmação de Estado Atual (Autenticação)

Todas as tarefas acima foram verificadas e confirmadas como implementadas conforme documentação detalhada em `/specs/AUTH/AUTH_IMPLEMENTATION_SUMMARY.md`.

### Funcionalidades Confirmadas:
1. **Autenticação**: Login, Logout, Refresh Token, Proteção de Rotas.
2. **Segurança**: Senhas com Hash, Proteção CSRF, Rate Limiting.
3. **UI/UX**: Dashboard responsivo, Cards estatísticos ajustados.

## ✅ Tarefas Resolvidas (Sessão Atual - Conteúdo, Localização, Calendário e Admin)

### PublicWebsite — Ajustes de Conteúdo e Layout
- [x] Calendário: remover contador numérico por dia e simplificar a UI
- [x] Calendário: remover legenda com bullets e textos explicativos; reduzir espaçamentos e eliminar overflow; manter apenas o aviso "Informações Importantes" em linha única; remover card inferior de detalhes
- [x] Localização: consolidar exibição do endereço em formato único e corrigir texto introdutório
- [x] Rodapé: alterar cor de fundo, simplificar redes sociais para Instagram e alinhar endereço/e-mail
- [x] Orixás: remover cards adicionais inferiores mantendo apenas o carrossel principal
- [x] Doações: remover bloco de campos “PIX / Banco / CNPJ / Agência / Conta / Tipo” na UI pública
- [x] Festas e Eventos: remover CTA final "Quer ficar por dentro de todos os nossos eventos? / Entre em Contato"
- [x] Guias e Entidades: remover textos introdutórios/explicativos adicionais (manter somente o título)
- [x] Títulos com data: manter preposição "de" em minúsculo (ex.: "Abril de 2026")

### API / SiteSettings — Ajustes de Contrato e Dados
- [x] SiteSettings público: adicionar fallbacks para dados institucionais e localização (endereço, Instagram, mapa)
- [x] Normalização: garantir URL de Instagram sem querystring e extração estável do handle
- [x] Migrações: remover campos de mídia da história (`HistoryImageUrl`, `HistoryVideoUrl`)

### AdminDashboard — Nossa História
- [x] Header: remover bordas arredondadas e garantir preenchimento consistente no topo
- [x] Remover campos: excluir imagem e vídeo do formulário de Nossa História (frontend, backend e banco)
- [x] Remover preview: eliminar a interface dividida e manter apenas editor textual em tela cheia
- [x] Conteúdo padrão: definir texto institucional como conteúdo padrão no editor
- [x] Correção de salvamento: evitar erro de validação quando `historyTitle` vier vazio/whitespace
- [x] Toolbar do editor: remover o botão Link
- [x] Troubleshooting de 502: diagnóstico e recriação do Nginx local para restabelecer PublicWebsite/Swagger/Admin

### Operação Local — Deploy e Troubleshooting
- [x] Deploy local via Docker Compose: rebuild de API, PublicWebsite e AdminDashboard
- [x] Correção de 502: recriar container do Nginx quando upstreams ficam desatualizados após rebuild

## 📌 Notas de Compatibilidade e Rotas

- Base da API: `/batuara-api` (PathBase), com rotas em `/batuara-api/api/*`
- PublicWebsite: `/batuara-public/`
- AdminDashboard: `/batuara-admin/`

## 🔧 Dependências e Procedimentos Validados

- Docker Compose local
- Nginx como proxy das três superfícies (`public`, `admin`, `api`)
- PostgreSQL com migrations da solução backend
- `dotnet test` para regressão de serviços
- `npm run build` para validação dos frontends

## 🧪 Exemplos de Verificação

```bash
curl http://localhost/batuara-api/health
curl http://localhost/batuara-api/swagger
curl http://localhost/batuara-public/
```

## 🔗 Referências Cruzadas

- `docs/STATUS-PROJETO.md`
- `docs/Status Atual - RBAC WhatsApp e COR-09.md`
- `docs/Evolution API - Operacao OCI.md`
- `docs/Plano de Implementacao - RBAC e Login WhatsApp.md`
- `docs/Backlog-Executavel.md`
- `docs/EFT-especificacao-funcional-tecnica.md`
- `agent.md`
