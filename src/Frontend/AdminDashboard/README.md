# Dashboard Administrativo - Casa de Caridade Batuara

Dashboard administrativo para gerenciamento do conteúdo e funcionalidades da Casa de Caridade Batuara.

## Funcionalidades

### ✅ Implementadas
- **Autenticação**: Sistema de login com JWT e proteção de rotas
- **Dashboard**: Visão geral com estatísticas e atividade recente
- **Layout Responsivo**: Interface adaptável para desktop e mobile
- **Navegação**: Menu lateral com todas as seções administrativas
- **Tema Consistente**: Design alinhado com o site público

### 🚧 Em Desenvolvimento
- **Gerenciamento de Eventos**: CRUD completo para eventos
- **Calendário**: Interface para gerenciar horários de atendimento
- **Orixás**: Gerenciamento de informações sobre os Orixás
- **Linhas de Umbanda**: Administração das linhas espirituais
- **Conteúdo Espiritual**: Editor para orações e ensinamentos

## Tecnologias Utilizadas

- **React 18** com TypeScript
- **Material-UI v5** para componentes e tema
- **React Router v6** para navegação
- **React Hook Form** para formulários
- **TanStack Query** para gerenciamento de estado
- **Axios** para comunicação com API
- **Date-fns** para manipulação de datas

## Estrutura do Projeto

```
src/
├── components/
│   ├── common/          # Componentes reutilizáveis
│   └── layout/          # Layout e navegação
├── contexts/            # Contextos React (Auth, etc.)
├── pages/              # Páginas da aplicação
├── services/           # Serviços de API
├── theme/              # Configuração do tema
├── types/              # Definições de tipos TypeScript
├── App.tsx             # Componente principal
└── index.tsx           # Ponto de entrada
```

## Como Executar

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente**:
   Criar arquivo `.env` com:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. **Executar em desenvolvimento**:
   ```bash
   npm start
   ```

4. **Build para produção**:
   ```bash
   npm run build
   ```

## Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação:

- **Login**: Endpoint `/api/auth/login`
- **Logout**: Endpoint `/api/auth/logout`
- **Verificação**: Endpoint `/api/auth/verify`
- **Refresh**: Endpoint `/api/auth/refresh`

### Roles de Usuário

- **Admin (0)**: Acesso completo a todas as funcionalidades
- **Moderator (1)**: Acesso limitado a algumas funcionalidades
- **Editor (2)**: Acesso apenas para edição de conteúdo

## Páginas Principais

### Dashboard (`/dashboard`)
- Estatísticas gerais do sistema
- Atividade recente dos usuários
- Resumo rápido de próximos eventos

### Eventos (`/events`)
- Lista de todos os eventos
- Criação e edição de eventos
- Gerenciamento de status (ativo/inativo)
- Mobile: listagem compacta com bullet (badge) indicando o tipo do evento ao lado da data
- Paleta: cores de tipo alinhadas ao Calendário do site público via variáveis CSS `--batuara-calendar-event-*` definidas no tema

### Calendário (`/calendar`)
- Visualização em calendário
- Gerenciamento de horários de atendimento
- Controle de capacidade e inscrições

### Orixás (`/orixas`)
- Informações sobre os Orixás
- Ensinamentos específicos da casa
- Características, cores e elementos

### Linhas de Umbanda (`/umbanda-lines`)
- Gerenciamento das linhas espirituais
- Entidades e dias de trabalho
- Interpretações da casa

### Conteúdo Espiritual (`/spiritual-content`)
- Orações e preces
- Ensinamentos e estudos
- Sistema de categorização

## Segurança

- Todas as rotas são protegidas por autenticação
- Verificação de roles para acesso a funcionalidades específicas
- Tokens JWT com expiração automática
- Interceptors para tratamento de erros de autenticação

## Próximos Passos

1. **Implementar CRUD completo** para todas as entidades
2. **Adicionar validações** nos formulários
3. **Implementar upload de imagens** para eventos e conteúdo
4. **Adicionar sistema de notificações** em tempo real
5. **Implementar auditoria** de ações dos usuários
6. **Adicionar testes unitários** e de integração

## Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento da Casa de Caridade Batuara.
