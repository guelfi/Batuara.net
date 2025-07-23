# Esquema do Banco de Dados - Casa de Caridade Batuara

## Visão Geral

O banco de dados da Casa de Caridade Batuara foi projetado seguindo os princípios de Domain-Driven Design (DDD) e Clean Architecture. Utiliza PostgreSQL como SGBD e está organizado no schema `batuara`.

## Estrutura das Tabelas

### 1. Events (Eventos)

Armazena informações sobre eventos, festas e celebrações da casa.

**Campos:**
- `Id` (SERIAL PRIMARY KEY) - Identificador único
- `Title` (VARCHAR(200)) - Título do evento
- `Description` (VARCHAR(2000)) - Descrição detalhada
- `Date` (TIMESTAMP WITH TIME ZONE) - Data do evento
- `StartTime` (INTERVAL) - Horário de início (opcional)
- `EndTime` (INTERVAL) - Horário de término (opcional)
- `Type` (INTEGER) - Tipo do evento
- `ImageUrl` (VARCHAR(500)) - URL da imagem (opcional)
- `Location` (VARCHAR(300)) - Local do evento (opcional)
- `CreatedAt` (TIMESTAMP WITH TIME ZONE) - Data de criação
- `UpdatedAt` (TIMESTAMP WITH TIME ZONE) - Data de atualização
- `IsActive` (BOOLEAN) - Status ativo/inativo

**Tipos de Evento:**
- 1 = Festa
- 2 = Evento
- 3 = Celebração
- 4 = Bazar
- 5 = Palestra

**Índices:**
- `IX_Events_IsActive` - Para consultas por status
- `IX_Events_Type` - Para consultas por tipo
- `IX_Events_IsActive_Type` - Para consultas combinadas

### 2. CalendarAttendances (Calendário de Atendimentos)

Gerencia o calendário de atendimentos de Kardecismo e Umbanda.

**Campos:**
- `Id` (SERIAL PRIMARY KEY) - Identificador único
- `Date` (TIMESTAMP WITH TIME ZONE) - Data do atendimento
- `StartTime` (INTERVAL) - Horário de início
- `EndTime` (INTERVAL) - Horário de término
- `Type` (INTEGER) - Tipo de atendimento
- `Description` (VARCHAR(500)) - Descrição (opcional)
- `Observations` (VARCHAR(1000)) - Observações (opcional)
- `RequiresRegistration` (BOOLEAN) - Requer inscrição
- `MaxCapacity` (INTEGER) - Capacidade máxima (opcional)
- `CreatedAt` (TIMESTAMP WITH TIME ZONE) - Data de criação
- `UpdatedAt` (TIMESTAMP WITH TIME ZONE) - Data de atualização
- `IsActive` (BOOLEAN) - Status ativo/inativo

**Tipos de Atendimento:**
- 1 = Kardecismo
- 2 = Umbanda
- 3 = Palestra
- 4 = Curso

**Índices:**
- `IX_CalendarAttendances_IsActive` - Para consultas por status
- `IX_CalendarAttendances_Type` - Para consultas por tipo
- `IX_CalendarAttendances_IsActive_Type` - Para consultas combinadas

### 3. Orixas

Armazena informações sobre os Orixás conforme os ensinamentos da Casa Batuara.

**Campos:**
- `Id` (SERIAL PRIMARY KEY) - Identificador único
- `Name` (VARCHAR(100)) - Nome do Orixá
- `Description` (VARCHAR(5000)) - Descrição geral
- `Origin` (VARCHAR(1000)) - Origem e história
- `BatuaraTeaching` (VARCHAR(5000)) - Ensinamentos específicos da Casa Batuara
- `ImageUrl` (VARCHAR(500)) - URL da imagem (opcional)
- `DisplayOrder` (INTEGER) - Ordem de exibição
- `Characteristics` (JSONB) - Características em formato JSON
- `Colors` (JSONB) - Cores associadas em formato JSON
- `Elements` (JSONB) - Elementos associados em formato JSON
- `CreatedAt` (TIMESTAMP WITH TIME ZONE) - Data de criação
- `UpdatedAt` (TIMESTAMP WITH TIME ZONE) - Data de atualização
- `IsActive` (BOOLEAN) - Status ativo/inativo

**Índices:**
- `IX_Orixas_Name` (UNIQUE) - Nome único para registros ativos
- `IX_Orixas_IsActive` - Para consultas por status
- `IX_Orixas_DisplayOrder` - Para ordenação
- `IX_Orixas_IsActive_DisplayOrder` - Para consultas ordenadas
- `IX_Orixas_Name_Description` - Para busca textual

### 4. UmbandaLines (Linhas da Umbanda)

Armazena informações sobre as linhas da Umbanda conforme a interpretação da Casa Batuara.

**Campos:**
- `Id` (SERIAL PRIMARY KEY) - Identificador único
- `Name` (VARCHAR(100)) - Nome da linha
- `Description` (VARCHAR(5000)) - Descrição da linha
- `Characteristics` (VARCHAR(3000)) - Características da linha
- `BatuaraInterpretation` (VARCHAR(5000)) - Interpretação específica da Casa Batuara
- `DisplayOrder` (INTEGER) - Ordem de exibição
- `Entities` (JSONB) - Entidades da linha em formato JSON
- `WorkingDays` (JSONB) - Dias de trabalho em formato JSON
- `CreatedAt` (TIMESTAMP WITH TIME ZONE) - Data de criação
- `UpdatedAt` (TIMESTAMP WITH TIME ZONE) - Data de atualização
- `IsActive` (BOOLEAN) - Status ativo/inativo

