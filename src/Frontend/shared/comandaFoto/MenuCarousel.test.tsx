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

describe('uso na comanda digital do cliente', () => {
  const menu = [
    { id: 'm1', name: 'Água', unitPrice: 5, isAvailable: true },
    { id: 'm2', name: 'Salada', unitPrice: 7, isAvailable: false },
  ];

  test('item esgotado mostra "Esgotado" e não tem controles', () => {
    render(<MenuCarousel items={menu} qty={{}} onChange={() => undefined} plusLabel={(n) => `Adicionar ${n}`} />);
    expect(screen.getByText('Esgotado')).toBeInTheDocument();
    expect(screen.queryByLabelText('Adicionar Salada')).toBeNull();
    expect(screen.getByLabelText('Adicionar Água')).toBeInTheDocument();
  });

  test('aceita ids em texto, rótulos próprios, selo de já pedido e id de teste', () => {
    const onChange = jest.fn();
    render(
      <MenuCarousel
        items={menu}
        qty={{ m1: 2 }}
        onChange={onChange}
        minusLabel={(n) => `Remover ${n}`}
        plusLabel={(n) => `Adicionar ${n}`}
        testIdPrefix="menu-"
        renderBadge={(m) => (m.id === 'm1' ? <span data-testid="ordered-m1">(3)</span> : null)}
      />,
    );
    expect(screen.getByTestId('menu-m1')).toBeInTheDocument();
    expect(screen.getByTestId('ordered-m1')).toHaveTextContent('(3)');
    expect(screen.getByLabelText('Quantidade de Água')).toHaveTextContent('2');
    fireEvent.click(screen.getByLabelText('Adicionar Água'));
    fireEvent.click(screen.getByLabelText('Remover Água'));
    expect(onChange).toHaveBeenNthCalledWith(1, 'm1', 1);
    expect(onChange).toHaveBeenNthCalledWith(2, 'm1', -1);
  });

  test('o "+" desabilita ao atingir o máximo por item', () => {
    render(<MenuCarousel items={menu} qty={{ m1: 20 }} maxQty={20} onChange={() => undefined} />);
    expect(screen.getByLabelText('Mais Água')).toBeDisabled();
  });

  test('várias linhas organizam os cards em colunas', () => {
    render(<MenuCarousel items={items} qty={{}} rows={3} onChange={() => undefined} />);
    const track = screen.getByRole('group', { name: 'Água' }).parentElement as HTMLElement;
    expect(track).toHaveStyle({ gridAutoFlow: 'column' });
    expect(track.style.gridTemplateRows || getComputedStyle(track).gridTemplateRows).toContain('repeat(3');
  });
});
