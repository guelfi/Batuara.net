# Design Document - Finalização UI/UX Completa

## Overview

Este documento detalha a arquitetura e design para finalização completa da UI/UX do sistema Batuara, incluindo estratégia de versionamento seguro, implementação de Sass, limpeza de código e otimizações para desktop/mobile.

## Architecture

### Sistema de Cores com Sass

```scss
// src/styles/variables/_colors.scss
$spiritual-colors: (
  // Orixás
  'Branco': #e8eaf6,
  'Azul': #1976d2,
  'Lilás': #9c27b0,
  'Amarelo': #ffc107,
  'Vermelho': #d32f2f,
  'Verde': #388e3c,
  'Marrom': #795548,
  'Laranja': #ff9800,
  'Roxo': #673ab7,
  'Preto': #212121,
  
  // Guias e Entidades
  'Amarelo e Vermelho': #ff9800,
  'Branco e Preto': #795548,
  'Rosa e Azul': #e91e63,
  'Marrom e Bege': #8bc34a,
  'Azul e Branco': #2196f3,
  'Dourado e Roxo': #9c27b0,
  'Preto e Branco': #424242,
  
  // Linhas da Umbanda
  'Azul-claro': #42a5f5,
  'Preto e vermelho': #d32f2f
);

// Função para obter cor espiritual
@function get-spiritual-color($color-name) {
  @return map-get($spiritual-colors, $color-name);
}

// Função para obter cor suave (fundo)
@function get-soft-color($color-name) {
  $base-color: get-spiritual-color($color-name);
  @return lighten(desaturate($base-color, 20%), 35%);
}

// Função para obter cor forte (texto)
@function get-strong-color($color-name) {
  $base-color: get-spiritual-color($color-name);
  @return darken(saturate($base-color, 10%), 15%);
}
```

### Estrutura de Arquivos Sass

```
src/styles/
├── main.scss                 // Arquivo principal
├── variables/
│   ├── _colors.scss          // Cores espirituais e sistema
│   ├── _typography.scss      // Tipografia responsiva
│   └── _breakpoints.scss     // Breakpoints mobile/desktop
├── mixins/
│   ├── _responsive.scss      // Mixins responsivos
│   └── _spiritual.scss       // Mixins para elementos espirituais
├── components/
│   ├── _sidebar.scss         // Estilos do sidebar
│   ├── _grids.scss          // Estilos das grids
│   ├── _cards.scss          // Cards espirituais
│   └── _modals.scss         // Modais flutuantes centralizados
└── pages/
    ├── _admin-dashboard.scss // Estilos específicos do admin
    └── _public-website.scss  // Estilos específicos do public
```

## Components and Interfaces

### SpiritualDetailModal Unificado

```typescript
interface SpiritualDetailData {
  nome: string;
  saudacao: string;
  elemento: string;
  habitat: string;
  simbolo: string;
  cor: string;
  diaSemana: string;
  fruta: string;
  comida: string;
  bebida: string;
  atuacao: string;
  description: string;
  corTematica: string;
}

interface SpiritualDetailModalProps {
  open: boolean;
  onClose: () => void;
  data: SpiritualDetailData;
  tipo: 'orixa' | 'guia' | 'linha';
}
```

### Estilos do Modal Card Flutuante

```scss
// components/_modals.scss
.spiritual-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  &__card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
    // Desktop: manter tamanho atual (aproximadamente 600px)
    max-width: 600px;
    max-height: 90vh;
    width: 100%;
    overflow: hidden;
    transform: scale(0.9);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    
    &--open {
      transform: scale(1);
      opacity: 1;
    }
    
    // Mobile: usar 80% da tela
    @media (max-width: 768px) {
      max-width: 80vw;
      max-height: 80vh;
      margin: 20px;
    }
  }
  
  &__content {
    overflow-y: auto;
    max-height: calc(80vh - 80px); // Espaço para header e footer
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: var(--spiritual-color);
      border-radius: 3px;
    }
  }
}
```

### Sistema de Cores Centralizado

```typescript
// utils/spiritualColors.ts
export const getSpiritualColor = (cor: string): string => {
  // Implementação baseada em variáveis Sass
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--spiritual-${cor.toLowerCase().replace(/\s+/g, '-')}`);
};

export const getSoftBackgroundColor = (cor: string): string => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--spiritual-soft-${cor.toLowerCase().replace(/\s+/g, '-')}`);
};

export const getStrongTextColor = (cor: string): string => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--spiritual-strong-${cor.toLowerCase().replace(/\s+/g, '-')}`);
};
```

## Data Models

### Estrutura Unificada de Dados Espirituais

```typescript
// types/spiritual.ts
export interface BaseSpiritual {
  id: string;
  name: string;
  cor: string;
  description: string;
}

export interface Orixa extends BaseSpiritual {
  element: string;
  habitat: string;
  atuacao: string;
  saudacao: string;
  simbolo: string;
  diaSemana: string;
  fruta: string;
  comida: string;
  bebida: string;
  dataComemoração: string;
}

