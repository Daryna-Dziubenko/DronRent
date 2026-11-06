import React, { useState } from 'react';
import { useStore } from '../store.jsx';
import { Badge, Button, Modal, Field, Empty, DronePhoto } from '../components/ui.jsx';
import { fmt, human, sum, TODAY, isFree, addDays } from '../utils.js';
import CabinetTemplate from '../components/templates/CabinetTemplate.jsx';

const STAGES = ['Оплачено', 'Видано', 'Повернено', 'Закрито'];
const stageOf = (r) => (r.status === 'скасовано' ? -1 : r.status === 'підтверджено' ? 0 : r.status === 'активний' ? 1 : r.status === 'спірний' ? 2 : 3);

export function RentalTimeline({ r }) {
  const s = stageOf(r);
  if (s < 0) return <p className="muted small">Бронювання скасовано, кошти повернуто.</p>;
  return (
    <ol className="timeline" aria-label="Етапи оренди">
      {STAGES.map((t, i) => <li key={t} className={i <= s ? 'timeline__on' : ''}>{t}</li>)}
    </ol>
  );
}

export default function Renter() {
  const { state, dispatch } = useStore();
  const user = state.users.find((u) => u.id === state.userId);
  const mine = state.rentals.filter((r) => r.renterId === state.userId).sort((a, b) => b.from.localeCompare(a.from));
  const [open, setOpen] = useState(mine[0]?.id);
  const [dispute, setDispute] = useState(null);
  const [review, setReview] = useState(null);
  const [lic, setLic] = useState(false);

  return (
    <CabinetTemplate
      crumbs={[['Головна', '#/'], ['Мої оренди']]}
      title="Мої оренди"
      subtitle={`${user.name} · рейтинг орендаря ★ ${user.rating}`}
      actions={(
        <div className="license">
          <p>Допуск оператора: <Badge>{user.licenseStatus}</Badge></p>
          {user.license && <p className="small muted">{user.license.number}, клас {user.license.cls}, до {human(user.license.until)}</p>}
          <button type="button" className="link" onClick={() => setLic(true)}>{user.license ? 'Оновити посвідчення' : 'Додати посвідчення'}</button>
        </div>
      )}
    >

      {mine.length === 0 && <Empty title="Оренд поки немає"><a className="btn btn--primary" href="#/">Обрати комплект у каталозі</a></Empty>}

      <div className="rentals">
        {mine.map((r) => {
          const kit = state.kits.find((k) => k.id === r.kitId);
          const isOpen = open === r.id;
          const paid = r.payments.filter((p) => p.type === 'оплата оренди').reduce((s, p) => s + p.sum, 0);
          const owed = sum(r.charges) - paid;
          return (
            <article key={r.id} className={isOpen ? 'rental rental--open' : 'rental'}>
              <button type="button" className="rental__head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : r.id)}>
                <DronePhoto small />
                <span className="rental__title"><b>{kit.name}</b><span className="muted">{human(r.from)} - {human(r.to)} · договір {r.contract}</span></span>
                <Badge>{r.status}</Badge>
              </button>
              {isOpen && (
                <div className="rental__body">
                  <RentalTimeline r={r} />
                  <div className="rental__cols">
                    <div>
                      <h3>Нарахування</h3>
                      <table className="mini"><tbody>
                        {r.charges.map((c, i) => <tr key={i}><td>{c.type}</td><td className="num">{fmt(c.sum)}</td></tr>)}
                        <tr className="mini__total"><td>Разом</td><td className="num">{fmt(sum(r.charges))}</td></tr>
                      </tbody></table>
                      {owed > 0 && <p className="warn-text">Доплата після повернення: {fmt(owed)} - буде утримано із застави.</p>}
                    </div>
                    <div>
                      <h3>Платежі</h3>
                      <table className="mini"><tbody>
                        {r.payments.map((p, i) => <tr key={i}><td>{p.type}</td><td className="num">{fmt(p.sum)}</td></tr>)}
                      </tbody></table>
                      {r.withOperator && <p className="small">Оператор: {state.users.find((u) => u.id === r.operatorId)?.name} · <Badge>{r.operatorStatus}</Badge></p>}
                    </div>
                  </div>
                  {r.acts.length > 0 && (
                    <div>
                      <h3>Акти передачі</h3>
                      {r.acts.map((a, i) => (
                        <div key={i} className="act-row">
                          <span>Акт {a.type === 'видача' ? 'видачі' : 'повернення'}, {a.at}, наліт {a.hours} год. {a.comment}</span>
                          <span className="act-row__items">{kit.items.map((it, j) => a.items[j] !== 'справна' && <Badge key={j}>{`${it.type}: ${a.items[j]}`}</Badge>)}</span>
                          {a.confirmed ? <span className="muted small">підтверджено вами</span> : <Button variant="ghost" onClick={() => dispatch({ type: 'confirmAct', id: r.id, index: i })}>Підтвердити акт</Button>}
                        </div>
                      ))}
                    </div>
                  )}
                  {r.dispute && (
                    <div className="dispute-box">
                      <p><b>Спір</b> <Badge>{r.dispute.status}</Badge></p>
                      <p>{r.dispute.text}</p>
                      {r.dispute.decision && <p><b>Рішення:</b> {r.dispute.decision}{r.dispute.compensation ? `, утримано ${fmt(r.dispute.compensation)}` : ''}</p>}
                    </div>
                  )}
                  {r.review && <p className="small">Ваш відгук: {'★'.repeat(r.review.stars)} {r.review.text}</p>}
                  <div className="actions">
                    {r.status === 'підтверджено' && r.from > TODAY && <Button variant="ghost" onClick={() => dispatch({ type: 'cancel', id: r.id })}>Скасувати бронювання</Button>}
                    {['підтверджено', 'активний'].includes(r.status) && (
                      <Button variant="ghost" onClick={() => {
                        const next = addDays(r.to, 1);
                        dispatch({ type: 'toast', text: isFree(state, r.kitId, next, next) ? `Оренду можна продовжити до ${human(next)}. Доплата - на наступному кроці.` : 'Продовжити не вийде: наступного дня комплект уже заброньовано.' });
                      }}>Продовжити на добу</Button>
                    )}
                    {r.acts.length > 0 && !r.dispute && <Button variant="ghost" onClick={() => setDispute(r)}>Відкрити спір</Button>}
                    {r.status === 'завершено' && !r.review && <Button onClick={() => setReview(r)}>Залишити відгук</Button>}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {dispute && <DisputeModal r={dispute} onClose={() => setDispute(null)} />}
      {review && <ReviewModal r={review} onClose={() => setReview(null)} />}
      {lic && <LicenseModal user={user} onClose={() => setLic(false)} />}
    </CabinetTemplate>
  );
}

function DisputeModal({ r, onClose }) {
  const { dispatch } = useStore();
  const [kind, setKind] = useState('пошкодження');
  const [text, setText] = useState('');
  const [claim, setClaim] = useState('');
  return (
    <Modal title={`Спір за договором ${r.contract}`} onClose={onClose}>
      <Field label="З чим ви не згодні">
        <select value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="пошкодження">Пошкодження в акті повернення</option>
          <option value="комплектність">Комплектність</option>
          <option value="нарахування">Нарахування або штраф</option>
          <option value="інше">Інше</option>
        </select>
      </Field>
      <Field label="Опишіть ситуацію" hint="Адміністратор порівняє акти видачі й повернення та фото.">
        <textarea rows="4" value={text} onChange={(e) => setText(e.target.value)} />
      </Field>
      <Field label="Сума, яку оскаржуєте, ₴"><input type="number" min="0" value={claim} onChange={(e) => setClaim(e.target.value)} /></Field>
      <div className="actions">
        <Button variant="ghost" onClick={onClose}>Скасувати</Button>
        <Button disabled={text.trim().length < 10} onClick={() => { dispatch({ type: 'openDispute', id: r.id, kind, text, claim: Number(claim) || 0 }); onClose(); }}>Відкрити спір</Button>
      </div>
      {text && text.trim().length < 10 && <p className="small muted">Опишіть трохи детальніше - щонайменше 10 символів.</p>}
    </Modal>
  );
}

function ReviewModal({ r, onClose }) {
  const { dispatch } = useStore();
  const [stars, setStars] = useState(5);
  const [text, setText] = useState('');
  return (
    <Modal title="Відгук про оренду" onClose={onClose}>
      <div className="star-pick" role="radiogroup" aria-label="Оцінка">
        {[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} role="radio" aria-checked={stars === n} className={n <= stars ? 'on' : ''} onClick={() => setStars(n)}>★</button>)}
      </div>
      <Field label="Коментар"><textarea rows="3" value={text} onChange={(e) => setText(e.target.value)} placeholder="Що сподобалось, що варто покращити" /></Field>
      <div className="actions"><Button onClick={() => { dispatch({ type: 'review', id: r.id, stars, text }); onClose(); }}>Надіслати відгук</Button></div>
    </Modal>
  );
}

function LicenseModal({ user, onClose }) {
  const { dispatch } = useStore();
  const [f, setF] = useState(user.license || { number: '', cls: 'A1', until: '' });
  const ok = /^UA-OP-\d{5}$/.test(f.number) && f.until > TODAY;
  return (
    <Modal title="Посвідчення оператора" onClose={onClose}>
      <Field label="Номер посвідчення" hint="Формат: UA-OP-12345"><input value={f.number} onChange={(e) => setF({ ...f, number: e.target.value.toUpperCase() })} /></Field>
      <Field label="Категорія допуску">
        <select value={f.cls} onChange={(e) => setF({ ...f, cls: e.target.value })}><option>A1</option><option>A2</option><option>A3</option></select>
      </Field>
      <Field label="Діє до"><input type="date" value={f.until} onChange={(e) => setF({ ...f, until: e.target.value })} /></Field>
      <div className="actions"><Button disabled={!ok} onClick={() => { dispatch({ type: 'license', userId: user.id, license: f, status: 'на перевірці', toastText: 'Посвідчення відправлено на перевірку' }); onClose(); }}>Відправити на перевірку</Button></div>
    </Modal>
  );
}
