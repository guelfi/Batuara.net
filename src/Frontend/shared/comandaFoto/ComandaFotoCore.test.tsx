import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

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
  await screen.findByTestId('item-2');
};

test('tela inicial: botão de foto, número, nome e cardápio já preenchido', async () => {
  await renderCore();
  expect(screen.getByRole('button', { name: /📷 - Fotografar Comanda/ })).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: /^Comanda/ })).toBeInTheDocument();
  expect(screen.getByLabelText(/^Nome/)).toBeInTheDocument();
  expect(screen.getByTestId('item-1')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Fechar comanda sem lançamentos' })).toBeDisabled();
  // Descartar só vale depois de uma tentativa de leitura por foto
  expect(screen.getByRole('button', { name: 'Descartar' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '+ Outra comanda para pagamento' })).toBeInTheDocument();
});

test('fechar sem lançamentos exige número e nome, e o atalho Não identificado preenche o nome', async () => {
  await renderCore();
  const close = screen.getByRole('button', { name: 'Fechar comanda sem lançamentos' });

  fireEvent.change(screen.getByRole('textbox', { name: /^Comanda/ }), { target: { value: '12' } });
  expect(close).toBeDisabled();
  expect(screen.getByText('Informe o número da comanda e o nome do cliente.')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Não identificado' }));
  expect(screen.getByLabelText(/^Nome/)).toHaveValue('Não identificado');
  expect(close).toBeEnabled();

  fireEvent.click(close);
  fireEvent.click(await screen.findByRole('button', { name: 'Fechar sem lançamentos' }));

  await waitFor(() => expect(mockPost).toHaveBeenCalled());
  const [url, body] = mockPost.mock.calls[0];
  expect(url).toBe('/comanda-foto');
  expect(body).toMatchObject({ comandaNumber: '12', items: [], imageBase64: '' });
  expect(body.label).toBe('Comanda 12 - Não identificado');
});

test('lançar item direto no cardápio destaca a linha, soma no total e passa ao fechamento normal', async () => {
  await renderCore();
  expect(screen.getByTestId('item-1')).not.toHaveAttribute('data-selected');
  fireEvent.click(screen.getByLabelText('Mais Água'));
  fireEvent.click(screen.getByLabelText('Mais Água'));

  expect(screen.getByTestId('item-1')).toHaveAttribute('data-selected', 'true');
  expect(screen.getByText(/Total da comanda/)).toHaveTextContent('10,00');
  expect(screen.getByText(/Total da comanda/)).toHaveTextContent('2 itens');
  expect(screen.getByRole('button', { name: 'Fechar comanda' })).toBeDisabled();

  fireEvent.change(screen.getByRole('textbox', { name: /^Comanda/ }), { target: { value: '7' } });
  fireEvent.change(screen.getByLabelText(/^Nome/), { target: { value: 'Maria' } });
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
  fireEvent.change(screen.getByRole('textbox', { name: /^Comanda/ }), { target: { value: '12' } });
  fireEvent.click(screen.getByRole('button', { name: 'Não identificado' }));
  fireEvent.click(screen.getByRole('button', { name: '+ Outra comanda para pagamento' }));
  await screen.findByText('Comandas para fechar juntas (1)');

  // segunda comanda digitada, sem foto: Descartar precisa estar disponível por causa da fila
  fireEvent.change(screen.getByRole('textbox', { name: /^Comanda/ }), { target: { value: '13' } });
  fireEvent.click(screen.getByLabelText('Mais Salada'));
  const discard = screen.getByRole('button', { name: 'Descartar' });
  expect(discard).toBeEnabled();
  fireEvent.click(discard);

  expect(screen.getByText('Comandas para fechar juntas (1)')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Fechar 1 comanda/ })).toBeInTheDocument();
});

/** Preenche a comanda aberta (número, "Não identificado" e itens) e a guarda na fila. */
const guardarComanda = async (numero: string, itens: { label: string; vezes: number }[] = []) => {
  fireEvent.change(screen.getByRole('textbox', { name: /^Comanda/ }), { target: { value: numero } });
  fireEvent.click(screen.getByRole('button', { name: 'Não identificado' }));
  for (const { label, vezes } of itens) {
    for (let i = 0; i < vezes; i += 1) fireEvent.click(screen.getByLabelText(`Mais ${label}`));
  }
  fireEvent.click(screen.getByRole('button', { name: '+ Outra comanda para pagamento' }));
  await waitFor(() => expect(screen.getByRole('textbox', { name: /^Comanda/ })).toHaveValue(''), { timeout: 4000 });
};
const linhasDaLista = () => within(screen.getByRole('list', { name: 'Comandas para fechar juntas' })).getAllByRole('listitem');

test('a lista mostra todas as comandas da conta, inclusive a que está aberta, e permite remover uma', async () => {
  await renderCore();
  await guardarComanda('12');
  await guardarComanda('13');
  fireEvent.change(screen.getByRole('textbox', { name: /^Comanda/ }), { target: { value: '14' } });
  fireEvent.click(screen.getByRole('button', { name: 'Não identificado' }));

  expect(screen.getByText('Comandas para fechar juntas (3)')).toBeInTheDocument();
  expect(linhasDaLista().map((l) => l.textContent)).toEqual([
    expect.stringContaining('12 · Não identificado'),
    expect.stringContaining('13 · Não identificado'),
    expect.stringContaining('14 · Não identificado'),
  ]);

  fireEvent.click(screen.getByRole('button', { name: 'Remover comanda 13' }));
  expect(screen.getByText('Comandas para fechar juntas (2)')).toBeInTheDocument();
  expect(linhasDaLista().map((l) => l.textContent?.slice(0, 2))).toEqual(['12', '14']);
}, 20000);

