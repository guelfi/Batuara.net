# Sistema de Cores Espirituais - Casa Batuara

## 📋 Visão Geral

Este sistema Sass centralizado fornece cores consistentes baseadas nos atributos 'cor' dos dados espirituais da Apostila Batuara 2024. Permite aplicação automática de cores para Orixás, Guias/Entidades e Linhas da Umbanda.

## 🎨 Cores Disponíveis

### Orixás
- **Oxalá**: Branco (`#ffffff`)
- **Iemanjá**: Azul (`#1976d2`)
- **Nanã**: Lilás (`#9c27b0`)
- **Oxum**: Dourado (`#ffc107`)
- **Ogum**: Vermelho (`#d32f2f`)
- **Oxóssi**: Verde (`#4caf50`)
- **Xangô**: Marrom (`#8d6e63`)
- **Iansã**: Alaranjado (`#ff9800`)
- **Obaluaê**: Roxo (`#673ab7`)
- **Exu**: Vermelho (`#d32f2f`)
- **Pomba Gira**: Preto (`#212121`)
- **Ossain**: Verde (`#4caf50`)
- **Oxumarê**: Amarelo e Verde (`#ffeb3b`)

### Guias e Entidades
- **Baiano**: Amarelo e Vermelho
- **Preto Velho**: Branco e Preto
- **Erês**: Rosa e Azul
- **Boiadeiro**: Marrom e Bege
- **Marinheiro**: Azul e Branco
- **Cigano**: Dourado e Roxo
- **Malandro**: Preto e Branco

## 🚀 Como Usar

### 1. Importação Sass

```scss
@import '../../../shared/styles/index.scss';
```

### 2. Funções Sass

```scss
// Obter cor principal
.meu-elemento {
  color: get-spiritual-color('azul');
  background-color: get-soft-color('azul', 0.1);
  border: 1px solid get-strong-color('azul');
}
```

### 3. Mixins Sass

```scss
// Card espiritual
.meu-card {
  @include spiritual-card('dourado', 'soft');
}

// Modal espiritual
.meu-modal {
  @include spiritual-modal('verde');
}

// Botão espiritual
.meu-botao {
  @include spiritual-button('vermelho', 'filled');
}
```

### 4. Classes Utilitárias

```html
<!-- Backgrounds -->
<div class="bg-azul-soft">Background suave</div>
<div class="bg-verde-medium">Background médio</div>
<div class="bg-dourado-strong">Background forte</div>

<!-- Textos -->
<p class="text-vermelho">Texto vermelho</p>
<p class="text-roxo-dark">Texto roxo escuro</p>

<!-- Bordas -->
<div class="border-azul">Borda azul</div>
<div class="border-verde-soft">Borda verde suave</div>
```

### 5. JavaScript/TypeScript

```typescript
import { 
  getSpiritualColor, 
  getSoftColor, 
  getSpiritualCardStyles 
} from '../../../shared/utils/spiritualColors';

// Obter cor
const corAzul = getSpiritualColor('azul');
const corSuave = getSoftColor('verde', 0.2);

// Estilos para componente
const cardStyles = getSpiritualCardStyles('dourado', 'soft');
```

## 📁 Estrutura de Arquivos

```
src/shared/styles/
├── _variables.scss    # Variáveis de cores espirituais
├── _functions.scss    # Funções para manipulação de cores
├── _mixins.scss       # Mixins para aplicação de estilos
├── index.scss         # Arquivo principal de importação
└── README.md          # Esta documentação

src/shared/utils/
└── spiritualColors.ts # Utilitário JavaScript/TypeScript
```

## 🎯 Exemplos Práticos

### Card de Orixá

```scss
.orixa-card {
  @include spiritual-card('azul', 'soft');
  
  &:hover {
    @include spiritual-card('azul', 'medium');
  }
}
```

```html
<div class="orixa-card" data-color="azul">
  <h3>Iemanjá</h3>
  <p>Mãe de todos os Orixás</p>
</div>
```

### Modal de Detalhes

```scss
.spiritual-modal {
  @include spiritual-modal('dourado');
}
```

```typescript
const modalStyles = getSpiritualModalStyles('dourado');
```

### Botão de Ação

```scss
.action-btn {
  @include spiritual-button('verde', 'filled');
}
```

## 🔧 Configuração

### Opacidades Padrão
- **Soft**: 0.1 (backgrounds suaves)
- **Medium**: 0.3 (elementos intermediários)
- **Strong**: 0.8 (elementos destacados)

### Contraste Automático
O sistema calcula automaticamente a cor de texto ideal (claro/escuro) baseado na luminosidade da cor de fundo.

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em todos os dispositivos. As cores mantêm consistência visual em diferentes tamanhos de tela.

## 🔄 Atualizações

Para adicionar novas cores:

1. Adicione a variável em `_variables.scss`
2. Inclua no mapa `$spiritual-colors`
3. Adicione no arquivo TypeScript `spiritualColors.ts`
4. Documente aqui no README

## 🐛 Troubleshooting

### Cor não encontrada
Se uma cor não for encontrada, o sistema usa a cor padrão (azul de Iemanjá) e exibe um warning no console.

### Compilação Sass
Certifique-se de que o Sass está instalado:
```bash
npm install sass --save-dev
```

### Importação
Sempre importe o arquivo principal:
```scss
@import '../../../shared/styles/index.scss';
```