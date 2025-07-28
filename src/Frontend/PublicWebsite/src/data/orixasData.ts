// Dados dos Orixás baseados na Apostila Batuara 2024
export interface Orixa {
  id: string;
  name: string;
  element: string;
  habitat: string;
  atuacao: string;
  saudacao: string;
  simbolo: string;
  cor: string;
  diaSemana: string;
  fruta: string;
  comida: string;
  bebida: string;
  dataComemoração: string;
  description: string;
}

export const orixasData: Orixa[] = [
  {
    id: '1',
    name: 'Oxalá',
    element: 'Ar',
    habitat: 'Campo aberto / planície',
    atuacao: 'Espiritualidade',
    saudacao: 'Epa babá',
    simbolo: 'Pomba Branca',
    cor: 'Branco',
    diaSemana: 'Sexta',
    fruta: 'Uva Branca',
    comida: 'Canjica',
    bebida: 'Champagne Branca',
    dataComemoração: 'Data não especificada',
    description: 'Orixá maior, pai de todos os Orixás, representa a paz, a pureza e a criação.'
  },
  {
    id: '2',
    name: 'Iemanjá',
    element: 'Água',
    habitat: 'Mar - Praia',
    atuacao: 'Família',
    saudacao: 'Odocya',
    simbolo: 'Pérola ou estrela do Mar',
    cor: 'Azul',
    diaSemana: 'Sábado',
    fruta: 'Mamão Papaya',
    comida: 'Peixe',
    bebida: 'Champagne Branca',
    dataComemoração: '23 de Abril',
    description: 'Mãe de todos os Orixás, rainha dos mares, protetora da família e da maternidade.'
  },
  {
    id: '3',
    name: 'Nanã',
    element: 'Água',
    habitat: 'Areia molhada da praia (cavar)',
    atuacao: 'Emoções',
    saudacao: 'Salupa Nanã',
    simbolo: 'Vassoura de palha da Costa',
    cor: 'Lilás',
    diaSemana: 'Sábado',
    fruta: 'Romã',
    comida: 'Água Salgada Casquinha Siri',
    bebida: 'Champagne Branca',
    dataComemoração: '15 de Agosto',
    description: 'Orixá anciã, senhora da sabedoria, da lama primordial e dos mistérios da vida e morte.'
  },
  {
    id: '4',
    name: 'Oxum',
    element: 'Água',
    habitat: 'Rio',
    atuacao: 'Amor – Fertilidade',
    saudacao: 'Aiê iê ô',
    simbolo: 'Ouro',
    cor: 'Dourado',
    diaSemana: 'Sábado',
    fruta: 'Melão',
    comida: 'Peixe água doce',
    bebida: 'Champagne Branca',
    dataComemoração: '16 de Agosto',
    description: 'Orixá do amor, da beleza, da fertilidade e dos rios. Senhora das águas doces.'
  },
  {
    id: '5',
    name: 'Ogum',
    element: 'Fogo',
    habitat: 'Estrada',
    atuacao: 'Batalha',
    saudacao: 'Ogunhê',
    simbolo: 'Espada de aço',
    cor: 'Vermelho',
    diaSemana: 'Quinta',
    fruta: 'Lima da Pérsia',
    comida: 'Feijoada',
    bebida: 'Cerveja',
    dataComemoração: '27 de Julho',
    description: 'Orixá guerreiro, senhor do ferro, das estradas e das batalhas. Protetor dos trabalhadores.'
  },
  {
    id: '6',
    name: 'Oxóssi',
    element: 'Terra',
    habitat: 'Mata',
    atuacao: 'Prosperidade/fartura',
    saudacao: 'Oxossi ê',
    simbolo: 'Arco e flecha',
    cor: 'Verde',
    diaSemana: 'Terça',
    fruta: 'Goiaba',
    comida: 'Caça',
    bebida: 'Cerveja',
    dataComemoração: '20 de Janeiro',
    description: 'Orixá caçador, senhor das matas e da fartura. Protetor da natureza e provedor do sustento.'
  },
  {
    id: '7',
    name: 'Xangô',
    element: 'Terra',
    habitat: 'Pedra',
    atuacao: 'Justiça',
    saudacao: 'Kao Kabecile',
    simbolo: 'Machado de pedra',
    cor: 'Marrom',
    diaSemana: 'Quarta',
    fruta: 'Banana da terra',
    comida: 'Rabada c/ guiabo',
    bebida: 'Cerveja Preta',
    dataComemoração: '04 de Dezembro',
    description: 'Orixá da justiça, do fogo e do trovão. Rei poderoso que pune os injustos e protege os oprimidos.'
  },
  {
    id: '8',
    name: 'Iansã',
    element: 'Ar',
    habitat: 'Queda da cachoeira',
    atuacao: 'Transformação',
    saudacao: 'Eparrey',
    simbolo: 'Espada',
    cor: 'Alaranjado',
    diaSemana: 'Quarta',
    fruta: 'Manga',
    comida: 'Acarajé',
    bebida: 'Champagne Branca',
    dataComemoração: 'Data não especificada',
    description: 'Orixá dos ventos, das tempestades e da transformação. Senhora dos raios e das mudanças.'
  },
  {
    id: '9',
    name: 'Obaluaê',
    element: 'Terra',
    habitat: 'Cemitério',
    atuacao: 'Saúde',
    saudacao: 'Atoto Obaluaê',
    simbolo: 'Palha da costa',
    cor: 'Roxo',
    diaSemana: 'Segunda',
    fruta: 'Pinha',
    comida: 'Carne de porco',
    bebida: 'Vinho Branco',
    dataComemoração: '31 de Outubro',
    description: 'Orixá da cura e das doenças. Senhor da vida e da morte, médico dos Orixás.'
  },
  {
    id: '10',
    name: 'Exu',
    element: 'Terra',
    habitat: 'Encruzilhada 4 pontas',
    atuacao: 'Caminho',
    saudacao: 'Laroye Exu',
    simbolo: 'Tridente',
    cor: 'Vermelho',
    diaSemana: 'Segunda',
    fruta: 'Figo da India',
    comida: 'Figado ou Miudos de Frango',
    bebida: 'Pinga',
    dataComemoração: '25 de Dezembro',
    description: 'Orixá mensageiro, guardião dos caminhos e das encruzilhadas. Comunicador entre os mundos.'
  },
  {
    id: '11',
    name: 'Pomba Gira',
    element: 'Terra',
    habitat: 'Encruzilhada 3 pontas ou T',
    atuacao: 'Caminho',
    saudacao: 'Laroye Pomba gira',
    simbolo: 'Tridente c/ 2 pontas',
    cor: 'Preto',
    diaSemana: 'Segunda',
    fruta: 'Figo ou Pera',
    comida: 'Figado ou Miudos de Frango',
    bebida: 'Champagne Vermelha',
    dataComemoração: 'Data não especificada',
    description: 'Entidade feminina dos caminhos, senhora das encruzilhadas e dos mistérios femininos.'
  },
  {
    id: '12',
    name: 'Ossain',
    element: 'Terra',
    habitat: 'Ervas Rasteiras',
    atuacao: 'Cura',
    saudacao: 'Ewê Ossain',
    simbolo: 'Folhas e ervas',
    cor: 'Verde',
    diaSemana: 'Terça',
    fruta: 'Ervas medicinais',
    comida: 'Preparados com ervas',
    bebida: 'Cerveja',
    dataComemoração: '02 de Fevereiro',
    description: 'Orixá das folhas e ervas medicinais. Senhor do conhecimento das plantas curativas.'
  },
  {
    id: '13',
    name: 'Oxumarê',
    element: 'Água',
    habitat: 'Encontro do rio com mar',
    atuacao: 'Conflitos emocionais',
    saudacao: 'Arroboboi Oxumarê',
    simbolo: 'Serpente/Arco-íris',
    cor: 'Amarelo e Verde',
    diaSemana: 'Terça',
    fruta: 'Milho',
    comida: 'Feijão fradinho',
    bebida: 'Champagne Branca',
    dataComemoração: '30 de Setembro',
    description: 'Orixá da transformação, do movimento e da renovação. Representa o arco-íris e a serpente.'
  }
];