// Dados das Linhas da Umbanda baseados na Apostila Batuara 2024
export interface LinhaUmbanda {
  id: string;
  name: string;
  regidaPor: string;
  entidades: string[];
  atuacao: string;
  cor: string;
  description: string;
}

export const linhasUmbandaData: LinhaUmbanda[] = [
  {
    id: '1',
    name: 'Linha de Oxalá (Linha da Fé)',
    regidaPor: 'Oxalá',
    entidades: ['Cristos', 'Anjos', 'Espíritos elevados', 'Guias da luz'],
    atuacao: 'Iluminação, fé, equilíbrio, paz, caridade',
    cor: 'Branco',
    description: 'Regida por Oxalá, o Pai maior e luz divina. Esta linha trabalha com a iluminação espiritual, fortalecimento da fé e promoção da paz interior através da caridade.'
  },
  {
    id: '2',
    name: 'Linha de Ogum (Linha da Lei e da Ordem)',
    regidaPor: 'Ogum',
    entidades: ['Caboclos guerreiros', 'Soldados espirituais'],
    atuacao: 'Quebra de demandas, justiça, força, desobsessão',
    cor: 'Vermelho',
    description: 'Linha regida por Ogum, focada na manutenção da lei e ordem espiritual. Atua na quebra de demandas negativas e proteção através da força e justiça.'
  },
  {
    id: '3',
    name: 'Linha de Oxóssi (Linha do Conhecimento)',
    regidaPor: 'Oxóssi',
    entidades: ['Caboclos caçadores', 'Mestres do conhecimento'],
    atuacao: 'Sabedoria, cura, abertura de caminhos, natureza',
    cor: 'Verde',
    description: 'Regida por Oxóssi, esta linha trabalha com a sabedoria ancestral, cura através da natureza e abertura de caminhos para o conhecimento espiritual.'
  },
  {
    id: '4',
    name: 'Linha de Xangô (Linha da Justiça)',
    regidaPor: 'Xangô',
    entidades: ['Pretos-Velhos juristas', 'Juízes espirituais'],
    atuacao: 'Justiça, equilíbrio, sabedoria ancestral',
    cor: 'Marrom',
    description: 'Linha regida por Xangô, focada na aplicação da justiça divina e equilíbrio espiritual através da sabedoria ancestral dos Pretos-Velhos juristas.'
  },
  {
    id: '5',
    name: 'Linha de Iemanjá (Linha do Amor e da Geração)',
    regidaPor: 'Iemanjá',
    entidades: ['Marinheiros', 'Iabás', 'Mães espirituais'],
    atuacao: 'Emoções, família, gestação, acolhimento',
    cor: 'Azul-claro',
    description: 'Regida por Iemanjá, mãe de todos os Orixás. Esta linha trabalha com as emoções, proteção familiar, gestação e acolhimento maternal.'
  },
  {
    id: '6',
    name: 'Linha de Iansã (Linha das Almas e Espíritos)',
    regidaPor: 'Iansã',
    entidades: ['Eguns', 'Espíritos em trânsito', 'Mensageiros'],
    atuacao: 'Desencarne, passagem, purificação energética',
    cor: 'Amarelo',
    description: 'Linha regida por Iansã, senhora dos ventos e das almas. Trabalha com espíritos em trânsito, auxiliando no desencarne e purificação energética.'
  },
  {
    id: '7',
    name: 'Linha de Exu (Linha da Comunicação e Movimento)',
    regidaPor: 'Exu e Pomba Gira',
    entidades: ['Exus', 'Pombas Giras', 'Guardiões'],
    atuacao: 'Comunicação entre mundos, abertura de caminhos, proteção',
    cor: 'Preto e vermelho',
    description: 'Regida por Exu e Pomba Gira, esta linha trabalha como comunicadora entre os mundos espiritual e material, abrindo caminhos e oferecendo proteção.'
  }
];

// Informações complementares sobre as forças da natureza
export const forcasNatureza = {
  title: 'ORIXÁS - FORÇAS NATURAIS',
  description: 'Para maior percepção de nossos estudos, identificamos cada ORIXÁ com uma força ou elemento da natureza.',
  totalForcas: 10,
  elementos: {
    ar: {
      name: 'AR',
      orixas: ['Oxalá', 'Iansã'],
      description: 'Elemento da espiritualidade e transformação'
    },
    agua: {
      name: 'ÁGUA', 
      orixas: ['Iemanjá', 'Oxum', 'Nanã'],
      description: 'Elemento das emoções e da vida'
    },
    fogo: {
      name: 'FOGO',
      orixas: ['Ogum'],
      description: 'Elemento da força e da batalha'
    },
    mata: {
      name: 'MATA',
      orixas: ['Oxóssi'],
      description: 'Elemento da prosperidade e fartura'
    },
    rocha: {
      name: 'ROCHA',
      orixas: ['Xangô'],
      description: 'Elemento da justiça e firmeza'
    },
    terra: {
      name: 'TERRA',
      orixas: ['Obaluaê', 'Exu', 'Pomba Gira'],
      description: 'Elemento da cura e dos caminhos'
    }
  }
};