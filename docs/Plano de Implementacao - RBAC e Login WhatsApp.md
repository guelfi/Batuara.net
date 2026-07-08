# Plano de Implementação — RBAC (multiadmin) + Login de Filhos da Casa via WhatsApp

**Projeto:** Batuara.net (API .NET Clean Architecture + AdminDashboard React)
**Gerado em:** 2026-07-07
**Decisão já tomada com o dono do produto:** envio do código de acesso via **Evolution API** (open source, self-hosted, protocolo não-oficial via Baileys), rodando na própria OCI onde o projeto já está hospedado (`scripts/docker/docker-compose.oracle.yml`).

## Como usar este documento

Escrito para ser executado por um agente de IA de desenvolvimento (Claude Code), em fases independentes. Cada fase lista arquivos/pastas já confirmados no código atual, o que falta construir, e como validar. Siga a ordem das fases — a Fase 2 (RBAC de staff) é pré-requisito de infraestrutura para a Fase 3 (login de Filhos da Casa), mas ambas podem ser paralelizadas por desenvolvedores diferentes depois que a Fase 1 estiver pronta.

Para o status operacional consolidado pós-implementação, consulte também `docs/Status Atual - RBAC WhatsApp e COR-09.md`.

---

## O que já existe (não precisa ser criado)

Investigação no código atual mostrou que boa parte do back-end de RBAC **já está pronta** — o trabalho real está concentrado no frontend e na parte nova (WhatsApp):

- `Batuara.Domain/Enums/UserRole.cs`: `Admin=1, Editor=2, Viewer=3`.
- `Batuara.Domain/Entities/User.cs`: já suporta múltiplos usuários, cada um com `Role`, `IsActive`, `RefreshTokens`.
- `POST /api/auth/register` (`[Authorize(Roles="Admin")]`) e `POST /api/auth/register-first-admin`: já permitem criar mais administradores/editores.
- `Batuara.API/Controllers/UsersController.cs` (`/api/users`, `[Authorize(Roles="Admin")]`): **CRUD completo de usuários já existe** — `GET /`, `GET /{id}`, `POST /`, `PUT /{id}`, `DELETE /{id}`.
- Todos os controllers de conteúdo (`EventsController`, `OrixasController`, `GuidesController`, `UmbandaLinesController`, `SpiritualContentsController`, `HouseMembersController`, `CalendarAttendancesController`, `ContactMessagesController`) já usam `[Authorize(Roles = "Admin,Editor")]`.
- `SiteSettingsController` e `UsersController` já usam `[Authorize(Roles = "Admin")]` (mais restritivo).

**O que falta não é back-end de autorização — é UI de gestão de usuários e a ligação correta do frontend com esses papéis.**

### Bug encontrado (corrigir na Fase 2)
`pages/ProfilePage.tsx:256` exibe `user?.role === 0 ? 'Administrador' : user?.role === 1 ? 'Moderador' : 'Editor'` — mas o enum real do backend é `Admin=1, Editor=2, Viewer=3` (não existe "Moderador", e os números não batem). Hoje isso provavelmente mostra o cargo errado na tela de perfil. Corrigir o mapeamento para `1=Administrador, 2=Editor, 3=Viewer`.

---

## Fase 1 — Pré-requisitos de infraestrutura

**Status em 2026-07-08:** concluída em ambiente funcional/dev. A infraestrutura Evolution API está funcional na OCI, a instância `batuara-casa` está pareada e validada com envio real usando temporariamente o número pessoal `5511975747470`. Ainda falta revisão final de logs antes de produção e troca para chip dedicado da Casa quando disponível. A abstração backend da Fase 1.2 está implementada no código.

### 1.1 Evolution API na OCI
**Status:** concluída para ambiente funcional/dev.

