# Scripts de Deploy e Correção de Assets - Oracle

Este documento descreve os scripts criados para resolver problemas de assets estáticos no servidor Oracle.

## 📋 Scripts Disponíveis

### 1. `diagnose-assets-oracle.sh` - Diagnóstico
**Propósito**: Diagnosticar problemas com assets estáticos
**Uso**: `./diagnose-assets-oracle.sh`

**O que faz**:
- Verifica status dos containers
- Lista arquivos no diretório nginx
- Testa acesso direto aos assets via HTTP
- Analisa logs do nginx para erros 404
- Verifica configuração do nginx

### 2. `clear-cache-oracle.sh` - Limpeza de Cache
**Propósito**: Limpar caches que podem estar causando problemas
**Uso**: `./clear-cache-oracle.sh`

**O que faz**:
- Limpa cache do nginx nos containers
- Remove cache de build do Docker
- Remove containers, imagens e volumes não utilizados
- Reinicia serviços automaticamente
- Testa assets após limpeza

### 3. `deploy-oracle-assets-fix.sh` - Deploy com Backup
**Propósito**: Deploy seguro com backup do projeto atual
**Uso**: `./deploy-oracle-assets-fix.sh`

**O que faz**:
- Faz backup do projeto atual
- Para containers existentes
- Clona repositório atualizado
- Reconstrói containers com --no-cache
- Verifica se assets estão funcionando
- Permite rollback se necessário

### 4. `clean-and-clone-oracle.sh` - Limpeza Completa
**Propósito**: Limpeza total e clonagem do repositório original
**Uso**: `./clean-and-clone-oracle.sh`

**⚠️ ATENÇÃO**: Este script remove COMPLETAMENTE o projeto atual!

**O que faz**:
- Remove todos os containers e imagens do Batuara
- Limpa completamente o sistema Docker
- Remove projeto atual
- Clona repositório original do GitHub
- Reconstrói tudo do zero

### 5. `oracle-deploy-ready.sh` - Deploy Automático (RECOMENDADO)
**Propósito**: Deploy completo sem necessidade de edição
**Uso**: `./oracle-deploy-ready.sh`

**✅ PRÉ-CONFIGURADO para Oracle**: Não precisa editar nada!

**O que faz**:
- Configurado para `/var/www/batuara_net`
- Para containers e faz backup automático
- Clona repositório atualizado do GitHub
- Reconstrói containers com --no-cache
- Executa diagnóstico automático
- Testa assets automaticamente

### 6. `oracle-quick-fix.sh` - Correção Rápida
**Propósito**: Correção rápida sem clonar repositório
**Uso**: `./oracle-quick-fix.sh`

**O que faz**:
- Limpa cache do Docker
- Reconstrói containers existentes
- Testa assets rapidamente
- Ideal para problemas simples

## 🚀 Ordem Recomendada de Execução

### Para Problemas Simples:
1. `./diagnose-assets-oracle.sh` - Identificar o problema
2. `./clear-cache-oracle.sh` - Limpar caches
3. `./diagnose-assets-oracle.sh` - Verificar se resolveu

### Para Problemas Persistentes:
1. `./deploy-oracle-assets-fix.sh` - Deploy com backup
2. `./diagnose-assets-oracle.sh` - Verificar resultado

### Para Deploy Completo (RECOMENDADO):
1. `./oracle-deploy-ready.sh` - Deploy automático pré-configurado
2. Testar no navegador

### Para Correção Rápida:
1. `./oracle-quick-fix.sh` - Correção sem clonar repositório

### Para Limpeza Completa (último recurso):
1. `./clean-and-clone-oracle.sh` - Limpeza total
2. `./diagnose-assets-oracle.sh` - Verificar resultado

## ⚙️ Configuração Necessária

### ✅ **Scripts Pré-Configurados - Sem Edição Necessária**

Os scripts já estão configurados com:
- **Repositório**: `https://github.com/guelfi/Batuara.net.git`
- **Branch**: `master`
- **Diretório Oracle**: `/var/www/batuara_net`

**Não é necessário editar nenhum arquivo!**

## 🔍 Problemas Comuns e Soluções

### Assets não carregam (404)
**Sintomas**: Favicon não aparece, logo não carrega
**Solução**: 
1. `./diagnose-assets-oracle.sh`
2. `./clear-cache-oracle.sh`

### Container não inicia
**Sintomas**: docker-compose ps mostra containers parados
**Solução**:
1. `./clear-cache-oracle.sh`
2. Se persistir: `./deploy-oracle-assets-fix.sh`

### Build falha
**Sintomas**: Erro durante docker-compose build
**Solução**:
1. `./clear-cache-oracle.sh` (com limpeza agressiva)
2. `./clean-and-clone-oracle.sh`

### Assets existem mas não são servidos
**Sintomas**: Assets estão no container mas retornam 404
**Solução**:
1. Verificar configuração nginx no diagnóstico
2. `./deploy-oracle-assets-fix.sh` (atualiza configuração)

## 📊 Interpretando o Diagnóstico

### Status dos Containers
- ✅ `Up` - Container funcionando
- ❌ `Exited` - Container parou (verificar logs)
- ❌ `Not found` - Container não existe

### Teste de Assets
- ✅ `Status: 200 (OK)` - Asset acessível
- ❌ `Status: 404 (NOT FOUND)` - Asset não encontrado
- ⚠️ `Status: 500` - Erro interno do servidor

### Logs do Nginx
- Procurar por linhas com `404` ou `Not Found`
- Verificar se há erros relacionados a `favicon`, `logo`, `.png`, `.ico`

## 🔄 Rollback

### Se deploy falhar:
```bash
# O script deploy-oracle-assets-fix.sh cria backup automático
docker-compose down
rm -rf Batuara.net
mv Batuara.net.backup.YYYYMMDD_HHMMSS Batuara.net
cd Batuara.net && docker-compose up -d
```

### Se limpeza completa falhar:
- Executar novamente `./clean-and-clone-oracle.sh`
- Verificar conectividade com GitHub
- Verificar URL do repositório

## 📝 Logs e Monitoramento

### Verificar logs dos containers:
```bash
docker-compose logs -f                    # Todos os serviços
docker-compose logs -f publicwebsite      # Apenas PublicWebsite
docker logs container_name                # Container específico
```

### Monitorar recursos:
```bash
docker stats                              # Uso de CPU/Memória
docker system df                          # Uso de disco
df -h                                     # Espaço em disco do servidor
```

## 🆘 Suporte

Se os scripts não resolverem o problema:

1. **Executar diagnóstico completo**:
   ```bash
   ./diagnose-assets-oracle.sh > diagnostico.log 2>&1
   ```

2. **Coletar logs dos containers**:
   ```bash
   docker-compose logs > containers.log 2>&1
   ```

3. **Verificar configuração do sistema**:
   ```bash
   docker version
   docker-compose version
   df -h
   free -h
   ```

4. **Enviar informações coletadas** para análise técnica.

---

## 📋 Checklist de Verificação Pós-Deploy

- [ ] Containers estão rodando (`docker-compose ps`)
- [ ] Assets estão no container (`docker exec container ls /usr/share/nginx/html/`)
- [ ] Assets respondem HTTP 200 (diagnóstico)
- [ ] Site carrega no navegador
- [ ] Favicon aparece na aba do navegador
- [ ] Logo aparece no header do site
- [ ] Não há erros 404 nos logs do nginx

---

**Criado em**: $(date)
**Versão**: 1.0
**Compatível com**: Docker, Docker Compose, Oracle Cloud Infrastructure