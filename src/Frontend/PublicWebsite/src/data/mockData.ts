// Dados mockados baseados no seed data da Casa Batuara
import { 
  Event, 
  EventType, 
  CalendarAttendance, 
  AttendanceType, 
  Orixa, 
  UmbandaLine, 
  SpiritualContent, 
  SpiritualContentType, 
  SpiritualCategory,
  ContactInfo 
} from '../types';

// Dados dos Orixás baseados na Apostila Batuara 2024
export const mockOrixas: Orixa[] = [
  {
    id: 1,
    name: 'Oxalá',
    description: 'Oxalá é o maior dos Orixás, pai de todos os outros Orixás e de toda a humanidade. Representa a paz, a pureza, a sabedoria e a criação.',
    origin: 'Oxalá tem origem na tradição Yorubá da África, onde é conhecido como Obatalá. É considerado o criador da humanidade e o pai de todos os Orixás.',
    batuaraTeaching: 'Na Casa Batuara, Oxalá é reverenciado como o grande pai, aquele que nos ensina a humildade, a paciência e o amor incondicional. Seus ensinamentos nos mostram que através da paz interior e da pureza de coração podemos alcançar a elevação espiritual.',
    displayOrder: 1,
    characteristics: ['Paciência', 'Sabedoria', 'Pureza', 'Paz', 'Criação', 'Paternidade', 'Humildade', 'Amor incondicional'],
    colors: ['Branco', 'Azul claro'],
    elements: ['Ar', 'Éter', 'Luz'],
    isActive: true,
  },
  {
    id: 2,
    name: 'Yemanjá',
    description: 'Yemanjá é a mãe de todos os Orixás e rainha dos mares. Representa a maternidade, a fertilidade, a proteção e o amor maternal.',
    origin: 'Yemanjá tem origem na tradição Yorubá, onde é conhecida como Yemoja. É a divindade dos rios e mares, mãe de muitos Orixás e protetora das mulheres e crianças.',
    batuaraTeaching: 'A Casa Batuara tem especial devoção à Yemanjá, nossa mãe querida. Ela nos ensina o amor incondicional de mãe, a proteção aos necessitados e a importância da família espiritual.',
    displayOrder: 2,
    characteristics: ['Maternidade', 'Proteção', 'Fertilidade', 'Amor maternal', 'Cura', 'Acolhimento', 'Generosidade', 'Compaixão'],
    colors: ['Azul', 'Branco', 'Azul marinho', 'Prata'],
    elements: ['Água', 'Mar', 'Rios', 'Conchas'],
    isActive: true,
  },
  {
    id: 3,
    name: 'Iansã',
    description: 'Iansã é a senhora dos ventos, tempestades e raios. Orixá guerreira, corajosa e determinada, que luta pela justiça e protege os oprimidos.',
    origin: 'Iansã, conhecida como Oyá na tradição Yorubá, é a divindade dos ventos e tempestades. É esposa de Xangô e uma das mais respeitadas guerreiras entre os Orixás.',
    batuaraTeaching: 'Na Casa Batuara, Iansã é reverenciada como a guerreira da luz, aquela que nos ensina a coragem para enfrentar as adversidades da vida.',
    displayOrder: 3,
    characteristics: ['Coragem', 'Justiça', 'Determinação', 'Liderança', 'Proteção', 'Transformação', 'Força', 'Independência'],
    colors: ['Amarelo', 'Vermelho', 'Coral', 'Dourado'],
    elements: ['Vento', 'Tempestade', 'Raio', 'Fogo'],
    isActive: true,
  },
  {
    id: 4,
    name: 'Ogum',
    description: 'Ogum é o Orixá guerreiro, senhor do ferro, da tecnologia e dos caminhos. Representa o trabalho, a perseverança, a luta pelos objetivos.',
    origin: 'Ogum é uma das divindades mais antigas da tradição Yorubá, conhecido como o senhor do ferro e da guerra.',
    batuaraTeaching: 'A Casa Batuara ensina que Ogum é o grande trabalhador, aquele que nos mostra a importância do esforço e da dedicação para alcançar nossos objetivos.',
    displayOrder: 4,
    characteristics: ['Trabalho', 'Perseverança', 'Coragem', 'Determinação', 'Proteção', 'Liderança', 'Honestidade', 'Força de vontade'],
    colors: ['Azul escuro', 'Vermelho', 'Verde escuro'],
    elements: ['Ferro', 'Metal', 'Terra', 'Fogo'],
    isActive: true,
  },
];