Implementado:
- Compose versionado em `scripts/docker/docker-compose.whatsapp.yml`.
- Evolution API validada em `http://127.0.0.1:8085` na OCI.
- Evolution API/Manager publicados apenas em loopback; sem porta pública e com acesso administrativo via túnel SSH local.
- Instância temporária `batuara-dev` pareada e testada com envio real.
- Instância definitiva `batuara-casa` pareada e testada com envio real.
- Runbook criado em `docs/Evolution API - Operacao OCI.md`.

Pendente antes de produção:
- Revisar configuração de logs da Evolution API para evitar conteúdo sensível.
- Trocar para chip dedicado da Casa quando disponível.

1. Subir um container Evolution API na mesma VM/OCI onde já roda `docker-compose.oracle.yml` (adicionar um novo `docker-compose.whatsapp.yml` ou um serviço adicional no compose existente, seguindo o padrão já usado — rede `batuara-net`, `restart: unless-stopped`, logging json-file).
2. Evolution API precisa de um Postgres (pode reaproveitar a instância já usada pelo backend, com um schema/database próprio — ver `docker-compose.db.yml`) e opcionalmente Redis para cache de sessão.
3. **Passo manual único:** após subir o container, acessar o painel/manager da Evolution API e escanear o QR Code com um número de WhatsApp real dedicado à Casa (recomendado: um número exclusivo para esse bot, não o WhatsApp pessoal de ninguém, para reduzir risco de banimento e não misturar conversas). Guardar a API key da instância como segredo.
4. Variáveis de ambiente novas no backend (`Batuara.API`, via appsettings/secrets, nunca commitadas): `WhatsApp__Provider=EvolutionApi`, `WhatsApp__BaseUrl`, `WhatsApp__ApiKey`, `WhatsApp__InstanceName`.

### 1.2 Abstração no backend
**Status:** concluída em código.

Implementado:
- `Batuara.Application/Notifications/Services/IWhatsAppService.cs`.
- `Batuara.Infrastructure/Notifications/EvolutionApiWhatsAppService.cs`.
- `Batuara.Infrastructure/Notifications/EvolutionApiWhatsAppOptions.cs`.
- Registro DI em `Batuara.API/Program.cs` via `AddHttpClient`.
- Configuração `WhatsApp` em `appsettings.json`, desligada por padrão.
- Allowlist de desenvolvimento em `appsettings.Development.json`.

Criar `Batuara.Application/Notifications/Services/IWhatsAppService.cs`:
```csharp
public interface IWhatsAppService
{
    Task SendAuthCodeAsync(string phoneE164, string code, CancellationToken ct = default);
}
```
Implementação concreta `EvolutionApiWhatsAppService` em `Batuara.Infrastructure` (ou novo projeto `Batuara.Infrastructure.Notifications`), chamando `POST {BaseUrl}/message/sendText/{InstanceName}` da Evolution API com o texto do código. Registrar via DI condicionalmente pelo `WhatsApp__Provider`, para permitir trocar de provedor no futuro (ex.: migrar para a API oficial da Meta) sem reescrever quem consome a interface.

### 1.3 Normalização de telefone
Adicionar um helper compartilhado para normalizar celular para E.164 (`+55DDDNNNNNNNNN`), usado tanto no cadastro de `HouseMember.MobilePhone` (hoje provavelmente salvo em formato livre — verificar `MembersPage.tsx` / `formatPhoneBr`) quanto na busca por telefone no login.

---

## Fase 2 — RBAC de staff (multiadmin)

**Status em 2026-07-07:** implementada em código; pendente validação E2E com usuários reais Admin/Editor/Viewer no ambiente.

Implementado:
- Enum frontend alinhado ao backend (`Admin=1`, `Editor=2`, `Viewer=3`) e helper de labels.
- Página `UsersPage.tsx` para gestão de usuários via `/api/users`.
- Rota `/users` e itens de menu restritos a Admin.
- Rotas de conteúdo restritas a Admin/Editor no frontend.
- `COR-03` absorvido e implementado em código.

**Objetivo:** permitir múltiplos Administradores/Editores geridos pela própria UI, e garantir que cada papel só acesse o que deve.

