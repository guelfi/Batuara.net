import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import WaiterTablesStatus, { detectOpenings, tableStateLabel } from './WaiterTablesStatus';
import bingoApi from '../../services/bingoApi';
import { WaiterTableStatus } from '../../types/bingoWaiter';

jest.mock('../../services/bingoApi', () => ({
  __esModule: true,
  default: { getWaiterTablesStatus: jest.fn() },
}));

// o Admin declara `jest` como any (jest-runtime.d.ts): sem tipos de mock
const getStatus = bingoApi.getWaiterTablesStatus as any;

const table = (over: Partial<WaiterTableStatus> & { numero: number }): WaiterTableStatus => ({
  lugares: 4,
  exclusiva: false,
  ocupados: 0,
  livres: 4,
  comandas: 0,
  estado: 'Free',
  ocupantes: [],
  ...over,
});

const base = [
  table({ numero: 1 }),
  table({ numero: 2, ocupados: 2, livres: 2, comandas: 1, estado: 'HasSeats', ocupantes: [{ nome: 'Maria', pessoas: 2 }] }),
  table({ numero: 3, ocupados: 4, livres: 0, comandas: 2, estado: 'Full', ocupantes: [{ nome: 'João', pessoas: 2 }, { nome: 'Ana', pessoas: 2 }] }),
  table({ numero: 4, exclusiva: true, ocupados: 1, livres: 0, comandas: 1, estado: 'ExclusiveTaken', ocupantes: [{ nome: 'Rosana', pessoas: 1 }] }),
  table({ numero: 5, exclusiva: true, lugares: 6, livres: 6 }),
];

beforeEach(() => {
  jest.clearAllMocks();
  getStatus.mockResolvedValue(base);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('tableStateLabel', () => {
  it('descreve cada estado', () => {
    expect(tableStateLabel(base[0])).toBe('Livre');
    expect(tableStateLabel(base[1])).toBe('2 lugares livres');
    expect(tableStateLabel(table({ numero: 9, estado: 'HasSeats', livres: 1 }))).toBe('1 lugar livre');
    expect(tableStateLabel(base[2])).toBe('Lotada');
    expect(tableStateLabel(base[3])).toBe('Exclusiva ocupada');
    expect(tableStateLabel(base[4])).toBe('Livre · exclusiva');
  });
});

describe('detectOpenings', () => {
  const map = (list: WaiterTableStatus[]) => new Map(list.map((t) => [t.numero, t]));

  it('não destaca nada na primeira carga', () => {
    expect(detectOpenings(new Map(), base)).toEqual({});
  });

  it('destaca a mesa que ficou totalmente livre e a que abriu vaga', () => {
    const next = [
      table({ numero: 1 }),
      table({ numero: 2 }), // estava com 1 comanda: agora livre
      table({ numero: 3, ocupados: 2, livres: 2, comandas: 1, estado: 'HasSeats', ocupantes: [{ nome: 'Ana', pessoas: 2 }] }), // lotada: abriu 2 vagas
      base[3],
      base[4],
    ];
    const out = detectOpenings(map(base), next);
    expect(out[2]).toEqual({ kind: 'free', text: 'Mesa 2 ficou livre' });
    expect(out[3]).toEqual({ kind: 'seats', text: 'Mesa 3 abriu 2 vagas' });
    expect(out[1]).toBeUndefined();
    expect(out[4]).toBeUndefined();
  });

  it('não destaca quando a ocupação aumenta', () => {
    const next = base.map((t) => (t.numero === 2 ? { ...t, ocupados: 4, livres: 0, estado: 'Full' as const } : t));
    expect(detectOpenings(map(base), next)).toEqual({});
  });
});

describe('WaiterTablesStatus', () => {
  it('mostra o estado de cada mesa, com exclusiva e lugares', async () => {
    render(<WaiterTablesStatus selected="" onSelect={() => undefined} />);
    expect(await screen.findByTestId('mesa-1')).toHaveAttribute('data-estado', 'Free');
    expect(screen.getByTestId('mesa-1')).toHaveTextContent('Livre');
    expect(screen.getByTestId('mesa-1')).toHaveTextContent('4 lugares');
    expect(screen.getByTestId('mesa-2')).toHaveTextContent('2 lugares livres');
    expect(screen.getByTestId('mesa-2')).toHaveTextContent('2 de 4 lugares');
    expect(screen.getByTestId('mesa-3')).toHaveTextContent('Lotada');
    expect(screen.getByTestId('mesa-4')).toHaveTextContent('Exclusiva ocupada');
    expect(screen.getByTestId('mesa-5')).toHaveTextContent('Livre · exclusiva');
    // cadeado só nas mesas exclusivas
    expect(screen.getByTestId('mesa-4').querySelector('svg')).not.toBeNull();
    expect(screen.getByTestId('mesa-5').querySelector('svg')).not.toBeNull();
    expect(screen.getByTestId('mesa-1').querySelector('svg')).toBeNull();
  });

  it('tocar numa mesa a seleciona; com mesa selecionada mostra os ocupantes e "Ver todas as mesas"', async () => {
    const onSelect = jest.fn();
    const { rerender } = render(<WaiterTablesStatus selected="" onSelect={onSelect} />);
    fireEvent.click(await screen.findByTestId('mesa-3'));
    expect(onSelect).toHaveBeenCalledWith('3');

    rerender(<WaiterTablesStatus selected="3" onSelect={onSelect} />);
    const detail = screen.getByTestId('mesa-detalhe-3');
    expect(detail).toHaveTextContent('Lotada');
    expect(detail).toHaveTextContent('João (2), Ana (2)');
    expect(screen.queryByTestId('mesa-1')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Ver todas as mesas' }));
    expect(onSelect).toHaveBeenLastCalledWith('');
  });

  it('atualiza sozinha e avisa/destaca quando uma mesa fica livre ou abre vaga', async () => {
    jest.useFakeTimers();
    render(<WaiterTablesStatus selected="" onSelect={() => undefined} />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByTestId('mesa-3')).toHaveAttribute('data-estado', 'Full');
    expect(screen.queryByRole('status')).toBeNull();

    // a conta da Maria foi paga (mesa 2 livre) e o João saiu da mesa 3 (abriu 2 vagas)
    getStatus.mockResolvedValue([
      base[0],
      table({ numero: 2 }),
      table({ numero: 3, ocupados: 2, livres: 2, comandas: 1, estado: 'HasSeats', ocupantes: [{ nome: 'Ana', pessoas: 2 }] }),
      base[3],
      base[4],
    ]);
    await act(async () => {
      jest.advanceTimersByTime(10000);
      await Promise.resolve();
    });

    expect(screen.getByTestId('mesa-2')).toHaveAttribute('data-estado', 'Free');
    expect(screen.getByTestId('mesa-2')).toHaveAttribute('data-flash', 'free');
    expect(screen.getByTestId('mesa-3')).toHaveAttribute('data-flash', 'seats');
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Mesa 2 ficou livre');
    expect(status).toHaveTextContent('Mesa 3 abriu 2 vagas');

    // o destaque some depois de alguns segundos
    await act(async () => {
      jest.advanceTimersByTime(9000);
    });
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByTestId('mesa-2')).not.toHaveAttribute('data-flash');
  });

  it('avisa quando não consegue carregar', async () => {
    getStatus.mockRejectedValue(new Error('rede'));
    render(<WaiterTablesStatus selected="" onSelect={() => undefined} />);
    expect(await screen.findByText(/Não foi possível carregar a situação das mesas/)).toBeInTheDocument();
  });
});