// Dados das Linhas da Umbanda
export const mockUmbandaLines: UmbandaLine[] = [
  {
    id: 1,
    name: 'Linha de Oxalá',
    description: 'A Linha de Oxalá é a linha da paz, da fé e da elevação espiritual. Trabalha com a energia da criação, da purificação e da conexão com o divino.',
    characteristics: 'Entidades desta linha trabalham com energias de paz, harmonia, fé, purificação espiritual e elevação da consciência.',
    batuaraInterpretation: 'Na Casa Batuara, a Linha de Oxalá é considerada a linha mestra, aquela que rege todas as outras. Nossos guias desta linha nos ensinam que a verdadeira força está na humildade e no amor.',
    displayOrder: 1,
    entities: ['Pai João de Oxalá', 'Vovô Benedito', 'Pai Francisco', 'Vovó Maria Conga', 'Caboclo Pena Branca'],
    workingDays: ['Domingo', 'Quinta-feira'],
    isActive: true,
  },
  {
    id: 2,
    name: 'Linha de Yemanjá',
    description: 'A Linha de Yemanjá trabalha com as energias do amor maternal, da proteção, da cura emocional e da purificação através das águas.',
    characteristics: 'Entidades desta linha são conhecidas por seu amor maternal, proteção às famílias, cura de traumas emocionais e limpeza espiritual.',
    batuaraInterpretation: 'Na Casa Batuara, a Linha de Yemanjá é muito querida e respeitada. Nossos guias desta linha são verdadeiras mães espirituais que acolhem a todos com amor incondicional.',
    displayOrder: 2,
    entities: ['Mãe Yara', 'Sereia do Mar', 'Cabocla Jurema', 'Vovó Cambinda', 'Mãe Oxum'],
    workingDays: ['Sábado', 'Segunda-feira'],
    isActive: true,
  },
  {
    id: 3,
    name: 'Linha dos Caboclos',
    description: 'A Linha dos Caboclos trabalha com as energias da natureza, da cura através das ervas, da força e da conexão com os elementos naturais.',
    characteristics: 'Os Caboclos são espíritos de índios que trabalham com a força da natureza, conhecimento das ervas medicinais, proteção e cura.',
    batuaraInterpretation: 'Na Casa Batuara, os Caboclos são nossos grandes protetores e curadores. Eles nos ensinam o respeito pela natureza e o uso das plantas para a cura.',
    displayOrder: 3,
    entities: ['Caboclo Pena Verde', 'Cabocla Jurema', 'Caboclo Sete Flechas', 'Cabocla Jandira', 'Caboclo Tupinambá'],
    workingDays: ['Terça-feira', 'Quinta-feira'],
    isActive: true,
  },
];

