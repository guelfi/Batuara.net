import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import MenuPagedCarousel from './MenuPagedCarousel';

const make = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `m${i + 1}`, name: `Item ${i + 1}`, unitPrice: 5 + i, isAvailable: true }));

afterEach(() => jest.restoreAllMocks());

test('sem medida de altura (testes), todos os itens ficam num cartão só', () => {
  render(<MenuPagedCarousel items={make(5)} qty={{}} onChange={() => undefined} />);
  expect(screen.getByRole('group', { name: 'Itens 1 a 5' })).toBeInTheDocument();
  expect(screen.getByText('Itens 1–5 de 5')).toBeInTheDocument();
});

test('divide os itens em cartões conforme a altura livre e mantém a ordem', () => {
  // altura do trilho 200 px: (200 − 20) / 48 = 3 itens por cartão
  jest.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(200);
  render(<MenuPagedCarousel items={make(7)} qty={{}} onChange={() => undefined} />);
  expect(screen.getByRole('group', { name: 'Itens 1 a 3' })).toHaveTextContent('Item 1');
  expect(screen.getByRole('group', { name: 'Itens 4 a 6' })).toHaveTextContent('Item 4');
  expect(screen.getByRole('group', { name: 'Itens 7 a 7' })).toHaveTextContent('Item 7');
  expect(screen.getByText('Itens 1–3 de 7')).toBeInTheDocument();
  expect(screen.getByLabelText('Itens anteriores')).toBeDisabled();
  expect(screen.getByLabelText('Próximos itens')).toBeEnabled();
});

test('+ e − chamam onChange com o id e respeitam o máximo por item', () => {
  const onChange = jest.fn();
  render(
    <MenuPagedCarousel
      items={make(2)}
      qty={{ m2: 20 }}
      maxQty={20}
      onChange={onChange}
      minusLabel={(n) => `Remover ${n}`}
      plusLabel={(n) => `Adicionar ${n}`}
    />,
  );
  fireEvent.click(screen.getByLabelText('Adicionar Item 1'));
  fireEvent.click(screen.getByLabelText('Remover Item 2'));
  expect(onChange).toHaveBeenNthCalledWith(1, 'm1', 1);
  expect(onChange).toHaveBeenNthCalledWith(2, 'm2', -1);
  expect(screen.getByLabelText('Adicionar Item 2')).toBeDisabled();
  expect(screen.getByLabelText('Remover Item 1')).toBeDisabled();
});

test('item esgotado mostra "Esgotado" sem controles; selo de já pedido e id de teste aparecem', () => {
  const items = [{ id: 'a', name: 'Água', unitPrice: 5, isAvailable: true }, { id: 'b', name: 'Salada', unitPrice: 7, isAvailable: false }];
  render(
    <MenuPagedCarousel
      items={items}
      qty={{}}
      onChange={() => undefined}
      plusLabel={(n) => `Adicionar ${n}`}
      testIdPrefix="menu-"
      renderBadge={(m) => (m.id === 'a' ? <span data-testid="ordered-a">(2)</span> : null)}
    />,
  );
  expect(screen.getByText('Esgotado')).toBeInTheDocument();
  expect(screen.queryByLabelText('Adicionar Salada')).toBeNull();
  expect(screen.getByTestId('menu-a')).toBeInTheDocument();
  expect(screen.getByTestId('ordered-a')).toHaveTextContent('(2)');
});

test('sem itens avisa que nada foi encontrado', () => {
  render(<MenuPagedCarousel items={[]} qty={{}} onChange={() => undefined} />);
  expect(screen.getByText('Nenhum item encontrado.')).toBeInTheDocument();
});
