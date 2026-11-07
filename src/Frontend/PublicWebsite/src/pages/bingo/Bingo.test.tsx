import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import BingoCustomerPage, { getTabIdFromPath } from './BingoCustomerPage';
import { bingoApi } from '../../services/bingoApi';

jest.mock('../../services/bingoApi', () => {
  const actual = jest.requireActual('../../services/bingoApi');
  return {
    ...actual,
    bingoApi: {
      getInfo: jest.fn(),
      getTab: jest.fn(),
      createTab: jest.fn(),
      addItems: jest.fn(),
      closeTab: jest.fn(),
      confirmPhone: jest.fn(),
      resendCode: jest.fn(),
      contestItem: jest.fn(),
    },
  };
});

const api = bingoApi as jest.Mocked<typeof bingoApi>;

const tabView = {
  id: 'abcdef12-0000-0000-0000-000000000000',
  customerName: 'Maria',
  mesa: 7,
  status: 'Open' as const,
  total: 10,
  closeAllRequested: false,
  isOpen: true,
  menu: [
    { id: 'm1', name: 'Água', unitPrice: 5, isAvailable: true },
    { id: 'm2', name: 'Salada', unitPrice: 7, isAvailable: false },
  ],
  items: [{ id: 'i1', menuItemId: 'm1', name: 'Água', unitPrice: 5, quantity: 2, status: 'Pending' as const }],
};

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
});

test('extrai o tabId do caminho', () => {
  expect(getTabIdFromPath('/bingo/comanda/abc-123')).toBe('abc-123');
  expect(getTabIdFromPath('/bingo')).toBeNull();
});

test('comanda: esgotado sem botão, pedido enviado e pendente exibido', async () => {
  window.history.pushState({}, '', `/bingo/comanda/${tabView.id}`);
  api.getTab.mockResolvedValue(tabView);
  api.addItems.mockResolvedValue();
  render(<BingoCustomerPage />);

  await screen.findByText(/Maria/);
  expect(screen.getByText(/Esgotado/)).toBeInTheDocument();
  expect(screen.queryByLabelText('Adicionar Salada')).toBeNull();
  expect(screen.getByText('COMANDA DO BINGO')).toBeInTheDocument();
  expect(screen.getByTestId('ordered-m1')).toHaveTextContent('(2)');
  expect(screen.queryByTestId('ordered-m2')).toBeNull();

  fireEvent.click(screen.getByLabelText('Adicionar Água'));
  fireEvent.click(screen.getByRole('button', { name: 'Fazer pedido' }));
  await waitFor(() => expect(api.addItems).toHaveBeenCalledWith(tabView.id, [{ menuItemId: 'm1', quantity: 1 }]));
  expect(await screen.findByText('Pedido enviado! Um garçom levará à sua mesa.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: /Pedido/ }));
  expect(await screen.findByText('Pendente')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Reenviar link/ })).toBeNull();
});

test('comanda: item retirado aparece como A caminho', async () => {
  window.history.pushState({}, '', `/bingo/comanda/${tabView.id}`);
  api.getTab.mockResolvedValue({ ...tabView, items: [{ ...tabView.items[0], status: 'Retrieved' as const }] });
  render(<BingoCustomerPage />);
  await screen.findByText(/Maria/);
  fireEvent.click(screen.getByRole('tab', { name: /Pedido/ }));
  expect(await screen.findByText('A caminho')).toBeInTheDocument();
});

test('formulário mostra a dica de voltar à comanda com o mesmo celular', async () => {
  window.history.pushState({}, '', '/bingo');
  api.getInfo.mockResolvedValue({ isOpen: true, closeAllRequested: false, mesas: [1], menu: [] });
  render(<BingoCustomerPage />);
  expect(await screen.findByText('Já tem comanda? Informe o mesmo celular para voltar a ela.')).toBeInTheDocument();
});

test('sem evento aberto mostra aviso amigável no formulário', async () => {
  window.history.pushState({}, '', '/bingo');
  api.getInfo.mockResolvedValue({ isOpen: false, closeAllRequested: false, mesas: [], menu: [] });
  render(<BingoCustomerPage />);
  expect(await screen.findByText(/ainda não foram abertos/)).toBeInTheDocument();
});