export interface GuiaEntidade extends BaseSpiritual {
  comemoracao: string;
  saudacao: string;
  habitat: string;
  diaSemana: string;
  bebida: string;
  fruta: string;
  comida: string;
  caracteristicas: string[];
}

export interface LinhaUmbanda extends BaseSpiritual {
  regidaPor: string;
  entidades: string[];
  atuacao: string;
}
```

## Error Handling

### Estratégia de Fallbacks

```typescript
// utils/colorFallbacks.ts
export const getColorWithFallback = (cor: string): string => {
  const spiritualColor = getSpiritualColor(cor);
  
  if (!spiritualColor || spiritualColor === '') {
    console.warn(`Cor espiritual não encontrada: ${cor}`);
    return '#1976d2'; // Cor padrão azul
  }
  
  return spiritualColor;
};
```

### Validação de Dados

```typescript
// utils/dataValidation.ts
export const validateSpiritualData = (data: any): boolean => {
  const requiredFields = ['name', 'cor', 'description'];
  
  return requiredFields.every(field => {
    if (!data[field]) {
      console.error(`Campo obrigatório ausente: ${field}`);
      return false;
    }
    return true;
  });
};
```

## Testing Strategy

### Testes de Responsividade

```typescript
// tests/responsive.test.ts
describe('Responsividade', () => {
  test('Sidebar mobile deve ter 300px de largura', () => {
    // Implementação do teste
  });
  
  test('Grid deve exibir 6 itens por página', () => {
    // Implementação do teste
  });
  
  test('Cards espirituais devem ser modais flutuantes centralizados', () => {
    // Implementação do teste
  });
  
  test('Modal deve manter tamanho atual no desktop e 80% no mobile', () => {
    // Implementação do teste
  });
  
  test('Modal deve ter efeitos de card flutuante', () => {
    // Implementação do teste
  });
});
```

### Testes de Cores

```typescript
// tests/colors.test.ts
describe('Sistema de Cores', () => {
  test('Deve retornar cor correta para cada entidade espiritual', () => {
    expect(getSpiritualColor('Branco')).toBe('#e8eaf6');
    expect(getSpiritualColor('Preto e vermelho')).toBe('#d32f2f');
  });
  
  test('Deve gerar cores suaves para fundos', () => {
    const softColor = getSoftBackgroundColor('Azul');
    expect(softColor).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
```

## Estratégia de Versionamento e Deploy

### Fluxo Git Seguro

```bash
# 1. Criar branch específica para UI/UX
git checkout -b feature/ui-ux-finalizacao

# 2. Commits incrementais durante desenvolvimento
git add .
git commit -m "feat: implementar sistema de cores Sass"
git commit -m "feat: otimizar sidebar AdminDashboard"
git commit -m "feat: criar modal espiritual como card flutuante centralizado"

# 3. Push para repositório remoto
git push origin feature/ui-ux-finalizacao

# 4. Após testes completos, merge para main
git checkout main
git merge feature/ui-ux-finalizacao
git push origin main

# 5. Deploy para servidor Oracle
# (Processo específico do servidor)
```

### Checklist de Deploy

1. ✅ Todos os testes passando
2. ✅ Build sem warnings
3. ✅ Responsividade validada
4. ✅ Cores funcionando corretamente
5. ✅ Performance mantida
6. ✅ Backup do estado atual
7. ✅ Plano de rollback definido

## Performance Considerations

### Otimização Sass

```scss
// Compilação otimizada
@use 'sass:map';
@use 'sass:color';

// Evitar duplicação de código
%spiritual-card-base {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
}

.orixa-card {
  @extend %spiritual-card-base;
  // Estilos específicos
}
```

### Lazy Loading de Componentes

```typescript
// Carregamento otimizado de modais
const SpiritualDetailModal = lazy(() => 
  import('../components/SpiritualDetailModal')
);
```

## Accessibility

### Contraste de Cores

```scss
// Garantir contraste adequado
@function ensure-contrast($background, $text) {
  $contrast: color.contrast($background, $text);
  
  @if $contrast < 4.5 {
    @warn "Contraste insuficiente: #{$contrast}";
    @return color.adjust($text, $lightness: -20%);
  }
  
  @return $text;
}
```

### Navegação por Teclado

```typescript
// Suporte a navegação por teclado em modais
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    onClose();
  }
};
```

## Migration Strategy

### Migração Gradual

1. **Fase 1**: Implementar sistema Sass
2. **Fase 2**: Migrar componentes existentes
3. **Fase 3**: Otimizar responsividade
4. **Fase 4**: Limpeza de código legado
5. **Fase 5**: Testes e validação final

### Compatibilidade

- Manter compatibilidade com componentes existentes
- Implementar fallbacks para browsers antigos
- Garantir que mudanças não quebrem funcionalidades atuais