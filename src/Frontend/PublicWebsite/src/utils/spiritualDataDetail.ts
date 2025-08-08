import { Orixa } from '../data/orixasData';
import { GuiaEntidade } from '../data/guiasEntidadesData';
import { LinhaUmbanda } from '../data/linhasUmbandaData';

// Interface para dados do modal
export interface SpiritualDetailData {
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

// Função unificada para obter cor temática baseada no atributo 'cor' da entidade
export const getColorFromAttribute = (cor: string): string => {
  const colorMap: { [key: string]: string } = {
    // Cores dos Orixás
    'Branco': '#e8eaf6', // Azul muito claro para contraste
    'Azul': '#1976d2',
    'Lilás': '#9c27b0',
    'Amarelo': '#ffc107',
    'Vermelho': '#d32f2f',
    'Verde': '#388e3c',
    'Marrom': '#795548',
    'Laranja': '#ff9800',
    'Roxo': '#673ab7',
    'Preto': '#212121',
    'Preto e Vermelho': '#d32f2f',
    
    // Cores das Guias e Entidades (cores compostas)
    'Amarelo e Vermelho': '#ff9800', // Laranja (mistura)
    'Branco e Preto': '#795548', // Marrom (neutro)
    'Rosa e Azul': '#e91e63', // Rosa (cor principal)
    'Marrom e Bege': '#8bc34a', // Verde (natureza/campo)
    'Azul e Branco': '#2196f3', // Azul (cor principal)
    'Dourado e Roxo': '#9c27b0', // Roxo (cor principal)
    'Preto e Branco': '#424242', // Cinza escuro (neutro)
    
    // Cores das Linhas da Umbanda
    'Azul-claro': '#42a5f5',
    'Preto e vermelho': '#d32f2f', // Linha de Exu
  };
  return colorMap[cor] || '#1976d2';
};

// Converter dados de Orixá para o modal
export const convertOrixaToModalData = (orixa: Orixa): SpiritualDetailData => {
  return {
    nome: orixa.name,
    saudacao: orixa.saudacao,
    elemento: orixa.element,
    habitat: orixa.habitat,
    simbolo: orixa.simbolo,
    cor: orixa.cor,
    diaSemana: orixa.diaSemana,
    fruta: orixa.fruta,
    comida: orixa.comida,
    bebida: orixa.bebida,
    atuacao: orixa.atuacao,
    description: `${orixa.description} Na Casa de Caridade Caboclo Batuara, ${orixa.name} atua principalmente na área de ${orixa.atuacao}, sendo uma das forças fundamentais que orientam nossos trabalhos espirituais e ensinamentos.`,
    corTematica: getColorFromAttribute(orixa.cor)
  };
};

// Converter dados de Guia/Entidade para o modal
export const convertGuiaToModalData = (guia: GuiaEntidade): SpiritualDetailData => {
  return {
    nome: guia.name,
    saudacao: guia.saudacao,
    elemento: 'Espiritual',
    habitat: guia.habitat,
    simbolo: 'Proteção e Orientação',
    cor: guia.cor,
    diaSemana: guia.diaSemana,
    fruta: guia.fruta,
    comida: guia.comida,
    bebida: guia.bebida,
    atuacao: `Comemoração: ${guia.comemoracao}`,
    description: `${guia.description} Na Casa de Caridade Caboclo Batuara, ${guia.name} trabalha conosco trazendo ${guia.caracteristicas.slice(0, 3).join(', ').toLowerCase()}, sendo uma das entidades que nos orientam e protegem em nossa jornada espiritual.`,
    corTematica: getColorFromAttribute(guia.cor)
  };
};

// Converter dados de Linha da Umbanda para o modal
export const convertLinhaToModalData = (linha: LinhaUmbanda): SpiritualDetailData => {
  const linhaName = linha.name.replace(/^Linha de |^Linha da /, '');
  return {
    nome: linhaName,
    saudacao: `Salve a ${linhaName}`,
    elemento: 'Linha Espiritual',
    habitat: 'Plano Espiritual',
    simbolo: 'Força Organizadora',
    cor: linha.cor,
    diaSemana: 'Todos os dias',
    fruta: 'Varia por entidade',
    comida: 'Varia por entidade',
    bebida: 'Varia por entidade',
    atuacao: linha.atuacao,
    description: `${linha.description} Esta linha é regida por ${linha.regidaPor} e trabalha com as seguintes entidades: ${linha.entidades.join(', ')}. Na Casa de Caridade Caboclo Batuara, esta linha atua principalmente em ${linha.atuacao.toLowerCase()}.`,
    corTematica: getColorFromAttribute(linha.cor)
  };
};