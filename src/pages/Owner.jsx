import React, { useState } from 'react';
import { useStore } from '../store.jsx';
import { Badge, Button, Tabs, DronePhoto, Field } from '../components/ui.jsx';
import { fmt, human, sum, TODAY, addDays, daysBetween } from '../utils.js';
import CabinetTemplate from '../components/templates/CabinetTemplate.jsx';

export default function Owner() {
  const { state } = useStore();
  const [tab, setTab] = useState('kits');
  const kits = state.kits.filter((k) => k.ownerId === state.userId);
  return (
    <CabinetTemplate
      crumbs={[['Головна', '#/'], ['Моя техніка']]}
      title="Моя техніка"
      subtitle={`${kits.length} комплектів у каталозі та на модерації`}
      actions={<a className="btn btn--primary" href="#/owner/new">Додати комплект</a>}
      tab={tab} onTab={setTab}
      tabs={[['kits', 'Комплекти'], ['avail', 'Доступність'], ['money', 'Нарахування і виплати'], ['stats', 'Завантаження']]}
    >
      {tab === 'kits' && <Kits kits={kits} />}
      {tab === 'avail' && <Availability kits={kits} />}
      {tab === 'money' && <Money kits={kits} />}
      {tab === 'stats' && <Stats kits={kits} />}
    </CabinetTemplate>
  );
}

