# 🚀 Guia de Deploy Automatizado - Projeto Batuara

## 📋 Fluxo de Desenvolvimento

### **Desenvolvimento Local → Oracle Cloud**

```bash
# 1. Desenvolvimento Local (IDE Kiro)
./src/servers.sh start                    # Testar localmente
git add .
git commit -m "feat: nova funcionalidade"
git push origin master

# 2. Deploy na Oracle Cloud (Servidor VPS)
ssh ubuntu@129.153.86.168
cd /var/www/batuara_net
./deploy.sh deploy                        # Deploy automático
```

## 🛠️ Comandos Disponíveis

### **Deploy Completo**
```bash
./deploy.sh deploy
```
- ✅ Cria backup automático
- ✅ Sincroniza com GitHub (git pull)
- ✅ Detecta mudanças nos serviços
- ✅ Reconstrói apenas containers alterados
- ✅ Valida funcionamento dos serviços
- ✅ Rollback automático em caso de falha

### **Apenas Backup**
```bash
./deploy.sh backup
```
- 💾 Backup do banco PostgreSQL
- 💾 Backup de configurações (.env, docker-compose.yml)
- 💾 Estado atual dos containers

### **Rollback**
```bash
./deploy.sh rollback
```
- ⏪ Restaura backup anterior
- ⏪ Reverte commit Git
- ⏪ Reinicia containers

### **Verificar Status**
```bash
./deploy.sh status
```
- 🔍 Status dos containers
- 🔍 Teste de conectividade (portas 3000/3001)
- 🔍 Validação de saúde dos serviços

## 📊 Exemplo de Saída

```bash
ubuntu@vmoracleguelfi:/var/www/batuara_net$ ./deploy.sh deploy

============================================================================
                    🚀 BATUARA DEPLOY AUTOMATION 🚀                      
============================================================================
Deploy ID: deploy_20250801_143022
Timestamp: 2025-08-01 14:30:22
Log File: /tmp/batuara_deploy_20250801_143022.log
============================================================================

ℹ️ 💾 Criando backup do sistema...
ℹ️ Fazendo backup do banco de dados...
✅ Backup do banco criado com sucesso
ℹ️ Fazendo backup das configurações...
✅ Backup completo criado em: /tmp/batuara_backups/deploy_20250801_143022

ℹ️ 🔄 Sincronizando com repositório Git...
ℹ️ Buscando atualizações do repositório...
✅ Fetch realizado com sucesso
ℹ️ Mudanças detectadas:
  • abc123d feat: adicionar nova funcionalidade
  • def456e fix: corrigir bug no frontend
ℹ️ Aplicando atualizações...
✅ Repositório atualizado com sucesso

ℹ️ Detectando mudanças nos serviços...
ℹ️ Mudanças detectadas no frontend público
ℹ️ Reconstruindo containers: batuara-public-website
✅ batuara-public-website reconstruído com sucesso

ℹ️ 🔍 Validando serviços...
ℹ️ Testando http://localhost:3000...
✅ http://localhost:3000 está respondendo
ℹ️ Testando http://localhost:3001...
✅ http://localhost:3001 está respondendo
✅ Todos os serviços estão funcionando corretamente

============================================================================
                           RESUMO DO DEPLOY                               
============================================================================
Deploy ID: deploy_20250801_143022
Status: ✅ SUCESSO
Duração: 45s
Log File: /tmp/batuara_deploy_20250801_143022.log

✅ Deploy concluído com sucesso!

ℹ️ Serviços disponíveis:
  • Site Público: http://129.153.86.168:3000
  • Admin Dashboard: http://129.153.86.168:3001
============================================================================
```

## 🔧 Funcionalidades Avançadas

### **Detecção Inteligente de Mudanças**
O script detecta automaticamente quais serviços precisam ser reconstruídos:

- **Backend alterado** → Reconstrói `batuara-api`
- **Frontend público alterado** → Reconstrói `batuara-public-website`
- **Admin dashboard alterado** → Reconstrói `batuara-admin-dashboard`
- **docker-compose.yml alterado** → Reconstrói todos os serviços

### **Backup Automático**
Antes de cada deploy:
- 💾 Dump completo do banco PostgreSQL
- 💾 Backup de arquivos de configuração
- 💾 Estado atual dos containers
- 💾 Informações do commit atual

### **Rollback Automático**
Em caso de falha:
- ⏪ Restaura configurações anteriores
- ⏪ Restaura banco de dados
- ⏪ Reverte para commit anterior
- ⏪ Reinicia containers

### **Validação Completa**
Após cada deploy:
- ✅ Verifica se containers estão rodando
- ✅ Testa conectividade HTTP nas portas 3000/3001
- ✅ Confirma que serviços estão respondendo

## 📝 Logs Detalhados

Todos os deploys geram logs detalhados em `/tmp/batuara_deploy_YYYYMMDD_HHMMSS.log`

```bash
# Ver logs do último deploy
tail -f /tmp/batuara_deploy_*.log

# Ver todos os logs de deploy
ls -la /tmp/batuara_deploy_*.log
```

## 🚨 Troubleshooting

### **Deploy Falhou**
```bash
# Ver logs detalhados
cat /tmp/batuara_deploy_*.log

# Fazer rollback manual
./deploy.sh rollback

# Verificar status dos serviços
./deploy.sh status
```

### **Containers Não Iniciam**
```bash
# Verificar logs dos containers
docker-compose logs

# Reiniciar containers manualmente
docker-compose down
docker-compose up -d
```

### **Problemas de Conectividade**
```bash
# Testar portas localmente
curl -I http://localhost:3000
curl -I http://localhost:3001

# Verificar firewall
sudo ufw status
```

## 🎯 Próximos Passos

1. **Configurar DNS** no registro.br
2. **Implementar HTTPS** com Let's Encrypt
3. **Adicionar monitoramento** de saúde
4. **Configurar alertas** por email/Slack

---

**🎉 Parabéns! Agora você tem um sistema de deploy completamente automatizado para o projeto Batuara!**