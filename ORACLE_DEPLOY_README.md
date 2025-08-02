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

## 🚀 Ordem Recomendada de Execução

### Para Problemas Simples:
1. `./diagnose-assets-oracle.sh` - Identificar o problema
2. `./clear-cache-oracle.sh` - Limpar caches
3. `./diagnose-assets-oracle.sh` - Verificar se resolveu

### Para Problemas Persistentes:
1. `./deploy-oracle-assets-fix.sh` - Deploy com backup
2. `./diagnose-assets-oracle.sh` - Verificar resultado

### Para Limpeza Completa (último recurso):
1. `./clean-and-clone-oracle.sh` - Limpeza total
2. `./diagnose-assets-oracle.sh` - Verificar resultado

## ⚙️ Configuração Necessária

### Antes de usar os scripts de deploy:

1. **Editar URL do repositório** nos scripts:
   ```bash
   # Em deploy-oracle-assets-fix.sh e clean-and-clone-oracle.sh
   REPO_URL="https://github.com/seu-usuario/Batuara.net.git"  # SUBSTITUA pela URL correta
   ```

2. **Verificar branch** (se não for 'main'):
   ```bash
   # Em clean-and-clone-oracle.sh
   BRANCH="main"  # ou "master" dependendo do seu repositório
   ```

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