test('tocar numa comanda da lista abre os itens dela no cardápio e devolve a atual à lista, na mesma ordem', async () => {
  await renderCore();
  await guardarComanda('12', [{ label: 'Água', vezes: 2 }]);
  await guardarComanda('13', [{ label: 'Salada', vezes: 1 }]);
  fireEvent.change(screen.getByRole('textbox', { name: /^Comanda/ }), { target: { value: '14' } });
  fireEvent.click(screen.getByRole('button', { name: 'Não identificado' }));
  fireEvent.click(screen.getByLabelText('Mais Água'));

  fireEvent.click(screen.getByRole('button', { name: 'Abrir a comanda 12' }));

  await waitFor(() => expect(screen.getByRole('textbox', { name: /^Comanda/ })).toHaveValue('12'), { timeout: 4000 });
  expect(screen.getByLabelText('Quantidade de Água')).toHaveTextContent('2');
  expect(screen.getByLabelText('Quantidade de Salada')).toHaveTextContent('0');
  // a ordem da lista não muda: 12 (aberta), 13, 14
  expect(linhasDaLista().map((l) => l.textContent?.slice(0, 2))).toEqual(['12', '13', '14']);

  // editar a comanda aberta atualiza o total dela na lista
  fireEvent.click(screen.getByLabelText('Mais Água'));
  expect(linhasDaLista()[0].textContent).toContain('3 itens');
}, 20000);

test('não abre outra comanda enquanto a atual está sem número ou nome', async () => {
  await renderCore();
  await guardarComanda('12');
  fireEvent.click(screen.getByLabelText('Mais Água'));

  // a atual tem item, mas falta número e nome: não dá para trocar
  fireEvent.click(screen.getByRole('button', { name: 'Abrir a comanda 12' }));
  expect(await screen.findByText('Informe o número e o nome da comanda atual antes de abrir outra.')).toBeInTheDocument();
  expect(screen.getByLabelText('Quantidade de Água')).toHaveTextContent('1');
}, 20000);

test('"Todas" mostra a soma dos itens de todas as comandas, só para leitura, e voltar a uma comanda sai da soma', async () => {
  await renderCore();
  await guardarComanda('12', [{ label: 'Água', vezes: 2 }]);
  await guardarComanda('13', [{ label: 'Água', vezes: 1 }, { label: 'Salada', vezes: 1 }]);

  fireEvent.click(screen.getByRole('button', { name: 'Ver os itens de todas as comandas' }));
  expect(screen.getByText('Itens de todas as comandas (soma)')).toBeInTheDocument();
  expect(screen.getByTestId('soma-1')).toHaveTextContent('× 3');
  expect(screen.getByTestId('soma-2')).toHaveTextContent('× 1');
  expect(screen.queryByLabelText('Mais Água')).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: 'Abrir a comanda 13' }));
  await waitFor(() => expect(screen.queryByText('Itens de todas as comandas (soma)')).toBeNull(), { timeout: 4000 });
  expect(screen.getByLabelText('Quantidade de Salada')).toHaveTextContent('1');
}, 20000);

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
    fireEvent.change(screen.getByRole('textbox', { name: /^Comanda/ }), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText(/^Nome/), { target: { value: 'Maria' } });

    mockPost.mockRejectedValueOnce({ response: { status: 400, data: { message: 'Foto ilegível' } } });
    const file = new File(['x'], 'comanda.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByTestId('comanda-file'), { target: { files: [file] } });

    fireEvent.click(await screen.findByRole('button', { name: /Digitar sem ler a foto/ }));

    expect(screen.getByTestId('item-1')).not.toHaveAttribute('data-selected');
    expect(screen.getByLabelText('Quantidade de Água')).toHaveTextContent('0');
    expect(screen.getByRole('textbox', { name: /^Comanda/ })).toHaveValue('');
    expect(screen.getByLabelText(/^Nome/)).toHaveValue('');
    expect(screen.getByRole('button', { name: /Fotografar Novamente/ })).toBeInTheDocument();

    // com foto anexada, Descartar fica habilitado e volta a comanda ao estado inicial
    const discard = screen.getByRole('button', { name: 'Descartar' });
    expect(discard).toBeEnabled();
    fireEvent.click(discard);
    expect(screen.getByRole('button', { name: /Fotografar Comanda/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Descartar' })).toBeDisabled();
  });

  test('depois de uma leitura, os itens lidos ficam no início do cardápio e com a quantidade lida', async () => {
    await renderCore();
    mockPost.mockResolvedValueOnce({
      data: { data: { items: [{ name: 'Salada', quantity: 2, unitPrice: 7, matched: true }], comandaNumber: '5', customerName: 'Ana', payments: [] } },
    });
    const file = new File(['x'], 'comanda.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByTestId('comanda-file'), { target: { files: [file] } });

    await waitFor(() => expect(screen.getByLabelText('Quantidade de Salada')).toHaveTextContent('2'));
    expect(screen.getByRole('textbox', { name: /^Comanda/ })).toHaveValue('5');
    expect(screen.getByLabelText(/^Nome/)).toHaveValue('Ana');
    // Salada (segunda do cardápio) passa a ser a primeira linha; Água vem depois
    const rows = screen.getAllByTestId(/^item-/).map((r) => r.getAttribute('data-testid'));
    expect(rows).toEqual(['item-2', 'item-1']);
    expect(screen.getByTestId('item-2')).toHaveAttribute('data-selected', 'true');

    // tocar em "+" não muda ninguém de lugar
    fireEvent.click(screen.getByLabelText('Mais Água'));
    expect(screen.getAllByTestId(/^item-/).map((r) => r.getAttribute('data-testid'))).toEqual(['item-2', 'item-1']);
  });
});
