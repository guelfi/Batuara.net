# 📊 BATUARA.NET - Status do Projeto

**Última atualização:** 17/03/2026

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
- **Fase 2** - Estabilidade da API (🔄 PR em revisão — health checks, EF Core, HTTPS, Docker fixes)

## 📋 PRÓXIMAS TAREFAS

1. [ ] Redeploy da API com novas variáveis de ambiente
2. [ ] Ativar HTTPS com Let's Encrypt (descomentar blocos nginx)
3. [ ] Unificar projetos de autenticação (Fase 3)
4. [ ] Configurar GitHub Actions CI/CD (Fase 4)
5. [ ] Criar testes automatizados (Fase 4)
6. [ ] Secret scanning e hardening (Fase 5)

## 📝 OBSERVAÇÕES

- 3 componentes: API + Public + Admin
- Usa PostgreSQL
- Branch master (não main)
- Variáveis de ambiente obrigatórias: DB_PASSWORD, JWT_SECRET (ver .env.production.example)
