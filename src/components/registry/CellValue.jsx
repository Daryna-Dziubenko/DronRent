import React from 'react';
import { useStore } from '../../store.jsx';
import { Badge } from '../ui.jsx';
import { labelOf } from '../../data/registry.js';
import { fmt, human } from '../../utils.js';

// Показує значення поля залежно від його типу - один компонент для всіх таблиць
export function displayValue(state, field, v) {
  if (v === undefined || v === null || v === '') return '';
  switch (field.type) {
    case 'money': return fmt(v);
    case 'date': return /^\d{4}-\d{2}-\d{2}$/.test(v) ? human(v) : v;
    case 'bool': return v ? 'Так' : 'Ні';
    case 'ref': return labelOf(state, field.ref, v);
    case 'multi': return v.map((x) => (field.optionLabels ? field.optionLabels[x] : x)).join(', ');
    case 'stars': return '★'.repeat(v);
    default: return String(v);
  }
}

export default function CellValue({ field, value }) {
  const { state } = useStore();
  const text = displayValue(state, field, value);
  if (text === '') return <span className="muted">-</span>;
  if (field.badge) return <Badge>{text}</Badge>;
  if (field.type === 'bool') return <span className={value ? 'yes' : 'no'}>{text}</span>;
  if (field.type === 'stars') return <span className="stars">{text}</span>;
  return text;
}
