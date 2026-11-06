import React, { createContext, useContext, useEffect, useReducer } from 'react';
import * as mock from './data/mock.js';

const KEY = 'dronprokat-state-v1';

const initial = {
  role: 'guest',
  userId: null,
  users: mock.users,
  points: mock.points,
  tariffs: mock.tariffs,
  coefficients: mock.coefficients,
  platforms: mock.platforms,
  kits: mock.kits,
  unavailable: mock.unavailable,
  rentals: mock.rentals,
  payouts: mock.payouts,
  notifications: mock.notifications,
  toast: null,
};

const ROLE_USER = { guest: null, renter: 1, owner: 2, operator: 3, employee: 4, admin: 5 };

function notify(state, userId, text) {
  const id = Math.max(0, ...state.notifications.map((n) => n.id)) + 1;
  return [...state.notifications, { id, userId, text, read: false }];
}

function updRental(state, id, fn) {
  return state.rentals.map((r) => (r.id === id ? fn(r) : r));
}

function reducer(state, a) {
  switch (a.type) {
    case 'login':
      return { ...state, role: a.role, userId: ROLE_USER[a.role], toast: null, feedback: null };
    case 'toast':
      return { ...state, toast: a.text };
    case 'readAll':
      return { ...state, notifications: state.notifications.map((n) => (n.userId === state.userId ? { ...n, read: true } : n)) };
    case 'book': {
      const id = Math.max(...state.rentals.map((r) => r.id)) + 1;
      const kit = state.kits.find((k) => k.id === a.kitId);
      const r = {
        id, kitId: a.kitId, renterId: state.userId, from: a.from, to: a.to,
        withOperator: a.withOperator, operatorId: a.withOperator ? 3 : null, operatorStatus: a.withOperator ? 'очікує' : null,
        insurance: a.insurance, status: 'підтверджено', contract: `ДП-2026-${id}`, createdAt: '2026-11-06',
        charges: a.charges, payments: [{ type: 'оплата оренди', sum: a.total, status: 'успішний' }, { type: 'внесення застави', sum: kit.deposit, status: 'успішний' }],
        acts: [], dispute: null, review: null,
      };
      let notifications = notify(state, kit.ownerId, `Нове бронювання «${kit.name}» на ${a.from} - ${a.to}.`);
      if (a.withOperator) notifications = notify({ ...state, notifications }, 3, `Нове замовлення з оператором: ${kit.name}, ${a.from} - ${a.to}.`);
      return { ...state, rentals: [...state.rentals, r], notifications, toast: `Оренду ${r.contract} оформлено` };
    }
    case 'cancel':
      return { ...state, rentals: updRental(state, a.id, (r) => ({ ...r, status: 'скасовано', payments: [...r.payments, { type: 'повернення коштів', sum: r.payments.reduce((s, p) => s + (p.type === 'повернення коштів' ? 0 : p.sum), 0), status: 'успішний' }] })), toast: 'Бронювання скасовано, кошти повертаються на картку' };
    case 'operatorAnswer':
      return { ...state, rentals: updRental(state, a.id, (r) => ({ ...r, operatorStatus: a.answer })), toast: a.answer === 'прийнято' ? 'Замовлення прийнято' : 'Замовлення відхилено' };
    case 'act': {
      const r = state.rentals.find((x) => x.id === a.id);
      const kit = state.kits.find((k) => k.id === r.kitId);
      const act = { type: a.actType, at: a.at, employeeId: state.userId, hours: a.hours, items: a.items, comment: a.comment, confirmed: false };
      let rentals = updRental(state, a.id, (x) => ({
        ...x,
        acts: [...x.acts, act],
        status: a.actType === 'видача' ? 'активний' : 'завершено',
        returnedAt: a.actType === 'повернення' ? a.at.slice(0, 10) : x.returnedAt,
        charges: [...x.charges, ...(a.extraCharges || [])],
      }));
      let platforms = state.platforms;
      let unavailable = state.unavailable;
      let kits = state.kits;
      if (a.actType === 'повернення') {
        const issue = r.acts.find((x) => x.type === 'видача');
        const flown = Math.max(0, a.hours - (issue ? issue.hours : a.hours));
        platforms = platforms.map((p) => (p.id === kit.platformId ? { ...p, hours: p.hours + flown, hoursSinceService: p.hoursSinceService + flown } : p));
        const pl = platforms.find((p) => p.id === kit.platformId);
        // «Тригер»: якщо досягнуто міжсервісного інтервалу - блокуємо комплект на ТО
        if (pl.hoursSinceService >= pl.serviceInterval) {
          unavailable = [...unavailable, { id: Date.now(), kitId: kit.id, from: '2026-11-06', to: '2026-11-13', reason: 'ТО', auto: true }];
          kits = kits.map((k) => (k.id === kit.id ? { ...k, status: 'на ТО' } : k));
        }
      }
      const notifications = notify(state, r.renterId, `Складено акт ${a.actType === 'видача' ? 'видачі' : 'повернення'} за договором ${r.contract}. Перевірте й підтвердьте.`);
      return { ...state, rentals, platforms, unavailable, kits, notifications, toast: `Акт ${a.actType === 'видача' ? 'видачі' : 'повернення'} збережено` };
    }
    case 'confirmAct':
      return { ...state, rentals: updRental(state, a.id, (r) => ({ ...r, acts: r.acts.map((x, i) => (i === a.index ? { ...x, confirmed: true } : x)) })), toast: 'Акт підтверджено' };
    case 'openDispute':
      return {
        ...state,
        rentals: updRental(state, a.id, (r) => ({ ...r, status: 'спірний', dispute: { id: Date.now(), initiatorId: state.userId, type: a.kind, text: a.text, claim: a.claim, status: 'відкрито', openedAt: '2026-11-06' } })),
        notifications: notify(state, 5, 'Відкрито новий спір.'),
        toast: 'Спір відкрито. Адміністратор розгляне його протягом 3 робочих днів',
      };
    case 'resolveDispute':
      return {
        ...state,
        rentals: updRental(state, a.id, (r) => ({
          ...r, status: 'завершено',
          dispute: { ...r.dispute, status: 'вирішено', decision: a.decision, compensation: a.compensation },
          // рішення замінює попередньо нараховану компенсацію
          charges: [...r.charges.filter((c) => c.type !== 'компенсація пошкоджень'), ...(a.compensation ? [{ type: 'компенсація пошкоджень', sum: a.compensation }] : [])],
          payments: [...r.payments,
            ...(a.compensation ? [{ type: 'утримання із застави', sum: a.compensation, status: 'успішний' }] : []),
            { type: 'повернення застави', sum: (r.payments.find((p) => p.type === 'внесення застави')?.sum || 0) - (a.compensation || 0), status: 'успішний' }],
        })),
        toast: 'Рішення у спорі збережено',
      };
    case 'review':
      return { ...state, rentals: updRental(state, a.id, (r) => ({ ...r, review: { stars: a.stars, text: a.text } })), toast: 'Дякуємо за відгук' };
    case 'moderate':
      return {
        ...state,
        kits: state.kits.map((k) => (k.id === a.id ? { ...k, status: a.ok ? 'опубліковано' : 'відхилено', rejectReason: a.reason || null } : k)),
        notifications: notify(state, 2, a.ok ? 'Ваш комплект опубліковано.' : `Комплект відхилено: ${a.reason}`),
        toast: a.ok ? 'Комплект опубліковано' : 'Комплект відхилено',
      };
    case 'saveKit': {
      const id = Math.max(...state.kits.map((k) => k.id)) + 1;
      return { ...state, kits: [...state.kits, { ...a.kit, id, ownerId: state.userId, status: 'на модерації', rating: 0, reviews: 0 }], notifications: notify(state, 5, `Новий комплект на модерацію: ${a.kit.name}`), toast: 'Комплект відправлено на модерацію' };
    }
    case 'block':
      return { ...state, unavailable: [...state.unavailable, { id: Date.now(), kitId: a.kitId, from: a.from, to: a.to, reason: 'блокування власником', auto: false }], toast: 'Дати заблоковано' };
    case 'unblock':
      return { ...state, unavailable: state.unavailable.filter((u) => u.id !== a.id), toast: 'Блокування знято' };
    case 'tariff':
      return { ...state, tariffs: state.tariffs.map((t) => (t.id === a.id ? { ...t, [a.field]: a.value } : t)) };
    case 'coef':
      return { ...state, coefficients: state.coefficients.map((c) => (c.id === a.id ? { ...c, mult: a.value } : c)) };
    case 'license':
      return { ...state, users: state.users.map((u) => (u.id === a.userId ? { ...u, ...(a.license ? { license: a.license } : {}), licenseStatus: a.status } : u)), toast: a.toastText };
    case 'payout':
      return { ...state, payouts: state.payouts.map((p) => (p.id === a.id ? { ...p, status: 'виплачено', paidAt: '2026-11-06' } : p)), toast: 'Виплату надіслано через платіжну систему' };
    // Загальні дії для всіх реєстрів (компонент Registry)
    case 'crudAdd': {
      const list = state[a.coll];
      const id = Math.max(0, ...list.map((x) => Number(x.id) || 0)) + 1;
      return { ...state, [a.coll]: [...list, { ...a.item, id }], toast: a.toastText };
    }
    case 'crudUpdate':
      return { ...state, [a.coll]: state[a.coll].map((x) => (x.id === a.id ? { ...x, ...a.item, id: a.id } : x)), toast: a.toastText };
    case 'crudDelete':
      return { ...state, [a.coll]: state[a.coll].filter((x) => x.id !== a.id), toast: a.toastText };
    case 'feedback':
      return { ...state, feedback: { title: a.title, text: a.text, actions: a.actions }, toast: null };
    case 'closeFeedback':
      return { ...state, feedback: null };
    case 'reset':
      return { ...initial };
    default:
      return state;
  }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...initial, ...JSON.parse(raw), toast: null, feedback: null } : initial;
  } catch {
    return initial;
  }
}

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* сховище недоступне - працюємо без збереження */ }
  }, [state]);
  useEffect(() => {
    if (!state.toast) return undefined;
    const t = setTimeout(() => dispatch({ type: 'toast', text: null }), 3200);
    return () => clearTimeout(t);
  }, [state.toast]);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
