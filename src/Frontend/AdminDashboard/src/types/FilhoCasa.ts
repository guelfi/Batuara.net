export interface FilhoCasa {
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

export interface FilhoCasaFormData {
  nome: string;
  email: string;
  telefone: string;
  dataEntrada: string;
  status: 'ativo' | 'afastado' | 'inativo';
  observacoes: string;
}