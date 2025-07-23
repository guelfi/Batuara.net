# Seed Data - Casa de Caridade Batuara

## Visão Geral

O seed data da Casa de Caridade Batuara contém informações específicas da casa baseadas na **Apostila Batuara 2024** e nos ensinamentos tradicionais da instituição. Este conteúdo é fundamental para o funcionamento do sistema, pois fornece as informações espirituais e doutrinárias que serão exibidas no site.

## Conteúdo do Seed Data

### 1. Orixás

O seed data inclui informações detalhadas sobre os principais Orixás conforme os ensinamentos da Casa Batuara:

- **Oxalá** - O Pai Criador, senhor da paz e sabedoria
- **Yemanjá** - A Mãe Universal, rainha dos mares
- **Iansã** - A Guerreira da Justiça, senhora dos ventos
- **Ogum** - O Trabalhador Incansável, senhor do ferro
- **Oxóssi** - O Provedor, senhor das matas
- **Xangô** - O Rei Justo, senhor da justiça
- **Oxum** - A Mãe da Prosperidade, senhora das águas doces
- **Nanã** - A Ancestral Sábia, senhora da sabedoria

#### Estrutura dos Dados dos Orixás

Cada Orixá contém:
- **Nome**: Nome do Orixá
- **Descrição**: Descrição geral das características
- **Origem**: Origem histórica e cultural
- **Ensinamento Batuara**: Interpretação específica da Casa Batuara
- **Características**: Lista de virtudes e qualidades
- **Cores**: Cores associadas ao Orixá
- **Elementos**: Elementos naturais relacionados
- **Ordem de Exibição**: Para organização no site

### 2. Linhas da Umbanda

O seed data inclui as principais linhas da Umbanda trabalhadas na Casa Batuara:

- **Linha de Oxalá** - Linha da paz e elevação espiritual
- **Linha de Yemanjá** - Linha do amor maternal e proteção
- **Linha dos Caboclos** - Linha da natureza e cura
- **Linha dos Pretos Velhos** - Linha da sabedoria e humildade
- **Linha das Crianças** - Linha da alegria e pureza
- **Linha dos Exus** - Linha da proteção e limpeza
- **Linha dos Boiadeiros** - Linha do trabalho e perseverança
- **Linha dos Marinheiros** - Linha da superação e renovação

#### Estrutura dos Dados das Linhas

Cada linha contém:
- **Nome**: Nome da linha
- **Descrição**: Descrição geral da linha
- **Características**: Características específicas
- **Interpretação Batuara**: Visão específica da Casa Batuara
- **Entidades**: Lista de entidades principais
- **Dias de Trabalho**: Dias da semana em que a linha trabalha
- **Ordem de Exibição**: Para organização no site

### 3. Conteúdos Espirituais

O seed data inclui diversos conteúdos espirituais da Casa Batuara:

#### Orações
- **Pai Nosso da Umbanda** - Oração principal da casa
- **Ave Maria da Umbanda** - Oração mariana adaptada
- **Oração de Oxalá** - Oração específica ao Pai Oxalá
- **Oração de Yemanjá** - Oração à Mãe Yemanjá

#### Ensinamentos
- **A Caridade Segundo os Ensinamentos da Casa Batuara**
- **A Mediunidade na Casa Batuara**
- **Princípios da Doutrina Espírita**

#### Doutrinas
- **Os Orixás na Visão da Casa Batuara**
- **As Linhas da Umbanda**
- **Fundamentos da Caridade**

#### Pontos Cantados
- **Ponto de Oxalá - Pai da Criação**
- **Ponto de Yemanjá - Mãe do Mar**
- **Pontos dos Caboclos**
- **Pontos dos Pretos Velhos**

#### Rituais
- **Ritual de Abertura dos Trabalhos**
- **Ritual de Defumação**
- **Ritual de Encerramento**

## Como Executar o Seed Data

### 1. Via SQL (PostgreSQL)

```bash
# Navegar para o diretório de scripts
cd Batuara.net/scripts

# Executar o script principal
psql -U postgres -d batuara_dev -f seed_all_data.sql
```

### 2. Via Código C#

```csharp
// No Program.cs ou Startup.cs
using Batuara.Infrastructure.Data.SeedData;

// Após configurar o banco de dados
await app.Services.SeedBatuaraDataAsync();
```

