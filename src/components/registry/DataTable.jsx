import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../../store.jsx';
import SearchInput from '../SearchInput.jsx';
import Pagination from '../Pagination.jsx';
import { Empty } from '../ui.jsx';
import CellValue, { displayValue } from './CellValue.jsx';

const PAGE = 8;

// Універсальна таблиця: пошук, сортування, сторінки, дії над рядком, вивантаження в CSV.
// Не знає нічого про конкретну сутність - отримує опис полів і рядки ззовні.
export default function DataTable({ fields, rows, onEdit, onDelete, readOnly, exportName, flash, removing }) {
  const { state } = useStore();
  const cols = fields.filter((f) => f.table !== false);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState({ key: 'id', dir: 'desc' });
  const [page, setPage] = useState(1);

  const view = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = needle
      ? rows.filter((r) => [String(r.id), ...cols.map((f) => displayValue(state, f, r[f.key]))].join(' ').toLowerCase().includes(needle))
      : rows;
    const f = fields.find((x) => x.key === sort.key);
    const val = (r) => (f ? (['number', 'money'].includes(f.type) ? Number(r[f.key]) || 0 : displayValue(state, f, r[f.key]).toLowerCase()) : r.id);
    return [...filtered].sort((a, b) => {
      const x = val(a); const y = val(b);
      const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'uk', { numeric: true });
      return sort.dir === 'asc' ? c : -c;
    });
  }, [rows, q, sort, state, cols, fields]);

  const pages = Math.max(1, Math.ceil(view.length / PAGE));
  const cur = Math.min(page, pages);
  const slice = view.slice((cur - 1) * PAGE, cur * PAGE);
  // Після додавання чи редагування переходимо на сторінку з цим рядком, щоб його було видно
  useEffect(() => {
    if (flash == null) return;
    const i = view.findIndex((r) => r.id === flash);
    if (i >= 0) setPage(Math.floor(i / PAGE) + 1);
  }, [flash]); // eslint-disable-line react-hooks/exhaustive-deps
  const arrow = (key) => <span className={sort.key === key ? `dt__arrow dt__arrow--on dt__arrow--${sort.dir}` : 'dt__arrow'} aria-hidden="true">↑</span>;
  const toggleSort = (key) => setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));

  const exportCsv = () => {
    const head = ['ID', ...cols.map((f) => f.label)];
    const lines = view.map((r) => [r.id, ...cols.map((f) => displayValue(state, f, r[f.key]))]);
    const csv = [head, ...lines].map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `${exportName || 'реєстр'}.csv`;
    a.click();
  };

  return (
    <div className="dt">
      <div className="dt__bar">
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Пошук по всіх полях" />
        <span className="muted small">Знайдено: {view.length} з {rows.length}</span>
        <button type="button" className="btn btn--ghost btn--sm" onClick={exportCsv}>Вивантажити CSV</button>
      </div>
      {view.length === 0 ? (
        <Empty title={rows.length ? 'Нічого не знайдено' : 'Записів поки немає'}>
          <p className="muted">{rows.length ? 'Змініть запит пошуку.' : readOnly ? 'Записи з’являться автоматично під час роботи системи.' : 'Додайте перший запис кнопкою «Новий запис».'}</p>
        </Empty>
      ) : (
        <div className="table-wrap">
          <table className="table dt__table">
            <thead>
              <tr>
                <th><button type="button" className="dt__sort" onClick={() => toggleSort('id')}>ID{arrow('id')}</button></th>
                {cols.map((f) => (
                  <th key={f.key} className={['number', 'money'].includes(f.type) ? 'num' : ''} aria-sort={sort.key === f.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                    <button type="button" className="dt__sort" onClick={() => toggleSort(f.key)}>{f.label}{arrow(f.key)}</button>
                  </th>
                ))}
                {!readOnly && <th className="dt__act">Дії</th>}
              </tr>
            </thead>
            <tbody key={`${sort.key}-${sort.dir}-${cur}`} className="dt__body">
              {slice.map((r) => (
                <tr key={r.id} className={r.id === removing ? 'dt-row--out' : r.id === flash ? 'dt-row--flash' : undefined}>
                  <td className="muted">{r.id}</td>
                  {cols.map((f) => <td key={f.key} className={['number', 'money'].includes(f.type) ? 'num' : ''}><CellValue field={f} value={r[f.key]} /></td>)}
                  {!readOnly && (
                    <td className="dt__act">
                      <button type="button" className="dt__icon" onClick={() => onEdit(r)} aria-label={`Редагувати запис ${r.id}`} title="Редагувати">✎</button>
                      <button type="button" className="dt__icon dt__icon--bad" onClick={() => onDelete(r)} aria-label={`Видалити запис ${r.id}`} title="Видалити">✕</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="dt__foot">
        <span className="muted small">{readOnly ? 'Реєстр формується автоматично, лише перегляд' : 'Клацніть заголовок стовпця, щоб відсортувати'}</span>
        <Pagination page={cur} pages={pages} onChange={setPage} />
      </div>
    </div>
  );
}
