import React, { useState } from 'react';
import { useStore } from '../store.jsx';
import { Badge, Button, Tabs, Modal, Field, Empty, DronePhoto } from '../components/ui.jsx';
import { fmt, human, sum } from '../utils.js';
import { ROLES } from '../data/mock.js';
import CabinetTemplate from '../components/templates/CabinetTemplate.jsx';

export default function Admin() {
  const { state } = useStore();
  const [tab, setTab] = useState('moder');
  const nMod = state.kits.filter((k) => k.status === 'на модерації').length;
  const nDisp = state.rentals.filter((r) => r.dispute && r.dispute.status !== 'вирішено').length;
  const nLic = state.users.filter((u) => u.licenseStatus === 'на перевірці').length;
  return (
    <CabinetTemplate
      crumbs={[['Головна', '#/'], ['Керування']]}
      title="Керування платформою"
      subtitle="Модерація оголошень, спори, тарифи, допуски й виплати."
      actions={<a className="btn btn--ghost" href="#/registry/kits">Реєстри даних</a>}
      tab={tab} onTab={setTab}
      tabs={[['moder', `Модерація (${nMod})`], ['disputes', `Спори (${nDisp})`], ['tariffs', 'Тарифи'], ['licenses', `Допуски (${nLic})`], ['payouts', 'Виплати'], ['users', 'Користувачі'], ['reports', 'Звіти']]}
    >
      {tab === 'moder' && <Moderation />}
      {tab === 'disputes' && <Disputes />}
      {tab === 'tariffs' && <Tariffs />}
      {tab === 'licenses' && <Licenses />}
      {tab === 'payouts' && <Payouts />}
      {tab === 'users' && <Users />}
      {tab === 'reports' && <Reports />}
    </CabinetTemplate>
  );
}

function Moderation() {
  const { state, dispatch } = useStore();
  const [reject, setReject] = useState(null);
  const [reason, setReason] = useState('');
  const list = state.kits.filter((k) => k.status === 'на модерації');
  if (!list.length) return <Empty title="Черга модерації порожня" />;
  return (
    <>
      {list.map((k) => {
        const p = state.platforms.find((x) => x.id === k.platformId);
        return (
          <article key={k.id} className="mod">
            <DronePhoto small />
            <div className="mod__body">
              <h3>{k.name}</h3>
              <p className="muted">{k.purpose} · {p.maker} {p.model}, клас {p.cls} · власник {state.users.find((u) => u.id === k.ownerId).name}</p>
              <p>{k.description}</p>
              <p className="small">Склад: {k.items.map((i) => `${i.name} (${i.qty})`).join(', ')}. Застава {fmt(k.deposit)}.</p>
            </div>
            <div className="actions actions--col">
              <Button onClick={() => dispatch({ type: 'moderate', id: k.id, ok: true })}>Опублікувати</Button>
              <Button variant="ghost" onClick={() => setReject(k)}>Відхилити</Button>
            </div>
          </article>
        );
      })}
      {reject && (
        <Modal title={`Відхилити «${reject.name}»`} onClose={() => setReject(null)}>
          <Field label="Причина - її побачить власник"><textarea rows="3" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Наприклад, не вказано оціночну вартість акумуляторів" /></Field>
          <div className="actions"><Button disabled={reason.trim().length < 5} onClick={() => { dispatch({ type: 'moderate', id: reject.id, ok: false, reason }); setReject(null); setReason(''); }}>Відхилити з причиною</Button></div>
        </Modal>
      )}
    </>
  );
}

