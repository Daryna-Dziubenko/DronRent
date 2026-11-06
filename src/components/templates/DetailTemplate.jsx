import React from 'react';
import PageTemplate from './PageTemplate.jsx';

// Шаблон детальної сторінки (успадковує PageTemplate): шлях і посилання назад до списку, без заголовка-шапки,
// бо назву об'єкта сторінка показує у власному блоці
export default function DetailTemplate({ className = '', children, ...page }) {
  return <PageTemplate className={`detail-tpl ${className}`} {...page}>{children}</PageTemplate>;
}
