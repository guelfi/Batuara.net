# 🚀 GitHub Actions - Deploy Automático para OCI

> **Baseado nas práticas bem-sucedidas do projeto MobileMed**

Este sistema de deploy automático foi desenvolvido utilizando as melhores práticas identificadas no projeto MobileMed, que possui uma implementação robusta e confiável de GitHub Actions para Oracle Cloud Infrastructure.

Este diretório contém os workflows do GitHub Actions para automatizar o processo de CI/CD do projeto Batuara.net.

## 📋 Workflows Disponíveis

### 1. `deploy-oci.yml` - Deploy para Produção
**Trigger**: Push para `main` ou `master`

**Etapas**:
1. **Build e Testes** - Compila e testa backend (.NET) e frontend (React)
2. **Build de Imagens** - Cria imagens Docker e publica no GitHub Container Registry
3. **Deploy na OCI** - Faz deploy automático no servidor Oracle Cloud
4. **Notificação** - Informa o status do deploy

### 2. `ci.yml` - Integração Contínua
**Trigger**: Pull requests e pushes para branches de desenvolvimento

**Etapas**:
1. **Lint e Formatação** - Verifica padrões de código
2. **Scan de Segurança** - Analisa vulnerabilidades com Trivy
3. **Testes Backend** - Executa testes unitários e de integração
4. **Testes Frontend** - Executa testes dos componentes React
5. **Build de Teste** - Valida se as imagens Docker são criadas corretamente
6. **Validação de Configuração** - Verifica arquivos de deploy

## 🔐 Configuração de Secrets

Para que os workflows funcionem corretamente, você precisa configurar os seguintes secrets no GitHub:

### Secrets Obrigatórios

1. **`OCI_SERVER_IP`** - IP público do servidor Oracle Cloud
   ```
   Exemplo: 123.456.789.012
   ```

2. **`OCI_SERVER_USER`** - Usuário SSH do servidor (geralmente `ubuntu` ou `opc`)
   ```
   Exemplo: ubuntu
   ```

3. **`OCI_SSH_PRIVATE_KEY`** - Chave SSH privada para acesso ao servidor
   ```
   -----BEGIN OPENSSH PRIVATE KEY-----
   [conteúdo da chave privada]
   -----END OPENSSH PRIVATE KEY-----
   ```

4. **`DB_PASSWORD`** - Senha do banco de dados PostgreSQL
   ```
   Exemplo: senha_segura_postgres
   ```

### Secrets Opcionais

5. **`OCI_SSH_PORT`** - Porta SSH (padrão: 22)
   ```
   Exemplo: 22
   ```

6. **`GITHUB_TOKEN`** - Token para acesso ao GitHub Container Registry (configurado automaticamente)

## ⚙️ Como Configurar os Secrets

1. Acesse seu repositório no GitHub
2. Vá em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**
4. Adicione cada secret com o nome exato listado acima

## 🏗️ Estrutura do Deploy (Baseado no MobileMed)

O deploy automático realiza as seguintes ações no servidor OCI:

1. **Backup Automático** - Cria backup completo do projeto atual com timestamp
2. **Parada Segura** - Para containers existentes com timeout configurável
3. **Atualização de Código** - Clona a versão mais recente via Git
4. **Build e Registry** - Baixa as imagens Docker do GitHub Container Registry
5. **Deploy Controlado** - Inicia os serviços com docker-compose
6. **Health Checks Robustos** - Testa conectividade e funcionalidade com retry
7. **Rollback Automático** - Restaura versão anterior em caso de falha
8. **Configuração Nginx** - Atualiza proxy reverso se configurado

## 🌐 Serviços Deployados

Após o deploy bem-sucedido, os seguintes serviços estarão disponíveis:

### Acesso Direto (Portas):
- **Website Público**: `http://[OCI_SERVER_IP]:3000`
- **Dashboard Admin**: `http://[OCI_SERVER_IP]:3001`
- **API Backend**: `http://[OCI_SERVER_IP]:8080`

### Acesso via Nginx (Recomendado):
- **Website Público**: `http://[OCI_SERVER_IP]/`
- **Dashboard Admin**: `http://[OCI_SERVER_IP]/admin`
- **API Backend**: `http://[OCI_SERVER_IP]/api/`

### Health Checks:
- **API Health**: `http://[OCI_SERVER_IP]:8080/health`
- **Nginx Status**: `http://[OCI_SERVER_IP]/nginx_status` (se configurado)

## 🔧 Troubleshooting

### Deploy Falhou?

1. **Verifique os logs** do workflow no GitHub Actions
2. **Acesse o servidor** via SSH e verifique:
   ```bash
   cd /home/ubuntu/batuara
   docker-compose ps
   docker-compose logs
   ```
3. **Execute health check**: `./scripts/oracle/health-check.sh full`

### Problemas Comuns

- **Erro de SSH**: Verifique se a chave privada está no formato OpenSSH correto
- **Erro de Docker**: Verifique se o Docker está instalado e o usuário tem permissões
- **Health Check Falha**: O sistema executa rollback automático - verifique backup
- **Erro de Permissões**: Certifique-se de que o usuário SSH tem permissões para executar Docker
- **Porta em Uso**: Verifique se as portas 3000, 3001, 8080 estão disponíveis

### Scripts de Diagnóstico (Baseados no MobileMed)

No servidor, você pode usar os scripts de diagnóstico:

```bash
# Health check completo
./scripts/oracle/health-check.sh full

# Diagnóstico completo
./scripts/oracle/diagnose-assets-oracle.sh

# Limpeza de cache
./scripts/oracle/clear-cache-oracle.sh

# Deploy manual (se necessário)
./scripts/oracle/oracle-deploy-ready.sh

# Restaurar backup
cp -r /home/ubuntu/backups/batuara_backup_YYYYMMDD_HHMMSS/* /home/ubuntu/batuara/
```

### Rollback Automático

Em caso de falha nos health checks, o sistema:
1. Para os novos containers
2. Restaura o backup anterior automaticamente
3. Reinicia os serviços da versão estável
4. Registra logs detalhados da falha

## 📚 Documentação Adicional

- [Configuração do Servidor OCI](../docs/DEPLOY.md)
- [Scripts Oracle](../docs/ORACLE_DEPLOY_README.md)
- [Guia de Desenvolvimento](../docs/GUIA_DESENVOLVIMENTO.md)

## 🤝 Contribuindo

Para contribuir com melhorias nos workflows:

1. Crie uma branch de feature
2. Faça suas alterações
3. Teste localmente quando possível
4. Abra um Pull Request

Os workflows de CI irão validar automaticamente suas alterações antes do merge.

---

**Nota**: Este sistema de deploy foi configurado especificamente para Oracle Cloud Infrastructure. Para outros provedores, ajustes nos workflows podem ser necessários.