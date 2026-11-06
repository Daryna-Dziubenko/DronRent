import React from 'react';
import { useStore } from '../store.jsx';
import { Badge, Empty } from '../components/ui.jsx';
import { human, TODAY, addDays } from '../utils.js';
import CabinetTemplate from '../components/templates/CabinetTemplate.jsx';

export default function Desk() {
  const { state } = useStore();
  const me = state.users.find((u) => u.id === state.userId);
  const point = state.points.find((p) => p.id === me.pointId);
  const atPoint = (r) => state.kits.find((k) => k.id === r.kitId).pointId === me.pointId || true; // демо: показуємо всі пункти
  const issues = state.rentals.filter((r) => r.status === 'підтверджено' && r.from <= addDays(TODAY, 2) && atPoint(r)).sort((a, b) => a.from.localeCompare(b.from));
  const returns = state.rentals.filter((r) => r.status === 'активний' && atPoint(r)).sort((a, b) => a.to.localeCompare(b.to));
  const Row = ({ r, kind }) => {
    const kit = state.kits.find((k) => k.id === r.kitId);
    const renter = state.users.find((u) => u.id === r.renterId);
    const late = kind === 'return' && r.to < TODAY;
    return (
      <li className="desk-row">
        <span className="desk-row__date">{human(kind === 'issue' ? r.from : r.to)}</span>
        <span><b>{kit.name}</b><span className="muted"> · {renter.name} · {r.contract}</span>{r.withOperator && <span className="tag tag--soft">з оператором</span>}</span>
        {late && <Badge tone="bad">прострочено</Badge>}
        <a className="btn btn--primary" href={`#/act/${r.id}/${kind}`}>{kind === 'issue' ? 'Оформити видачу' : 'Прийняти повернення'}</a>
      </li>
    );
  };
  return (
    <CabinetTemplate crumbs={[['Головна', '#/'], ['Видача і повернення']]} title="Видача і повернення" subtitle={`${point.name}, ${point.address}. Сьогодні ${human(TODAY)}.`}>
      <div className="two-col">
        <section className="panel">
          <h2>До видачі</h2>
          {issues.length === 0 ? <Empty title="Видач на найближчі дні немає" /> : <ul className="list">{issues.map((r) => <Row key={r.id} r={r} kind="issue" />)}</ul>}
        </section>
        <section className="panel">
          <h2>Очікуємо повернення</h2>
          {returns.length === 0 ? <Empty title="Усі комплекти на місці" /> : <ul className="list">{returns.map((r) => <Row key={r.id} r={r} kind="return" />)}</ul>}
        </section>
      </div>
    </CabinetTemplate>
  );
}