### 2.1 Corrigir o mapeamento de papel
`pages/ProfilePage.tsx:256` — trocar o mapeamento incorreto (0/1/2) por `1=Administrador, 2=Editor, 3=Viewer`, idealmente centralizando em um helper `getRoleLabel(role: UserRole)` reutilizável (evita repetir a lógica em outras telas, como a nova página de usuários da 2.2).

### 2.2 Nova página "Usuários" no AdminDashboard
Criar `pages/UsersPage.tsx` (não existe hoje — confirmado que não está na lista de páginas atuais), consumindo o CRUD já existente em `/api/users`:
- Grade: Nome, E-mail, Papel (chip), Status (Ativo/Inativo), Último login.
- Criar/editar: nome, e-mail, papel (select Admin/Editor/Viewer), ativo/inativo. Senha: gerar temporária + fluxo de "definir senha no primeiro acesso", ou permitir o admin digitar uma senha inicial (mais simples para v1 — reavaliar depois).
- Excluir/desativar usuário — usar `IsActive=false` em vez de exclusão física quando o usuário já tiver histórico de ações (auditoria), similar ao raciocínio já aplicado a Orixás/Umbanda no Plano de Correção, mas aqui a favor de manter, não de remover — different contexto: aqui a preocupação é auditoria de quem fez o quê, não simplicidade de UI.
- Adicionar item de menu "Usuários" no `Sidebar.tsx`, visível **apenas para Admin**.

### 2.3 Restringir rotas por papel (já identificado no Plano de Correção como COR-03)
Em `App.tsx`, passar `requiredRole={UserRole.Admin}` nas rotas de `UsersPage` e `SiteSettings`/Preferências avançadas. Papéis Editor continuam acessando conteúdo (Eventos, Orixás, Guias, etc., já autorizados no backend como "Admin,Editor"). Definir com o dono do produto se `Viewer` deve ter acesso de leitura a alguma tela agora ou se fica reservado para o futuro (hoje nenhuma rota do backend aceita `Viewer` sozinho — só "Admin" ou "Admin,Editor" — então um usuário Viewer ficaria bloqueado de quase tudo até isso ser decidido).

### Critério de aceite da Fase 2
Um Admin consegue criar um segundo Admin e um Editor pela UI; o Editor consegue logar e usar as telas de conteúdo mas é redirecionado em `/unauthorized` ao tentar acessar Usuários; o rótulo de papel na tela de perfil bate com o papel real.

---

## Fase 3 — Login e autoatendimento de Filhos da Casa via WhatsApp

**Status em 2026-07-08:** implementada em código, validada por build/testes em Docker local e aplicada no banco local; pendente teste E2E completo de login/autosserviço com WhatsApp. A instância definitiva `batuara-casa` já está conectada e enviando mensagens reais.

**Nota de sequência:** o plano consolidado recomendava executar COR-09 antes da Fase 3. A execução inicial inverteu essa ordem, mas COR-09 foi implementado em seguida no mesmo ciclo: `MembersPage.tsx` usa `Autocomplete` para Orixás e exige Orixá de frente; `MemberProfilePage.tsx` não expõe a aba Orixás, então não houve retrabalho relevante na tela do Filho da Casa.

Implementado:
- `UserRole.Member = 4` no backend e frontend.
- Entidade `MemberLoginCode` com hash do código, expiração, tentativas e consumo.
- Migração manual `20260707000000_AddMemberLoginCodes.cs` para a tabela `MemberLoginCodes`.
- `POST /api/member-auth/request-code` com resposta genérica.
- `POST /api/member-auth/verify-code` emitindo JWT com role `Member` e claim `houseMemberId`.
- `GET /api/members/me`, `PUT /api/members/me` e `POST /api/members/me/contributions`, restritos a `Member`.
- Frontend com login por WhatsApp para Filho da Casa.
- Página `MemberProfilePage.tsx` para editar apenas dados pessoais/endereço e registrar contribuição pendente.
- Layout do AdminDashboard mostra somente “Meu Cadastro” para `Member`.

