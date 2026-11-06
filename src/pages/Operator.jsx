import React from 'react';
import { useStore } from '../store.jsx';
import { Badge, Button, Empty } from '../components/ui.jsx';
import { human, daysBetween, fmt } from '../utils.js';
import CabinetTemplate from '../components/templates/CabinetTemplate.jsx';

export default function Operator() {
  const { state, dispatch } = useStore();
  const orders = state.rentals.filter((r) => r.operatorId === state.userId && r.status !== 'скасовано').sort((a, b) => a.from.localeCompare(b.from));
  const pending = orders.filter((r) => r.operatorStatus === 'очікує');
  const accepted = orders.filter((r) => r.operatorStatus === 'прийнято');
  const Row = ({ r, actions }) => {
    const kit = state.kits.find((k) => k.id === r.kitId);
    const renter = state.users.find((u) => u.id === r.renterId);
    const t = state.tariffs.find((x) => x.id === kit.tariffId);
    return (
      <article className="order">
        <div><b>{kit.name}</b><p className="muted">{human(r.from)} - {human(r.to)} · {daysBetween(r.from, r.to)} дн · замовник {renter.name}</p>
          <p className="small">Пункт: {state.points.find((p) => p.id === kit.pointId).name}. Оплата: {fmt(t.operatorHour * 8 * daysBetween(r.from, r.to))}.</p></div>
        <div className="order__side"><Badge>{r.operatorStatus}</Badge>{actions}</div>
      </article>
    );
  };
  return (
    <CabinetTemplate crumbs={[['Головна', '#/'], ['Мої замовлення']]} title="Мої замовлення" subtitle="Пропозиції оренди з оператором і ваш розклад.">
      <h2>Нові пропозиції</h2>
      {pending.length === 0 && <Empty title="Нових замовлень немає"><p>Коли орендар обере оренду з оператором, пропозиція з’явиться тут.</p></Empty>}
      {pending.map((r) => <Row key={r.id} r={r} actions={<div className="actions"><Button variant="ghost" onClick={() => dispatch({ type: 'operatorAnswer', id: r.id, answer: 'відхилено' })}>Відхилити</Button><Button onClick={() => dispatch({ type: 'operatorAnswer', id: r.id, answer: 'прийнято' })}>Прийняти</Button></div>} />)}
      <h2>Розклад</h2>
      {accepted.length === 0 ? <p className="muted">Розклад порожній.</p> : accepted.map((r) => <Row key={r.id} r={r} />)}
    </CabinetTemplate>
  );
}
