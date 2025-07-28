# 🚀 Batuara.net - Script de Gerenciamento de Serviços

Este script permite iniciar, parar e monitorar todos os serviços do projeto Batuara.net de forma elegante e automatizada, sem a necessidade da IDE do Kiro.

## ✨ Características

- **Interface elegante** com cores e emojis
- **Gerenciamento automático** de portas e processos
- **Logs detalhados** para debugging
- **Verificação de dependências** automática
- **Controle completo** dos serviços via linha de comando

## 📋 Pré-requisitos

Certifique-se de ter instalado:

- **Node.js** (para os frontends)
- **npm** (gerenciador de pacotes)
- **.NET Core** (para a API backend)
- **lsof** (para verificação de portas - geralmente já instalado no macOS)

## 🎯 Comandos Disponíveis

### Iniciar todos os serviços
```bash
./servers.sh start
```
- Inicia todos os três serviços simultaneamente
- Verifica e libera portas ocupadas automaticamente
- Exibe informações de acesso e URLs
- Mantém o script ativo para monitoramento
- Use `Ctrl+C` para parar todos os serviços

### Parar todos os serviços
```bash
./servers.sh stop
```
- Para todos os serviços em execução
- Libera todas as portas utilizadas
- Limpa arquivos temporários e logs

### Verificar status
```bash
./servers.sh status
```
- Mostra o status atual de todos os serviços
- Exibe PIDs e portas utilizadas
- Identifica serviços ativos/inativos

### Exibir ajuda
```bash
./servers.sh help
# ou
./servers.sh --help
# ou
./servers.sh -h
```

## 🌐 Serviços Gerenciados

| Serviço | Porta | URL | Descrição |
|---------|-------|-----|-----------|
| **Batuara.API** | 3003 | http://localhost:3003 | API Backend do sistema |
| **AdminDashboard** | 3001 | http://localhost:3001 | Painel Administrativo |
| **PublicWebsite** | 3000 | http://localhost:3000 | Website Público |

## 📁 Estrutura de Diretórios

O script espera a seguinte estrutura a partir do diretório `src/`:

```
src/
├── servers.sh
├── Backend/
│   └── Batuara.API/
└── Frontend/
    ├── AdminDashboard/
    └── PublicWebsite/
```

## 📝 Logs e Debugging

- **Logs automáticos**: Cada serviço gera logs em `/tmp/batuara_[serviço]_[timestamp].log`
- **Arquivo de serviços**: Lista de serviços ativos em `/tmp/batuara_services.tmp`
- **Limpeza automática**: Logs são removidos ao parar os serviços

## 🔧 Solução de Problemas

### Porta já em uso
O script automaticamente identifica e finaliza processos que estejam usando as portas necessárias.

### Dependências não encontradas
Execute o comando desejado e o script informará quais dependências estão faltando.

### Serviço não inicia
Verifique o log específico do serviço em `/tmp/batuara_[serviço]_*.log` para detalhes do erro.

### Permissões
Certifique-se de que o script tem permissão de execução:
```bash
chmod +x servers.sh
```

## 🎨 Exemplo de Uso Completo

```bash
# Verificar status inicial
./servers.sh status

# Iniciar todos os serviços
./servers.sh start

# Em outro terminal, verificar se estão rodando
./servers.sh status

# Parar todos os serviços quando terminar
./servers.sh stop
```

## 🌟 Dicas

- **Acesso em rede**: O script exibe URLs para acesso local e em rede
- **Desenvolvimento**: Ideal para testes sem a IDE
- **Produtividade**: Inicia todo o ambiente com um único comando
- **Monitoramento**: Mantém controle visual dos serviços ativos

---

**Desenvolvido para o projeto Batuara.net** 🏛️✨