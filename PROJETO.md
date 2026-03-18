# 🏖️ BATUARA.NET - Sistema de Turismo e Reservas

**Stack:** .NET 8 API + React (Public) + React (Admin)  
**Branch:** `master`  
**Banco:** PostgreSQL (CasaBatuara)  
**Repo:** https://github.com/guelfi/Batuara.net.git

## 📋 CONFIGURAÇÃO

| Componente | Porta | URL Local | URL Produção |
|------------|-------|-----------|--------------|
| API | 3003 | http://localhost:3003 | /batuara-api/ |
| Public Website | 3000 | http://localhost/batuara-public/ | /batuara-public/ |
| Admin Dashboard | 3001 | http://localhost/batuara-admin/ | /batuara-admin/ |

## 🗄️ BANCO DE DADOS

**PostgreSQL Dev:**
- Database: `batuara_dev`
- User: `batuara_user`
- Password: *(definida via variável de ambiente `DB_PASSWORD`)*

**PostgreSQL Prod:**
- Database: `CasaBatuara`
- User: `batuara`
- Password: *(definida via variável de ambiente `DB_PASSWORD`)*

## 🚀 DEPLOY

```bash
cd /mnt/c/Users/SP-MGUELFI/Projetos
./deploy-oci.sh  # Opção 2
```

## 📝 MIGRAÇÃO PENDENTE

- [ ] docker-compose.local.yml (com PostgreSQL)
- [ ] docker-compose.production.yml
- [ ] deploy.sh
- [ ] dev.sh
- [ ] .env.example
- [ ] README-DEPLOY.md
- [ ] .github/workflows/deploy-oci.yml

## 🔗 LINKS

- API: http://129.153.86.168/batuara-api/swagger
- Public: http://129.153.86.168/batuara-public/
- Admin: http://129.153.86.168/batuara-admin/
- Docs Central: /Projetos/PROMPT_MESTRE.md
