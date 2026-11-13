import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import CompactRowList, { CompactRow } from './CompactRowList';

const row = (n: number, over: Partial<CompactRow> = {}): CompactRow => ({
  id: String(n),
  order: n,
  name: `Item ${n}`,
  trailing: `R$ ${n},00`,
  checked: true,
  onToggle: () => undefined,
  onEdit: () => undefined,
  ...over,
});

test('lista vazia mostra o texto', () => {
  render(<CompactRowList rows={[]} emptyText="Nenhum item no cardápio." />);
  expect(screen.getByText('Nenhum item no cardápio.')).toBeInTheDocument();
});

test('mostra as linhas em cartões paginados (nome, preço e nota)', () => {
  render(<CompactRowList rows={[row(1, { note: 'já usado: nome travado' }), row(2)]} emptyText="-" />);
  expect(screen.getByRole('group', { name: 'Lista' })).toBeInTheDocument();
  expect(screen.getByTestId('linha-1')).toHaveTextContent('Item 1');
  expect(screen.getByTestId('linha-1')).toHaveTextContent('R$ 1,00');
  expect(screen.getByTestId('linha-1')).toHaveTextContent('já usado: nome travado');
  expect(screen.getByText('Itens 1–2 de 2')).toBeInTheDocument();
  // poucos itens: sem busca
  expect(screen.queryByPlaceholderText('Buscar por nome')).toBeNull();
});

test('com mais de 6 itens aparece a busca, que filtra pelo nome', () => {
  const rows = Array.from({ length: 8 }, (_, i) => row(i + 1, { name: i === 4 ? 'Cerveja Heineken' : `Item ${i + 1}` }));
  render(<CompactRowList rows={rows} emptyText="-" />);
  fireEvent.change(screen.getByPlaceholderText('Buscar por nome'), { target: { value: 'heine' } });
  expect(screen.getByTestId('linha-5')).toBeInTheDocument();
  expect(screen.queryByTestId('linha-1')).toBeNull();
  fireEvent.change(screen.getByPlaceholderText('Buscar por nome'), { target: { value: 'zzz' } });
  expect(screen.getByText('Nenhum resultado.')).toBeInTheDocument();
});

test('o interruptor e o menu de ações chamam os callbacks do item', () => {
  const onToggle = jest.fn();
  const onEdit = jest.fn();
  const onDelete = jest.fn();
  render(<CompactRowList rows={[row(1, { onToggle, onEdit, onDelete })]} emptyText="-" />);

  fireEvent.click(screen.getByRole('switch'));
  expect(onToggle).toHaveBeenCalledWith(false);

  fireEvent.click(screen.getByLabelText('Ações'));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Editar' }));
  expect(onEdit).toHaveBeenCalled();

  fireEvent.click(screen.getByLabelText('Ações'));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Excluir' }));
  expect(onDelete).toHaveBeenCalled();
});

test('item para confirmar tem a ação "Confirmar" no menu', () => {
  const onConfirm = jest.fn();
  render(<CompactRowList rows={[row(1, { warn: true, onConfirm })]} emptyText="-" />);
  fireEvent.click(screen.getByLabelText('Ações'));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Confirmar' }));
  expect(onConfirm).toHaveBeenCalled();
});

test('exclusão desabilitada quando o item já foi usado', () => {
  render(<CompactRowList rows={[row(1, { onDelete: () => undefined, deleteDisabled: true })]} emptyText="-" />);
  fireEvent.click(screen.getByLabelText('Ações'));
  expect(screen.getByRole('menuitem', { name: 'Excluir' })).toHaveAttribute('aria-disabled', 'true');
});
