import React from 'react';

// «Хлібні крихти»: шлях від головної до поточної сторінки, кожен рівень - посилання назад
export default function Breadcrumbs({ items }) {
  return (
    <nav className="crumbs" aria-label="Шлях до сторінки">
      <ol>
        {items.map(([label, href], i) => (
          <li key={label}>
            {href && i < items.length - 1 ? <a href={href}>{label}</a> : <span aria-current="page">{label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
