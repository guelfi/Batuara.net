# Design - Melhorias UX Fase 0.1

## Visão Geral

Este documento detalha o design das melhorias de UX identificadas após o deploy bem-sucedido da Fase 0. Foca em responsividade mobile, navegação simplificada e funcionalidades essenciais.

## Arquitetura

### Estrutura de Componentes Atualizada

```
src/components/
├── layout/
│   ├── Sidebar.tsx                 # ← Atualizar responsividade
│   ├── Layout.tsx                  # ← Adicionar navegação por logo
│   └── UserProfile.tsx             # ← NOVO componente
├── content/
│   ├── FilhosCasaContent.tsx       # ← NOVO componente
│   └── LocalizacaoContent.tsx      # ← Integrar com PublicWebsite
└── common/
    └── ResponsiveChips.tsx         # ← NOVO componente
```

## Componentes e Interfaces

### 1. Sidebar Limpo e Responsivo

#### Header do Sidebar (Simplificado)
```tsx
// ANTES: Header com informações desnecessárias
// <Typography variant="h6">Admin Dashboard</Typography>
// <Typography variant="body2">Batuara.net</Typography>

// DEPOIS: Sem header ou header minimalista
// Foco apenas nas opções de navegação
```

#### Desktop/Tablet (> 768px) - Qualquer Ambiente
```tsx
// Exibição completa com chips sempre
<Chip label="Funcional" color="success" size="small" />
<Typography variant="caption">Interface completa com dados mockados</Typography>
```

#### Mobile (< 768px) - Ambiente Local/Desenvolvimento
```tsx
// Exibição completa com chips
<Chip label="Funcional" color="success" size="small" />
<Typography variant="caption">Interface completa com dados mockados</Typography>
```

#### Mobile (< 768px) - Ambiente Produção
```tsx
// Apenas texto, sem chips
<Typography variant="body2">Dashboard</Typography>
// Sem descrição detalhada
```

#### Implementação
```tsx
const useResponsiveChips = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Oculta chips apenas em: mobile + produção
  return !(isMobile && isProduction);
};
```

#### Contraste Visual Melhorado
```tsx
// Item selecionado com melhor contraste (WCAG AA 4.5:1)
const selectedItemStyles = {
  backgroundColor: 'rgba(25, 118, 210, 0.15)', // Fundo mais claro
  borderRadius: 1,
  '&:hover': {
    backgroundColor: 'rgba(25, 118, 210, 0.25)',
  },
  '& .MuiTypography-root': {
    color: '#1565c0',      // Fonte mais escura (primary.dark)
    fontWeight: 600,       // Peso maior para melhor legibilidade
  },
  '& .MuiListItemIcon-root': {
    color: '#1565c0',      // Ícone mais escuro
  }
};
```

#### Header Sidebar Limpo
```tsx
// Remover "Batuara.net", manter apenas essencial
<Box sx={{ p: { xs: 1.5, sm: 2 }, borderBottom: 1, borderColor: 'divider' }}>
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <img 
      src="/batuara_logo.png" 
      alt="Batuara Logo" 
      style={{ height: isMobile ? '28px' : '32px', marginRight: '12px' }} 
    />
    <Typography 
      variant={isMobile ? "subtitle1" : "h6"} 
      sx={{ fontWeight: 'bold', color: 'primary.main' }}
    >
      Admin Dashboard
    </Typography>
  </Box>
  {/* Linha "Batuara.net" removida para visual mais limpo */}
</Box>
```

### 2. Navegação por Header

#### Logo/Nome Clicável
```tsx
<Box 
  sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
  onClick={() => onItemSelect('dashboard')}
>
  <img src="/batuara_logo.png" alt="Logo" style={{ height: '32px', marginRight: '12px' }} />
  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
    Casa de Caridade Caboclo Batuara
  </Typography>
</Box>
```

### 3. Perfil de Usuário