function Disputes() {
  const { state, dispatch } = useStore();
  const list = state.rentals.filter((r) => r.dispute);
  const [cur, setCur] = useState(list.find((r) => r.dispute.status !== 'вирішено')?.id || list[0]?.id);
  const [decision, setDecision] = useState('');
  const [comp, setComp] = useState('');
  const r = state.rentals.find((x) => x.id === cur);
  if (!list.length) return <Empty title="Спорів немає" />;
  const kit = r && state.kits.find((k) => k.id === r.kitId);
  const issue = r?.acts.find((a) => a.type === 'видача');
  const ret = r?.acts.find((a) => a.type === 'повернення');
  return (
    <div className="disputes">
      <ul className="disputes__list">
        {list.map((x) => (
          <li key={x.id}><button type="button" className={x.id === cur ? 'disp-item disp-item--on' : 'disp-item'} onClick={() => setCur(x.id)}>
            <b>{x.contract}</b><span className="muted small">{state.users.find((u) => u.id === x.dispute.initiatorId).name} · {x.dispute.type}</span><Badge>{x.dispute.status}</Badge>
          </button></li>
        ))}
      </ul>
      {r && (
        <section className="panel">
          <h2>Спір за договором {r.contract}</h2>
          <p className="muted">{kit.name} · {human(r.from)} - {human(r.to)} · відкрито {human(r.dispute.openedAt)}</p>
          <blockquote className="quote">{r.dispute.text}<span className="muted small"> Оскаржує: {fmt(r.dispute.claim)}</span></blockquote>
          <h3>Порівняння актів</h3>
          <table className="table">
            <thead><tr><th>Позиція</th><th>Вартість</th><th>При видачі</th><th>При поверненні</th></tr></thead>
            <tbody>
              {kit.items.map((it, i) => {
                const a = issue?.items[i]; const b = ret?.items[i];
                return <tr key={it.name} className={a && b && a !== b ? 'checklist__changed' : ''}><td>{it.name}</td><td className="num">{fmt(it.value)}</td><td>{a ? <Badge>{a}</Badge> : '-'}</td><td>{b ? <Badge>{b}</Badge> : '-'}</td></tr>;
              })}
            </tbody>
          </table>
          <p className="small">Наліт: {issue?.hours ?? '-'} → {ret?.hours ?? '-'} год. Коментар працівника: {ret?.comment || '-'}. Орендар {ret?.confirmed ? 'підтвердив' : 'не підтвердив'} акт повернення.</p>
          {r.dispute.status === 'вирішено' ? (
            <p><b>Рішення:</b> {r.dispute.decision}. Утримано {fmt(r.dispute.compensation || 0)}.</p>
          ) : (
            <>
              <Field label="Рішення"><textarea rows="3" value={decision} onChange={(e) => setDecision(e.target.value)} placeholder="Обґрунтування за актами й фото" /></Field>
              <Field label="Утримати із застави, ₴" hint="0 - якщо претензія власника не підтвердилась"><input type="number" min="0" value={comp} onChange={(e) => setComp(e.target.value)} /></Field>
              <div className="actions">
                <Button disabled={decision.trim().length < 10} onClick={() => { dispatch({ type: 'resolveDispute', id: r.id, decision, compensation: Number(comp) || 0 }); setDecision(''); setComp(''); }}>Ухвалити рішення</Button>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}

function Tariffs() {
  const { state, dispatch } = useStore();
  const cols = [['day', 'За добу'], ['hour', 'За год нальоту'], ['operatorHour', 'Оператор, год'], ['insuranceDay', 'Страхування, доба'], ['lateFeeDay', 'Штраф, доба']];
  return (
    <>
      <p className="muted">Зміни одразу застосовуються до нових розрахунків. Чинні договори не змінюються.</p>
      <div className="table-wrap">
        <table className="table table--edit">
          <thead><tr><th>Тариф</th><th>Тип</th>{cols.map(([, l]) => <th key={l} className="num">{l}, ₴</th>)}</tr></thead>
          <tbody>{state.tariffs.map((t) => (
            <tr key={t.id}><td>{t.name}</td><td>{t.type}</td>
              {cols.map(([k]) => <td key={k} className="num"><input aria-label={`${t.name}: ${k}`} type="number" min="0" value={t[k]} onChange={(e) => dispatch({ type: 'tariff', id: t.id, field: k, value: Number(e.target.value) })} /></td>)}
            </tr>))}</tbody>
        </table>
      </div>
      <h2>Коефіцієнти</h2>
      <div className="table-wrap">
        <table className="table table--edit">
          <thead><tr><th>Коефіцієнт</th><th>Тип</th><th className="num">Множник</th></tr></thead>
          <tbody>{state.coefficients.map((c) => (
            <tr key={c.id}><td>{c.label}</td><td>{c.type}</td><td className="num"><input aria-label={c.label} type="number" step="0.05" min="0.1" max="3" value={c.mult} onChange={(e) => dispatch({ type: 'coef', id: c.id, value: Number(e.target.value) })} /></td></tr>
          ))}</tbody>
        </table>
      </div>
    </>
  );
}

function Licenses() {
  const { state, dispatch } = useStore();
  const list = state.users.filter((u) => u.license);
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr><th>Користувач</th><th>Номер</th><th>Категорія</th><th>Діє до</th><th>Статус</th><th /></tr></thead>
        <tbody>{list.map((u) => (
          <tr key={u.id}><td>{u.name}</td><td>{u.license.number}</td><td>{u.license.cls}</td><td>{human(u.license.until)}</td><td><Badge>{u.licenseStatus}</Badge></td>
            <td>{u.licenseStatus === 'на перевірці' && <div className="actions"><Button variant="ghost" onClick={() => dispatch({ type: 'license', userId: u.id, status: 'відхилено', toastText: 'Допуск відхилено' })}>Відхилити</Button><Button onClick={() => dispatch({ type: 'license', userId: u.id, status: 'підтверджено', toastText: 'Допуск підтверджено' })}>Підтвердити</Button></div>}</td></tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function Payouts() {
  const { state, dispatch } = useStore();
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr><th>Власник</th><th>Період</th><th className="num">Нараховано</th><th className="num">Комісія</th><th className="num">До виплати</th><th>Статус</th><th /></tr></thead>
        <tbody>{state.payouts.map((p) => (
          <tr key={p.id}><td>{state.users.find((u) => u.id === p.ownerId).name}</td><td>{human(p.from)} - {human(p.to)}</td><td className="num">{fmt(p.gross)}</td><td className="num">{fmt(p.gross * p.rate / 100)}</td><td className="num"><b>{fmt(p.gross * (1 - p.rate / 100))}</b></td><td><Badge>{p.status}</Badge></td>
            <td>{p.status === 'очікує' && <Button onClick={() => dispatch({ type: 'payout', id: p.id })}>Виплатити</Button>}</td></tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function Users() {
  const { state } = useStore();
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr><th>Ім’я</th><th>Пошта</th><th>Ролі</th><th>Рейтинг</th></tr></thead>
        <tbody>{state.users.map((u) => <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.roles.map((r) => ROLES[r]).join(', ')}</td><td>{u.rating ? `★ ${u.rating}` : '-'}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

function Reports() {
  const { state, dispatch } = useStore();
  const act = state.rentals.filter((r) => r.status !== 'скасовано');
  const turnover = act.reduce((s, r) => s + sum(r.charges), 0);
  const commission = act.reduce((s, r) => s + sum(r.charges.filter((c) => c.type !== 'послуги оператора')), 0) * 0.15;
  const late = act.filter((r) => r.charges.some((c) => c.type === 'штраф за прострочення')).length;
  const disputes = act.filter((r) => r.dispute).length;
  return (
    <>
      <div className="stats">
        <div className="stat"><span className="stat__v">{act.length}</span><span className="stat__l">оренд за період</span></div>
        <div className="stat"><span className="stat__v">{fmt(turnover)}</span><span className="stat__l">оборот</span></div>
        <div className="stat"><span className="stat__v">{fmt(commission)}</span><span className="stat__l">комісія платформи</span></div>
        <div className="stat"><span className="stat__v">{late} / {disputes}</span><span className="stat__l">прострочень / спорів</span></div>
      </div>
      <h2>Пункти видачі</h2>
      <ul className="list">{state.points.map((p) => <li key={p.id}><span><b>{p.name}</b> - {p.address}, {p.hours}</span></li>)}</ul>
      <p className="small muted">Демо-дані зберігаються у браузері. <button type="button" className="link" onClick={() => dispatch({ type: 'reset' })}>Скинути демо до початкового стану</button></p>
    </>
  );
}