Validação executada em Docker local:
- `docker compose -f docker-compose.local.yml build api`: concluído com sucesso, `0 Warning(s)`, `0 Error(s)`.
- `docker run --rm -v "${PWD}:/src" -w /src mcr.microsoft.com/dotnet/sdk:8.0 dotnet test "src/Backend/Batuara.Infrastructure.Tests/Batuara.Infrastructure.Tests.csproj"`: concluído com sucesso, 23 testes passando.
- `docker compose -f docker-compose.local.yml build admindashboard`: concluído com sucesso; permanecem apenas warnings antigos de lint em páginas não relacionadas.
- `dotnet ef database update` executado via container SDK na rede Docker local: migration `20260708020346_AddMemberLoginCodes` aplicada no banco local.
- `docker compose -f docker-compose.local.yml up -d api admindashboard`: containers locais recriados com as novas imagens; `api` e `admindashboard` ficaram `healthy`.

Pendências de validação/produção:
- Aplicar migração no banco dos demais ambientes quando houver deploy.
- Executar teste E2E: solicitar código, receber WhatsApp, autenticar, editar cadastro e validar bloqueio de rotas administrativas.

### 3.1 Modelo de dados novo
Nova entidade `MemberLoginCode` (`Batuara.Domain/Entities`):
- `Id`, `HouseMemberId` (FK), `CodeHash`, `ExpiresAt`, `Attempts`, `ConsumedAt`, `CreatedAt`, `CreatedByIp`.
- Código numérico de 6 dígitos, expiração curta (5–10 min), máximo de tentativas (ex.: 5) antes de invalidar e exigir novo pedido.
- **Nunca armazenar o código em texto puro** — usar hash (mesmo padrão de `IPasswordService` já usado para senha de `User`).

Estender `UserRole` com `Member = 4` (reaproveita toda a infraestrutura `[Authorize(Roles=...)]` já existente em vez de criar um sistema de autorização paralelo). O JWT emitido para um Filho da Casa autenticado carrega `role=Member` e um claim próprio identificando o `HouseMemberId` (em vez de `UserId`, já que `HouseMember` não é `User`).

### 3.2 Novos endpoints (`Batuara.API/Controllers/MemberAuthController.cs`)
- `POST /api/member-auth/request-code` — recebe `{ mobilePhone }`, normaliza (E.164), busca `HouseMember` ativo com esse telefone. **Resposta genérica sempre** ("Se o número estiver cadastrado, você receberá um código no WhatsApp") independentemente de existir ou não — evita enumeração de membros por telefone. Aplicar rate limiting (nova policy, ex. `member-login`, seguindo o padrão de `[EnableRateLimiting("login")]` já usado em `AuthController`).
- `POST /api/member-auth/verify-code` — recebe `{ mobilePhone, code }`, valida hash/expiração/tentativas, em caso de sucesso emite JWT (`role=Member`, claim `houseMemberId`) e opcionalmente refresh token (avaliar se vale a pena para v1 — sessão mais curta sem refresh é mais simples e aceitável dado o uso esporádico esperado).

### 3.3 Endpoints de autoatendimento (escopo restrito)
Novo controller `Batuara.API/Controllers/MemberSelfServiceController.cs` (`[Authorize(Roles = "Member")]`, rota `/api/members/me`):
- `GET /api/members/me` — retorna os dados do próprio `HouseMember` (via `houseMemberId` do token, nunca por `id` na URL — evita um membro acessar o cadastro de outro).
- `PUT /api/members/me` — DTO **novo e restrito** (`MemberSelfUpdateRequest`), aceitando apenas: `FullName`, `Email`, `MobilePhone`, endereço completo (`ZipCode/Street/Number/Complement/District/City/State`). Implementar no `IHouseMemberService` um método dedicado (`UpdateSelfProfileAsync`) que só toca esses campos — **nunca reaproveitar o `UpdateHouseMemberRequest` do admin**, mesmo escondendo campos no frontend, porque validação de permissão precisa acontecer no backend, não só na UI.
  - **Campos proibidos mesmo que enviados no corpo da requisição:** `BirthDate`, `EntryDate`, `HeadOrixaFront/Back/Ronda`, `AmaciDate`, `YaoDate`, `SmallParent`, `ReligiousLeader`, `Notes`, `IsActive` — o serviço deve ignorá-los silenciosamente ou rejeitar a requisição se vierem preenchidos (recomendo rejeitar com 400, mais seguro que ignorar silenciosamente).
