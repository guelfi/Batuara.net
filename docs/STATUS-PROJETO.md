# 📊 STATUS ATUAL DO PROJETO BATUARA.NET

**Última atualização:** 03/04/2026  
**Versão de referência documental:** 2026.04.03  
**Fase atual:** Plataforma funcional com módulos administrativos e públicos integrados  
**Ambiente local:** Docker Compose com Nginx, API, PublicWebsite, AdminDashboard e PostgreSQL

## 🎯 Resumo Executivo

O projeto saiu do estágio de “interfaces aguardando API” e hoje opera com backend .NET 8 funcional, banco PostgreSQL, autenticação JWT e módulos CMS reais consumidos pelos dois frontends.

### ✅ Entregas Confirmadas

- **Autenticação:** login, refresh, logout, verificação de token, perfil e alteração de senha
- **PublicWebsite:** calendário, eventos, Orixás, linhas, conteúdos, localização, rodapé e conteúdo institucional via API
- **AdminDashboard:** gestão de história, localização, calendário, eventos, Orixás, guias, linhas, conteúdos e Filhos da Casa
- **Infra local:** deploy via `docker-compose.local.yml`, health checks e Swagger operacionais
- **Banco de dados:** migrations ativas para `SiteSettings`, `ContactMessages`, `Guides`, `HouseMembers` e módulos relacionados

## 🧩 Status por Módulo

| Módulo | Status | Detalhes técnicos |
|---|---|---|
| Auth | ✅ Implementado | JWT, refresh token, endpoints `/auth/*` |
| SiteSettings | ✅ Implementado | História, missão, localização, redes, PIX e dados bancários |
| Nossa História (Admin) | ✅ Implementado | Editor textual em tela cheia, sem preview, sem mídia |
| Localização | ✅ Implementado | Admin e site público integrados via `site-settings` |
| Calendário | ✅ Implementado | CRUD admin + leitura pública |
| Eventos | ✅ Implementado | CRUD admin + catálogo público |
| Orixás | ✅ Implementado | CRUD admin + catálogo público |
| Guias e Entidades | ✅ Implementado | CRUD admin + leitura pública |
| Linhas da Umbanda | ✅ Implementado | CRUD admin + leitura pública |
| Conteúdos Espirituais | ✅ Implementado | CRUD admin + leitura pública |
| Filhos da Casa | ✅ Implementado | CRUD administrativo |
| Contato Público | ✅ Implementado | Recebimento de mensagens públicas |
| Segurança avançada OCI | 🔄 Parcial | operação local estabilizada; itens avançados dependem do ambiente alvo |

## 🆕 Mudanças Recentes Relevantes

### 1. Nossa História

- Remoção completa de upload de imagem e vídeo
- Remoção da interface dividida com preview
- Conteúdo padrão institucional incorporado ao editor
- Remoção do botão `Link` na toolbar do editor
- Correção do fluxo de salvamento para evitar erro `History title cannot be empty`

### 2. SiteSettings e Dados Públicos

- `SiteSettings` consolidado como núcleo de:
  - história institucional
  - contato institucional
  - endereço estruturado
  - mapa incorporado
  - redes sociais
  - dados de PIX e conta bancária
- Ajustados fallbacks para localização, e-mail institucional, Instagram e mapa

### 3. PublicWebsite

- Localização pública ajustada para refletir os dados reais da API
- Rodapé alinhado com endereço/e-mail/Instagram institucionais
- Calendário público simplificado visualmente, sem contador numérico por dia

### 4. Operação Local

- O ambiente local pode apresentar `502 Bad Gateway` quando o `nginx` mantém upstreams antigos após rebuilds
- Procedimento validado: recriar o `nginx` restaura acesso à API, Swagger, PublicWebsite e autenticação

## 🗄️ Banco de Dados e Schema

### Migrations mais relevantes

- `20260401234426_AddSiteSettings`
- `20260402235355_ContentManagementModules`
- `20260403014603_AddHistoryMissionTextToSiteSettings`
- `20260403043437_RemoveHistoryMediaFromSiteSettings`

### Alterações recentes de schema

- inclusão de `HistoryMissionText`
- remoção de `HistoryImageUrl`
- remoção de `HistoryVideoUrl`
- expansão da tabela `SiteSettings` para endereço, redes e doações
- criação de tabelas para `ContactMessages`, `Guides`, `HouseMembers` e contribuições

## 🌐 Endpoints em Produção Local

### Verificações principais

- `GET /batuara-api/health`
- `GET /batuara-api/swagger`
- `POST /batuara-api/api/auth/login`
- `GET /batuara-api/api/site-settings/public`
- `PUT /batuara-api/api/site-settings`
- `GET /batuara-api/api/public/calendar/attendances`

### Exemplo de validação

```bash
curl http://localhost/batuara-api/health
curl http://localhost/batuara-api/swagger
curl http://localhost/batuara-public/
```

## 🚀 Operação e Deploy

### Procedimento padrão de deploy local

```bash
$env:DB_PASSWORD='...'
$env:JWT_SECRET='...'
docker compose -p batuara-net-local -f docker-compose.local.yml up -d --build api publicwebsite admindashboard nginx
```

### Procedimento corretivo para 502

```bash
$env:DB_PASSWORD='...'
$env:JWT_SECRET='...'
docker compose -p batuara-net-local -f docker-compose.local.yml up -d --force-recreate nginx
```

## 📁 Estrutura Atual Relevante

- `src/Backend/Batuara.API/` — controllers, middleware, boot da API
- `src/Backend/Batuara.Infrastructure/` — EF Core, migrations e serviços
- `src/Frontend/PublicWebsite/` — SPA pública
- `src/Frontend/AdminDashboard/` — painel administrativo
- `docs/` — documentação funcional, operacional e de onboarding
- `agent.md` — guia de entendimento rápido para IA e novos devs

## 🔄 Próximos Passos Recomendados

1. Consolidar a documentação viva com o estado atual dos módulos
2. Revisar o backlog restante para itens avançados de segurança e governança
3. Validar produção OCI com a mesma disciplina operacional aplicada localmente
4. Manter testes de regressão para `SiteSettings`, autenticação e proxy local

## 📚 Referências Cruzadas

- `docs/EFT-especificacao-funcional-tecnica.md`
- `docs/Resumo-Executivo.md`
- `docs/Backlog-Executavel.md`
- `docs/TASK_HISTORY.md`
- `agent.md`

## 📝 Change Log

### 03/04/2026

- Documento reescrito para refletir o estado real da implementação
- Removidas referências desatualizadas à fase “aguardando API”
- Incluídas as mudanças recentes em `SiteSettings`, Nossa História, localização e deploy local
- Incluídas instruções operacionais para recuperação de `502` no ambiente local
