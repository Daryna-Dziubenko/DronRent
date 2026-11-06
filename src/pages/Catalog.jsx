import React, { useMemo, useState } from 'react';
import { useStore } from '../store.jsx';
import { DroneArt, DronePhoto, Stars, Empty } from '../components/ui.jsx';
import { fmt, isFree, TODAY, addDays, calcPrice } from '../utils.js';

const CLASSES = ['C0', 'C1', 'C2', 'C3'];

export default function Catalog() {
  const { state } = useStore();
  const [q, setQ] = useState('');
  const [from, setFrom] = useState(addDays(TODAY, 7));
  const [to, setTo] = useState(addDays(TODAY, 9));
  const [cls, setCls] = useState([]);
  const [point, setPoint] = useState('');
  const [maxPrice, setMaxPrice] = useState(3000);
  const [operator, setOperator] = useState(false);
  const [noLicense, setNoLicense] = useState(false);
  const [onlyFree, setOnlyFree] = useState(true);
  const [sort, setSort] = useState('rating');

  const list = useMemo(() => {
    const res = state.kits
      .filter((k) => k.status === 'опубліковано')
      .map((k) => {
        const p = state.platforms.find((x) => x.id === k.platformId);
        const t = state.tariffs.find((x) => x.id === k.tariffId);
        const free = from && to && from <= to ? isFree(state, k.id, from, to) : true;
        const price = from && to && from <= to ? calcPrice(state, k, from, to).total : null;
        return { k, p, t, free, price };
      })
      .filter(({ k, p, t, free }) =>
        (!q || (k.name + k.purpose).toLowerCase().includes(q.toLowerCase())) &&
        (cls.length === 0 || cls.includes(p.cls)) &&
        (!point || k.pointId === Number(point)) &&
        t.day <= maxPrice &&
        (!operator || k.withOperator) &&
        (!noLicense || !k.needsLicense) &&
        (!onlyFree || free));
    return res.sort((a, b) => (sort === 'price' ? a.t.day - b.t.day : b.k.rating - a.k.rating));
  }, [state, q, from, to, cls, point, maxPrice, operator, noLicense, onlyFree, sort]);

  const toggle = (c) => setCls(cls.includes(c) ? cls.filter((x) => x !== c) : [...cls, c]);
  const toResults = () => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
  const reset = () => { setQ(''); setCls([]); setPoint(''); setMaxPrice(3000); setOperator(false); setNoLicense(false); };

  return (
    <div className="catalog">
      <section className="hero">
        <div className="hero__text">
          <span className="hero__eyebrow"><i aria-hidden="true" />Оренда дронів від власників</span>
          <h1>Дрон на кілька днів - без купівлі</h1>
          <p className="hero__sub">Орендуйте готовий комплект з акумуляторами й кейсом у власників техніки. Немає допуску - візьміть разом з оператором.</p>
          <div className="hero__cta">
            <button type="button" className="swipe" onClick={toResults}>
              <span className="swipe__knob" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <span className="swipe__arrows" aria-hidden="true">›››</span>
              Обрати дрон
            </button>
            {state.role === 'guest' && <span className="hero__login">Вже маєте акаунт? <a href="#/login">Увійти</a></span>}
          </div>
        </div>
        <div className="hero__art"><DroneArt /></div>
        <div className="search">
          <label className="search__field search__field--wide">
            <span>Що шукаєте</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Наприклад, тепловізор або FPV" />
          </label>
          <label className="search__field">
            <span>Отримати</span>
            <input type="date" value={from} min={TODAY} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="search__field">
            <span>Повернути</span>
            <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
          </label>
          <button type="button" className="search__go" aria-label="До результатів" onClick={toResults}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2.2" fill="none" /><path d="M16 16l4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
          </button>
        </div>
        {from > to && <p className="error">Дата повернення раніша за дату отримання.</p>}
      </section>

      <div className="catalog__body">
        <aside className="filters" aria-label="Фільтри">
          <div className="filters__group">
            <p className="filters__title">Клас апарата</p>
            <div className="chips">
              {CLASSES.map((c) => <button type="button" key={c} className={cls.includes(c) ? 'chip chip--on' : 'chip'} aria-pressed={cls.includes(c)} onClick={() => toggle(c)}>{c}</button>)}
            </div>
            <p className="filters__note">C0 - до 250 г, допуск не потрібен</p>
          </div>
          <div className="filters__group">
            <label className="filters__title" htmlFor="pt">Пункт видачі</label>
            <select id="pt" value={point} onChange={(e) => setPoint(e.target.value)}>
              <option value="">Будь-який</option>
              {state.points.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="filters__group">
            <label className="filters__title" htmlFor="pr">Ціна за добу до {fmt(maxPrice)}</label>
            <input id="pr" type="range" min="400" max="3000" step="100" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} />
          </div>
          <div className="filters__group">
            <label className="check"><input type="checkbox" checked={operator} onChange={(e) => setOperator(e.target.checked)} /> Можна з оператором</label>
            <label className="check"><input type="checkbox" checked={noLicense} onChange={(e) => setNoLicense(e.target.checked)} /> Без допуску</label>
            <label className="check"><input type="checkbox" checked={onlyFree} onChange={(e) => setOnlyFree(e.target.checked)} /> Тільки вільні на ці дати</label>
          </div>
          <button type="button" className="link" onClick={reset}>Скинути фільтри</button>
        </aside>

        <section className="results" id="results">
          <div className="results__bar">
            <p><b>{list.length}</b> {list.length === 1 ? 'комплект' : 'комплектів'} {onlyFree ? 'вільні на обрані дати' : 'у каталозі'}</p>
            <label className="sort">Сортувати
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="rating">за рейтингом</option>
                <option value="price">спочатку дешевші</option>
              </select>
            </label>
          </div>
          {list.length === 0 && (
            <Empty title="Нічого не знайшлося">
              <p>Спробуйте інші дати або приберіть частину фільтрів.</p>
              <button type="button" className="btn btn--ghost" onClick={reset}>Скинути фільтри</button>
            </Empty>
          )}
          <div className="grid">
            {list.map(({ k, p, t, free, price }) => {
              const pt = state.points.find((x) => x.id === k.pointId);
              return (
                <a key={k.id} href={`#/kit/${k.id}?from=${from}&to=${to}`} className="card">
                  <div className="card__media">
                    <span className="tag">{p.cls}</span>
                    <DronePhoto />
                  </div>
                  <div className="card__body">
                    <div className="card__top">
                      <h3 className="card__title">{k.name}</h3>
                      <Stars value={k.rating} />
                    </div>
                    <p className="card__purpose">{k.purpose}</p>
                    <ul className="packing">
                      {k.items.slice(0, 4).map((i) => <li key={i.name}>{i.qty > 1 ? `${i.qty} × ` : ''}{i.type}</li>)}
                      {k.items.length > 4 && <li>ще {k.items.length - 4}</li>}
                    </ul>
                    <div className="card__meta">
                      <span>{pt.name.replace('Пункт ', '')}</span>
                      {k.withOperator && <span className="tag tag--soft">з оператором</span>}
                      {!k.needsLicense && <span className="tag tag--soft">без допуску</span>}
                    </div>
                    <div className="card__price">
                      <span><b>{fmt(t.day)}</b> / доба</span>
                      {price != null && free && <span className="muted">разом {fmt(price)}</span>}
                      {!free && <span className="busy">зайнятий на ці дати</span>}
                    </div>
                    <div className="card__go">
                      <span className="card__more">Детальніше <span aria-hidden="true">↗</span></span>
                      <span className="card__arrow" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
