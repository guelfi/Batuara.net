# AGENTS.md — Batuara.net

## Idioma de comunicação

- **Sempre responda em português do Brasil (pt-BR)** em todas as interações com o usuário deste repositório (respostas de chat, resumos, títulos e descrições de PR).

## Onboarding e guia do projeto

- Consulte [`agent.md`](agent.md) para o guia completo de arquitetura, módulos, endpoints, banco de dados e fluxo de deploy.
- O ambiente de desenvolvimento do Cloud Agent está definido em [`.cursor/environment.json`](.cursor/environment.json), com os scripts `.cursor/install.sh` (instala .NET 8, PostgreSQL 16, dependências dos frontends e gera o schema do banco) e `.cursor/start.sh` (sobe o PostgreSQL e aplica o schema). A API sobe em `:3003`, o PublicWebsite em `:3000` e o AdminDashboard em `:3001`.
