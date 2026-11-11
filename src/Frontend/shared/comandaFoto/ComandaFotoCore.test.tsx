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
  // Descartar só vale depois de uma tentativa de leitura por foto
  expect(screen.getByRole('button', { name: 'Descartar' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '+ Outra comanda para pagamento' })).toBeInTheDocument();
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

test('Descartar fica desabilitado enquanto não houve foto, mesmo com itens lançados', async () => {
  await renderCore();
  fireEvent.click(screen.getByLabelText('Mais Salada'));
  expect(screen.getByRole('button', { name: 'Descartar' })).toBeDisabled();
});

test('com uma comanda na fila, dá para desistir da próxima e voltar a fechar a fila', async () => {
  await renderCore();
  fireEvent.click(screen.getByLabelText('Mais Água'));
  fireEvent.change(screen.getByLabelText(/^Comanda/), { target: { value: '12' } });
  fireEvent.click(screen.getByRole('button', { name: 'Não identificado' }));
  fireEvent.click(screen.getByRole('button', { name: '+ Outra comanda para pagamento' }));
  await screen.findByText('Comandas para fechar juntas (1)');

  // segunda comanda digitada, sem foto: Descartar precisa estar disponível por causa da fila
  fireEvent.change(screen.getByLabelText(/^Comanda/), { target: { value: '13' } });
  fireEvent.click(screen.getByLabelText('Mais Salada'));
  const discard = screen.getByRole('button', { name: 'Descartar' });
  expect(discard).toBeEnabled();
  fireEvent.click(discard);

  expect(screen.getByText('Comandas para fechar juntas (1)')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Fechar 1 comanda/ })).toBeInTheDocument();
});

test('o atalho Não identificado some depois de usado', async () => {
  await renderCore();
  fireEvent.click(screen.getByRole('button', { name: 'Não identificado' }));
  expect(screen.queryByRole('button', { name: 'Não identificado' })).not.toBeInTheDocument();
});

describe('foto nova com leitura falhando', () => {
  const realImage = global.Image;
  const realCreate = URL.createObjectURL;
  const realRevoke = URL.revokeObjectURL;
  const realGetContext = HTMLCanvasElement.prototype.getContext;
  const realToDataURL = HTMLCanvasElement.prototype.toDataURL;

  beforeEach(() => {
    URL.createObjectURL = jest.fn(() => 'blob:foto');
    URL.revokeObjectURL = jest.fn();
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({ drawImage: jest.fn() })) as any;
    HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/jpeg;base64,AAAA');
    (global as any).Image = class {
      width = 100;
      height = 100;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_v: string) {
        setTimeout(() => this.onload?.(), 0);
      }
    };
  });

  afterEach(() => {
    global.Image = realImage;
    URL.createObjectURL = realCreate;
    URL.revokeObjectURL = realRevoke;
    HTMLCanvasElement.prototype.getContext = realGetContext;
    HTMLCanvasElement.prototype.toDataURL = realToDataURL;
  });

  test('não carrega itens, número nem nome da comanda anterior', async () => {
    await renderCore();
    fireEvent.click(screen.getByLabelText('Mais Água'));
    fireEvent.change(screen.getByLabelText(/^Comanda/), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText(/^Nome do cliente/), { target: { value: 'Maria' } });

    mockPost.mockRejectedValueOnce({ response: { status: 400, data: { message: 'Foto ilegível' } } });
    const file = new File(['x'], 'comanda.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByTestId('comanda-file'), { target: { files: [file] } });

    fireEvent.click(await screen.findByRole('button', { name: /Digitar sem ler a foto/ }));

    expect(screen.queryByText(/Na comanda/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Quantidade de Água')).toHaveTextContent('0');
    expect(screen.getByLabelText(/^Comanda/)).toHaveValue('');
    expect(screen.getByLabelText(/^Nome do cliente/)).toHaveValue('');
    expect(screen.getByText(/Foto anexada/)).toBeInTheDocument();

    // com foto anexada, Descartar fica habilitado e volta a comanda ao estado inicial
    const discard = screen.getByRole('button', { name: 'Descartar' });
    expect(discard).toBeEnabled();
    fireEvent.click(discard);
    expect(screen.queryByText(/Foto anexada/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Descartar' })).toBeDisabled();
  });
});
