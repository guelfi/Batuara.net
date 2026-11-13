import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import TableSettingsDialog from './TableSettingsDialog';
import bingoApi from '../../services/bingoApi';

jest.mock('../../services/bingoApi', () => ({
  __esModule: true,
  default: { getTableSettings: jest.fn(), updateTableSettings: jest.fn() },
}));

// o Admin declara `jest` como any (jest-runtime.d.ts): sem tipos de mock
const getSettings = bingoApi.getTableSettings as any;
const updateSettings = bingoApi.updateTableSettings as any;

const tables = [
  { numero: 1, lugares: 4, exclusiva: false },
  { numero: 2, lugares: 4, exclusiva: false },
  { numero: 3, lugares: 6, exclusiva: true },
];

beforeEach(() => {
  jest.clearAllMocks();
  getSettings.mockResolvedValue(tables);
  updateSettings.mockImplementation((list: any) => Promise.resolve(list));
});

const renderDialog = (over: Partial<React.ComponentProps<typeof TableSettingsDialog>> = {}) => {
  const onClose = jest.fn();
  const notify = jest.fn();
  render(<TableSettingsDialog open onClose={onClose} notify={notify} {...over} />);
  return { onClose, notify };
};

test('mostra as mesas em cartões paginados, com lugares e exclusiva de cada uma', async () => {
  renderDialog();
  expect(await screen.findByTestId('config-mesa-1')).toHaveTextContent('Mesa 1');
  expect(screen.getByRole('group', { name: 'Mesas do evento' })).toBeInTheDocument();
  expect(screen.getByText('Mesas 1–3 de 3')).toBeInTheDocument();
  expect(screen.getByLabelText('Lugares da mesa 3')).toHaveValue(6);
  expect(screen.getByLabelText('Mesa 3 exclusiva')).toBeChecked();
  expect(screen.getByLabelText('Mesa 1 exclusiva')).not.toBeChecked();
  // só salva depois de mudar algo
  expect(screen.getByRole('button', { name: 'Salvar lugares' })).toBeDisabled();
});

test('"Aplicar a todas" muda os lugares de todas as mesas e salva a lista inteira', async () => {
  const { onClose, notify } = renderDialog();
  await screen.findByTestId('config-mesa-1');

  fireEvent.change(screen.getByLabelText('Lugares em todas'), { target: { value: '8' } });
  fireEvent.click(screen.getByRole('button', { name: 'Aplicar a todas' }));
  expect(screen.getByLabelText('Lugares da mesa 1')).toHaveValue(8);
  expect(screen.getByLabelText('Lugares da mesa 3')).toHaveValue(8);

  fireEvent.click(screen.getByLabelText('Mesa 2 exclusiva'));
  fireEvent.click(screen.getByRole('button', { name: 'Salvar lugares' }));

  await waitFor(() => expect(updateSettings).toHaveBeenCalled());
  expect(updateSettings.mock.calls[0][0]).toEqual([
    { numero: 1, lugares: 8, exclusiva: false },
    { numero: 2, lugares: 8, exclusiva: true },
    { numero: 3, lugares: 8, exclusiva: true },
  ]);
  await waitFor(() => expect(onClose).toHaveBeenCalled());
  expect(notify).toHaveBeenCalledWith('Lugares das mesas salvos.', 'success');
});

test('lugares inválidos desabilitam o salvar', async () => {
  renderDialog();
  await screen.findByTestId('config-mesa-1');
  fireEvent.change(screen.getByLabelText('Lugares da mesa 1'), { target: { value: '0' } });
  expect(screen.getByRole('button', { name: 'Salvar lugares' })).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Lugares da mesa 1'), { target: { value: '51' } });
  expect(screen.getByRole('button', { name: 'Salvar lugares' })).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Lugares da mesa 1'), { target: { value: '5' } });
  expect(screen.getByRole('button', { name: 'Salvar lugares' })).toBeEnabled();
});

test('"Aplicar a todas" com valor inválido avisa e não muda nada', async () => {
  const { notify } = renderDialog();
  await screen.findByTestId('config-mesa-1');
  fireEvent.change(screen.getByLabelText('Lugares em todas'), { target: { value: '99' } });
  fireEvent.click(screen.getByRole('button', { name: 'Aplicar a todas' }));
  expect(notify).toHaveBeenCalledWith('Informe de 1 a 50 lugares.', 'error');
  expect(screen.getByLabelText('Lugares da mesa 1')).toHaveValue(4);
});

test('erro ao salvar mostra a mensagem do servidor e mantém o diálogo aberto', async () => {
  updateSettings.mockRejectedValue({ response: { data: { message: 'Evento encerrado ou cancelado: as mesas não podem mais ser ajustadas.' } } });
  const { onClose, notify } = renderDialog();
  await screen.findByTestId('config-mesa-1');
  fireEvent.click(screen.getByLabelText('Mesa 1 exclusiva'));
  fireEvent.click(screen.getByRole('button', { name: 'Salvar lugares' }));
  await waitFor(() => expect(notify).toHaveBeenCalledWith('Evento encerrado ou cancelado: as mesas não podem mais ser ajustadas.', 'error'));
  expect(onClose).not.toHaveBeenCalled();
});

test('"Fechar" fecha sem salvar', async () => {
  const { onClose } = renderDialog();
  await screen.findByTestId('config-mesa-1');
  fireEvent.click(screen.getByLabelText('Mesa 1 exclusiva'));
  fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
  expect(onClose).toHaveBeenCalled();
  expect(updateSettings).not.toHaveBeenCalled();
});

test('sem diálogo aberto não carrega nada', () => {
  render(<TableSettingsDialog open={false} onClose={() => undefined} notify={() => undefined} />);
  expect(getSettings).not.toHaveBeenCalled();
});
