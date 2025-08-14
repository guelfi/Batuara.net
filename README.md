# 🏠 Batuara.net

Casa de Caridade Caboclo Batuara - Sistema completo com website público e dashboard administrativo.

## 🎯 **STATUS ATUAL: FASE 0 CONCLUÍDA ✅**
- **PublicWebsite:** Funcional com header atualizado
- **AdminDashboard:** Interface completa remodelada (aguardando integração com API)
- **Próxima Etapa:** Desenvolvimento da API .NET 8 e integração

📊 **Ver detalhes completos em:** [STATUS-PROJETO.md](docs/STATUS-PROJETO.md)

## 🚀 Instalação Rápida (VPS)

```bash
# Em um VPS Ubuntu/Debian limpo, execute:
wget https://raw.githubusercontent.com/guelfi/Batuara.net/master/install-batuara-vps.sh
chmod +x install-batuara-vps.sh
./install-batuara-vps.sh
```

**Pronto!** Suas aplicações estarão rodando em:
- 📱 **PublicWebsite**: `http://SEU_IP:3000`
- 🔧 **AdminDashboard**: `http://SEU_IP:3001/dashboard`

---

## 🏗️ Arquitetura do Projeto

```
Batuara.net/
├── src/Frontend/
│   ├── PublicWebsite/         # Website público (React + TypeScript)
│   └── AdminDashboard/        # Dashboard admin (React + TypeScript)
├── docs/                      # Documentação completa
├── docker-compose.production.yml  # Deploy em produção
├── Dockerfile.frontend        # Build otimizado para React
├── monitor-assets.sh          # Monitoramento automático
└── install-batuara-vps.sh     # Instalação automatizada
```

## 💻 Desenvolvimento Local

Para desenvolvimento, usamos **ambiente nativo** (sem Docker) para máxima performance:

```bash
# Pré-requisitos: Node.js 18+, npm, Git

# PublicWebsite (Terminal 1)
cd src/Frontend/PublicWebsite
npm install && npm start  # http://localhost:3000

# AdminDashboard (Terminal 2)
cd src/Frontend/AdminDashboard
npm install && npm start  # http://localhost:3001
```

📖 **Guia completo**: [Configuração do Ambiente Local](docs/LOCAL_DEVELOPMENT_SETUP.md)

## 🌐 Aplicações

### 📱 PublicWebsite
Website público da Casa de Caridade com:
- ✨ Design responsivo e moderno
- 📅 Calendário de eventos
- 🙏 Seções sobre Orixás e Umbanda
- 💝 Sistema de doações
- 📍 Localização e contato
- 🎨 Assets otimizados (favicon, logo, imagens)

### 🔧 AdminDashboard
Dashboard administrativo para:
- 📊 Gerenciamento de eventos
- 💰 Controle de doações
- ✏️ Administração de conteúdo
- 📈 Relatórios e estatísticas
- 👥 Gestão de usuários

## 🛠️ Desenvolvimento Local

### Pré-requisitos
- Node.js 18+
- Docker & Docker Compose
- Git

### Instalação Rápida

```bash
# Clonar repositório
git clone https://github.com/guelfi/Batuara.net.git
cd Batuara.net

# PublicWebsite
cd src/Frontend/PublicWebsite
npm install
npm start  # http://localhost:3000

# AdminDashboard (em outro terminal)
cd src/Frontend/AdminDashboard
npm install
npm start  # http://localhost:3001
```

## 🌍 Deploy em Produção

### 🚀 Opção 1: Instalação Automatizada (Recomendado)

```bash
# Execute em qualquer VPS Ubuntu/Debian
curl -sSL https://raw.githubusercontent.com/guelfi/Batuara.net/master/install-batuara-vps.sh | bash
```

### 📖 Opção 2: Instalação Manual

1. **[Guia de Deploy Oracle](docs/DEPLOY.md)** - Deploy na Oracle Cloud Infrastructure
2. **[Scripts de Deploy](docs/ORACLE_DEPLOY_README.md)** - Scripts específicos Oracle
3. **[Guia de Desenvolvimento](docs/GUIA_DESENVOLVIMENTO.md)** - Para iniciantes React

### 🐳 Opção 3: Docker Compose Direto

```bash
# Clonar e configurar
git clone https://github.com/guelfi/Batuara.net.git
cd Batuara.net
cp .env.example .env

# Build e iniciar
docker compose -f docker-compose.production.yml build --no-cache
docker compose -f docker-compose.production.yml up -d

# Verificar
docker compose -f docker-compose.production.yml ps
```

## 📊 Monitoramento e Manutenção

### Monitoramento Automático

