import React, { useState } from 'react';
import { useStore } from '../store.jsx';
import { Button, Field } from '../components/ui.jsx';
import { fmt } from '../utils.js';
import FormTemplate from '../components/templates/FormTemplate.jsx';

const TYPES = ['акумулятор', 'пульт', 'зарядний пристрій', 'пропелери', 'камера', 'фільтри', 'кейс', 'інше'];
const COLORS = ['#3F6E8C', '#5A6B4E', '#7A4A3A', '#B5651D', '#4A4E69', '#2F5D50'];

export default function KitEditor() {
  const { state, dispatch } = useStore();
  const myPlatforms = state.platforms.filter((p) => p.ownerId === state.userId);
  const [f, setF] = useState({ name: '', purpose: '', description: '', platformId: myPlatforms[0]?.id, tariffId: 1, pointId: 1, deposit: 10000, withOperator: true, needsLicense: true, limits: '' });
  const [items, setItems] = useState([{ type: 'акумулятор', name: '', qty: 1, value: 0 }]);
  const [tried, setTried] = useState(false);
  const set = (k, v) => setF({ ...f, [k]: v });
  const pl = myPlatforms.find((p) => p.id === Number(f.platformId));
  const errors = [];
  if (f.name.trim().length < 5) errors.push('Назва - щонайменше 5 символів.');
  if (!f.purpose.trim()) errors.push('Вкажіть, для яких робіт підходить комплект.');
  if (items.some((i) => !i.name.trim() || i.value <= 0)) errors.push('У кожної позиції має бути назва й оціночна вартість.');
  if (f.deposit < 1000) errors.push('Застава - не менше 1 000 ₴.');
  const total = items.reduce((s, i) => s + i.value * i.qty, 0) + (pl ? 0 : 0);

  const save = () => {
    setTried(true);
    if (errors.length) return;
    dispatch({
      type: 'saveKit',
      kit: { ...f, platformId: Number(f.platformId), tariffId: Number(f.tariffId), pointId: Number(f.pointId), deposit: Number(f.deposit), color: COLORS[state.kits.length % COLORS.length],
        items: [{ type: 'дрон', name: `${pl.maker} ${pl.model}`, qty: 1, value: Number(f.droneValue) || 30000, serial: pl.serial, state: 'справна' }, ...items.map((i) => ({ ...i, qty: Number(i.qty), value: Number(i.value), state: 'справна' }))] },
    });
    dispatch({ type: 'feedback', title: 'Комплект відправлено на модерацію', text: `«${f.name}» з’явиться в каталозі після перевірки адміністратором. Статус видно у вкладці «Комплекти».`, actions: [{ label: 'Додати ще один', href: '#/owner/new' }, { label: 'До моєї техніки', href: '#/owner' }] });
    location.hash = '#/owner';
  };

  return (
    <FormTemplate
      className="editor"
      crumbs={[['Головна', '#/'], ['Моя техніка', '#/owner'], ['Новий комплект']]}
      back={['Моя техніка', '#/owner']}
      title="Новий комплект"
      subtitle="Після збереження комплект потрапить на модерацію. Зазвичай перевірка триває до доби."
    >
      <div className="two-col two-col--wide">
        <section className="panel">
          <h2>Опис</h2>
          <Field label="Назва комплекту"><input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Наприклад, DJI Mini 4 Pro - комплект для зйомки" /></Field>
          <Field label="Для яких робіт"><input value={f.purpose} onChange={(e) => set('purpose', e.target.value)} placeholder="Зйомка заходів, огляд дахів" /></Field>
          <Field label="Опис"><textarea rows="3" value={f.description} onChange={(e) => set('description', e.target.value)} /></Field>
          <div className="form-grid">
            <Field label="Апарат"><select value={f.platformId} onChange={(e) => set('platformId', e.target.value)}>{myPlatforms.map((p) => <option key={p.id} value={p.id}>{p.maker} {p.model} ({p.cls})</option>)}</select></Field>
            <Field label="Оціночна вартість апарата, ₴"><input type="number" min="0" value={f.droneValue || ''} onChange={(e) => set('droneValue', e.target.value)} placeholder="30000" /></Field>
            <Field label="Тариф"><select value={f.tariffId} onChange={(e) => set('tariffId', e.target.value)}>{state.tariffs.filter((t) => t.active).map((t) => <option key={t.id} value={t.id}>{t.name} - {fmt(t.day)}/доба</option>)}</select></Field>
            <Field label="Пункт видачі"><select value={f.pointId} onChange={(e) => set('pointId', e.target.value)}>{state.points.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
            <Field label="Застава, ₴"><input type="number" min="1000" step="500" value={f.deposit} onChange={(e) => set('deposit', e.target.value)} /></Field>
          </div>
          <label className="check"><input type="checkbox" checked={f.withOperator} onChange={(e) => set('withOperator', e.target.checked)} /> Можна орендувати з оператором</label>
          <label className="check"><input type="checkbox" checked={f.needsLicense} onChange={(e) => set('needsLicense', e.target.checked)} /> Без оператора - тільки з допуском</label>
          <Field label="Обмеження використання"><input value={f.limits} onChange={(e) => set('limits', e.target.value)} placeholder="Тільки денні польоти" /></Field>
        </section>
        <section className="panel">
          <h2>Склад кейсу</h2>
          <p className="muted small">Апарат додається автоматично. Перелічіть усе інше, що отримає орендар, - за цим списком складатимуться акти.</p>
          {items.map((i, n) => (
            <div key={n} className="item-row">
              <select aria-label="Тип позиції" value={i.type} onChange={(e) => setItems(items.map((x, j) => (j === n ? { ...x, type: e.target.value } : x)))}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
              <input aria-label="Назва позиції" placeholder="Назва" value={i.name} onChange={(e) => setItems(items.map((x, j) => (j === n ? { ...x, name: e.target.value } : x)))} />
              <input aria-label="Кількість" type="number" min="1" value={i.qty} onChange={(e) => setItems(items.map((x, j) => (j === n ? { ...x, qty: e.target.value } : x)))} />
              <input aria-label="Оціночна вартість" type="number" min="0" placeholder="₴" value={i.value || ''} onChange={(e) => setItems(items.map((x, j) => (j === n ? { ...x, value: Number(e.target.value) } : x)))} />
              <button type="button" className="icon-btn" aria-label="Прибрати позицію" onClick={() => setItems(items.filter((_, j) => j !== n))} disabled={items.length === 1}>✕</button>
            </div>
          ))}
          <button type="button" className="link" onClick={() => setItems([...items, { type: 'кейс', name: '', qty: 1, value: 0 }])}>+ Додати позицію</button>
          <p className="small">Разом аксесуарів на {fmt(total)}.</p>
          {tried && errors.length > 0 && <ul className="errors">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
          <div className="actions"><Button variant="ghost" onClick={() => { location.hash = '#/owner'; }}>Скасувати</Button><Button onClick={save}>Відправити на модерацію</Button></div>
        </section>
      </div>
    </FormTemplate>
  );
}
