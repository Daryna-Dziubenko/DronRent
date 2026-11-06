import React from 'react';

// Заголовок сторінки: надпис, підзаголовок і кнопки дій праворуч
export default function PageHeader({ eyebrow, title, subtitle, actions, icon }) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <p className="page-head__eyebrow">{eyebrow}</p>}
        <h1>{icon && <span className="page-head__icon" aria-hidden="true">{icon}</span>}{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {actions && <div className="page-head__actions">{actions}</div>}
    </div>
  );
}