```bash
# Executar teste manual
./monitor-assets.sh

# Configurar monitoramento automático (a cada 15 min)
crontab -e
# Adicionar: */15 * * * * /var/www/Batuara.net/monitor-assets.sh >> /var/log/batuara-monitor.log 2>&1

# Ver logs de monitoramento
tail -f /var/log/batuara-monitor.log
```

### Comandos Úteis

```bash
# Status das aplicações
docker compose -f docker-compose.production.yml ps

# Logs em tempo real
docker compose -f docker-compose.production.yml logs -f

# Reiniciar aplicações
docker compose -f docker-compose.production.yml restart

# Atualizar do GitHub
git pull origin master
docker compose -f docker-compose.production.yml build --no-cache
docker compose -f docker-compose.production.yml up -d

# Limpeza do sistema
docker system prune -a
```

## ⚙️ Configuração

### Arquivo .env

```bash
# Portas das aplicações
PUBLIC_WEBSITE_PORT=3000
ADMIN_DASHBOARD_PORT=3001
API_PORT=8080

# URL da API (ajustar para seu IP/domínio)
REACT_APP_API_URL=http://SEU_IP:8080

# Database (futuro)
DB_PASSWORD=sua_senha_segura_aqui

# Ambiente
ENVIRONMENT=production
COMPOSE_PROJECT_NAME=batuara
```

## 🌐 Provedores VPS Suportados

| Provedor | Status | Custo/Mês | Recursos | Observações |
|----------|--------|-----------|----------|-------------|
| 🟢 **Oracle Cloud** | ✅ Testado | **Grátis** | 1GB RAM | Always Free Tier |
| 🟢 **Hostinger** | ✅ Testado | $8 | 2GB RAM | Boa performance |
| 🟢 **DigitalOcean** | ✅ Testado | $12 | 2GB RAM | Documentação excelente |
| 🟢 **AWS EC2** | ✅ Testado | $17 | 2GB RAM | Mais recursos |
| 🟢 **Google Cloud** | ✅ Testado | $15 | 2GB RAM | Créditos iniciais |
| 🟢 **Vultr** | ✅ Testado | $12 | 2GB RAM | Performance sólida |
| 🟢 **Linode** | ✅ Testado | $12 | 2GB RAM | Suporte excelente |

## 🔧 Tecnologias

### Frontend
- **React 18** com TypeScript
- **Material-UI (MUI)** para componentes
- **Responsive Design** para mobile/desktop
- **Assets otimizados** (favicon, logo, imagens)

### Infraestrutura
- **Docker** para containerização
- **Nginx** para servir aplicações
- **UFW** para firewall
- **Cron** para monitoramento automático

### Deploy
- **Docker Compose** para orquestração
- **Multi-stage builds** para otimização
- **Health checks** para monitoramento
- **Auto-restart** para alta disponibilidade

## 📚 Documentação Completa

- 📊 **[Status do Projeto](docs/STATUS-PROJETO.md)** - Fases, cronograma e progresso
- 🚀 **[Deploy Oracle](docs/DEPLOY.md)** - Guia completo de deploy na OCI
- 🛠️ **[Scripts Oracle](docs/ORACLE_DEPLOY_README.md)** - Scripts de deploy e correção
- 💻 **[Setup Local](docs/LOCAL_DEVELOPMENT_SETUP.md)** - Configuração ambiente desenvolvimento
- �  **[Guia Iniciantes](docs/GUIA_DESENVOLVIMENTO.md)** - Para novos desenvolvedores React
- 🗄️ **[Schema do Banco](docs/database-schema.md)** - Estrutura PostgreSQL
- 🌱 **[Dados Iniciais](docs/seed-data.md)** - Seed data da Casa Batuara

## 🚨 Troubleshooting

### Problemas Comuns

```bash
# Aplicação não responde
docker compose -f docker-compose.production.yml restart

# Assets não carregam
./monitor-assets.sh  # Ver diagnóstico detalhado

# Sem espaço em disco
docker system prune -a

# Portas bloqueadas
sudo ufw status
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp

# Containers não iniciam
docker compose -f docker-compose.production.yml logs
```

### Logs Importantes

```bash
# Logs das aplicações
docker compose -f docker-compose.production.yml logs -f

# Logs do sistema
journalctl -u docker.service

# Logs de monitoramento
tail -f /var/log/batuara-monitor.log

# Logs de acesso (se usando nginx)
tail -f /var/log/nginx/access.log
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adicionar NovaFeature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Contato

**Casa de Caridade Caboclo Batuara**
- 🌐 Website: http://129.153.86.168:3000 (Demo)
- 🔧 Admin: http://129.153.86.168:3001/dashboard (Demo)
- 📧 Email: contato@batuara.net
- 📱 GitHub: [@guelfi](https://github.com/guelfi)

---

**Desenvolvido com ❤️ para a Casa de Caridade Caboclo Batuara**

*"Fora da caridade não há salvação"*