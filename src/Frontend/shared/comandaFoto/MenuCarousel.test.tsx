import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import MenuCarousel from './MenuCarousel';

const items = [
  { id: 1, name: 'Água', unitPrice: 5 },
  { id: 2, name: 'Salada', unitPrice: 7 },
  { id: 3, name: 'Cerveja', unitPrice: 12 },
];

test('mostra um card por item, com preço e quantidade', () => {
  render(<MenuCarousel items={items} qty={{ 2: 3 }} onChange={() => undefined} />);
  expect(screen.getByRole('group', { name: 'Cardápio' })).toBeInTheDocument();
  expect(screen.getByRole('group', { name: 'Salada' })).toBeInTheDocument();
  expect(screen.getByLabelText('Quantidade de Salada')).toHaveTextContent('3');
  expect(screen.getByLabelText('Quantidade de Água')).toHaveTextContent('0');
  expect(screen.getByText(/de 3$/)).toBeInTheDocument();
});

test('+ e − chamam onChange com o id e o passo, e − fica desabilitado em zero', () => {
  const onChange = jest.fn();
  render(<MenuCarousel items={items} qty={{ 2: 1 }} onChange={onChange} />);
  expect(screen.getByLabelText('Menos Água')).toBeDisabled();
  fireEvent.click(screen.getByLabelText('Mais Água'));
  fireEvent.click(screen.getByLabelText('Menos Salada'));
  expect(onChange).toHaveBeenNthCalledWith(1, 1, 1);
  expect(onChange).toHaveBeenNthCalledWith(2, 2, -1);
});

test('mantém a ordem recebida mesmo com quantidade', () => {
  render(<MenuCarousel items={items} qty={{ 3: 5 }} onChange={() => undefined} />);
  const names = screen.getAllByRole('group').filter((g) => g.getAttribute('aria-label') !== 'Cardápio').map((g) => g.getAttribute('aria-label'));
  expect(names).toEqual(['Água', 'Salada', 'Cerveja']);
});

test('sem itens avisa que nada foi encontrado', () => {
  render(<MenuCarousel items={[]} qty={{}} onChange={() => undefined} />);
  expect(screen.getByText('Nenhum item encontrado.')).toBeInTheDocument();
});
