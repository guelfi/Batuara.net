# Casa de Caridade Caboclo Batuara

Sistema web completo para a Casa de Caridade Caboclo Batuara, desenvolvido com tecnologias modernas e seguindo as melhores práticas de desenvolvimento.

## 🚀 Início Rápido

### Desenvolvimento Local

```bash
# Iniciar todos os serviços
./server.sh start

# Ver status dos serviços  
./server.sh status

# Ver logs em tempo real
./server.sh logs

# Parar serviços
./server.sh stop

# Reconstruir containers
./server.sh build

# Ajuda
./server.sh help
```

**Acesso aos serviços:**
- 🌐 Website Público: http://localhost:3000
- 🔧 API: http://localhost:8080

### Deploy na Oracle Cloud

```bash
# Deploy automático completo (recomendado)
./oracle-deploy-ready.sh

# Correção rápida (sem clonar repositório)
./oracle-quick-fix.sh

# Diagnóstico de problemas
./diagnose-assets-oracle.sh

# Limpeza de cache
./clear-cache-oracle.sh
```

## 🏗️ Arquitetura

Este projeto segue os princípios de **Clean Architecture** e **Domain-Driven Design (DDD)**, implementando os padrões **SOLID** e práticas de **Clean Code**.

### Estrutura do Projeto

```
Batuara.net/
├── src/
│   ├── Backend/
│   │   ├── Batuara.Domain/          # Camada de Domínio (DDD)
│   │   ├── Batuara.Application/     # Camada de Aplicação (CQRS)
│   │   ├── Batuara.Infrastructure/  # Camada de Infraestrutura
│   │   └── Batuara.API/            # Camada de Apresentação (Web API)
│   └── Frontend/
│       └── PublicWebsite/          # Site público em React
├── scripts/                        # Scripts de banco de dados
├── docs/                          # Documentação
├── tests/                         # Testes automatizados
├── postman/                       # Coleções de API
├── docker-compose.yml             # Configuração dos serviços
├── Dockerfile.frontend            # Build do frontend
├── server.sh                      # Gerenciador de serviços local
├── setup-database.sh              # Configuração do banco
└── ORACLE_DEPLOY_README.md        # Guia de deploy na Oracle
```

## 🛠️ Tecnologias

### Frontend
- **React.js** - Biblioteca para interfaces de usuário
- **Material-UI** - Componentes de interface
- **TypeScript** - Tipagem estática
- **Nginx** - Servidor web

### Backend
- **.NET Core** - Framework web
- **Entity Framework Core** - ORM
- **PostgreSQL** - Banco de dados
- **Docker** - Containerização

### DevOps
- **Docker Compose** - Orquestração de containers
- **Scripts Shell** - Automação de deploy
- **Oracle Cloud** - Hospedagem em produção

## 📋 Funcionalidades

### Website Público
- ✅ Página inicial com informações da casa
- ✅ Seção sobre a história e missão
- ✅ Calendário de eventos e atividades
- ✅ Informações sobre Orixás
- ✅ Guias e entidades espirituais
- ✅ Linhas da Umbanda
- ✅ Orações e conteúdo espiritual
- ✅ Sistema de doações
- ✅ Informações de contato e localização
- ✅ Design responsivo (mobile/desktop)

### API REST
- 🔧 Gerenciamento de conteúdo
- 🔧 Sistema de autenticação
- 🔧 CRUD de entidades espirituais
- 🔧 Gerenciamento de eventos
- 🔧 Sistema de logs

## 🚦 Status do Projeto

- ✅ **Frontend**: Website público funcional
- ✅ **Containerização**: Docker configurado
- ✅ **Deploy**: Scripts automatizados para Oracle
- 🔧 **Backend**: API em desenvolvimento
- 🔧 **Banco de Dados**: Schema em implementação
- 🔧 **Testes**: Suíte de testes em desenvolvimento

## 📖 Documentação

- [Guia de Deploy na Oracle](ORACLE_DEPLOY_README.md) - Instruções completas para deploy
- [Guia de Desenvolvimento](GUIA_DESENVOLVIMENTO.md) - Padrões e práticas do projeto
- [Scripts de Banco](scripts/) - Scripts SQL para configuração do banco

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é desenvolvido para a Casa de Caridade Caboclo Batuara.

## 📞 Contato

Casa de Caridade Caboclo Batuara
- Website: Em desenvolvimento
- Email: contato@batuara.net

---

**Desenvolvido com ❤️ para a comunidade espiritual**