function Kits({ kits }) {
  const { state } = useStore();
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr><th>Комплект</th><th>Статус</th><th>Тариф</th><th>Застава</th><th>Ресурс до ТО</th></tr></thead>
        <tbody>
          {kits.map((k) => {
            const p = state.platforms.find((x) => x.id === k.platformId);
            const used = Math.min(100, Math.round((p.hoursSinceService / p.serviceInterval) * 100));
            return (
              <tr key={k.id}>
                <td><div className="cell-kit"><DronePhoto small /><span><a href={`#/kit/${k.id}`}>{k.name}</a><span className="muted small">{p.maker} {p.model} · {p.serial}</span></span></div></td>
                <td><Badge>{k.status}</Badge>{k.rejectReason && <p className="small muted">{k.rejectReason}</p>}</td>
                <td>{state.tariffs.find((t) => t.id === k.tariffId).name}</td>
                <td className="num">{fmt(k.deposit)}</td>
                <td>
                  <div className={used >= 90 ? 'meter meter--bad' : used >= 70 ? 'meter meter--warn' : 'meter'} role="meter" aria-valuenow={used} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${used}%` }} /></div>
                  <span className="small muted">{p.hoursSinceService} з {p.serviceInterval} год</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Availability({ kits }) {
  const { state, dispatch } = useStore();
  const [kitId, setKit] = useState(kits[0]?.id);
  const [from, setFrom] = useState(addDays(TODAY, 7));
  const [to, setTo] = useState(addDays(TODAY, 8));
  const blocks = state.unavailable.filter((u) => u.kitId === Number(kitId));
  return (
    <div className="two-col">
      <section className="panel">
        <h2>Заблокувати дати</h2>
        <p className="muted">Коли техніка потрібна вам самим або на ремонті - орендарі не зможуть забронювати ці дні.</p>
        <Field label="Комплект"><select value={kitId} onChange={(e) => setKit(e.target.value)}>{kits.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}</select></Field>
        <div className="form-grid">
          <Field label="З"><input type="date" value={from} min={TODAY} onChange={(e) => setFrom(e.target.value)} /></Field>
          <Field label="По"><input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} /></Field>
        </div>
        <Button disabled={from > to} onClick={() => dispatch({ type: 'block', kitId: Number(kitId), from, to })}>Заблокувати дати</Button>
      </section>
      <section className="panel">
        <h2>Недоступні періоди</h2>
        {blocks.length === 0 && <p className="muted">Комплект доступний у всі дні, крім бронювань.</p>}
        <ul className="list">
          {blocks.map((b) => (
            <li key={b.id}><span>{human(b.from)} - {human(b.to)} · {b.reason}{b.auto ? ' (автоматично)' : ''}</span>
              {!b.auto && <button type="button" className="link" onClick={() => dispatch({ type: 'unblock', id: b.id })}>Зняти</button>}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Money({ kits }) {
  const { state, dispatch } = useStore();
  const ids = kits.map((k) => k.id);
  const rows = state.rentals.filter((r) => ids.includes(r.kitId) && r.status !== 'скасовано');
  const pays = state.payouts.filter((p) => p.ownerId === state.userId);
  return (
    <>
      <div className="stats">
        <div className="stat"><span className="stat__v">{fmt(rows.reduce((s, r) => s + sum(r.charges.filter((c) => c.type !== 'послуги оператора')), 0) * 0.85)}</span><span className="stat__l">ваша частка за всі оренди (після комісії 15%)</span></div>
        <div className="stat"><span className="stat__v">{fmt(pays.filter((p) => p.status === 'очікує').reduce((s, p) => s + p.gross * (1 - p.rate / 100), 0))}</span><span className="stat__l">очікує виплати</span></div>
      </div>
      <h2>Нарахування за орендами</h2>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Договір</th><th>Комплект</th><th>Дати</th><th>Статус</th><th className="num">Нараховано</th><th className="num">Комісія</th><th className="num">Вам</th></tr></thead>
          <tbody>
            {rows.map((r) => {
              const g = sum(r.charges.filter((c) => c.type !== 'послуги оператора'));
              return <tr key={r.id}><td>{r.contract}</td><td>{state.kits.find((k) => k.id === r.kitId).name}</td><td>{human(r.from)} - {human(r.to)}</td><td><Badge>{r.status}</Badge></td><td className="num">{fmt(g)}</td><td className="num">−{fmt(g * 0.15)}</td><td className="num"><b>{fmt(g * 0.85)}</b></td></tr>;
            })}
          </tbody>
        </table>
      </div>
      <h2>Виплати</h2>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Період</th><th className="num">Сума нарахувань</th><th className="num">Комісія</th><th className="num">До виплати</th><th>Статус</th></tr></thead>
          <tbody>{pays.map((p) => <tr key={p.id}><td>{human(p.from)} - {human(p.to)}</td><td className="num">{fmt(p.gross)}</td><td className="num">{p.rate}%</td><td className="num">{fmt(p.gross * (1 - p.rate / 100))}</td><td><Badge>{p.status}</Badge>{p.paidAt && <span className="small muted"> {human(p.paidAt)}</span>}</td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}

function Stats({ kits }) {
  const { state } = useStore();
  const period = 30;
  const data = kits.filter((k) => k.status !== 'на модерації').map((k) => {
    const rs = state.rentals.filter((r) => r.kitId === k.id && r.status !== 'скасовано');
    const days = rs.reduce((s, r) => s + daysBetween(r.from, r.to), 0);
    const income = rs.reduce((s, r) => s + sum(r.charges.filter((c) => c.type !== 'послуги оператора')), 0) * 0.85;
    const value = k.items.reduce((s, i) => s + i.value * i.qty, 0);
    return { k, days, income, value, util: Math.min(100, Math.round((days / period) * 100)) };
  });
  const max = Math.max(1, ...data.map((d) => d.days));
  return (
    <div>
      <p className="muted">Жовтень–листопад 2026, {period} днів. Окупність - частка вартості комплекту, яку вже повернула оренда.</p>
      <div className="bars" role="img" aria-label="Дні в оренді за комплектами">
        {data.map((d) => (
          <div key={d.k.id} className="bars__row">
            <span className="bars__name">{d.k.name}</span>
            <span className="bars__track"><span className="bars__fill" style={{ width: `${(d.days / max) * 100}%` }} /></span>
            <span className="bars__val">{d.days} дн · {d.util}%</span>
          </div>
        ))}
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Комплект</th><th className="num">Днів в оренді</th><th className="num">Днів простою</th><th className="num">Дохід</th><th className="num">Окупність</th></tr></thead>
          <tbody>{data.map((d) => <tr key={d.k.id}><td>{d.k.name}</td><td className="num">{d.days}</td><td className="num">{Math.max(0, period - d.days)}</td><td className="num">{fmt(d.income)}</td><td className="num">{((d.income / d.value) * 100).toFixed(1)}%</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