- `POST /api/members/me/contributions` — permite o membro sugerir uma contribuição própria (mês de referência, valor pretendido, data pretendida), reaproveitando `HouseMember.AddContribution(...)` já existente no domínio, mas sempre como `Pending` — confirmação de pagamento (`MarkAsPaid`) continua **exclusiva dos dirigentes/admin**, nunca pelo próprio membro.

> **Confirmar com o dono do produto:** "dados pessoais" no pedido original inclui alterar o próprio nome completo? A proposta acima permite. Se não for desejado, remover `FullName` da lista de campos editáveis.

### 3.4 Frontend — login por celular
No `LoginPage.tsx`, adicionar uma alternância "Sou Filho da Casa" (ou rota separada `/login-membro`) com dois passos: (1) campo de celular → `POST /api/member-auth/request-code`; (2) campo de código de 6 dígitos → `POST /api/member-auth/verify-code`. Reaproveitar `AuthContext.tsx` para também guardar sessão de `Member` (adaptar o contexto para lidar com os dois tipos de principal, ou criar um `MemberAuthContext` paralelo, se a mistura ficar confusa).

### 3.5 Frontend — área restrita do próprio cadastro
Nova página `pages/MemberProfilePage.tsx`: reaproveita visualmente o layout do diálogo "Editar filho da casa" (`MembersPage.tsx`), mas:
- Mantém apenas as abas **Dados pessoais** e **Endereço** (remove a aba **Orixás** por completo da experiência do membro).
- Adiciona uma seção "Minha contribuição" (mês, valor pretendido, data pretendida) chamando `POST /api/members/me/contributions`.
- Sem o toggle "Cadastro ativo" (fica só com os dirigentes).
- `Sidebar.tsx`: quando o papel do token for `Member`, mostrar **apenas** o item "Meu Cadastro" (esconder todo o restante do menu administrativo).
- `App.tsx`: todas as rotas administrativas continuam com `requiredRole` de Admin/Editor (Fase 2) — isso já bloqueia um `Member` de acessá-las diretamente pela URL, redirecionando para `/unauthorized`.

### Critério de aceite da Fase 3
Um Filho da Casa com celular cadastrado consegue: pedir código, receber no WhatsApp (via Evolution API), autenticar, ver e editar apenas dados pessoais/endereço/contribuição pretendida, e é bloqueado (backend, não só frontend) ao tentar alterar campos de Orixá ou o próprio status Ativo/Inativo.

---

## Riscos e observações

- **Evolution API não é oficial:** monitorar desconexões da sessão (webhook de status) e ter um plano B documentado (ex.: reautenticar escaneando o QR novamente) — isso é operação, não código, mas precisa estar no runbook de quem administra o servidor.
- **Volume baixo favorece a escolha:** por ser uma casa de caridade com poucas dezenas/centenas de membros, o risco de banimento por volume é baixo; ainda assim, evitar reutilizar esse número para qualquer outro disparo em massa.
- **Segurança do código de acesso:** sempre hash, nunca log do código em texto puro, rate limit agressivo em `request-code` (por telefone e por IP) para evitar abuso do envio de mensagens.
- **Enumeração de usuários:** resposta genérica em `request-code` independentemente de o telefone existir ou não (ver 3.2).
- **Migração futura:** a interface `IWhatsAppService` existe justamente para permitir trocar Evolution API pela API oficial da Meta depois, sem reescrever os controllers.
