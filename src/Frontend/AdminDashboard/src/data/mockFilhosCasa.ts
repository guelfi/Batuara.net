import { FilhoCasa } from '../types/FilhoCasa';

// Dados mockados realistas para Filhos da Casa
export const mockFilhosCasa: FilhoCasa[] = [
  {
    id: '1',
    nome: 'Maria Silva Santos',
    email: 'maria.silva@email.com',
    telefone: '(11) 99999-1234',
    dataEntrada: new Date('2020-03-15'),
    status: 'ativo',
    observacoes: 'Médium de incorporação, trabalha nas giras de Pretos Velhos',
    createdAt: new Date('2020-03-15'),
    updatedAt: new Date('2024-12-01')
  },
  {
    id: '2',
    nome: 'João Carlos Oliveira',
    email: 'joao.oliveira@email.com',
    telefone: '(11) 98888-5678',
    dataEntrada: new Date('2019-08-22'),
    status: 'ativo',
    observacoes: 'Cambono, auxilia nos trabalhos de mesa',
    createdAt: new Date('2019-08-22'),
    updatedAt: new Date('2024-11-15')
  },
  {
    id: '3',
    nome: 'Ana Paula Costa',
    email: 'ana.costa@email.com',
    telefone: '(11) 97777-9012',
    dataEntrada: new Date('2021-01-10'),
    status: 'ativo',
    observacoes: 'Médium de psicografia, trabalha com Caboclos',
    createdAt: new Date('2021-01-10'),
    updatedAt: new Date('2024-12-05')
  },
  {
    id: '4',
    nome: 'Carlos Eduardo Lima',
    email: 'carlos.lima@email.com',
    telefone: '(11) 96666-3456',
    dataEntrada: new Date('2018-05-30'),
    status: 'afastado',
    observacoes: 'Afastado temporariamente por motivos pessoais',
    createdAt: new Date('2018-05-30'),
    updatedAt: new Date('2024-10-20')
  },
  {
    id: '5',
    nome: 'Fernanda Rodrigues',
    email: 'fernanda.rodrigues@email.com',
    telefone: '(11) 95555-7890',
    dataEntrada: new Date('2022-07-18'),
    status: 'ativo',
    observacoes: 'Em desenvolvimento mediúnico, participa das giras de estudo',
    createdAt: new Date('2022-07-18'),
    updatedAt: new Date('2024-11-28')
  },
  {
    id: '6',
    nome: 'Roberto Almeida',
    email: 'roberto.almeida@email.com',
    telefone: '(11) 94444-2345',
    dataEntrada: new Date('2017-11-12'),
    status: 'ativo',
    observacoes: 'Dirigente, coordena os trabalhos de caridade',
    createdAt: new Date('2017-11-12'),
    updatedAt: new Date('2024-12-03')
  },
  {
    id: '7',
    nome: 'Luciana Ferreira',
    email: 'luciana.ferreira@email.com',
    telefone: '(11) 93333-6789',
    dataEntrada: new Date('2023-02-14'),
    status: 'ativo',
    observacoes: 'Nova na casa, em período de adaptação',
    createdAt: new Date('2023-02-14'),
    updatedAt: new Date('2024-12-01')
  },
  {
    id: '8',
    nome: 'Pedro Henrique Souza',
    email: 'pedro.souza@email.com',
    telefone: '(11) 92222-4567',
    dataEntrada: new Date('2020-09-05'),
    status: 'ativo',
    observacoes: 'Médium de cura, trabalha com Caboclos e Pretos Velhos',
    createdAt: new Date('2020-09-05'),
    updatedAt: new Date('2024-11-20')
  },
  {
    id: '9',
    nome: 'Juliana Martins',
    email: 'juliana.martins@email.com',
    telefone: '(11) 91111-8901',
    dataEntrada: new Date('2019-12-03'),
    status: 'inativo',
    observacoes: 'Inativo desde 2024, mudou de cidade',
    createdAt: new Date('2019-12-03'),
    updatedAt: new Date('2024-08-15')
  },
  {
    id: '10',
    nome: 'Anderson Silva',
    email: 'anderson.silva@email.com',
    telefone: '(11) 90000-1234',
    dataEntrada: new Date('2021-06-20'),
    status: 'ativo',
    observacoes: 'Responsável pela organização das festas e eventos',
    createdAt: new Date('2021-06-20'),
    updatedAt: new Date('2024-11-30')
  },
  {
    id: '11',
    nome: 'Patrícia Gomes',
    email: 'patricia.gomes@email.com',
    telefone: '(11) 98765-4321',
    dataEntrada: new Date('2022-03-08'),
    status: 'ativo',
    observacoes: 'Médium de vidência, auxilia nos atendimentos',
    createdAt: new Date('2022-03-08'),
    updatedAt: new Date('2024-12-02')
  },
  {
    id: '12',
    nome: 'Ricardo Santos',
    email: 'ricardo.santos@email.com',
    telefone: '(11) 97654-3210',
    dataEntrada: new Date('2018-10-15'),
    status: 'ativo',
    observacoes: 'Dirigente, coordena as giras de desenvolvimento',
    createdAt: new Date('2018-10-15'),
    updatedAt: new Date('2024-11-25')
  },
  {
    id: '13',
    nome: 'Camila Oliveira',
    email: 'camila.oliveira@email.com',
    telefone: '(11) 96543-2109',
    dataEntrada: new Date('2023-05-22'),
    status: 'ativo',
    observacoes: 'Em desenvolvimento, participa das giras de estudo',
    createdAt: new Date('2023-05-22'),
    updatedAt: new Date('2024-12-04')
  },
  {
    id: '14',
    nome: 'Marcos Pereira',
    email: 'marcos.pereira@email.com',
    telefone: '(11) 95432-1098',
    dataEntrada: new Date('2020-01-18'),
    status: 'afastado',
    observacoes: 'Afastado por motivos de saúde, retorno previsto para 2025',
    createdAt: new Date('2020-01-18'),
    updatedAt: new Date('2024-09-10')
  },
  {
    id: '15',
    nome: 'Beatriz Lima',
    email: 'beatriz.lima@email.com',
    telefone: '(11) 94321-0987',
    dataEntrada: new Date('2021-11-30'),
    status: 'ativo',
    observacoes: 'Cambona, auxilia nos trabalhos de limpeza espiritual',
    createdAt: new Date('2021-11-30'),
    updatedAt: new Date('2024-11-18')
  },
  {
    id: '16',
    nome: 'Gabriel Costa',
    email: 'gabriel.costa@email.com',
    telefone: '(11) 93210-9876',
    dataEntrada: new Date('2022-08-14'),
    status: 'ativo',
    observacoes: 'Jovem médium, em desenvolvimento com Caboclos',
    createdAt: new Date('2022-08-14'),
    updatedAt: new Date('2024-12-06')
  },
  {
    id: '17',
    nome: 'Renata Alves',
    email: 'renata.alves@email.com',
    telefone: '(11) 92109-8765',
    dataEntrada: new Date('2019-04-07'),
    status: 'ativo',
    observacoes: 'Médium experiente, trabalha com todas as linhas',
    createdAt: new Date('2019-04-07'),
    updatedAt: new Date('2024-11-22')
  },
  {
    id: '18',
    nome: 'Thiago Barbosa',
    email: 'thiago.barbosa@email.com',
    telefone: '(11) 91098-7654',
    dataEntrada: new Date('2023-09-11'),
    status: 'ativo',
    observacoes: 'Novo na casa, demonstra grande potencial mediúnico',
    createdAt: new Date('2023-09-11'),
    updatedAt: new Date('2024-12-07')
  },
  {
    id: '19',
    nome: 'Vanessa Rocha',
    email: 'vanessa.rocha@email.com',
    telefone: '(11) 90987-6543',
    dataEntrada: new Date('2020-12-25'),
    status: 'inativo',
    observacoes: 'Inativa desde 2023, questões pessoais',
    createdAt: new Date('2020-12-25'),
    updatedAt: new Date('2023-06-30')
  },
  {
    id: '20',
    nome: 'Leonardo Dias',
    email: 'leonardo.dias@email.com',
    telefone: '(11) 99876-5432',
    dataEntrada: new Date('2021-04-16'),
    status: 'ativo',
    observacoes: 'Responsável pela manutenção do terreiro e organização',
    createdAt: new Date('2021-04-16'),
    updatedAt: new Date('2024-11-29')
  }
];

// Função para obter estatísticas dos filhos da casa
export const getFilhosCasaStats = () => {
  const total = mockFilhosCasa.length;
  const ativos = mockFilhosCasa.filter(f => f.status === 'ativo').length;
  const afastados = mockFilhosCasa.filter(f => f.status === 'afastado').length;
  const inativos = mockFilhosCasa.filter(f => f.status === 'inativo').length;
  
  return {
    total,
    ativos,
    afastados,
    inativos
  };
};