### 3. Via Contexto Específico

```csharp
using var context = new BatuaraDbContext(options);
var logger = serviceProvider.GetRequiredService<ILogger<BatuaraDbContext>>();

await context.SeedBatuaraDataAsync(logger);
```

## Estrutura dos Arquivos

```
scripts/
├── seed_all_data.sql              # Script principal
├── seed_orixas_data.sql           # Dados dos Orixás
├── seed_umbanda_lines_data.sql    # Dados das Linhas da Umbanda
└── seed_spiritual_content_data.sql # Conteúdos espirituais

src/Backend/Batuara.Infrastructure/Data/SeedData/
├── BatuaraSeedData.cs            # Classe principal de seed
└── DatabaseSeedExtensions.cs     # Métodos de extensão
```

## Características Técnicas

### Segurança
- Verificação de dados existentes antes da inserção
- Transações para garantir consistência
- Logs detalhados de todas as operações
- Tratamento de erros robusto

### Performance
- Inserção em lote para melhor performance
- Índices otimizados para consultas frequentes
- Dados organizados por ordem de exibição

### Manutenibilidade
- Código bem documentado e comentado
- Separação clara entre diferentes tipos de conteúdo
- Fácil adição de novos conteúdos
- Versionamento através de migrations

## Fonte dos Dados

Todos os dados do seed são baseados em:

1. **Apostila Batuara 2024** - Documento oficial da casa
2. **Ensinamentos tradicionais** - Passados pelos dirigentes
3. **Práticas da casa** - Rituais e procedimentos específicos
4. **Interpretações doutrinárias** - Visão específica da Casa Batuara

## Manutenção e Atualizações

### Adicionando Novos Orixás

1. Adicionar no script SQL `seed_orixas_data.sql`
2. Adicionar na classe C# `BatuaraSeedData.cs`
3. Atualizar a documentação
4. Criar migration se necessário

### Adicionando Novas Linhas

1. Adicionar no script SQL `seed_umbanda_lines_data.sql`
2. Adicionar na classe C# `BatuaraSeedData.cs`
3. Atualizar a documentação

### Adicionando Novos Conteúdos

1. Adicionar no script SQL `seed_spiritual_content_data.sql`
2. Adicionar na classe C# `BatuaraSeedData.cs`
3. Definir tipo, categoria e ordem de exibição
4. Marcar como destaque se necessário

## Validação dos Dados

Antes de executar o seed data, certifique-se de que:

- [ ] O schema `batuara` existe
- [ ] Todas as tabelas foram criadas
- [ ] As migrations foram aplicadas
- [ ] O usuário tem permissões adequadas
- [ ] O banco de dados está acessível

## Troubleshooting

### Erro: Schema não existe
```sql
-- Criar o schema manualmente
CREATE SCHEMA IF NOT EXISTS batuara;
```

### Erro: Tabelas não existem
```bash
# Executar migrations
dotnet ef database update --project src/Backend/Batuara.Infrastructure
```

### Erro: Dados já existem
```sql
-- Limpar dados existentes (cuidado!)
TRUNCATE batuara."SpiritualContents" RESTART IDENTITY CASCADE;
TRUNCATE batuara."UmbandaLines" RESTART IDENTITY CASCADE;
TRUNCATE batuara."Orixas" RESTART IDENTITY CASCADE;
```

### Erro: Permissões insuficientes
```sql
-- Conceder permissões ao usuário
GRANT ALL PRIVILEGES ON SCHEMA batuara TO usuario;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA batuara TO usuario;
```

## Considerações Importantes

1. **Backup**: Sempre faça backup antes de executar seed data em produção
2. **Ambiente**: Teste primeiro em ambiente de desenvolvimento
3. **Validação**: Verifique se todos os dados foram inseridos corretamente
4. **Logs**: Monitore os logs durante a execução
5. **Performance**: Em bancos grandes, considere executar em horários de menor uso

## Próximos Passos

1. Implementar seed data para eventos de exemplo
2. Adicionar seed data para calendário de atendimentos
3. Criar seed data para usuários administrativos
4. Implementar versionamento do seed data
5. Criar testes automatizados para validação dos dados