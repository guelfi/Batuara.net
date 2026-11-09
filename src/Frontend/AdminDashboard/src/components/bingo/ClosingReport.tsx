import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BingoEvent, BingoSummary, BingoTab } from '../../types/bingo';

interface Props {
  event: BingoEvent;
  summary: BingoSummary;
  tabs: BingoTab[];
  onDone: () => void;
}

const money = (v: number) => (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dateBR = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-BR');
};
const STATUS_LABEL: Record<string, string> = { Open: 'Aberta', CloseRequested: 'Pediu a conta', Paid: 'Paga' };
const EVENT_LABEL: Record<string, string> = { Draft: 'Rascunho', Open: 'Aberto', Closed: 'Encerrado', Suspended: 'Suspenso' };
const PAY_LABEL: Record<string, string> = {
  Cash: 'Dinheiro', Pix: 'Pix', CreditCard: 'Cartão de crédito', DebitCard: 'Cartão de débito', Card: 'Cartão',
};
const payLabel = (m?: string | null) => (m ? PAY_LABEL[m] ?? m : '-');
const mesaKey = (t: BingoTab) => String(t.mesa);
const byMesa = (a: BingoTab, b: BingoTab) => mesaKey(a).localeCompare(mesaKey(b), 'pt-BR', { numeric: true });

const CSS = `
.bingo-closing-print { display: none; }
@media print {
  body > *:not(.bingo-closing-print) { display: none !important; }
  .bingo-closing-print { display: block; color: #000; background: #fff; font-family: Arial, sans-serif; font-size: 10pt; }
  .bingo-closing-print h1 { font-size: 16pt; margin: 0 0 2pt; }
  .bingo-closing-print h2 { font-size: 11pt; margin: 14pt 0 4pt; border-bottom: 1px solid #000; padding-bottom: 2pt; }
  .bingo-closing-print table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
  .bingo-closing-print tr { page-break-inside: avoid; }
  .bingo-closing-print th, .bingo-closing-print td { border-bottom: 1px solid #bbb; padding: 2pt 4pt; text-align: left; vertical-align: top; }
  .bingo-closing-print .r { text-align: right; white-space: nowrap; }
  .bingo-closing-print .unpaid td { font-weight: 700; background: #eee; }
  .bingo-closing-print .totals td { border: none; padding: 1pt 4pt; }
  .bingo-closing-print .sign { display: flex; gap: 40pt; margin-top: 48pt; page-break-inside: avoid; }
  .bingo-closing-print .sign div { flex: 1; border-top: 1px solid #000; padding-top: 3pt; text-align: center; }
  @page { size: A4 portrait; margin: 1.5cm; }
}
`;

