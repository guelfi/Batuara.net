# 📊 BATUARA.NET - Status do Projeto

**Última atualização:** 18/03/2026

## ✅ STATUS ATUAL

**Desenvolvimento:** 🟢 Funcional  
**Produção:** 🟡 Requer redeploy (credenciais removidas, novas env vars necessárias)  
**Repositório:** 🟢 Sincronizado (local ↔ GitHub)

### 🐳 Containers OCI
- batuara-api: ⚠️ Requer redeploy com novas variáveis de ambiente (DB_PASSWORD, JWT_SECRET)
- batuara-public-website: ✅ Funcionando
- batuara-admin-dashboard: ✅ Funcionando
- postgres-batuara: ✅ Funcionando (healthy)

## 🎯 FASES CONCLUÍDAS

- **Fase 0** - Documentação (✅ PROJETO.md e STATUS.md)
- **Fase 1** - Emergência de Segurança (✅ PR #1 merged — credenciais removidas, CORS restrito)
- **Fase 2** - Estabilidade da API (✅ PR #2 merged — health checks, EF Core, HTTPS, Docker fixes)
- **Fase 3** - Limpeza Arquitetural (🔄 PR em revisão — unificação de auth, middlewares, rate limiting)

### Detalhes da Fase 3
- SecurityHeadersMiddleware migrado para Batuara.API
- Rate Limiting nativo do .NET 8 (login: 5/min, refresh: 10/min, geral: 100/min)
- Novos endpoints: PUT /me, PUT /change-password
- UsersController (admin CRUD): GET /users, GET /users/{id}, POST /users, PUT /users/{id}, DELETE /users/{id}
- Removidos: Class1.cs (boilerplate), scripts de teste, logs, pasta _deprecated/
- Batuara.Auth depreciado (funcionalidades migradas para Clean Architecture)

## 📋 PRÓXIMAS TAREFAS

1. [ ] Redeploy da API com novas variáveis de ambiente
2. [ ] Ativar HTTPS com Let's Encrypt (descomentar blocos nginx)
3. [ ] Configurar GitHub Actions CI/CD (Fase 4)
4. [ ] Criar testes automatizados (Fase 4)
5. [ ] Secret scanning e hardening (Fase 5)

## 📝 OBSERVAÇÕES

- 3 componentes: API + Public + Admin
- Usa PostgreSQL
- Branch master (não main)
- Variáveis de ambiente obrigatórias: DB_PASSWORD, JWT_SECRET (ver .env.production.example)
- Batuara.Auth está depreciado — usar apenas Batuara.API para autenticação
