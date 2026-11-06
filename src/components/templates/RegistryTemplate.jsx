import React from 'react';
import PageTemplate from './PageTemplate.jsx';

// Шаблон реєстру (успадковує PageTemplate): додає бічне меню ліворуч
export default function RegistryTemplate({ sidebar, children, ...page }) {
  return (
    <div className="reg">
      {sidebar}
      <section className="reg-main">
        <PageTemplate {...page}>{children}</PageTemplate>
      </section>
    </div>
  );
}
