import React, { useState } from 'react';
import { useStore } from '../store.jsx';
import { ROLES } from '../data/mock.js';

const NAV = {
  guest: [['#/', 'Каталог'], ['#/points', 'Пункти видачі']],
  renter: [['#/', 'Каталог'], ['#/renter', 'Мої оренди'], ['#/points', 'Пункти видачі']],
  owner: [['#/', 'Каталог'], ['#/owner', 'Моя техніка'], ['#/owner/new', 'Новий комплект']],
  operator: [['#/operator', 'Мої замовлення'], ['#/', 'Каталог']],
  employee: [['#/desk', 'Видача і повернення'], ['#/', 'Каталог']],
  admin: [['#/admin', 'Керування'], ['#/registry/kits', 'Реєстри'], ['#/ui-kit', 'UI Kit'], ['#/', 'Каталог']],
};

export default function Header({ route }) {
  const { state, dispatch } = useStore();
  const [bell, setBell] = useState(false);
  const user = state.users.find((u) => u.id === state.userId);
  const mine = state.notifications.filter((n) => n.userId === state.userId).reverse();
  const unread = mine.filter((n) => !n.read).length;

  return (
    <header className="header">
      <a href="#/" className="logo" aria-label="ДронПрокат, на головну">
        <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="#A3B35F" /><path d="M9 11l7 5 7-5M9 21l7-5 7 5" stroke="#1D1D1F" strokeWidth="2.6" fill="none" strokeLinecap="round" /></svg>
        <span>ДронПрокат</span>
      </a>
      <nav className="nav" aria-label="Основна навігація">
        {NAV[state.role].map(([href, label]) => (
          <a key={href} href={href} className={route === href || (href.startsWith('#/registry') && route.startsWith('#/registry')) ? 'nav__a nav__a--on' : 'nav__a'}>{label}</a>
        ))}
      </nav>
      <div className="header__right">
        {user && (
          <div className="bell-wrap">
            <button type="button" className="icon-btn bell" aria-label={`Сповіщення, непрочитаних: ${unread}`} onClick={() => { setBell(!bell); if (!bell) dispatch({ type: 'readAll' }); }}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 17V11a6 6 0 1112 0v6l2 2H4l2-2zM10 21h4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinejoin="round" /></svg>
              {unread > 0 && <span className="bell__dot">{unread}</span>}
            </button>
            {bell && (
              <div className="bell__panel">
                <p className="bell__title">Сповіщення</p>
                {mine.length === 0 && <p className="muted">Поки що нічого нового.</p>}
                {mine.map((n) => <p key={n.id} className={n.read ? 'bell__item' : 'bell__item bell__item--new'}>{n.text}</p>)}
              </div>
            )}
          </div>
        )}
        <label className="role-switch">
          <span className="sr-only">Увійти як</span>
          <select value={state.role} onChange={(e) => { dispatch({ type: 'login', role: e.target.value }); location.hash = e.target.value === 'guest' ? '#/' : { renter: '#/renter', owner: '#/owner', operator: '#/operator', employee: '#/desk', admin: '#/admin' }[e.target.value]; }}>
            {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{k === 'guest' ? 'Гість (не увійшли)' : v}</option>)}
          </select>
        </label>
        {user && <span className="who"><span className="who__ava" aria-hidden="true">{user.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>{user.name.split(' ')[0]}</span>}
      </div>
    </header>
  );
}