#### Card de Perfil
```tsx
<Card sx={{ minWidth: 280 }}>
  <CardContent>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Avatar sx={{ mr: 2 }}>A</Avatar>
      <Box>
        <Typography variant="h6">Admin User</Typography>
        <Typography variant="body2" color="text.secondary">
          admin@batuara.net
        </Typography>
      </Box>
    </Box>
    <Divider sx={{ my: 2 }} />
    <List dense>
      <ListItem button>
        <ListItemIcon><PersonIcon /></ListItemIcon>
        <ListItemText primary="Meu Perfil" />
      </ListItem>
      <ListItem button>
        <ListItemIcon><SettingsIcon /></ListItemIcon>
        <ListItemText primary="Configurações" />
      </ListItem>
      <ListItem button onClick={handleLogout}>
        <ListItemIcon><LogoutIcon /></ListItemIcon>
        <ListItemText primary="Sair" />
      </ListItem>
    </List>
  </CardContent>
</Card>
```

### 4. Dashboard Mobile Otimizado

#### Layout ResponsCards
```tsx
// Desktoal)
<Grid container spa3}>
  <Grid item md={3}>
    <MetricCard />
  </Grid>
  {/* Repete para 4 cards */}
</Grid>

// Mobile: 2x2 cards com altura otimizada
<Gri */}
  <Grid item xs */}
    <MetricCard com
  
  {

```

#### Card Compacto para Mobile
```tsx
const MetricCard = ({ compact = false }) => (
  <Card 
    sx={{ 
      height: compact ? 120 : 16le
      minHeight: compact ? 120 : 160,
    }}
  >
    <CardContent sx={{ p: compac}>
      <Box sx={{ display: 'flex', alignItems: 'c}>
        <Avatsx={{ 
          bgcolor: metric.color, 
          mr: compact ? 1 : 2,
          wid 32 : 40,
          height: compact ? 32 :,
        }}>
          <Ic} />
        </Avatar>
        <Box sx={{ fl}}>
          <Typography 
            color=ry" 
            variant={compact ? "caption" : "body2"}
            sx={{ fontSize: compact ? '0.7rem' : undefined }}
          >
            {metric
          </Typography
          {!c}
        </B
      </Box>
      <Ty
   "h4"} 
2" 
        sx={{ mb: 0.5, fontWeight: bold' }}
      >
        {metric.value}
      phy>
      {metric.trend && (
        <Box sx={{ display: 'flex', align' }}>
          <TrendIcon sx={{ 
  n',
            mr: 0.5,
            fontSize: compact ? 14 : 16
          }} />
          <Typography 
         y2"}
    sx={{ 
              color: metric.trend.isPositivn',
  um',
   defined
 }}
          >
}
          </Typoghy>
        </Box>
      )}
    </CardContent>
  </Card>
);
```

#### Layout Mobile das Seções Inferiores
```tsx
// Mobile: Stack va
<Grid container sp
 xs={12}>
   

        <Typography variant="h6" sx={{ : 1 }}>
          Ati
        </Typography>
        {/* Lista c}
        <List den
          {activi> (
            <List
              
                <Av
                
                </A>
              </ListItemAvatar>
 t
   y={

                 title}
phy>
                }
                secondary={
                  <Typography variant=y">

                  </Typogr
                }
              />
            </ListItem>
  ))}
        </List>
      </CardContent>
    </Card>
  </Grid>
  
  <Grid item xs={12}>
d>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" >
          Resumo Rápido
        </Typography>

        <Grid container1}>
          <Grid item 
            <Typographycondary">
              Mensagens Pentes
y>
            <Ty }}>
              7
            </Typography>
          </Grid>
          <Grid i
ary">
              Próxima Gira
            </Typography>
            <Typography variant="body2" 
              Sexta, 20:00     e CRUDnterfac I da Casa -# 5. Filhos`

