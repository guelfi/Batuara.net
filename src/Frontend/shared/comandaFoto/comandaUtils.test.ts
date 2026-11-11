import { MenuItem, applyOcrItems, deriveItems, norm } from './comandaUtils';

const menu: MenuItem[] = [
  { id: 1, name: 'Água', unitPrice: 5 },
  { id: 2, name: 'Salada', unitPrice: 7 },
  { id: 3, name: 'Cerveja Heineken', unitPrice: 12 },
];

describe('norm', () => {
  it('ignora acento, maiúsculas e espaços nas pontas', () => {
    expect(norm('  ÁGUA ')).toBe('agua');
  });
});

describe('applyOcrItems', () => {
  it('liga o item lido ao cardápio pelo nome, sem diferenciar acento e caixa, e soma repetidos', () => {
    const r = applyOcrItems(menu, [
      { name: 'agua', quantity: 2, unitPrice: 5 },
      { name: 'ÁGUA', quantity: 1, unitPrice: 5 },
    ]);
    expect(r.qty).toEqual({ 1: 3 });
    expect(r.extras).toEqual([]);
  });

  it('manda para fora do cardápio o que não existe nele e usa o preço lido', () => {
    const r = applyOcrItems(menu, [{ name: 'Batidas', quantity: 2, unitPrice: 9 }]);
    expect(r.qty).toEqual({});
    expect(r.extras).toEqual([{ name: 'Batidas', quantity: 2, unitPrice: 9 }]);
  });

  it('descarta itens sem quantidade e limita a 500', () => {
    const r = applyOcrItems(menu, [
      { name: 'Salada', quantity: 0, unitPrice: 7 },
      { name: 'Cerveja Heineken', quantity: 9999, unitPrice: 12 },
    ]);
    expect(r.qty).toEqual({ 3: 500 });
  });

  it('aceita leitura vazia', () => {
    expect(applyOcrItems(menu, undefined as any)).toEqual({ qty: {}, extras: [] });
  });
});

describe('deriveItems', () => {
  it('lista primeiro os itens do cardápio com quantidade (na ordem do cardápio) e depois os de fora', () => {
    const items = deriveItems(menu, { 3: 1, 1: 2, 2: 0 }, [{ name: 'Batidas', quantity: 1, unitPrice: 9 }]);
    expect(items.map((i) => [i.name, i.quantity, i.matched])).toEqual([
      ['Água', 2, true],
      ['Cerveja Heineken', 1, true],
      ['Batidas', 1, false],
    ]);
  });
});
