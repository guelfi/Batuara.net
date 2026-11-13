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
  expect(screen.getByRole('button', { name: '+ Outra comanda' })).toBeInTheDocument();
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
  fireEvent.click(screen.getByRole('button', { name: '+ Outra comanda' }));
  await screen.findByRole('list', { name: 'Comandas para fechar juntas' });

  // segunda comanda digitada, sem foto: Descartar precisa estar disponível por causa da fila
  fireEvent.change(screen.getByRole('textbox', { name: /^Comanda/ }), { target: { value: '13' } });
  fireEvent.click(screen.getByLabelText('Mais Salada'));
  const discard = screen.getByRole('button', { name: 'Descartar' });
  expect(discard).toBeEnabled();
  fireEvent.click(discard);

  expect(linhasDaLista()).toHaveLength(1);
  expect(screen.getByRole('button', { name: /Fechar 1 comanda/ })).toBeInTheDocument();
});

/** Preenche a comanda aberta (número, "Não identificado" e itens) e a guarda na fila. */
const guardarComanda = async (numero: string, itens: { label: string; vezes: number }[] = []) => {
  fireEvent.change(screen.getByRole('textbox', { name: /^Comanda/ }), { target: { value: numero } });
  fireEvent.click(screen.getByRole('button', { name: 'Não identificado' }));
  for (const { label, vezes } of itens) {
    for (let i = 0; i < vezes; i += 1) fireEvent.click(screen.getByLabelText(`Mais ${label}`));
  }
  fireEvent.click(screen.getByRole('button', { name: '+ Outra comanda' }));
  await waitFor(() => expect(screen.getByRole('textbox', { name: /^Comanda/ })).toHaveValue(''), { timeout: 4000 });
};
const linhasDaLista = () => within(screen.getByRole('list', { name: 'Comandas para fechar juntas' })).getAllByRole('listitem');

test('a lista mostra todas as comandas da conta, inclusive a que está aberta, e permite remover uma', async () => {
  await renderCore();
  await guardarComanda('12');
  await guardarComanda('13');
  fireEvent.change(screen.getByRole('textbox', { name: /^Comanda/ }), { target: { value: '14' } });
  fireEvent.click(screen.getByRole('button', { name: 'Não identificado' }));

  expect(linhasDaLista()).toHaveLength(3);
  expect(screen.getByText(/Total das comandas/)).toHaveTextContent('3 comandas');
  expect(linhasDaLista().map((l) => l.textContent)).toEqual([
    expect.stringContaining('12 · Não identificado'),
    expect.stringContaining('13 · Não identificado'),
    expect.stringContaining('14 · Não identificado'),
  ]);

  fireEvent.click(screen.getByRole('button', { name: 'Remover comanda 13' }));
  expect(linhasDaLista()).toHaveLength(2);
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

  await waitFor(() => expect(linhasDaLista()[0]).toHaveAttribute('data-selected', 'true'), { timeout: 4000 });
  expect(linhasDaLista()[0].textContent).toContain('12 · Não identificado');
  expect(screen.getByLabelText('Quantidade de Água')).toHaveTextContent('2');
  // com várias comandas, Comanda e Nome ficam recolhidos (estão no cartão da lista)
  expect(screen.queryByRole('textbox', { name: /^Comanda/ })).toBeNull();
  expect(screen.getByLabelText('Quantidade de Salada')).toHaveTextContent('0');
  // a ordem da lista não muda: 12 (aberta), 13, 14
  expect(linhasDaLista().map((l) => l.textContent?.slice(0, 2))).toEqual(['12', '13', '14']);

  // editar a comanda aberta atualiza o total dela na lista
  fireEvent.click(screen.getByLabelText('Mais Água'));
  expect(linhasDaLista()[0].textContent).toContain('3 itens');

  // tocar na linha da comanda aberta mostra os campos para corrigir número e nome
  fireEvent.click(screen.getByRole('button', { name: 'Editar número e nome da comanda 12' }));
  expect(screen.getByRole('textbox', { name: /^Comanda/ })).toHaveValue('12');
  fireEvent.click(screen.getByRole('button', { name: 'Editar número e nome da comanda 12' }));
  expect(screen.queryByRole('textbox', { name: /^Comanda/ })).toBeNull();
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

test('com uma comanda só, Comanda e Nome ficam visíveis; com várias, ficam recolhidos depois de preenchidos', async () => {
  await renderCore();
  fireEvent.change(screen.getByRole('textbox', { name: /^Comanda/ }), { target: { value: '12' } });
  fireEvent.click(screen.getByRole('button', { name: 'Não identificado' }));
  // uma comanda só: os campos continuam ali para editar
  expect(screen.getByRole('textbox', { name: /^Comanda/ })).toBeInTheDocument();
  expect(screen.queryByRole('list', { name: 'Comandas para fechar juntas' })).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: '+ Outra comanda' }));
  await waitFor(() => expect(screen.getByRole('textbox', { name: /^Comanda/ })).toHaveValue(''), { timeout: 4000 });
  fireEvent.change(screen.getByRole('textbox', { name: /^Comanda/ }), { target: { value: '13' } });
  expect(screen.getByRole('textbox', { name: /^Nome/ })).toBeInTheDocument(); // falta o nome: segue visível
  fireEvent.click(screen.getByRole('button', { name: 'Não identificado' }));
  // identificada e com várias comandas: só no cartão da lista
  expect(screen.queryByRole('textbox', { name: /^Comanda/ })).toBeNull();
  expect(linhasDaLista().map((l) => l.textContent?.slice(0, 2))).toEqual(['12', '13']);
}, 20000);