##>
``
</Gridrid>  </G   </Card>
t>
 Conten     </Card>
 /Grid      <
   </Grid>       
  hy>/Typograp   <  
  um' }}>medit: ' fontWeighsx={{.second"textolor=caption" cant="ariography v <Typ           tem xs={6}>.main'arningor: 'w colld', 'bontWeight:foh6" sx={{ t="hy varianappogr/Typograph      <      den"text.secolor=aption" variant="c xs={6}> spacing={to */}is compac ma em formatomações   {/* Infor     }}: 1 mb{ sx={    <Car        y>aphity.time}ctiv  {a                  dar.seconolor="texttion" c"cap</Typogra                  ity.  {activ }}>edium' ntWeight: 'm fody2" sx={{ariant="boraphy vog       <Typ            primar            ListItemTex          <   vatar"small" />ze=nent fontSipo  <IconCom32 }}>t:  heighdth: 32,={{ wiatar sxr>stItemAvata<Li 0.5 }}> py:: 0,={{ pxivity.id} sxey={actm kIte =ap(activity ? 3 : 4).mlee(0, isMobis.slictiese>bile */mo itens em a com menosompact Recentesdadesvimb 2 }}> sx={{ p:tentCardCon      <auto' }}>overflow: 'ht: 300,  maxHeigsx={{ <Card rid item  <G2}>ng={ciaura otimizadaltl com erticarapend.valueric.tr      +{met                 un : em'act ? '0.7re: compiztS        fon   edi'mWeight:  font           maierror.' : 'inccess.ma ? 'sue        : "bod"caption" ct ? ={compa variant  mai'error.ess.main' :  ? 'succiveitrend.isPosic.tolor: metr       c   enters: 'cItemgra</Typo'ponent="h  com       "h5" : mpact ?coiant={     varraphy pogox>hase)tric.pp(meeChit && getPhasacomp>.title}conda"textSeow: 1 exGr' : 'medium'mallpact ? 'scomntSize={ foonentonComp 40ct ? compath:ar b: 1 }enter', m2 } 1.5 : t ?bim moida eAltura reduz, // 0</Grid>/}4 cards *ra  pa/* Repeteid></Grobile} />act={isMpnha= 2 por li{/* xs=6 }> md={36} sm={6} ={m mobileing menor e}> {/* Spacacing={2 spd container sm={6}xs={12} cing={nha (atu cards em liet: 4p/Tablivo dos 

#### Grid Principal
```tsx
<DataGrid
  rows={filhosCasa}
  columns={[
    { field: 'nome', headerName: 'Nome', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'telefone', headerName: 'Telefone', width: 150 },
    { field: 'dataEntrada', headerName: 'Data Entrada', width: 130 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'actions', type: 'actions', width: 150 }
  ]}
  pageSize={10}
  checkboxSelection
/>
```

#### Formulário de Cadastro/Edição
```tsx
<Dialog maxWidth="md" fullWidth>
  <DialogTitle>
    {isEditing ? 'Editar Filho da Casa' : 'Novo Filho da Casa'}
  </DialogTitle>
  <DialogContent>
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <TextField label="Nome Completo" required />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField label="Email" type="email" />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField label="Telefone" />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField label="Data de Entrada" type="date" />
      </Grid>
      <Grid item xs={12}>
        <FormControl>
          <InputLabel>Status</InputLabel>
          <Select>
            <MenuItem value="ativo">Ativo</MenuItem>
            <MenuItem value="afastado">Afastado</MenuItem>
            <MenuItem value="inativo">Inativo</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  </DialogContent>
</Dialog>
```

### 5. Integração com PublicWebsite

#### Carregamento de Dados
```tsx
const useLocationData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Na Fase 0: carregar dados mockados do PublicWebsite
    // Na Fundação: carregar da API
    loadLocationFromPublicWebsite();
  }, []);
  
  return { data, loading, updateLocation };
};
```

## Data Models

### Filho da Casa
```typescript
interface FilhoCasa {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  dataEntrada: Date;
  status: 'ativo' | 'afastado' | 'inativo';
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Dados de Localização Compartilhados
```typescript
interface LocationData {
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  horarios: string;
  informacoesAdicionais: string;
}
```

## Error Handling

### Responsividade
- Fallback para desktop se detecção mobile falhar
- Graceful degradation dos componentes

### Sincronização de Dados
- Retry automático em caso de falha
- Mensagens de erro claras
- Rollback em caso de erro crítico

### CRUD Filhos da Casa
- Validação de campos obrigatórios
- Confirmação para exclusões
- Feedback visual para todas as operações

## Testing Strategy

### Testes de Responsividade
- Viewport mobile (320px - 767px)
- Viewport tablet (768px - 1023px)  
- Viewport desktop (1024px+)

### Testes de Navegação
- Clique no logo/nome
- Navegação via Sidebar
- Funcionalidade do perfil

### Testes CRUD
- Criar novo filho da casa
- Editar existente
- Excluir com confirmação
- Filtros e busca

### Testes de Integração
- Sincronização de dados de localização
- Atualização de contadores no Dashboard
- Consistência entre interfaces
### 4.
 Dashboard Mobile Otimizado

#### Layout Responsivo dos Cards
```tsx
// Desktop/Tablet: 4 cards em linha (atual)
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={3}>
    <MetricCard />
  </Grid>
  {/* Repete para 4 cards */}
</Grid>

// Mobile: 2x2 cards com altura otimizada
<Grid container spacing={2}> {/* Spacing menor em mobile */}
  <Grid item xs={6} sm={6} md={3}> {/* xs=6 = 2 por linha */}
    <MetricCard compact={isMobile} />
  </Grid>
  {/* Repete para 4 cards */}
</Grid>
```

#### Card Compacto para Mobile
```tsx
const MetricCard = ({ compact = false }) => (
  <Card 
    sx={{ 
      height: compact ? 120 : 160, // Altura reduzida em mobile
      minHeight: compact ? 120 : 160,
    }}
  >
    <CardContent sx={{ p: compact ? 1.5 : 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Avatar sx={{ 
          bgcolor: metric.color, 
          mr: compact ? 1 : 2,
          width: compact ? 32 : 40,
          height: compact ? 32 : 40,
        }}>
          <IconComponent fontSize={compact ? 'small' : 'medium'} />
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography 
            color="textSecondary" 
            variant={compact ? "caption" : "body2"}
            sx={{ fontSize: compact ? '0.7rem' : undefined }}
          >
            {metric.title}
          </Typography>
          {!compact && getPhaseChip(metric.phase)}
        </Box>
      </Box>
      <Typography 
        variant={compact ? "h5" : "h4"} 
        component="h2" 
        sx={{ mb: 0.5, fontWeight: 'bold' }}
      >
        {metric.value}
      </Typography>
      {metric.trend && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TrendIcon sx={{ 
            color: metric.trend.isPositive ? 'success.main' : 'error.main',
            mr: 0.5,
            fontSize: compact ? 14 : 16
          }} />
          <Typography 
            variant={compact ? "caption" : "body2"}
            sx={{ 
              color: metric.trend.isPositive ? 'success.main' : 'error.main',
              fontWeight: 'medium',
              fontSize: compact ? '0.7rem' : undefined
            }}
          >
            +{metric.trend.value}
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);
```

#### Layout Mobile das Seções Inferiores
```tsx
// Mobile: Stack vertical com altura otimizada
<Grid container spacing={2}>
  <Grid item xs={12}>
    <Card sx={{ maxHeight: 300, overflow: 'auto' }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Atividades Recentes
        </Typography>
        {/* Lista compacta com menos itens em mobile */}
        <List dense>
          {activities.slice(0, isMobile ? 3 : 4).map(activity => (
            <ListItem key={activity.id} sx={{ px: 0, py: 0.5 }}>
              <ListItemAvatar>
                <Avatar sx={{ width: 32, height: 32 }}>
                  <IconComponent fontSize="small" />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {activity.title}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {activity.time}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  </Grid>
  
  <Grid item xs={12}>
    <Card>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Resumo Rápido
        </Typography>
        {/* Informações em formato mais compacto */}
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Mensagens Pendentes
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
              7
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Próxima Gira
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              Sexta, 20:00
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  </Grid>
</Grid>
```