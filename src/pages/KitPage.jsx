import React, { useState } from 'react';
import { useStore } from '../store.jsx';
import { DronePhoto, Stars, Button, Badge } from '../components/ui.jsx';
import { fmt, calcPrice, isFree, busyRanges, TODAY, addDays, parse, iso, hasLicense, human } from '../utils.js';
import DetailTemplate from '../components/templates/DetailTemplate.jsx';

function Calendar({ ranges, from, to }) {
  const start = parse(TODAY); start.setDate(1);
  const months = [0, 1].map((m) => new Date(start.getFullYear(), start.getMonth() + m, 1));
  return (
    <div className="cal">
      {months.map((m) => {
        const first = (m.getDay() + 6) % 7;
        const n = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
        const cells = [...Array(first).fill(null), ...Array.from({ length: n }, (_, i) => iso(new Date(m.getFullYear(), m.getMonth(), i + 1)))];
        return (
          <div key={m.getMonth()} className="cal__m">
            <p className="cal__title">{m.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })}</p>
            <div className="cal__grid">
              {['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'нд'].map((d) => <span key={d} className="cal__dow">{d}</span>)}
              {cells.map((d, i) => {
                if (!d) return <span key={`e${i}`} />;
                const busy = ranges.find((r) => d >= r.from && d <= r.to);
                const sel = from && to && d >= from && d <= to;
                const past = d < TODAY;
                const cls = ['cal__d', past && 'cal__d--past', busy && (busy.reason === 'ТО' ? 'cal__d--service' : 'cal__d--busy'), sel && 'cal__d--sel'].filter(Boolean).join(' ');
                return <span key={d} className={cls} title={busy ? busy.reason : ''}>{Number(d.slice(8))}</span>;
              })}
            </div>
          </div>
        );
      })}
      <div className="cal__legend">
        <span><i className="lg lg--sel" />обрані дати</span>
        <span><i className="lg lg--busy" />зайнято</span>
        <span><i className="lg lg--service" />технічне обслуговування</span>
      </div>
    </div>
  );
}

