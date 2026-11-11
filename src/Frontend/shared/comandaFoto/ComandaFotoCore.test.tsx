import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const mockGet = jest.fn();
const mockPost = jest.fn();
jest.mock('axios', () => ({
  __esModule: true,
  default: { create: () => ({ get: (...a: unknown[]) => mockGet(...a), post: (...a: unknown[]) => mockPost(...a) }) },
}));

// eslint-disable-next-line import/first
import ComandaFotoCore from './ComandaFotoCore';

const menu = [
  { id: 1, name: 'Água', unitPrice: 5 },
  { id: 2, name: 'Salada', unitPrice: 7 },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockGet.mockImplementation((url: string) => {
    if (url.endsWith('/relatorio')) return Promise.resolve({ data: { data: { eventName: 'Bingo' } } });
    if (url.endsWith('/formas-pagamento')) return Promise.resolve({ data: { data: [{ id: 1, name: 'Dinheiro' }] } });
    if (url.endsWith('/cardapio')) return Promise.resolve({ data: { data: menu } });
    return Promise.reject(new Error(`GET inesperado: ${url}`));
  });
  mockPost.mockResolvedValue({ data: { data: {} } });
});

const renderCore = async () => {
  render(<ComandaFotoCore token="t" baseUrl="http://api" variant="panel" />);
  await screen.findByRole('group', { name: 'Salada' });
};

test('tela inicial: botão de foto, número, nome e cardápio já preenchido', async () => {
  await renderCore();
  expect(screen.getByRole('button', { name: /📷 - Fotografar Comanda/ })).toBeInTheDocument();
  expect(screen.getByLabelText(/^Comanda/)).toBeInTheDocument();
  expect(screen.getByLabelText(/^Nome do cliente/)).toBeInTheDocument();
  expect(screen.getByRole('group', { name: 'Água' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Fechar comanda sem lançamentos' })).toBeDisabled();
});

test('fechar sem lançamentos exige número e nome, e o atalho Não identificado preenche o nome', async () => {
  await renderCore();
  const close = screen.getByRole('button', { name: 'Fechar comanda sem lançamentos' });

  fireEvent.change(screen.getByLabelText(/^Comanda/), { target: { value: '12' } });
  expect(close).toBeDisabled();
  expect(screen.getByText('Informe o número da comanda e o nome do cliente.')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Não identificado' }));
  expect(screen.getByLabelText(/^Nome do cliente/)).toHaveValue('Não identificado');
  expect(close).toBeEnabled();

  fireEvent.click(close);
  fireEvent.click(await screen.findByRole('button', { name: 'Fechar sem lançamentos' }));

  await waitFor(() => expect(mockPost).toHaveBeenCalled());
  const [url, body] = mockPost.mock.calls[0];
  expect(url).toBe('/comanda-foto');
  expect(body).toMatchObject({ comandaNumber: '12', items: [], imageBase64: '' });
  expect(body.label).toBe('Comanda 12 - Não identificado');
});

test('lançar item direto no cardápio mostra a faixa Na comanda e passa ao fechamento normal', async () => {
  await renderCore();
  fireEvent.click(screen.getByLabelText('Mais Água'));
  // agora o item também aparece na faixa "Na comanda": o primeiro "Mais Água" é o dela
  fireEvent.click(screen.getAllByLabelText('Mais Água')[0]);

  expect(screen.getByText('Na comanda (2)')).toBeInTheDocument();
  expect(screen.getByText(/Total da comanda/)).toHaveTextContent('10,00');
  expect(screen.getByRole('button', { name: 'Fechar comanda' })).toBeDisabled();

  fireEvent.change(screen.getByLabelText(/^Comanda/), { target: { value: '7' } });
  fireEvent.change(screen.getByLabelText(/^Nome do cliente/), { target: { value: 'Maria' } });
  expect(screen.getByRole('button', { name: 'Fechar comanda' })).toBeEnabled();
});

test('descartar volta a comanda ao estado inicial', async () => {
  await renderCore();
  fireEvent.click(screen.getByLabelText('Mais Salada'));
  fireEvent.click(screen.getByRole('button', { name: 'Descartar' }));
  expect(screen.queryByText(/Na comanda/)).not.toBeInTheDocument();
  expect(screen.getByLabelText('Quantidade de Salada')).toHaveTextContent('0');
});
