import React from 'react';
import Breadcrumbs from '../Breadcrumbs.jsx';
import PageHeader from '../PageHeader.jsx';

// Шаблон сторінки (успадковує каркас BaseTemplate).
// Додає блоки, однакові для внутрішніх сторінок: «хлібні крихти», посилання назад і заголовок з діями.
// Кожен блок можна перевизначити або не використовувати - як блоки в шаблонізаторах.
export default function PageTemplate({ className = '', crumbs, back, eyebrow, title, subtitle, actions, children }) {
  return (
    <div className={`tpl ${className}`}>
      {crumbs && <Breadcrumbs items={crumbs} />}
      {back && <a href={back[1]} className="back">‹ {back[0]}</a>}
      {title && <PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} actions={actions} />}
      {children}
    </div>
  );
}
