# Histórico de Tarefas e Implementações

Este arquivo mantém o histórico de tarefas resolvidas e o status de implementação do projeto Batuara.net.

**Última atualização:** 2026.04.03  
**Escopo:** mudanças implementadas, deploy local, troubleshooting e validações recentes

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
- `docs/Backlog-Executavel.md`
- `docs/EFT-especificacao-funcional-tecnica.md`
- `agent.md`
