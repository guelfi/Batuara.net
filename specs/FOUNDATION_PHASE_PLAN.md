# Plano de Implementação - Fase Fundação (API & Integração)

## 🎯 Objetivo
Implementar a infraestrutura backend (.NET 8) necessária para suportar as funcionalidades principais do sistema e transformar o PublicWebsite em uma aplicação totalmente gerenciável via CMS (AdminDashboard).

## 📋 Escopo Expandido (CMS Completo)

### 1. Gestão de Eventos e Calendário
- **Backend**: CRUD de Eventos, endpoints de listagem por período.
- **Frontend Admin**: Integrar tela de Gestão de Eventos.
- **Frontend Public**: Integrar Calendário na Home (`CalendarSection`, `EventsSection`).

### 2. Conteúdo Espiritual (CMS)
- **Backend**: CRUD de Orixás, Linhas, Guias/Entidades, Orações e Sobre a Umbanda.
- **Frontend Admin**: Telas de gestão para cada tipo de conteúdo.
- **Frontend Public**: Tornar dinâmicas as seções:
    - `OrixasSection`
    - `UmbandaSection`
    - `GuiasEntidadesSection`
    - `PrayersSection`

### 3. Conteúdo Institucional (CMS)
- **Backend**: Endpoint de Configurações Gerais (Singleton) ou tabela de Conteúdo Estático.
- **Frontend Admin**: Tela de "Configurações do Site" ou "Páginas Institucionais".
- **Frontend Public**: Tornar dinâmicas as seções:
    - `HeroSection` (Banners, Textos de boas-vindas)
    - `AboutSection` (História, Missão)
    - `LocationSection` (Endereço, Horários)
    - `ContactSection` (Email, Telefone, Redes Sociais)
    - `DonationsSection` (Chaves PIX, QR Codes)

### 4. Gestão de Membros (Filhos da Casa)
- **Backend**: CRUD de Membros.
- **Frontend Admin**: Integrar nova tela de "Filhos da Casa".

## 🛠️ Detalhes Técnicos

### Backend (.NET 8)
Seguindo o padrão Clean Architecture já estabelecido:
- **Application**: `[Feature]/Models` (DTOs) e `[Feature]/Services` (Interfaces).
- **Infrastructure**: `[Feature]/Services` (Implementações) e Repositories.
- **API**: Controllers novos (`EventsController`, `SpiritualContentController`, `MembersController`, `SiteSettingsController`).

#### Estrutura de Pastas Proposta
```
src/Backend/
├── Batuara.Application/
│   ├── Events/
│   ├── SpiritualContent/
│   ├── Members/
│   └── SiteSettings/
├── Batuara.Infrastructure/
│   ├── Events/
│   ├── SpiritualContent/
│   ├── Members/
│   └── SiteSettings/
└── Batuara.API/Controllers/
    ├── EventsController.cs
    ├── SpiritualContentController.cs
    ├── MembersController.cs
    └── SiteSettingsController.cs
```

### Frontend (React)
- Criar/Atualizar Services em `src/services/` para consumir os novos endpoints.
- Remover mocks e conectar componentes ao `TanStack Query`.
- Criar Contexto ou Hook global para `SiteSettings` (carregar configurações no boot da aplicação).

## 📅 Etapas de Execução

### Etapa 1: Backend - Eventos e Calendário
1.  Criar DTOs e Interfaces em `Application/Events`.
2.  Implementar Services em `Infrastructure/Events`.
3.  Criar `EventsController`.
4.  Testar via Swagger.

### Etapa 2: Frontend - Integração de Eventos
1.  Atualizar `eventService.ts` no Admin e Public.
2.  Integrar tela de Eventos no Admin.
3.  Integrar Calendário no PublicWebsite.

### Etapa 3: Backend - Conteúdo Espiritual
1.  Criar DTOs/Services para Orixás e Linhas.
2.  Criar `SpiritualContentController`.

### Etapa 4: Frontend - Integração de Conteúdo
1.  Atualizar services de conteúdo.
2.  Integrar telas de gestão e visualização pública.

### Etapa 5: CMS Institucional (Hero, Sobre, Contato)
1.  Criar entidade `SiteSetting` (Key/Value) ou `PageContent`.
2.  Criar `SiteSettingsController`.
3.  Criar tela de gestão no Admin.
4.  Conectar seções do PublicWebsite.

### Etapa 6: Deploy
1.  Gerar nova build Docker.
2.  Atualizar servidor Oracle.

## 🔍 Pontos de Atenção
- **Imagens**: Onde serão salvas as imagens de Orixás/Eventos? (Banco, Sistema de Arquivos ou Blob Storage?). *Decisão inicial: Banco (Base64) ou Volume Docker mapeado.*
- **Cache**: Conteúdo institucional muda pouco. Implementar cache agressivo no backend ou frontend?

## ✅ Critérios de Aceite
- [ ] Admin consegue editar TODOS os textos e imagens do site público.
- [ ] Site público carrega conteúdo dinamicamente sem "flicker" excessivo.
- [ ] Performance mantém-se alta (Lighthouse > 90).
