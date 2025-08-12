// ============================================================================
// UTILITÁRIO JAVASCRIPT PARA SISTEMA DE CORES ESPIRITUAIS
// ============================================================================
// Integração entre o sistema Sass e componentes JavaScript/TypeScript
// Permite obter cores baseadas no atributo 'cor' dos dados espirituais
// ============================================================================

// ============================================================================
// MAPEAMENTO DE CORES (SINCRONIZADO COM SASS)
// ============================================================================

export const SPIRITUAL_COLORS = {
  // Cores básicas
  'branco': '#ffffff',
  'azul': '#1976d2',
  'azul-claro': '#42a5f5',
  'lilás': '#9c27b0',
  'dourado': '#ffc107',
  'vermelho': '#d32f2f',
  'verde': '#4caf50',
  'marrom': '#8d6e63',
  'alaranjado': '#ff9800',
  'roxo': '#673ab7',
  'preto': '#212121',
  'amarelo': '#ffeb3b',
  'rosa': '#e91e63',
  'bege': '#d7ccc8',
  
  // Cores compostas (primeira cor como principal)
  'amarelo e vermelho': '#ffeb3b',
  'branco e preto': '#ffffff',
  'rosa e azul': '#e91e63',
  'marrom e bege': '#8d6e63',
  'azul e branco': '#1976d2',
  'dourado e roxo': '#ffc107',
  'preto e branco': '#212121',
  'amarelo e verde': '#ffeb3b',
  'preto e vermelho': '#212121'
} as const;

// ============================================================================
// VARIAÇÕES DE CORES
// ============================================================================

export const COLOR_VARIANTS = {
  light: {
    'branco': '#fafafa',
    'azul': '#42a5f5',
    'lilás': '#ba68c8',
    'dourado': '#ffeb3b',
    'vermelho': '#f44336',
    'verde': '#81c784',
    'marrom': '#a1887f',
    'alaranjado': '#ffb74d',
    'roxo': '#9575cd',
    'preto': '#424242',
    'amarelo': '#fff176',
    'rosa': '#f48fb1',
    'bege': '#efebe9'
  },
  dark: {
    'branco': '#f5f5f5',
    'azul': '#1565c0',
    'lilás': '#7b1fa2',
    'dourado': '#ff8f00',
    'vermelho': '#c62828',
    'verde': '#388e3c',
    'marrom': '#6d4c41',
    'alaranjado': '#f57c00',
    'roxo': '#512da8',
    'preto': '#000000',
    'amarelo': '#fbc02d',
    'rosa': '#c2185b',
    'bege': '#bcaaa4'
  }
} as const;

// ============================================================================
// FUNÇÕES PRINCIPAIS
// ============================================================================

/**
 * Obtém a cor baseada no atributo 'cor' dos dados espirituais
 * @param colorName - Nome da cor conforme atributo 'cor'
 * @param variant - Variação da cor: 'primary', 'light', 'dark'
 * @returns Código hexadecimal da cor
 */
export function getSpiritualColor(
  colorName: string, 
  variant: 'primary' | 'light' | 'dark' = 'primary'
): string {
  const normalizedName = colorName.toLowerCase().trim();
  
  if (variant === 'light' && COLOR_VARIANTS.light[normalizedName as keyof typeof COLOR_VARIANTS.light]) {
    return COLOR_VARIANTS.light[normalizedName as keyof typeof COLOR_VARIANTS.light];
  }
  
  if (variant === 'dark' && COLOR_VARIANTS.dark[normalizedName as keyof typeof COLOR_VARIANTS.dark]) {
    return COLOR_VARIANTS.dark[normalizedName as keyof typeof COLOR_VARIANTS.dark];
  }
  
  if (SPIRITUAL_COLORS[normalizedName as keyof typeof SPIRITUAL_COLORS]) {
    return SPIRITUAL_COLORS[normalizedName as keyof typeof SPIRITUAL_COLORS];
  }
  
  // Fallback para cor padrão (Iemanjá - azul)
  console.warn(`Cor '${colorName}' não encontrada. Usando cor padrão.`);
  return SPIRITUAL_COLORS.azul;
}

/**
 * Gera cor suave para backgrounds baseada no atributo 'cor'
 * @param colorName - Nome da cor conforme atributo 'cor'
 * @param opacity - Opacidade da cor (0.1 padrão)
 * @returns String rgba para background suave
 */
