# Correção da Estrutura do Batuara.net na OCI

## Problema Identificado

A estrutura atual na OCI está desorganizada com arquivos duplicados:

```
/var/www/batuara_net/
├── Batuara.net/          # ← Pasta duplicada com projeto completo
│   ├── src/
│   ├── docker-compose.production.yml
│   ├── Dockerfile.api
│   └── ...
├── src/                  # ← Arquivos duplicados na raiz
├── scripts/
├── docs/
└── ...
```

**Problemas:**
- GitHub Actions configurado para `/home/ubuntu/batuara` (caminho inexistente)
- Estrutura duplicada causa confusão no deploy
- Arquivos espalhados em locais incorretos

## Solução

### 1. Corrigir GitHub Actions (✅ Concluído)

O workflow foi atualizado para usar o caminho correto:
- **Antes:** `/home/ubuntu/batuara`
- **Depois:** `/var/www/batuara_net`

### 2. Executar Limpeza na OCI

#### Passo 1: Conectar na OCI
```bash
ssh ubuntu@129.153.86.168
```

#### Passo 2: Fazer Backup
```bash
sudo mkdir -p /var/www/backups
sudo cp -r /var/www/batuara_net /var/www/backups/batuara_net_backup_$(date +%Y%m%d_%H%M%S)
```

#### Passo 3: Validar Estrutura Atual
```bash
cd /var/www/batuara_net

# Baixar script de validação
wget -O validate-structure.sh https://raw.githubusercontent.com/seu-usuario/Batuara.net/master/scripts/oracle/validate-oci-structure.sh
chmod +x validate-structure.sh
./validate-structure.sh
```

#### Passo 4: Executar Limpeza
```bash
# Baixar script de limpeza
wget -O cleanup-structure.sh https://raw.githubusercontent.com/seu-usuario/Batuara.net/master/scripts/oracle/cleanup-oci-structure.sh
chmod +x cleanup-structure.sh

# Executar limpeza
sudo ./cleanup-structure.sh
```

#### Passo 5: Validar Estrutura Corrigida
```bash
./validate-structure.sh
```

### 3. Estrutura Final Esperada

```
/var/www/batuara_net/
├── .env.example
├── .env.production
├── .github/
│   └── workflows/
│       └── deploy-oci.yml
├── Batuara.sln
├── Dockerfile.api
├── Dockerfile.frontend
├── docker-compose.production.yml
├── docs/
├── scripts/
│   └── oracle/
│       ├── cleanup-oci-structure.sh
│       ├── validate-oci-structure.sh
│       ├── port-manager.sh
│       └── multi-project-manager.sh
├── src/
│   ├── Backend/
│   └── Frontend/
└── tests/
```

## Comandos de Emergência

### Restaurar Backup
```bash
# Se algo der errado, restaurar backup
sudo rm -rf /var/www/batuara_net
sudo cp -r /var/www/backups/batuara_net_backup_YYYYMMDD_HHMMSS /var/www/batuara_net
```

### Verificar Containers
```bash
# Verificar containers em execução
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Parar containers do Batuara
docker-compose -f /var/www/batuara_net/docker-compose.production.yml -p batuara-net down
```

### Testar Deploy Manual
```bash
cd /var/www/batuara_net

# Atualizar código
git pull origin master

# Fazer deploy
docker-compose -f docker-compose.production.yml --env-file .env.production -p batuara-net up -d --build
```

## Verificações Pós-Correção

### 1. Estrutura
- [ ] Pasta `/var/www/batuara_net/Batuara.net/` removida
- [ ] Arquivos duplicados removidos
- [ ] Todos os arquivos essenciais na raiz

### 2. Deploy
- [ ] GitHub Actions funciona sem erros
- [ ] Containers sobem corretamente
- [ ] Health checks passam

### 3. Serviços
- [ ] Website: http://129.153.86.168:3000
- [ ] Dashboard: http://129.153.86.168:3001  
- [ ] API: http://129.153.86.168:3003

## Próximos Passos

1. **Testar Deploy Automático**
   - Fazer push no repositório
   - Verificar se GitHub Actions executa sem erros

2. **Monitorar Logs**
   ```bash
   # Logs dos containers
   docker-compose -f /var/www/batuara_net/docker-compose.production.yml -p batuara-net logs -f
   ```

3. **Remover Backups Antigos** (após confirmação)
   ```bash
   # Listar backups
   ls -la /var/www/backups/
   
   # Remover backups antigos (cuidado!)
   sudo rm -rf /var/www/backups/batuara_net_backup_OLD_DATE
   ```

## Contatos de Suporte

Em caso de problemas:
1. Verificar logs do GitHub Actions
2. Executar script de validação
3. Restaurar backup se necessário
4. Contatar equipe de desenvolvimento