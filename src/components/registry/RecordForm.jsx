import React, { useState } from 'react';
import { useStore } from '../../store.jsx';
import { Field, Button } from '../ui.jsx';
import { rowsOf, findRegistry, labelOf } from '../../data/registry.js';

// Перевірка запису за описом полів: обов'язковість, межі, формат, унікальність, порядок дат
export function validate(fields, data, rows, id) {
  const errs = {};
  for (const f of fields) {
    const v = data[f.key];
    const empty = v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
    if (f.required && empty) { errs[f.key] = 'Обов’язкове поле'; continue; }
    if (empty) continue;
    if (['number', 'money'].includes(f.type)) {
      if (Number.isNaN(Number(v))) errs[f.key] = 'Введіть число';
      else if (f.min != null && Number(v) < f.min) errs[f.key] = `Не менше ${f.min}`;
      else if (f.max != null && Number(v) > f.max) errs[f.key] = `Не більше ${f.max}`;
    }
    if (f.pattern && !f.pattern.test(String(v))) errs[f.key] = f.hint || 'Неправильний формат';
    if (f.unique && rows.some((r) => r.id !== id && String(r[f.key]).toLowerCase() === String(v).toLowerCase())) errs[f.key] = 'Таке значення вже є в реєстрі';
    if (f.after && data[f.after] && v < data[f.after]) errs[f.key] = 'Не раніше за початкову дату';
  }
  return errs;
}

function Input({ f, value, onChange }) {
  const { state } = useStore();
  switch (f.type) {
    case 'textarea': return <textarea rows="3" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    case 'number': case 'money': return <input type="number" step={f.step || 1} min={f.min} max={f.max} value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} />;
    case 'date': return <input type="date" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    case 'select': return <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}><option value="">Оберіть…</option>{f.options.map((o) => <option key={o}>{o}</option>)}</select>;
    case 'ref': {
      const opts = rowsOf(state, findRegistry(f.ref));
      return <select value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}><option value="">Оберіть…</option>{opts.map((o) => <option key={o.id} value={o.id}>{labelOf(state, f.ref, o.id)}</option>)}</select>;
    }
    case 'bool': return <span className="switch"><input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} /><span>{value ? 'Так' : 'Ні'}</span></span>;
    case 'multi': return (
      <span className="multi">{f.options.map((o) => {
        const on = (value || []).includes(o);
        return <button type="button" key={o} className={on ? 'chip chip--on' : 'chip'} aria-pressed={on} onClick={() => onChange(on ? value.filter((x) => x !== o) : [...(value || []), o])}>{f.optionLabels ? f.optionLabels[o] : o}</button>;
      })}</span>
    );
    default: return <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
  }
}

// Форма запису будується автоматично з опису полів реєстру
export default function RecordForm({ fields, initial, rows, onSave, onCancel }) {
  const [data, setData] = useState(initial || {});
  const [errs, setErrs] = useState({});
  const [tried, setTried] = useState(false);
  const set = (k, v) => {
    const next = { ...data, [k]: v };
    setData(next);
    if (tried) setErrs(validate(fields, next, rows, initial?.id));
  };
  const save = () => {
    setTried(true);
    const e = validate(fields, data, rows, initial?.id);
    setErrs(e);
    if (Object.keys(e).length === 0) onSave(data);
  };
  return (
    <div className="rform">
      <div className="rform__grid">
        {fields.map((f) => (
          <div key={f.key} className={['textarea', 'multi'].includes(f.type) ? 'rform__wide' : ''}>
            <Field label={`${f.label}${f.required ? ' *' : ''}`} hint={errs[f.key] ? undefined : f.hint}>
              <Input f={f} value={data[f.key]} onChange={(v) => set(f.key, v)} />
            </Field>
            {errs[f.key] && <p className="rform__err">{errs[f.key]}</p>}
          </div>
        ))}
      </div>
      {tried && Object.keys(errs).length > 0 && <p className="error small">Виправте поля, позначені червоним: {Object.keys(errs).length}.</p>}
      <div className="actions">
        <Button variant="ghost" onClick={onCancel}>Скасувати</Button>
        <Button onClick={save}>{initial?.id ? 'Зберегти зміни' : 'Додати запис'}</Button>
      </div>
    </div>
  );
}