export function getSoftColor(colorName: string, opacity: number = 0.1): string {
  const baseColor = getSpiritualColor(colorName);
  const rgb = hexToRgb(baseColor);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

/**
 * Gera cor média para elementos intermediários
 * @param colorName - Nome da cor conforme atributo 'cor'
 * @param opacity - Opacidade da cor (0.3 padrão)
 * @returns String rgba para cor média
 */
export function getMediumColor(colorName: string, opacity: number = 0.3): string {
  const baseColor = getSpiritualColor(colorName);
  const rgb = hexToRgb(baseColor);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

/**
 * Gera cor forte para textos e bordas baseada no atributo 'cor'
 * @param colorName - Nome da cor conforme atributo 'cor'
 * @param variant - Variação: 'primary', 'dark' (mais forte)
 * @returns Código hexadecimal da cor forte
 */
export function getStrongColor(
  colorName: string, 
  variant: 'primary' | 'dark' = 'primary'
): string {
  return getSpiritualColor(colorName, variant);
}/**
 *
 Determina se deve usar texto claro ou escuro baseado na cor de fundo
 * @param backgroundColor - Cor de fundo em hexadecimal
 * @returns Cor de texto com melhor contraste
 */
export function getContrastText(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor);
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  
  return luminance > 0.5 ? '#212121' : '#ffffff';
}

/**
 * Obtém cor de texto com contraste adequado para cor espiritual
 * @param colorName - Nome da cor conforme atributo 'cor'
 * @returns Cor de texto com contraste adequado
 */
export function getSpiritualContrastText(colorName: string): string {
  const backgroundColor = getSpiritualColor(colorName);
  return getContrastText(backgroundColor);
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

/**
 * Converte cor hexadecimal para RGB
 * @param hex - Cor em formato hexadecimal
 * @returns Objeto com valores r, g, b
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Gera estilos CSS para card espiritual
 * @param colorName - Nome da cor conforme atributo 'cor'
 * @param backgroundType - Tipo de background: 'soft', 'medium', 'strong'
 * @returns Objeto com estilos CSS
 */
export function getSpiritualCardStyles(
  colorName: string, 
  backgroundType: 'soft' | 'medium' | 'strong' = 'soft'
) {
  const baseStyles = {
    borderRadius: '8px',
    padding: '16px',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  switch (backgroundType) {
    case 'soft':
      return {
        ...baseStyles,
        backgroundColor: getSoftColor(colorName),
        color: getStrongColor(colorName, 'dark'),
        border: `1px solid ${getMediumColor(colorName)}`
      };
    
    case 'medium':
      return {
        ...baseStyles,
        backgroundColor: getMediumColor(colorName),
        color: getStrongColor(colorName, 'dark'),
        border: `1px solid ${getStrongColor(colorName)}`
      };
    
    case 'strong':
      return {
        ...baseStyles,
        backgroundColor: getStrongColor(colorName),
        color: getSpiritualContrastText(colorName),
        border: '1px solid transparent'
      };
    
    default:
      return baseStyles;
  }
}

/**
 * Gera estilos CSS para modal espiritual
 * @param colorName - Nome da cor conforme atributo 'cor'
 * @returns Objeto com estilos CSS para modal
 */
export function getSpiritualModalStyles(colorName: string) {
  return {
    modal: {
      backgroundColor: getSoftColor(colorName, 0.05),
      border: `2px solid ${getMediumColor(colorName)}`,
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      backdropFilter: 'blur(10px)',
      overflow: 'hidden'
    },
    header: {
      backgroundColor: getMediumColor(colorName, 0.2),
      color: getStrongColor(colorName, 'dark'),
      borderBottom: `1px solid ${getMediumColor(colorName, 0.3)}`,
      borderRadius: '12px 12px 0 0',
      padding: '16px 24px',
      fontWeight: '600'
    },
    content: {
      padding: '24px',
      color: getStrongColor(colorName)
    }
  };
}

/**
 * Gera estilos CSS para botão espiritual
 * @param colorName - Nome da cor conforme atributo 'cor'
 * @param variant - Variante: 'filled', 'outlined', 'text'
 * @returns Objeto com estilos CSS para botão
 */
export function getSpiritualButtonStyles(
  colorName: string, 
  variant: 'filled' | 'outlined' | 'text' = 'filled'
) {
  const baseStyles = {
    borderRadius: '8px',
    padding: '8px 16px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: 'none'
  };

  switch (variant) {
    case 'filled':
      return {
        ...baseStyles,
        backgroundColor: getStrongColor(colorName),
        color: getSpiritualContrastText(colorName)
      };
    
    case 'outlined':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        color: getStrongColor(colorName),
        border: `2px solid ${getStrongColor(colorName)}`
      };
    
    case 'text':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        color: getStrongColor(colorName),
        border: 'none'
      };
    
    default:
      return baseStyles;
  }
}

// ============================================================================
// EXPORTAÇÕES PARA COMPATIBILIDADE
// ============================================================================

// Função legacy para compatibilidade (se existir)
export const getColorFromAttribute = getSpiritualColor;
export const getOrixaColor = getSpiritualColor;

// Constantes úteis
export const SOFT_OPACITY = 0.1;
export const MEDIUM_OPACITY = 0.3;
export const STRONG_OPACITY = 0.8;
export const LIGHT_TEXT = '#ffffff';
export const DARK_TEXT = '#212121';