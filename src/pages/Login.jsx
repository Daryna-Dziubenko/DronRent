import React from 'react';
import { useStore } from '../store.jsx';
import { ROLES } from '../data/mock.js';
import PageTemplate from '../components/templates/PageTemplate.jsx';

const START = { renter: '#/renter', owner: '#/owner', operator: '#/operator', employee: '#/desk', admin: '#/admin' };
const WHO = { renter: 'Ірина Коваленко', owner: 'Олег Савчук', operator: 'Максим Гнатюк', employee: 'Світлана Мельник', admin: 'Андрій Бондар' };
const WHAT = {
  renter: 'Бронює комплекти, оплачує, відкриває спори, залишає відгуки',
  owner: 'Додає техніку, керує доступністю, бачить нарахування й виплати',
  operator: 'Приймає замовлення на оренду з оператором',
  employee: 'Складає акти видачі й повернення в пункті',
  admin: 'Модерація, тарифи, допуски, спори, виплати',
};

export default function Login({ need }) {
  const { dispatch } = useStore();
  return (
    <PageTemplate className="login" crumbs={[['Головна', '#/'], ['Вхід']]} title="Вхід" subtitle={`${need ? `Ця сторінка доступна ролі «${ROLES[need]}». ` : ''}Це демо: оберіть, ким увійти. Пароль не потрібен.`}>
      <div className="login__grid">
        {Object.keys(START).map((r) => (
          <button type="button" key={r} className="login__card" onClick={() => { dispatch({ type: 'login', role: r }); location.hash = START[r]; }}>
            <b>{ROLES[r]}</b>
            <span>{WHO[r]}</span>
            <span className="muted small">{WHAT[r]}</span>
          </button>
        ))}
      </div>
      <p className="small muted">Реєстрація нового користувача в демо вимкнена: дані зберігаються лише у вашому браузері.</p>
    </PageTemplate>
  );
}
