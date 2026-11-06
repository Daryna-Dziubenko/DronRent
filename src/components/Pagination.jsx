import React from 'react';

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <nav className="pager" aria-label="Сторінки">
      <button type="button" className="pager__b" disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Попередня">‹</button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button type="button" key={n} className={n === page ? 'pager__b pager__b--on' : 'pager__b'} aria-current={n === page ? 'page' : undefined} onClick={() => onChange(n)}>{n}</button>
      ))}
      <button type="button" className="pager__b" disabled={page === pages} onClick={() => onChange(page + 1)} aria-label="Наступна">›</button>
    </nav>
  );
}
