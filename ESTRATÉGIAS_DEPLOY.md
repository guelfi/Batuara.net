# 🚀 Estratégias de Deploy Batuara.net

## Sobre Acesso SSH

**⚠️ IMPORTANTE**: Não posso acessar diretamente seu servidor via SSH por questões de segurança. Você precisará executar os comandos localmente no servidor.

## 📋 Estratégias Disponíveis

### 🎯 Estratégia 1: Correção Automática (RECOMENDADA)

**Melhor para**: Correção rápida dos problemas identificados

```bash
# No servidor, na pasta /var/www/batuara_net
chmod +x batuara-deploy-fixer.sh
./batuara-deploy-fixer.sh
```

**O que faz**:
- ✅ Cria arquivos index.html ausentes
- ✅ Corrige docker-compose.yml
- ✅ Cria Dockerfile otimizado
- ✅ Faz backup automático
- ✅ Valida configurações

### 🔧 Estratégia 2: Configuração Dinâmica

**Melhor para**: Deploy em novo servidor ou reconfiguração completa

```bash
# 1. Gerar configurações automáticas
chmod +x deploy-config-generator.sh
./deploy-config-generator.sh

# 2. Aplicar correções
chmod +x batuara-deploy-fixer.sh
./batuara-deploy-fixer.sh

# 3. Executar deploy
docker-compose build --no-cache
docker-compose up -d
```

### 📝 Estratégia 3: Manual (Para Troubleshooting)

**Melhor para**: Quando você quer controle total sobre cada etapa

#### Passo 1: Criar index.html para PublicWebsite
```bash
mkdir -p src/Frontend/PublicWebsite/public
cat > src/Frontend/PublicWebsite/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Casa de Caridade Caboclo Batuara</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>
EOF
```

#### Passo 2: Criar index.html para AdminDashboard
```bash
mkdir -p src/Frontend/AdminDashboard/public
cat > src/Frontend/AdminDashboard/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Batuara Admin</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>
EOF
```

#### Passo 3: Usar docker-compose corrigido
```bash
cp docker-compose-fixed.yml docker-compose.yml
cp Dockerfile.frontend .
```

#### Passo 4: Executar deploy
```bash
docker-compose build --no-cache
docker-compose up -d
```

## 🔄 Em Caso de Problemas

### Rollback Automático
```bash
# Se algo der errado, use o rollback
./rollback-deploy.sh ./deploy-backups/[TIMESTAMP]
```

### Logs Detalhados
```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f public-website
docker-compose logs -f api
```

### Limpeza Completa
```bash
# Parar tudo e limpar
docker-compose down --volumes --remove-orphans
docker system prune -af
```

## 📊 Validação Pós-Deploy

### Verificar Status dos Containers
```bash
docker ps
```

### Testar Conectividade
```bash
# Testar API
curl http://localhost:8080/health

# Testar frontend (substitua pelo seu IP)
curl http://SEU_IP:8003
curl http://SEU_IP:8004
```

### Verificar Logs de Saúde
```bash
docker-compose ps
```

## 🎯 Recomendação Final

**Para sua situação atual**, recomendo a **Estratégia 1** (Correção Automática):

1. Copie os arquivos criados para o servidor
2. Execute o script de correção
3. Faça o deploy normalmente

Isso resolverá o problema do `index.html` ausente e outros problemas identificados de forma automática e segura.