const ClosingReport: React.FC<Props> = ({ event, summary, tabs, onDone }) => {
  useEffect(() => {
    const t = window.setTimeout(() => {
      window.print();
      onDone();
    }, 300);
    return () => window.clearTimeout(t);
  }, [onDone]);

  const unpaid = tabs.filter((t) => t.status !== 'Paid').sort(byMesa);
  const paid = tabs.filter((t) => t.status === 'Paid').sort(byMesa);
  const unpaidDue = unpaid.reduce((s, t) => s + t.amountDue, 0);
  const problemItems = tabs.flatMap((t) =>
    t.items.filter((i) => i.status === 'Cancelled' || i.status === 'Contested').map((i) => ({ t, i }))
  );

  return createPortal(
    <div className="bingo-closing-print">
      <style>{CSS}</style>
      <h1>Fechamento do Bingo - {event.name}</h1>
      <div>
        Casa de Caridade Caboclo Batuara · Data do evento: {dateBR(event.eventDate)} · Situação: {EVENT_LABEL[event.status]}
        {event.isTest ? ' (evento de teste)' : ''} · Emitido em {new Date().toLocaleString('pt-BR')}
      </div>

      <h2>Totais</h2>
      <table className="totals">
        <tbody>
          <tr><td>Comandas fotografadas ({summary.photoCount})</td><td className="r"><b>{money(summary.photoTotal)}</b></td></tr>
          <tr><td><b>Total geral (digital + foto)</b></td><td className="r"><b>{money(summary.grandTotal)}</b></td></tr>
          <tr><td>Total recebido (pago: digitais + fotografadas)</td><td className="r"><b>{money(summary.totalSold)}</b></td></tr>
          <tr><td>A receber ({unpaid.length} {unpaid.length === 1 ? 'comanda não paga' : 'comandas não pagas'})</td><td className="r"><b>{money(unpaidDue)}</b></td></tr>
          <tr><td>Itens cancelados</td><td className="r">{money(summary.cancelledTotal)}</td></tr>
          <tr><td>Itens em contestação sem resolução</td><td className="r">{summary.contestedOpen}</td></tr>
        </tbody>
      </table>

      <h2>Recebido por forma de pagamento</h2>
      <table>
        <thead><tr><th>Forma</th><th className="r">Contas</th><th className="r">Total</th></tr></thead>
        <tbody>
          {summary.byPayment.map((l) => (
            <tr key={l.label}><td>{payLabel(l.label)}</td><td className="r">{l.count ?? '-'}</td><td className="r">{money(l.total)}</td></tr>
          ))}
          {summary.byPayment.length === 0 && <tr><td colSpan={3}>Sem pagamentos.</td></tr>}
        </tbody>
      </table>

      <h2>Conferência de caixa por garçom</h2>
      <table>
        <thead><tr><th>Garçom</th><th className="r">Contas</th><th className="r">Total</th><th>Por forma de pagamento</th></tr></thead>
        <tbody>
          {summary.byWaiter.map((w) => (
            <tr key={w.name}>
              <td>{w.name}</td><td className="r">{w.count}</td><td className="r">{money(w.total)}</td>
              <td>{w.byMethod.map((m) => `${payLabel(m.method)}: ${money(m.total)}`).join(' · ') || '-'}</td>
            </tr>
          ))}
          {summary.byWaiter.length === 0 && <tr><td colSpan={4}>Sem recebimentos.</td></tr>}
        </tbody>
      </table>

      <h2>Vendas por item</h2>
      <table>
        <thead><tr><th>Item</th><th className="r">Qtd.</th><th className="r">Valor</th></tr></thead>
        <tbody>
          {summary.byItem.map((l) => (
            <tr key={l.label}><td>{l.label}</td><td className="r">{l.quantity ?? '-'}</td><td className="r">{money(l.total)}</td></tr>
          ))}
          {summary.byItem.length === 0 && <tr><td colSpan={3}>Sem itens.</td></tr>}
        </tbody>
      </table>

      <h2>Comandas não fechadas ({unpaid.length})</h2>
      <table>
        <thead><tr><th>Mesa</th><th>Cliente</th><th>Situação</th><th>Celular</th><th className="r">Consumo</th><th className="r">A receber</th></tr></thead>
        <tbody>
          {unpaid.map((t) => (
            <tr key={t.tabId} className="unpaid">
              <td>{t.mesa}</td><td>{t.customerName}</td><td>{STATUS_LABEL[t.status] ?? t.status}</td>
              <td>{t.phoneVerified ? 'confirmado' : 'não confirmado'}</td>
              <td className="r">{money(t.total)}</td><td className="r">{money(t.amountDue)}</td>
            </tr>
          ))}
          {unpaid.length === 0 && <tr><td colSpan={6}>Nenhuma comanda pendente.</td></tr>}
        </tbody>
      </table>

      <h2>Comandas pagas ({paid.length})</h2>
      <table>
        <thead><tr><th>Mesa</th><th>Cliente</th><th>Forma</th><th>Recebido por</th><th className="r">Total</th></tr></thead>
        <tbody>
          {paid.map((t) => (
            <tr key={t.tabId}>
              <td>{t.mesa}</td><td>{t.customerName}</td><td>{payLabel(t.paymentMethod)}</td>
              <td>{t.paidByName || 'Não informado'}</td><td className="r">{money(t.amountDue)}</td>
            </tr>
          ))}
          {paid.length === 0 && <tr><td colSpan={5}>Nenhuma comanda paga.</td></tr>}
        </tbody>
      </table>

      <h2>Itens cancelados e contestados ({problemItems.length})</h2>
      <table>
        <thead><tr><th>Mesa</th><th>Cliente</th><th>Item</th><th>Situação</th><th>Motivo / observação</th><th className="r">Valor</th></tr></thead>
        <tbody>
          {problemItems.map(({ t, i }) => (
            <tr key={`${t.tabId}-${i.id}`}>
              <td>{t.mesa}</td><td>{t.customerName}</td><td>{i.quantity}x {i.name}</td>
              <td>{i.status === 'Cancelled' ? 'Cancelado' : 'Em contestação'}</td>
              <td>
                {i.status === 'Cancelled'
                  ? `${i.cancelReason ?? ''}${i.cancelledByName ? ` (${i.cancelledByName})` : ''}`
                  : i.contestNote ?? ''}
              </td>
              <td className="r">{money(i.unitPrice * i.quantity)}</td>
            </tr>
          ))}
          {problemItems.length === 0 && <tr><td colSpan={6}>Nenhum item cancelado ou contestado.</td></tr>}
        </tbody>
      </table>

      <div className="sign">
        <div>Conferido por (nome e assinatura)</div>
        <div>Responsável / tesoureiro (assinatura)</div>
        <div>Data</div>
      </div>
    </div>,
    document.body
  );
};

export default ClosingReport;
