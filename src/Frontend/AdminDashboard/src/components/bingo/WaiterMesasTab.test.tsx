import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import WaiterMesasTab from './WaiterMesasTab';
import bingoApi from '../../services/bingoApi';

jest.mock('qrcode', () => ({
  __esModule: true,
  default: { toDataURL: () => Promise.resolve('data:image/png;base64,AAAA') },
}));
jest.mock('../../services/bingoApi', () => ({
  __esModule: true,
  default: { getWaiterTablesStatus: jest.fn(), getMesaQrUrl: jest.fn() },
}));

// o Admin declara `jest` como any (jest-runtime.d.ts): sem tipos de mock
const getStatus = bingoApi.getWaiterTablesStatus as any;
const getQrUrl = bingoApi.getMesaQrUrl as any;

const tables = [
  { numero: 1, lugares: 4, exclusiva: false, ocupados: 0, livres: 4, comandas: 0, estado: 'Free', ocupantes: [] },
  { numero: 2, lugares: 4, exclusiva: false, ocupados: 2, livres: 2, comandas: 1, estado: 'HasSeats', ocupantes: [{ nome: 'Maria', pessoas: 2 }] },
];

beforeEach(() => {
  jest.clearAllMocks();
  getStatus.mockResolvedValue(tables);
  getQrUrl.mockResolvedValue('https://www.batuara.org.br/bingo?mesa=2&s=abc');
  // dimensões da área do QR (o jsdom não calcula layout)
  jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(320);
  jest.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(300);
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('sem mesa escolhida mostra a caixa de seleção e a grade, sem QR nem botão de voltar', async () => {
  render(<WaiterMesasTab mesas={[1, 2]} />);
  expect(await screen.findByTestId('mesa-1')).toBeInTheDocument();
  expect(screen.getByLabelText('Selecionar mesa')).toBeInTheDocument();
  expect(screen.queryByAltText(/QR code da mesa/)).toBeNull();
  expect(screen.queryByRole('button', { name: 'Voltar às mesas' })).toBeNull();
});

test('ao escolher a mesa: a caixa de seleção some e ficam o card, o QR (entre eles e o botão) e "Voltar às mesas"', async () => {
  render(<WaiterMesasTab mesas={[1, 2]} />);
  fireEvent.click(await screen.findByTestId('mesa-2'));

  const card = await screen.findByTestId('mesa-detalhe-2');
  const qr = await screen.findByAltText('QR code da mesa 2');
  const voltar = screen.getByRole('button', { name: 'Voltar às mesas' });
  expect(screen.queryByLabelText('Selecionar mesa')).toBeNull();
  expect(screen.queryByTestId('mesa-1')).toBeNull();
  expect(getQrUrl).toHaveBeenCalledWith(2);
  // não há mais opção de ampliar o QR
  expect(screen.queryByText(/ampliar/i)).toBeNull();

  // ordem na tela: card da mesa, QR, botão de voltar
  expect(card.compareDocumentPosition(qr) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(qr.compareDocumentPosition(voltar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  // o QR usa o espaço disponível (o menor lado da área)
  expect(qr).toHaveStyle({ width: '300px', height: '300px' });
});

test('"Voltar às mesas" traz de volta a caixa de seleção e a grade e tira o QR', async () => {
  render(<WaiterMesasTab mesas={[1, 2]} />);
  fireEvent.click(await screen.findByTestId('mesa-2'));
  await screen.findByAltText('QR code da mesa 2');

  fireEvent.click(screen.getByRole('button', { name: 'Voltar às mesas' }));
  expect(await screen.findByTestId('mesa-1')).toBeInTheDocument();
  expect(screen.getByLabelText('Selecionar mesa')).toBeInTheDocument();
  expect(screen.queryByAltText(/QR code da mesa/)).toBeNull();
  expect(screen.queryByRole('button', { name: 'Voltar às mesas' })).toBeNull();
});

test('escolher pela caixa de seleção também mostra o card e o QR', async () => {
  render(<WaiterMesasTab mesas={[1, 2]} />);
  await screen.findByTestId('mesa-1');
  fireEvent.mouseDown(screen.getByLabelText('Selecionar mesa'));
  fireEvent.click(await screen.findByRole('option', { name: 'Mesa 2' }));

  expect(await screen.findByTestId('mesa-detalhe-2')).toBeInTheDocument();
  expect(await screen.findByAltText('QR code da mesa 2')).toBeInTheDocument();
  expect(screen.queryByLabelText('Selecionar mesa')).toBeNull();
});

test('falha ao gerar o QR mostra o aviso e mantém o botão de voltar', async () => {
  getQrUrl.mockRejectedValue(new Error('falhou'));
  render(<WaiterMesasTab mesas={[1, 2]} />);
  fireEvent.click(await screen.findByTestId('mesa-2'));
  expect(await screen.findByText('Não foi possível gerar o QR da mesa. Tente novamente.')).toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Voltar às mesas' })).toBeInTheDocument());
  expect(screen.queryByAltText(/QR code da mesa/)).toBeNull();
});
