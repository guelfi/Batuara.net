# 📊 BATUARA.NET - Status do Projeto

**Última atualização:** 29/01/2026

## ✅ STATUS ATUAL

**Desenvolvimento:** 🟢 Funcional (via start-dev.sh centralizado)  
**Produção:** 🟡 Online com problemas (API unhealthy)  
**Repositório:** 🟢 Sincronizado (local ↔ GitHub)  
**Último commit:** 9bb9a5c (16/01/2026)

### 🐳 Containers OCI
- batuara-api: ⚠️ Up 3 weeks (unhealthy)
- batuara-public-website: ✅ Up 3 weeks
- batuara-admin-dashboard: ✅ Up 3 weeks
- postgres-batuara: ✅ Up 3 weeks (healthy)

## 🎯 FASE ATUAL

**Fase 0** - Documentação (✅ PROJETO.md e STATUS.md criados)

## 📋 PRÓXIMAS TAREFAS

1. [ ] Investigar e corrigir problema de health check da API
2. [ ] Criar docker-compose.local.yml (PostgreSQL)
3. [ ] Criar docker-compose.production.yml
4. [ ] Criar deploy.sh
5. [ ] Criar dev.sh
6. [ ] Criar .env.example
7. [ ] Criar README-DEPLOY.md
8. [ ] Configurar GitHub Actions (CI/CD)
9. [ ] Testar deploy isolado

## 📝 OBSERVAÇÕES

- 3 componentes: API + Public + Admin
- Usa PostgreSQL
- Branch master (não main)
- Projeto mais completo
