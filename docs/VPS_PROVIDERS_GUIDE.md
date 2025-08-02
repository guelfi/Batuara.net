# 🌐 Guia Específico por Provedor VPS - Batuara.net

Este guia contém instruções específicas para diferentes provedores de VPS populares.

## 🏢 Provedores Suportados

- [Hostinger VPS](#hostinger-vps)
- [DigitalOcean](#digitalocean)
- [AWS EC2](#aws-ec2)
- [Google Cloud Platform](#google-cloud-platform)
- [Vultr](#vultr)
- [Linode](#linode)
- [Oracle Cloud](#oracle-cloud)

---

## 🟦 Hostinger VPS

### Configurações Recomendadas
- **Plano**: VPS 2 ou superior (2GB RAM, 2 CPU)
- **OS**: Ubuntu 22.04 LTS
- **Localização**: Mais próxima dos usuários

### Configuração Inicial
```bash
# Conectar via SSH (Hostinger fornece IP, usuário e senha)
ssh root@SEU_IP_HOSTINGER

# Alterar senha root (recomendado)
passwd

# Seguir guia principal de infraestrutura
# Ver: VPS_INFRASTRUCTURE_SETUP.md
```

### Configurações Específicas da Hostinger
```bash
# Hostinger usa algumas configurações específicas
# Verificar se o firewall está desabilitado inicialmente
ufw status

# Configurar timezone (opcional)
timedatectl set-timezone America/Sao_Paulo

# Verificar recursos disponíveis
free -h
df -h
```

### Domínio na Hostinger
```bash
# Se você tem domínio na Hostinger:
# 1. Acesse o painel da Hostinger
# 2. Vá em "Domínios" > "Gerenciar"
# 3. Configure DNS:
#    Tipo: A, Nome: @, Valor: SEU_IP_VPS
#    Tipo: A, Nome: www, Valor: SEU_IP_VPS
#    Tipo: A, Nome: admin, Valor: SEU_IP_VPS
```

---

## 🟦 DigitalOcean

### Configurações Recomendadas
- **Droplet**: Basic, 2GB RAM, 1 CPU ($12/mês)
- **OS**: Ubuntu 22.04 LTS
- **Região**: Mais próxima dos usuários

### Configuração Inicial
```bash
# DigitalOcean cria usuário root por padrão
ssh root@SEU_IP_DIGITALOCEAN

# Criar usuário não-root (recomendado)
adduser batuara
usermod -aG sudo batuara

# Configurar SSH key para novo usuário
rsync --archive --chown=batuara:batuara ~/.ssh /home/batuara
```

### Configurações Específicas do DigitalOcean
```bash
# DigitalOcean tem firewall próprio (Cloud Firewall)
# Configure no painel web ou use UFW localmente

# Instalar agente de monitoramento (opcional)
curl -sSL https://repos.insights.digitalocean.com/install.sh | sudo bash

# Configurar backups automáticos (recomendado)
# Fazer no painel web: Droplet > Backups > Enable
```

---

## 🟦 AWS EC2

### Configurações Recomendadas
- **Instância**: t3.small (2GB RAM, 2 vCPU)
- **AMI**: Ubuntu Server 22.04 LTS
- **Storage**: 20GB GP3
- **Security Group**: Portas 22, 80, 443, 3000, 3001

### Configuração Inicial
```bash
# AWS usa chave SSH por padrão
ssh -i sua-chave.pem ubuntu@SEU_IP_AWS

# Atualizar sistema
sudo apt update && sudo apt upgrade -y
```

### Configurações Específicas da AWS
```bash
# Configurar Security Group via AWS CLI (opcional)
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 3000 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 3001 \
  --cidr 0.0.0.0/0

# Configurar Elastic IP (recomendado para produção)
# Fazer no console AWS: EC2 > Elastic IPs > Allocate
```

---

## 🟦 Google Cloud Platform

### Configurações Recomendadas
- **Máquina**: e2-small (2GB RAM, 1 vCPU)
- **OS**: Ubuntu 22.04 LTS
- **Disco**: 20GB SSD persistente
- **Região**: Mais próxima dos usuários

### Configuração Inicial
```bash
# GCP usa SSH via browser ou gcloud CLI
gcloud compute ssh sua-instancia --zone=sua-zona

# Ou via SSH tradicional (configurar chave primeiro)
ssh -i ~/.ssh/gcp-key usuario@SEU_IP_GCP
```

### Configurações Específicas do GCP
```bash
# Configurar firewall via gcloud
gcloud compute firewall-rules create allow-batuara-ports \
  --allow tcp:3000,tcp:3001 \
  --source-ranges 0.0.0.0/0 \
  --description "Portas para Batuara.net"

# Configurar IP estático
gcloud compute addresses create batuara-ip --region=sua-regiao
```

---

## 🟦 Vultr

### Configurações Recomendadas
- **Plano**: Regular Performance, 2GB RAM ($12/mês)
- **OS**: Ubuntu 22.04 x64
- **Localização**: Mais próxima dos usuários

### Configuração Inicial
```bash
# Vultr fornece acesso root
ssh root@SEU_IP_VULTR

# Seguir guia principal
# Ver: VPS_INFRASTRUCTURE_SETUP.md
```

### Configurações Específicas da Vultr
```bash
# Vultr tem firewall próprio
# Configure no painel: Settings > Firewall

# Habilitar backups automáticos (opcional)
# Configurar no painel: Settings > Backups
```

---

## 🟦 Linode

### Configurações Recomendadas
- **Plano**: Nanode 2GB ($12/mês)
- **OS**: Ubuntu 22.04 LTS
- **Região**: Mais próxima dos usuários

### Configuração Inicial
```bash
# Linode fornece acesso root
ssh root@SEU_IP_LINODE

# Configurar hostname
hostnamectl set-hostname batuara-server
```

### Configurações Específicas da Linode
```bash
# Configurar Linode Firewall (Cloud Firewall)
# No painel: Networking > Firewalls

# Configurar backups (recomendado)
# No painel: Linodes > sua-instancia > Backups
```

---

## 🟦 Oracle Cloud

### Configurações Recomendadas
- **Shape**: VM.Standard.E2.1.Micro (Always Free)
- **OS**: Ubuntu 22.04
- **Boot Volume**: 50GB

### Configuração Inicial
```bash
# Oracle Cloud usa usuário ubuntu por padrão
ssh -i sua-chave-oracle.key ubuntu@SEU_IP_ORACLE

# Configurar iptables (Oracle usa iptables por padrão)
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3000 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3001 -j ACCEPT
sudo netfilter-persistent save
```

### Configurações Específicas da Oracle
```bash
# Oracle Cloud tem Security Lists
# Configure no painel: Networking > Virtual Cloud Networks > Security Lists

# Regras necessárias:
# - Ingress: TCP 3000 (Source: 0.0.0.0/0)
# - Ingress: TCP 3001 (Source: 0.0.0.0/0)

# Desabilitar firewall local se usar Security Lists
sudo ufw disable
```

---

## 🔧 Configurações Comuns para Todos os Provedores

### 1. Após Configurar o Servidor

```bash
# Executar em qualquer provedor após configuração inicial
cd /var/www
git clone https://github.com/guelfi/Batuara.net.git
cd Batuara.net

# Seguir guia de deploy
# Ver: VPS_APPLICATION_DEPLOY.md
```

### 2. Teste de Conectividade

```bash
# Testar se as portas estão abertas (executar do seu computador)
telnet SEU_IP_VPS 3000
telnet SEU_IP_VPS 3001

# Ou usar nmap
nmap -p 3000,3001 SEU_IP_VPS
```

### 3. Configuração de Domínio (Qualquer Provedor)

```bash
# Configurar DNS no seu provedor de domínio:
# Tipo: A, Nome: @, Valor: SEU_IP_VPS
# Tipo: A, Nome: www, Valor: SEU_IP_VPS  
# Tipo: A, Nome: admin, Valor: SEU_IP_VPS

# Aguardar propagação DNS (pode demorar até 48h)
# Testar: nslookup seudominio.com
```

---

## 💰 Comparação de Custos (Aproximados)

| Provedor | Plano Recomendado | RAM | CPU | Preço/Mês |
|----------|-------------------|-----|-----|------------|
| Hostinger | VPS 2 | 2GB | 2 | $8 |
| DigitalOcean | Basic Droplet | 2GB | 1 | $12 |
| AWS EC2 | t3.small | 2GB | 2 | $17 |
| Google Cloud | e2-small | 2GB | 1 | $15 |
| Vultr | Regular Performance | 2GB | 1 | $12 |
| Linode | Nanode | 2GB | 1 | $12 |
| Oracle Cloud | Always Free | 1GB | 1 | $0 |

*Preços podem variar. Verificar sites oficiais para valores atuais.*

---

## 🚨 Troubleshooting por Provedor

### Hostinger
- **Problema**: SSH não conecta
- **Solução**: Verificar se usou IP e credenciais corretas do painel

### DigitalOcean
- **Problema**: Droplet não responde
- **Solução**: Verificar Cloud Firewall no painel

### AWS
- **Problema**: Não consegue acessar aplicação
- **Solução**: Verificar Security Groups e NACLs

### Google Cloud
- **Problema**: Firewall bloqueando
- **Solução**: Verificar regras de firewall no console

### Vultr
- **Problema**: Performance baixa
- **Solução**: Considerar upgrade para High Performance

### Linode
- **Problema**: Backup não funciona
- **Solução**: Habilitar backups no painel

### Oracle Cloud
- **Problema**: Portas bloqueadas
- **Solução**: Configurar Security Lists e iptables

---

## 📞 Suporte por Provedor

- **Hostinger**: Chat 24/7, tickets
- **DigitalOcean**: Tickets, documentação extensa
- **AWS**: Support plans pagos, fóruns
- **Google Cloud**: Support plans pagos, documentação
- **Vultr**: Tickets, documentação
- **Linode**: Tickets, guias detalhados
- **Oracle Cloud**: Tickets, documentação

---

**Criado para**: Projeto Batuara.net  
**Última atualização**: Agosto 2025