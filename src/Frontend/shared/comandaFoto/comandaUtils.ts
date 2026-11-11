export interface MenuItem {
  id: number;
  name: string;
  unitPrice: number;
}

/** Linha enviada à API: item do cardápio (matched) ou item fora do cardápio. */
export interface Item {
  name: string;
  quantity: number;
  unitPrice: number;
  matched: boolean;
}

export interface ExtraItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export const MAX_QTY = 500;

export const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Normaliza para comparar nomes sem acento e sem diferença de maiúsculas. */
export const norm = (v: string) => v.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/**
 * Converte a leitura da foto no modelo da tela: quantidade por item do cardápio + itens fora do cardápio.
 * Item lido cujo nome existe no cardápio usa o preço do cardápio; o restante vai para "fora do cardápio".
 */
export const applyOcrItems = (
  menu: MenuItem[],
  read: { name: string; quantity: number; unitPrice: number }[],
): { qty: Record<number, number>; extras: ExtraItem[] } => {
  const byName = new Map(menu.map((m) => [norm(m.name), m]));
  const qty: Record<number, number> = {};
  const extras: ExtraItem[] = [];

  for (const it of read ?? []) {
    const quantity = Math.max(0, Math.min(MAX_QTY, Math.round(Number(it.quantity) || 0)));
    if (quantity === 0) continue;
    const found = byName.get(norm(it.name ?? ''));
    if (found) {
      qty[found.id] = Math.min(MAX_QTY, (qty[found.id] ?? 0) + quantity);
    } else {
      extras.push({ name: String(it.name ?? '').trim(), quantity, unitPrice: Math.max(0, Number(it.unitPrice) || 0) });
    }
  }
  return { qty, extras };
};

/** Linhas a gravar: itens do cardápio com quantidade (na ordem do cardápio) e depois os de fora. */
export const deriveItems = (menu: MenuItem[], qty: Record<number, number>, extras: ExtraItem[]): Item[] => [
  ...menu.filter((m) => (qty[m.id] ?? 0) > 0).map((m) => ({ name: m.name, quantity: qty[m.id], unitPrice: m.unitPrice, matched: true })),
  ...extras.filter((e) => e.quantity > 0).map((e) => ({ ...e, matched: false })),
];
