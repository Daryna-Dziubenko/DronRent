import React from 'react';
import { useStore } from '../../store.jsx';
import { GROUPS, REGISTRIES, rowsOf } from '../../data/registry.js';

// Бічне меню реєстрів, згрупованих за розділами ER-моделі
export default function RegistrySidebar({ current }) {
  const { state } = useStore();
  return (
    <aside className="reg-side" aria-label="Реєстри даних">
      {GROUPS.map((g) => (
        <div key={g} className="reg-side__group">
          <p className="reg-side__title">{g}</p>
          {REGISTRIES.filter((r) => r.group === g).map((r) => (
            <a key={r.key} href={`#/registry/${r.key}`} className={r.key === current ? 'reg-side__a reg-side__a--on' : 'reg-side__a'} aria-current={r.key === current ? 'page' : undefined}>
              <span className="reg-side__name">{r.title}</span>
              <span className="reg-side__n">{rowsOf(state, r).length}</span>
            </a>
          ))}
        </div>
      ))}
    </aside>
  );
}
