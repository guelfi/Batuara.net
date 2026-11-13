import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import PagedCards from './PagedCards';

const make = (n: number) => Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Mesa ${i + 1}` }));

afterEach(() => jest.restoreAllMocks());

test('sem medida de altura (testes), todas as linhas ficam num cartão só, com o conteúdo de cada linha', () => {
  render(<PagedCards items={make(4)} getKey={(m) => m.id} renderRow={(m) => <span>{m.name}</span>} noun="Mesas" label="Mesas do evento" />);
  expect(screen.getByRole('group', { name: 'Mesas do evento' })).toBeInTheDocument();
  expect(screen.getByRole('group', { name: 'Mesas 1 a 4' })).toBeInTheDocument();
  expect(screen.getByText('Mesas 1–4 de 4')).toBeInTheDocument();
  expect(screen.getByText('Mesa 3')).toBeInTheDocument();
});

test('divide em cartões pela altura medida, mantém a ordem e usa o substantivo nos botões', () => {
  // trilho de 200 px: (200 − 20) / 48 = 3 linhas por cartão
  jest.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(200);
  render(<PagedCards items={make(7)} getKey={(m) => m.id} renderRow={(m) => <span>{m.name}</span>} noun="Mesas" />);
  expect(within(screen.getByRole('group', { name: 'Mesas 1 a 3' })).getByText('Mesa 1')).toBeInTheDocument();
  expect(within(screen.getByRole('group', { name: 'Mesas 4 a 6' })).getByText('Mesa 4')).toBeInTheDocument();
  expect(within(screen.getByRole('group', { name: 'Mesas 7 a 7' })).getByText('Mesa 7')).toBeInTheDocument();
  expect(screen.getByLabelText('Mesas anteriores')).toBeDisabled();
  expect(screen.getByLabelText('Próximas mesas')).toBeEnabled();
});

test('propriedades por linha: id de teste, destaque e esmaecido', () => {
  render(
    <PagedCards
      items={make(3)}
      getKey={(m) => m.id}
      renderRow={(m) => <span>{m.name}</span>}
      rowProps={(m) => ({ testId: `linha-${m.id}`, selected: m.id === 2, dimmed: m.id === 3 })}
    />,
  );
  expect(screen.getByTestId('linha-1')).not.toHaveAttribute('data-selected');
  expect(screen.getByTestId('linha-2')).toHaveAttribute('data-selected', 'true');
  expect(screen.getByTestId('linha-3')).toHaveStyle({ opacity: '0.5' });
});

test('controles embaixo com ação à esquerda; indicador curto', () => {
  render(
    <PagedCards
      items={make(4)}
      getKey={(m) => m.id}
      renderRow={(m) => <span>{m.name}</span>}
      controlsPosition="bottom"
      footerStart={<button type="button">Adicionar</button>}
    />,
  );
  expect(screen.getByRole('group', { name: 'Lista' })).toContainElement(screen.getByRole('button', { name: 'Adicionar' }));
  expect(screen.getByText('1–4/4')).toBeInTheDocument();
});

test('sem itens mostra o texto vazio', () => {
  render(<PagedCards items={[] as { id: number }[]} getKey={(m) => m.id} renderRow={() => null} emptyText="Nenhuma mesa." />);
  expect(screen.getByText('Nenhuma mesa.')).toBeInTheDocument();
});

test('o botão de próximo pede a rolagem para o cartão seguinte', () => {
  jest.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(200);
  const scrollTo = jest.fn();
  const real = HTMLElement.prototype.scrollTo;
  HTMLElement.prototype.scrollTo = scrollTo as unknown as typeof HTMLElement.prototype.scrollTo;
  try {
    render(<PagedCards items={make(7)} getKey={(m) => m.id} renderRow={(m) => <span>{m.name}</span>} />);
    scrollTo.mockClear();
    fireEvent.click(screen.getByLabelText('Próximos itens'));
    expect(scrollTo).toHaveBeenCalled();
  } finally {
    HTMLElement.prototype.scrollTo = real;
  }
});