// Conteúdos Espirituais
export const mockSpiritualContent: SpiritualContent[] = [
  {
    id: 1,
    title: 'Pai Nosso da Umbanda',
    content: `Pai nosso que estais no infinito,
Santificado seja o vosso reino de luz.
Venha a nós a vossa paz,
Seja feita a vossa vontade,
Assim na Terra como no infinito.

O pão nosso de cada dia nos dai hoje,
Perdoai as nossas dívidas,
Assim como nós perdoamos aos nossos devedores.
Não nos deixeis cair em tentação,
Mas livrai-nos de todo mal.

Porque vosso é o reino,
O poder e a glória,
Para todo o sempre.
Saravá!`,
    type: SpiritualContentType.Prayer,
    category: SpiritualCategory.Umbanda,
    source: 'Apostila Batuara 2024',
    displayOrder: 1,
    isFeatured: true,
    isActive: true,
  },
  {
    id: 2,
    title: 'A Caridade Segundo os Ensinamentos da Casa Batuara',
    content: `A caridade é o fundamento de toda a nossa doutrina. Não se trata apenas de dar esmolas ou ajudar materialmente, mas sim de amar verdadeiramente ao próximo como a nós mesmos.

A verdadeira caridade começa no coração. É preciso ter compaixão, compreensão e amor por todos os seres, independentemente de sua condição social, raça ou religião.

Na Casa Batuara, praticamos a caridade de várias formas:
- Através da assistência espiritual gratuita
- Do atendimento aos necessitados
- Da orientação e consolação aos aflitos
- Do ensino da doutrina espírita e umbandista
- Da promoção da fraternidade entre todos

Lembrem-se sempre: "Fora da caridade não há salvação".`,
    type: SpiritualContentType.Teaching,
    category: SpiritualCategory.General,
    source: 'Apostila Batuara 2024',
    displayOrder: 2,
    isFeatured: true,
    isActive: true,
  },
];

// Eventos mockados
export const mockEvents: Event[] = [
  {
    id: 1,
    title: 'Festa de Yemanjá',
    description: 'Celebração em honra à nossa querida Mãe Yemanjá, com gira especial e oferendas ao mar.',
    date: '2025-02-02',
    startTime: '19:00',
    endTime: '22:00',
    type: EventType.Festa,
    location: 'Casa de Caridade Batuara',
    isActive: true,
  },
  {
    id: 2,
    title: 'Palestra: Os Orixás na Umbanda',
    description: 'Palestra educativa sobre os Orixás e seus ensinamentos na tradição umbandista.',
    date: '2025-01-25',
    startTime: '19:30',
    endTime: '21:00',
    type: EventType.Palestra,
    location: 'Casa de Caridade Batuara',
    isActive: true,
  },
  {
    id: 3,
    title: 'Bazar Beneficente',
    description: 'Bazar com roupas, livros e artesanatos para arrecadar fundos para as obras da casa.',
    date: '2025-01-30',
    startTime: '14:00',
    endTime: '18:00',
    type: EventType.Bazar,
    location: 'Casa de Caridade Batuara',
    isActive: true,
  },
];

// Calendário de Atendimentos
export const mockCalendarAttendances: CalendarAttendance[] = [
  {
    id: 1,
    date: '2025-01-21',
    startTime: '19:00',
    endTime: '21:00',
    type: AttendanceType.Kardecismo,
    description: 'Atendimento Kardecista',
    observations: 'Trazer água',
    requiresRegistration: false,
    isActive: true,
  },
  {
    id: 2,
    date: '2025-01-24',
    startTime: '20:00',
    endTime: '22:00',
    type: AttendanceType.Umbanda,
    description: 'Gira de Umbanda',
    observations: 'Usar roupas brancas',
    requiresRegistration: false,
    isActive: true,
  },
  {
    id: 3,
    date: '2025-01-26',
    startTime: '14:00',
    endTime: '17:00',
    type: AttendanceType.Curso,
    description: 'Curso de Desenvolvimento Mediúnico',
    requiresRegistration: true,
    maxCapacity: 30,
    isActive: true,
  },
];

// Informações de Contato
export const mockContactInfo: ContactInfo = {
  address: 'Av.Brigadeiro Faria Lima, 2750 - Jardim Cocaia, Guarulhos - SP, 07130-000',
  phone: '(11) 1234-5678', // Mantido para compatibilidade, mas não será exibido
  email: 'contato@casabatuara.org.br',
  instagram: '@casadecaridade.batuara',
  instagramUrl: 'https://www.instagram.com/casadecaridade.batuara?igsh=ejU1dWozbTZlYXM4',
  pixKey: 'contato@casabatuara.org.br',
};