export default function KitPage({ id }) {
  const { state } = useStore();
  const kit = state.kits.find((k) => k.id === id);
  const q = Object.fromEntries(new URLSearchParams(location.hash.split('?')[1] || ''));
  const [from, setFrom] = useState(q.from || addDays(TODAY, 7));
  const [to, setTo] = useState(q.to || addDays(TODAY, 9));
  const [withOperator, setOp] = useState(false);
  const [insurance, setIns] = useState(true);
  const [hours, setHours] = useState(2);
  if (!kit) return <p>Комплект не знайдено. <a href="#/">До каталогу</a></p>;

  const p = state.platforms.find((x) => x.id === kit.platformId);
  const pt = state.points.find((x) => x.id === kit.pointId);
  const owner = state.users.find((u) => u.id === kit.ownerId);
  const user = state.users.find((u) => u.id === state.userId);
  const valid = from && to && from <= to && from >= TODAY;
  const free = valid && isFree(state, kit.id, from, to);
  const price = valid ? calcPrice(state, kit, from, to, { withOperator, insurance, hours }) : null;
  const licenseOk = !kit.needsLicense || withOperator || hasLicense(user, to);
  const ranges = busyRanges(state, kit.id);

  let block = null;
  if (!valid) block = 'Оберіть коректні дати: повернення не раніше отримання.';
  else if (!free) block = 'На ці дати комплект зайнятий. Подивіться календар і оберіть вільні дні.';
  else if (state.role === 'guest') block = null;
  else if (!licenseOk) block = 'Для цього класу потрібен підтверджений допуск. Додайте посвідчення в кабінеті або оберіть оренду з оператором.';

  const go = () => {
    if (state.role === 'guest') { location.hash = '#/login?next=kit'; return; }
    location.hash = `#/checkout?kit=${kit.id}&from=${from}&to=${to}&op=${withOperator ? 1 : 0}&ins=${insurance ? 1 : 0}&h=${hours}`;
  };

  return (
    <DetailTemplate className="kit" crumbs={[['Каталог', `#/?from=${from}&to=${to}`], [kit.name]]} back={['До каталогу', '#/']}>
      <div className="kit__layout">
        <div className="kit__main">
          <DronePhoto />
          <div className="kit__head">
            <h1>{kit.name}</h1>
            <p className="kit__purpose">{kit.purpose}</p>
            <p className="kit__meta"><Stars value={kit.rating} /> <span className="muted">{kit.reviews} відгуків</span> <span className="tag">{p.cls}</span> <span>Власник: {owner.name}</span></p>
            <p>{kit.description}</p>
          </div>

          <section className="block">
            <h2>Що в кейсі</h2>
            <p className="muted">Кожну позицію перевіряють при видачі й поверненні. Оціночна вартість - сума компенсації, якщо позицію пошкоджено або втрачено.</p>
            <table className="packlist">
              <thead><tr><th>Позиція</th><th>К-сть</th><th className="num">Оціночна вартість</th></tr></thead>
              <tbody>
                {kit.items.map((i) => (
                  <tr key={i.name}><td><span className="packlist__box" aria-hidden="true" />{i.name}<span className="muted"> · {i.type}</span></td><td>{i.qty}</td><td className="num">{fmt(i.value)}</td></tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="block">
            <h2>Характеристики апарата</h2>
            <dl className="specs">
              <div><dt>Модель</dt><dd>{p.maker} {p.model}</dd></div>
              <div><dt>Клас</dt><dd>{p.cls}</dd></div>
              <div><dt>Злітна маса</dt><dd>{p.mass} кг</dd></div>
              <div><dt>Час польоту</dt><dd>до {p.flightMin} хв</dd></div>
              <div><dt>Загальний наліт</dt><dd>{p.hours} год</dd></div>
              <div><dt>До наступного ТО</dt><dd>{Math.max(0, p.serviceInterval - p.hoursSinceService)} год</dd></div>
            </dl>
            <p className="note">Обмеження: {kit.limits}</p>
          </section>

          <section className="block">
            <h2>Календар доступності</h2>
            <Calendar ranges={ranges} from={valid ? from : null} to={valid ? to : null} />
          </section>

          <section className="block">
            <h2>Де забрати</h2>
            <p><b>{pt.name}</b>, {pt.address}. {pt.hours}, {pt.phone}.</p>
          </section>
        </div>

        <aside className="book" aria-label="Бронювання">
          <p className="book__price"><b>{fmt(price ? price.tariff.day : state.tariffs.find((t) => t.id === kit.tariffId).day)}</b> / доба <span className="muted">· тариф «{state.tariffs.find((t) => t.id === kit.tariffId).name}»</span></p>
          <div className="book__dates">
            <label><span>Отримати</span><input type="date" value={from} min={TODAY} onChange={(e) => setFrom(e.target.value)} /></label>
            <label><span>Повернути</span><input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} /></label>
          </div>
          {price?.tariff.type === 'за нальотом' && (
            <label className="book__hours">Орієнтовний наліт на добу, год
              <input type="number" min="1" max="8" value={hours} onChange={(e) => setHours(Number(e.target.value) || 1)} />
            </label>
          )}
          {kit.withOperator && <label className="check"><input type="checkbox" checked={withOperator} onChange={(e) => setOp(e.target.checked)} /><span>З оператором<span className="muted small check__hint">керує оператор, допуск не потрібен</span></span></label>}
          <label className="check"><input type="checkbox" checked={insurance} onChange={(e) => setIns(e.target.checked)} /> Страхування на час оренди</label>

          {price && free && (
            <div className="calc">
              {price.lines.map((l) => (
                <div key={l.label} className="calc__row"><span>{l.label}</span><span>{l.sum == null ? '' : (l.sum < 0 ? '−' : '') + fmt(Math.abs(l.sum))}</span></div>
              ))}
              <div className="calc__row calc__total"><span>До сплати</span><span>{fmt(price.total)}</span></div>
              <div className="calc__row calc__dep"><span>Застава (повертається)</span><span>{fmt(kit.deposit)}</span></div>
            </div>
          )}
          {block && <p className="book__warn">{block}</p>}
          <Button onClick={go} disabled={!!block} className="btn--block">
            {state.role === 'guest' ? 'Увійти, щоб забронювати' : 'Забронювати'}
          </Button>
          {valid && free && <p className="muted small">{human(from)} - {human(to)}. Скасування без втрат до доби до видачі.</p>}
          {user && kit.needsLicense && !withOperator && (
            <p className="small">Ваш допуск: <Badge>{user.licenseStatus === 'підтверджено' ? 'прийнято' : user.licenseStatus}</Badge></p>
          )}
        </aside>
      </div>
    </DetailTemplate>
  );
}
