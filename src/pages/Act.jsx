import React, { useState } from 'react';
import { useStore } from '../store.jsx';
import { Badge, Button, DronePhoto } from '../components/ui.jsx';
import { fmt, human, TODAY, daysBetween } from '../utils.js';
import FormTemplate from '../components/templates/FormTemplate.jsx';

const STATES = ['справна', 'зношена', 'пошкоджена', 'відсутня'];

export default function Act({ id, kind }) {
  const { state, dispatch } = useStore();
  const r = state.rentals.find((x) => x.id === id);
  const kit = r && state.kits.find((k) => k.id === r.kitId);
  const issue = r?.acts.find((a) => a.type === 'видача');
  const isReturn = kind === 'return';
  const [rows, setRows] = useState(() => kit ? kit.items.map(() => ({ state: 'справна', checked: false, photo: false })) : []);
  const [hours, setHours] = useState(issue ? issue.hours : state.platforms.find((p) => p.id === kit?.platformId)?.hours ?? 0);
  const [comment, setComment] = useState('');
  if (!r) return <p>Оренду не знайдено. <a href="#/desk">Назад</a></p>;

  const t = state.tariffs.find((x) => x.id === kit.tariffId);
  const renter = state.users.find((u) => u.id === r.renterId);
  const allChecked = rows.every((x) => x.checked);
  const needPhoto = rows.some((x) => x.state !== 'справна' && !x.photo);
  const hoursBad = isReturn && issue && hours < issue.hours;
  const lateDays = isReturn && r.to < TODAY ? daysBetween(r.to, TODAY) - 1 : 0;
  const damage = isReturn ? rows.reduce((s, x, i) => s + (x.state === 'пошкоджена' || x.state === 'відсутня' ? kit.items[i].value : 0), 0) : 0;
  const extra = [];
  if (lateDays > 0) extra.push({ type: 'штраф за прострочення', sum: lateDays * t.lateFeeDay });
  if (damage > 0) extra.push({ type: 'компенсація пошкоджень', sum: damage });
  const done = rows.filter((x) => x.checked).length;

  const save = () => {
    dispatch({ type: 'act', id: r.id, actType: isReturn ? 'повернення' : 'видача', at: `${TODAY} ${new Date().toTimeString().slice(0, 5)}`, hours: Number(hours), items: rows.map((x) => x.state), comment, extraCharges: extra });
    location.hash = '#/desk';
  };

  return (
    <FormTemplate className="act" crumbs={[['Головна', '#/'], ['Видача і повернення', '#/desk'], [`Акт ${isReturn ? 'повернення' : 'видачі'}`]]} back={['Видача і повернення', '#/desk']}>
      <div className="act__head">
        <DronePhoto small />
        <div>
          <h1>Акт {isReturn ? 'повернення' : 'видачі'}</h1>
          <p className="muted">{kit.name} · договір {r.contract} · {renter.name} · {human(r.from)} - {human(r.to)}</p>
        </div>
      </div>
      <div className="progress" aria-label={`Перевірено ${done} з ${rows.length}`}><span style={{ width: `${(done / rows.length) * 100}%` }} /></div>
      <p className="small muted">Перевірено {done} з {rows.length} позицій. Позицію з пошкодженням обов’язково сфотографуйте.</p>

      <table className="checklist">
        <thead><tr><th>Перевірено</th><th>Позиція</th>{isReturn && <th>При видачі</th>}<th>Стан зараз</th><th>Фото</th></tr></thead>
        <tbody>
          {kit.items.map((it, i) => {
            const x = rows[i];
            const was = issue?.items[i];
            const changed = isReturn && was && was !== x.state;
            return (
              <tr key={it.name} className={changed ? 'checklist__changed' : ''}>
                <td><input type="checkbox" aria-label={`Перевірено: ${it.name}`} checked={x.checked} onChange={(e) => setRows(rows.map((y, j) => (j === i ? { ...y, checked: e.target.checked } : y)))} /></td>
                <td><b>{it.name}</b><span className="muted small"> · {it.qty} шт · {fmt(it.value)}{it.serial ? ` · с/н ${it.serial}` : ''}</span></td>
                {isReturn && <td>{was ? <Badge>{was}</Badge> : '-'}</td>}
                <td>
                  <div className="seg" role="radiogroup" aria-label={`Стан: ${it.name}`}>
                    {STATES.map((s) => <button type="button" key={s} role="radio" aria-checked={x.state === s} className={x.state === s ? `seg__b seg__b--on seg__b--${STATES.indexOf(s)}` : 'seg__b'} onClick={() => setRows(rows.map((y, j) => (j === i ? { ...y, state: s, checked: true } : y)))}>{s}</button>)}
                  </div>
                </td>
                <td><button type="button" className={x.photo ? 'photo photo--on' : 'photo'} onClick={() => setRows(rows.map((y, j) => (j === i ? { ...y, photo: !y.photo } : y)))}>{x.photo ? 'Фото додано' : 'Додати фото'}</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="two-col">
        <section className="panel">
          <label className="field"><span className="field__label">Наліт апарата за лічильником, год</span>
            <input type="number" min="0" value={hours} onChange={(e) => setHours(e.target.value)} /></label>
          {issue && <p className="small muted">При видачі: {issue.hours} год. За оренду: {Math.max(0, hours - issue.hours)} год.</p>}
          {hoursBad && <p className="error">Наліт не може бути меншим, ніж при видачі ({issue.hours} год).</p>}
          <label className="field"><span className="field__label">Коментар</span><textarea rows="3" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Загальний стан, зауваження орендаря" /></label>
        </section>
        <section className="panel">
          <h2>Підсумок</h2>
          {!isReturn && <p>Після збереження оренда стане активною, а орендар отримає акт на підтвердження.</p>}
          {isReturn && (
            <>
              <div className="calc">
                <div className="calc__row"><span>Прострочення</span><span>{lateDays > 0 ? `${lateDays} дн × ${fmt(t.lateFeeDay)}` : 'немає'}</span></div>
                <div className="calc__row"><span>Пошкоджено або відсутнє</span><span>{fmt(damage)}</span></div>
                <div className="calc__row calc__total"><span>Утримати із застави</span><span>{fmt(Math.min(kit.deposit, damage + lateDays * t.lateFeeDay))}</span></div>
                <div className="calc__row calc__dep"><span>Повернути орендарю</span><span>{fmt(Math.max(0, kit.deposit - damage - lateDays * t.lateFeeDay))}</span></div>
              </div>
              <p className="small muted">Якщо орендар не згоден, він може відкрити спір - його розгляне адміністратор.</p>
            </>
          )}
          {needPhoto && <p className="warn-text">Додайте фото до позицій з пошкодженням або відсутніх.</p>}
          <Button className="btn--block" disabled={!allChecked || needPhoto || hoursBad} onClick={save}>{isReturn ? 'Зберегти акт повернення' : 'Зберегти акт видачі'}</Button>
          {!allChecked && <p className="small muted">Кнопка стане активною, коли перевірите всі позиції.</p>}
        </section>
      </div>
    </FormTemplate>
  );
}