**Índices:**
- `IX_UmbandaLines_Name` (UNIQUE) - Nome único para registros ativos
- `IX_UmbandaLines_IsActive` - Para consultas por status
- `IX_UmbandaLines_DisplayOrder` - Para ordenação
- `IX_UmbandaLines_IsActive_DisplayOrder` - Para consultas ordenadas
- `IX_UmbandaLines_Name_Description` - Para busca textual

### 5. SpiritualContents (Conteúdos Espirituais)

Armazena orações, ensinamentos, doutrinas e outros conteúdos espirituais.

**Campos:**
- `Id` (SERIAL PRIMARY KEY) - Identificador único
- `Title` (VARCHAR(200)) - Título do conteúdo
- `Content` (VARCHAR(10000)) - Conteúdo completo
- `Type` (INTEGER) - Tipo de conteúdo
- `Category` (INTEGER) - Categoria do conteúdo
- `Source` (VARCHAR(200)) - Fonte do conteúdo
- `DisplayOrder` (INTEGER) - Ordem de exibição
- `IsFeatured` (BOOLEAN) - Conteúdo em destaque
- `CreatedAt` (TIMESTAMP WITH TIME ZONE) - Data de criação
- `UpdatedAt` (TIMESTAMP WITH TIME ZONE) - Data de atualização
- `IsActive` (BOOLEAN) - Status ativo/inativo

**Tipos de Conteúdo:**
- 1 = Oração
- 2 = Ensinamento
- 3 = Doutrina
- 4 = Ponto Cantado
- 5 = Ritual

**Categorias:**
- 1 = Umbanda
- 2 = Kardecismo
- 3 = Geral
- 4 = Orixás

**Índices:**
- `IX_SpiritualContents_Title_Category_Type` (UNIQUE) - Título único por categoria e tipo
- `IX_SpiritualContents_IsActive` - Para consultas por status
- `IX_SpiritualContents_Category` - Para consultas por categoria
- `IX_SpiritualContents_Type` - Para consultas por tipo
- `IX_SpiritualContents_IsFeatured` - Para conteúdos em destaque
- `IX_SpiritualContents_IsActive_Category` - Para consultas combinadas
- `IX_SpiritualContents_IsActive_Type` - Para consultas combinadas
- `IX_SpiritualContents_IsActive_IsFeatured` - Para consultas combinadas
- `IX_SpiritualContents_Title_Content` - Para busca textual

## Campos de Auditoria

Todas as tabelas possuem campos de auditoria padrão:
- `CreatedAt` - Data e hora de criação do registro
- `UpdatedAt` - Data e hora da última atualização
- `IsActive` - Flag para soft delete (exclusão lógica)

## Características Técnicas

### PostgreSQL Features Utilizadas

1. **JSONB**: Para armazenar dados estruturados como características, cores, elementos e entidades
2. **TIMESTAMP WITH TIME ZONE**: Para garantir consistência temporal
3. **INTERVAL**: Para armazenar durações de tempo
4. **Índices Parciais**: Usando filtros WHERE para otimizar consultas
5. **Índices Compostos**: Para otimizar consultas complexas

### Padrões de Design

1. **Domain-Driven Design (DDD)**:
   - Entidades com encapsulamento adequado
   - Value Objects para tipos complexos (EventDate)
   - Agregados bem definidos

2. **Clean Architecture**:
   - Separação clara entre camadas
   - Dependências apontando para o domínio
   - Configurações isoladas na camada de infraestrutura

3. **Soft Delete**:
   - Uso do campo `IsActive` para exclusão lógica
   - Preservação de dados históricos
   - Índices otimizados para registros ativos

### Performance e Otimização

1. **Índices Estratégicos**:
   - Índices simples para consultas básicas
   - Índices compostos para consultas complexas
   - Índices únicos para garantir integridade

2. **Tipos de Dados Otimizados**:
   - VARCHAR com tamanhos apropriados
   - JSONB para dados semi-estruturados
   - INTEGER para enums

3. **Constraints e Validações**:
   - Primary Keys com SERIAL
   - Unique constraints com filtros
   - Default values apropriados

## Segurança

1. **Schema Isolado**: Uso do schema `batuara` para isolamento
2. **Tipos Seguros**: Uso de enums tipados no código
3. **Validações**: Validações tanto no banco quanto na aplicação
4. **Auditoria**: Campos de auditoria em todas as tabelas

## Manutenção

1. **Migrations**: Controle de versão do schema via Entity Framework
2. **Scripts**: Scripts SQL para criação manual quando necessário
3. **Documentação**: Comentários nas tabelas e colunas
4. **Backup**: Estrutura preparada para backup e restore

## Próximos Passos

1. Implementar triggers para atualização automática de `UpdatedAt`
2. Adicionar stored procedures para operações complexas
3. Implementar particionamento para tabelas de log
4. Configurar replicação para alta disponibilidade