// Dados das Guias e Entidades baseados na Apostila Batuara 2024
export interface GuiaEntidade {
  id: string;
  name: string;
  comemoracao: string;
  saudacao: string;
  habitat: string;
  cor: string;
  diaSemana: string;
  bebida: string;
  fruta: string;
  comida: string;
  description: string;
  caracteristicas: string[];
}

export const guiasEntidadesData: GuiaEntidade[] = [
  {
    id: '1',
    name: 'Baiano',
    comemoracao: '04/08',
    saudacao: 'Salve Nosso Senhor do Bonfim',
    habitat: 'Praias e cidades da Bahia',
    cor: 'Amarelo e Vermelho',
    diaSemana: 'Quinta-feira',
    bebida: 'Pinga',
    fruta: 'Coco / Cajú',
    comida: 'Farofa',
    description: 'Entidades alegres e festeiras, vindas da Bahia. Conhecidos por sua sabedoria popular e humor.',
    caracteristicas: [
      'Alegria contagiante',
      'Sabedoria popular',
      'Gosto por festas',
      'Linguagem típica baiana',
      'Proteção através da alegria'
    ]
  },
  {
    id: '2',
    name: 'Preto Velho',
    comemoracao: '13/05',
    saudacao: 'Adorei as Almas',
    habitat: 'Senzalas e terreiros antigos',
    cor: 'Branco e Preto',
    diaSemana: 'Segunda-feira',
    bebida: 'Café / Vinho',
    fruta: 'Caqui',
    comida: 'Feijão Preto s/ pertences',
    description: 'Espíritos de anciãos africanos, símbolos de sabedoria, paciência e humildade.',
    caracteristicas: [
      'Sabedoria ancestral',
      'Paciência infinita',
      'Humildade profunda',
      'Conselhos valiosos',
      'Cura através da fé'
    ]
  },
  {
    id: '3',
    name: 'Erês',
    comemoracao: '27/09',
    saudacao: 'Aminbeijada',
    habitat: 'Jardins e parques infantis',
    cor: 'Rosa e Azul',
    diaSemana: 'Domingo',
    bebida: 'Refrigerante',
    fruta: 'Doces',
    comida: 'Caruru',
    description: 'Espíritos de crianças, trazem alegria, pureza e inocência. São os mensageiros da esperança.',
    caracteristicas: [
      'Pureza de coração',
      'Alegria contagiante',
      'Inocência genuína',
      'Brincadeiras e risos',
      'Proteção das crianças'
    ]
  },
  {
    id: '4',
    name: 'Boiadeiro',
    comemoracao: '24/06',
    saudacao: 'Getruá seu Boiadeiro',
    habitat: 'Campos e fazendas',
    cor: 'Marrom e Bege',
    diaSemana: 'Terça-feira',
    bebida: 'Pinga/Cerveja',
    fruta: 'Laranja',
    comida: 'Arroz Carreteiro',
    description: 'Espíritos de vaqueiros e trabalhadores rurais, conhecidos por sua força e determinação.',
    caracteristicas: [
      'Força e coragem',
      'Determinação',
      'Simplicidade',
      'Proteção do gado',
      'Trabalho árduo'
    ]
  },
  {
    id: '5',
    name: 'Marinheiro',
    comemoracao: '07/07',
    saudacao: 'Salve Nossa Senhora dos Navegantes',
    habitat: 'Portos e navios',
    cor: 'Azul e Branco',
    diaSemana: 'Sábado',
    bebida: 'Rum',
    fruta: 'Pera',
    comida: 'Peixe frito',
    description: 'Espíritos dos mares, navegadores experientes que trazem proteção nas viagens.',
    caracteristicas: [
      'Conhecimento dos mares',
      'Proteção em viagens',
      'Aventura e coragem',
      'Histórias fascinantes',
      'Ligação com Iemanjá'
    ]
  },
  {
    id: '6',
    name: 'Cigano',
    comemoracao: '24/05',
    saudacao: 'É de Ouro e Oriente',
    habitat: 'Estradas e acampamentos',
    cor: 'Dourado e Roxo',
    diaSemana: 'Sexta-feira',
    bebida: 'Vinho',
    fruta: 'Carambola',
    comida: 'Pernil',
    description: 'Espíritos nômades, conhecedores dos mistérios, da magia e da leitura do destino.',
    caracteristicas: [
      'Conhecimento místico',
      'Leitura do destino',
      'Liberdade de espírito',
      'Magia e encantamentos',
      'Proteção em viagens'
    ]
  },
  {
    id: '7',
    name: 'Malandro',
    comemoracao: '18/03',
    saudacao: 'Salve a Malandragem',
    habitat: 'Ruas e esquinas da cidade',
    cor: 'Preto e Branco',
    diaSemana: 'Quarta-feira',
    bebida: 'Cerveja',
    fruta: 'Maçã Abacaxi',
    comida: 'Buteco',
    description: 'Espíritos urbanos, conhecedores da vida nas ruas, trazem proteção e esperteza.',
    caracteristicas: [
      'Esperteza urbana',
      'Proteção nas ruas',
      'Jogo de cintura',
      'Conhecimento da vida',
      'Humor e malandragem'
    ]
  }
];