test('as linhas do cardápio mostram "descrição - valor × quantidade = total" e − / + como ícones', async () => {
  await renderCore();
  expect(screen.getByTestId('item-1')).toHaveTextContent('Água - R$ 5,00');
  fireEvent.click(screen.getByLabelText('Mais Água'));
  fireEvent.click(screen.getByLabelText('Mais Água'));
  expect(screen.getByTestId('item-1')).toHaveTextContent('Água - R$ 5,00 × 2 = R$ 10,00');
});

test('o botão "+ Outra comanda" fica no topo, ao lado do de fotografar, e a linha de baixo não existe mais', async () => {
  await renderCore();
  const foto = screen.getByRole('button', { name: /📷 - Fotografar Comanda/ });
  const outra = screen.getByRole('button', { name: '+ Outra comanda' });
  expect(foto.parentElement).toBe(outra.parentElement);
  expect(screen.queryByRole('button', { name: /Outra comanda para pagamento/ })).toBeNull();
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

  test('item lido que não está no cardápio aparece depois dos itens do cardápio, com remover e cadastrar', async () => {
    await renderCore();
    mockPost.mockResolvedValueOnce({
      data: {
        data: {
          items: [
            { name: 'Salada', quantity: 1, unitPrice: 7, matched: true },
            { name: 'Batida de maracujá', quantity: 2, unitPrice: 15, matched: false },
          ],
          comandaNumber: '5',
          customerName: 'Ana',
          payments: [],
        },
      },
    });
    const file = new File(['x'], 'comanda.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByTestId('comanda-file'), { target: { files: [file] } });

    const extra = await screen.findByTestId('item-x:0', undefined, { timeout: 4000 });
    expect(extra).toHaveTextContent('Batida de maracujá (fora do cardápio) - R$ 15,00 × 2 = R$ 30,00');
    // vem depois de todos os itens do cardápio
    const ordem = screen.getAllByTestId(/^item-/).map((r) => r.getAttribute('data-testid'));
    expect(ordem).toEqual(['item-2', 'item-1', 'item-x:0']);
    expect(screen.getByLabelText('Cadastrar Batida de maracujá no cardápio')).toBeInTheDocument();

    // "−" na quantidade 1 remove o item de fora do cardápio
    fireEvent.click(screen.getByLabelText('Menos Batida de maracujá'));
    expect(screen.getByTestId('item-x:0')).toHaveTextContent('× 1 = R$ 15,00');
    fireEvent.click(screen.getByLabelText('Menos Batida de maracujá'));
    expect(screen.queryByTestId('item-x:0')).toBeNull();
  });
});