test('bloco de confirmação de celular aparece sem phoneVerified e some ao confirmar', async () => {
  window.history.pushState({}, '', `/bingo/comanda/${tabView.id}`);
  api.getTab.mockResolvedValue(tabView);
  api.confirmPhone.mockResolvedValue();
  render(<BingoCustomerPage />);
  expect(await screen.findByText(/Confirme seu celular/)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Código de confirmação'), { target: { value: '123456' } });
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
  await waitFor(() => expect(api.confirmPhone).toHaveBeenCalledWith(tabView.id, '123456'));
  await waitFor(() => expect(screen.queryByText(/Confirme seu celular/)).toBeNull());
  expect(screen.getByLabelText('Celular confirmado')).toBeInTheDocument();
});

test('bloco de confirmação não aparece com phoneVerified true', async () => {
  window.history.pushState({}, '', `/bingo/comanda/${tabView.id}`);
  api.getTab.mockResolvedValue({ ...tabView, phoneVerified: true });
  render(<BingoCustomerPage />);
  await screen.findByText(/Maria/);
  expect(screen.queryByText(/Confirme seu celular/)).toBeNull();
  expect(screen.getByLabelText('Celular confirmado')).toBeInTheDocument();
});

test('código inválido mostra a mensagem do servidor', async () => {
  window.history.pushState({}, '', `/bingo/comanda/${tabView.id}`);
  api.getTab.mockResolvedValue(tabView);
  api.confirmPhone.mockRejectedValue({ response: { status: 400, data: { message: 'Código inválido ou expirado.' } } });
  render(<BingoCustomerPage />);
  await screen.findByText(/Confirme seu celular/);
  fireEvent.change(screen.getByLabelText('Código de confirmação'), { target: { value: '000000' } });
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
  expect(await screen.findByText('Código inválido ou expirado.')).toBeInTheDocument();
  expect(screen.getByText(/Confirme seu celular/)).toBeInTheDocument();
});

const orders = () => {
  fireEvent.click(screen.getByRole('tab', { name: /Pedido/ }));
};

test('itens entregues, contestados e cancelados aparecem com status e valores', async () => {
  window.history.pushState({}, '', `/bingo/comanda/${tabView.id}`);
  const base = tabView.items[0];
  api.getTab.mockResolvedValue({
    ...tabView,
    total: 20,
    amountDue: 5,
    contestedCount: 1,
    items: [
      { ...base, id: 'd1', quantity: 1, status: 'Delivered' as const, deliveredAt: '2026-01-01T20:30:00', deliveredByName: 'Ana' },
      { ...base, id: 'c1', name: 'Suco', status: 'Contested' as const },
      { ...base, id: 'x1', name: 'Bolo', status: 'Cancelled' as const },
    ],
  });
  render(<BingoCustomerPage />);
  await screen.findByText(/Maria/);
  orders();
  expect(await screen.findByText('Em contestação')).toBeInTheDocument();
  expect(screen.getByText('Cancelado')).toBeInTheDocument();
  expect(screen.getByText(/Entregue às .* por Ana/)).toBeInTheDocument();
  expect(screen.getByTestId('amount-due')).toHaveTextContent(/A pagar \(itens entregues\):.*5,00/);
  expect(screen.getByText(/Itens em contestação não entram/)).toBeInTheDocument();
});

test('Não recebi chama contestar e confirma', async () => {
  window.history.pushState({}, '', `/bingo/comanda/${tabView.id}`);
  api.getTab.mockResolvedValue({ ...tabView, items: [{ ...tabView.items[0], status: 'Delivered' as const }] });
  api.contestItem.mockResolvedValue();
  render(<BingoCustomerPage />);
  await screen.findByText(/Maria/);
  orders();
  fireEvent.click(await screen.findByRole('button', { name: 'Não recebi' }));
  fireEvent.change(screen.getByLabelText('Observação (opcional)'), { target: { value: 'nada na mesa' } });
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
  await waitFor(() => expect(api.contestItem).toHaveBeenCalledWith(tabView.id, 'i1', 'nada na mesa'));
  expect(await screen.findByText('Contestação enviada. Um garçom vai conferir.')).toBeInTheDocument();
});

test('encerrar com 409 de itens não entregues oferece aguardar ou cancelar e encerrar', async () => {
  window.history.pushState({}, '', `/bingo/comanda/${tabView.id}`);
  api.getTab.mockResolvedValue(tabView);
  const err = {
    response: { status: 409, data: { success: false, code: 'UNDELIVERED_ITEMS', message: 'x', data: { items: [{ id: 'i1', name: 'Água', quantity: 2, status: 'Pending' }] } } },
  };
  api.closeTab.mockRejectedValueOnce(err);
  render(<BingoCustomerPage />);
  await screen.findByText(/Maria/);
  orders();
  fireEvent.click(await screen.findByRole('button', { name: 'Encerrar a conta' }));
  fireEvent.click(screen.getByRole('button', { name: 'Encerrar conta' }));
  expect(await screen.findByText('Itens ainda não entregues')).toBeInTheDocument();
  expect(screen.getAllByText('2x Água').length).toBeGreaterThan(1);
  expect(api.closeTab).toHaveBeenLastCalledWith(tabView.id, false);
  fireEvent.click(screen.getByRole('button', { name: 'Aguardar a entrega' }));
  await waitFor(() => expect(screen.queryByText('Itens ainda não entregues')).toBeNull());
  expect(api.closeTab).toHaveBeenCalledTimes(1);

  api.closeTab.mockRejectedValueOnce(err);
  fireEvent.click(screen.getByRole('button', { name: 'Encerrar a conta' }));
  fireEvent.click(screen.getByRole('button', { name: 'Encerrar conta' }));
  api.closeTab.mockResolvedValueOnce();
  fireEvent.click(await screen.findByRole('button', { name: 'Cancelar esses itens e encerrar' }));
  await waitFor(() => expect(api.closeTab).toHaveBeenLastCalledWith(tabView.id, true));
});

test('encerrar com PHONE_NOT_VERIFIED mostra a mensagem', async () => {
  window.history.pushState({}, '', `/bingo/comanda/${tabView.id}`);
  api.getTab.mockResolvedValue(tabView);
  api.closeTab.mockRejectedValue({ response: { status: 409, data: { code: 'PHONE_NOT_VERIFIED', message: 'Confirme seu celular antes de encerrar.' } } });
  render(<BingoCustomerPage />);
  await screen.findByText(/Maria/);
  orders();
  fireEvent.click(await screen.findByRole('button', { name: 'Encerrar a conta' }));
  fireEvent.click(screen.getByRole('button', { name: 'Encerrar conta' }));
  expect(await screen.findByText('Confirme seu celular antes de encerrar.')).toBeInTheDocument();
});
