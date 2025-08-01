# 🔧 Correção do Deploy Batuara.net

## Problemas Identificados:
1. **Arquivo index.html ausente** na pasta `public` dos projetos React
2. **Contexto Docker incorreto** no docker-compose.yml
3. **Dockerfile inadequado** para projetos React

## Solução Rápida:

### 1. Execute o script de correção no servidor:

```bash
# No servidor, na pasta /var/www/batuara_net
wget https://raw.githubusercontent.com/guelfi/Batuara.net/master/fix-deploy.sh
chmod +x fix-deploy.sh
./fix-deploy.sh
```

### 2. Ou execute manualmente:

```bash
cd /var/www/batuara_net

# Criar index.html para PublicWebsite
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

# Criar index.html para AdminDashboard
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

# Usar os arquivos corrigidos
cp docker-compose-fixed.yml docker-compose.yml
cp Dockerfile.frontend .

# Tentar novamente
docker-compose build --no-cache
docker-compose up -d
```

### 3. Verificar resultado:
```bash
docker-compose logs -f
docker ps
```

## Arquivos Criados:
- `fix-deploy.sh` - Script automático de correção
- `docker-compose-fixed.yml` - Docker compose corrigido
- `Dockerfile.frontend` - Dockerfile otimizado para React