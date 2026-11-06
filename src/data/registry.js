// Опис реєстрів: які поля має кожна сутність і як їх показувати.
// Один опис - і таблиця, і форма, і перевірки будуються автоматично (компонентно-орієнтований підхід).
import { ROLES } from './mock.js';

const STATUS_RENT = ['підтверджено', 'активний', 'спірний', 'завершено', 'скасовано'];
const STATUS_KIT = ['чернетка', 'на модерації', 'опубліковано', 'відхилено', 'на ТО', 'знято'];

export const GROUPS = ['Довідники', 'Техніка', 'Оренда', 'Фінанси', 'Користувачі'];

export const REGISTRIES = [
  {
    key: 'points', title: 'Пункти видачі', group: 'Довідники', label: 'name',
    usedBy: [['kits', 'pointId', ['комплект', 'комплекти', 'комплектів']]],
    fields: [
      { key: 'name', label: 'Назва', type: 'text', required: true },
      { key: 'address', label: 'Адреса', type: 'text', required: true },
      { key: 'hours', label: 'Графік роботи', type: 'text' },
      { key: 'phone', label: 'Телефон', type: 'text', pattern: /^\+380[\d ]{9,13}$/, hint: 'Формат: +380 44 000 11 22' },
      { key: 'lat', label: 'Широта', type: 'number', table: false },
      { key: 'lng', label: 'Довгота', type: 'number', table: false },
    ],
  },
  {
    key: 'tariffs', title: 'Тарифні плани', group: 'Довідники', label: 'name',
    usedBy: [['kits', 'tariffId', ['комплект', 'комплекти', 'комплектів']]],
    fields: [
      { key: 'name', label: 'Назва', type: 'text', required: true },
      { key: 'type', label: 'Тип', type: 'select', options: ['подобово', 'за нальотом'], required: true },
      { key: 'day', label: 'За добу', type: 'money', required: true, min: 0 },
      { key: 'hour', label: 'За год нальоту', type: 'money', min: 0 },
      { key: 'operatorHour', label: 'Оператор, год', type: 'money', min: 0 },
      { key: 'insuranceDay', label: 'Страхування, доба', type: 'money', min: 0, table: false },
      { key: 'lateFeeDay', label: 'Штраф, доба', type: 'money', min: 0 },
      { key: 'active', label: 'Активний', type: 'bool' },
    ],
  },
  {
    key: 'coefficients', title: 'Коефіцієнти тарифу', group: 'Довідники', label: 'label',
    fields: [
      { key: 'label', label: 'Назва', type: 'text', required: true },
      { key: 'type', label: 'Тип', type: 'select', options: ['вихідні', 'сезон', 'тривалість'], required: true },
      { key: 'mult', label: 'Множник', type: 'number', required: true, min: 0.1, max: 3, step: 0.05 },
      { key: 'minDays', label: 'Від діб', type: 'number', min: 1 },
    ],
  },
  {
    key: 'roles', title: 'Ролі', group: 'Довідники', readOnly: true, label: 'title',
    derive: (s) => Object.entries(ROLES).map(([k, title], i) => ({ id: i + 1, code: k, title, users: s.users.filter((u) => u.roles.includes(k)).length })),
    fields: [
      { key: 'code', label: 'Код', type: 'text' },
      { key: 'title', label: 'Назва', type: 'text' },
      { key: 'users', label: 'Користувачів', type: 'number' },
    ],
  },
  {
    key: 'platforms', title: 'Платформи', group: 'Техніка', label: (p) => `${p.maker} ${p.model}`,
    usedBy: [['kits', 'platformId', ['комплект', 'комплекти', 'комплектів']]],
    fields: [
      { key: 'maker', label: 'Виробник', type: 'text', required: true },
      { key: 'model', label: 'Модель', type: 'text', required: true },
      { key: 'serial', label: 'Серійний номер', type: 'text', required: true, unique: true },
      { key: 'cls', label: 'Клас', type: 'select', options: ['C0', 'C1', 'C2', 'C3', 'C4'], required: true },
      { key: 'ownerId', label: 'Власник', type: 'ref', ref: 'users', required: true },
      { key: 'mass', label: 'Маса, кг', type: 'number', min: 0, step: 0.01, table: false },
      { key: 'flightMin', label: 'Політ, хв', type: 'number', min: 1, table: false },
      { key: 'hours', label: 'Наліт, год', type: 'number', min: 0 },
      { key: 'hoursSinceService', label: 'Після ТО, год', type: 'number', min: 0 },
      { key: 'serviceInterval', label: 'Інтервал ТО, год', type: 'number', min: 1, table: false },
      { key: 'state', label: 'Стан', type: 'select', options: ['справна', 'на обслуговуванні', 'списана'] },
    ],
  },
  {
    key: 'kits', title: 'Комплекти оренди', group: 'Техніка', label: 'name',
    usedBy: [['rentals', 'kitId', ['оренда', 'оренди', 'оренд']], ['unavailable', 'kitId', ['період недоступності', 'періоди недоступності', 'періодів недоступності']]],
    fields: [
      { key: 'name', label: 'Назва', type: 'text', required: true },
      { key: 'platformId', label: 'Платформа', type: 'ref', ref: 'platforms', required: true },
      { key: 'ownerId', label: 'Власник', type: 'ref', ref: 'users', required: true },
      { key: 'tariffId', label: 'Тариф', type: 'ref', ref: 'tariffs', required: true },
      { key: 'pointId', label: 'Пункт видачі', type: 'ref', ref: 'points', required: true },
      { key: 'deposit', label: 'Застава', type: 'money', required: true, min: 1000 },
      { key: 'status', label: 'Статус', type: 'select', options: STATUS_KIT, badge: true },
      { key: 'withOperator', label: 'З оператором', type: 'bool', table: false },
      { key: 'needsLicense', label: 'Потрібен допуск', type: 'bool', table: false },
      { key: 'purpose', label: 'Для яких робіт', type: 'text', table: false },
      { key: 'limits', label: 'Обмеження', type: 'textarea', table: false },
    ],
  },
  {
    key: 'unavailable', title: 'Періоди недоступності', group: 'Техніка', label: (u) => `${u.from} - ${u.to}`,
    fields: [
      { key: 'kitId', label: 'Комплект', type: 'ref', ref: 'kits', required: true },
      { key: 'from', label: 'З', type: 'date', required: true },
      { key: 'to', label: 'По', type: 'date', required: true, after: 'from' },
      { key: 'reason', label: 'Причина', type: 'select', options: ['блокування власником', 'ТО'], required: true },
      { key: 'auto', label: 'Автоматично', type: 'bool' },
    ],
  },
  {
    key: 'rentals', title: 'Бронювання і договори', group: 'Оренда', label: 'contract',
    fields: [
      { key: 'contract', label: 'Договір', type: 'text', required: true, unique: true },
      { key: 'kitId', label: 'Комплект', type: 'ref', ref: 'kits', required: true },
      { key: 'renterId', label: 'Орендар', type: 'ref', ref: 'users', required: true },
      { key: 'from', label: 'Початок', type: 'date', required: true },
      { key: 'to', label: 'Завершення', type: 'date', required: true, after: 'from' },
      { key: 'withOperator', label: 'З оператором', type: 'bool' },
      { key: 'operatorId', label: 'Оператор', type: 'ref', ref: 'users', table: false },
      { key: 'insurance', label: 'Страхування', type: 'bool', table: false },
      { key: 'status', label: 'Статус', type: 'select', options: STATUS_RENT, badge: true },
    ],
  },
  {
    key: 'acts', title: 'Акти передачі', group: 'Оренда', readOnly: true,
    derive: (s) => s.rentals.flatMap((r) => r.acts.map((a, i) => ({ id: `${r.id}-${i}`, contract: r.contract, ...a, damaged: a.items.filter((x) => x !== 'справна').length }))),
    fields: [
      { key: 'contract', label: 'Договір', type: 'text' },
      { key: 'type', label: 'Тип', type: 'text' },
      { key: 'at', label: 'Дата і час', type: 'text' },
      { key: 'employeeId', label: 'Працівник', type: 'ref', ref: 'users' },
      { key: 'hours', label: 'Наліт, год', type: 'number' },
      { key: 'damaged', label: 'Зауважень', type: 'number' },
      { key: 'confirmed', label: 'Підтверджено', type: 'bool' },
    ],
  },
  {
    key: 'disputes', title: 'Спори', group: 'Оренда', readOnly: true,
    derive: (s) => s.rentals.filter((r) => r.dispute).map((r) => ({ id: r.dispute.id, contract: r.contract, ...r.dispute })),
    fields: [
      { key: 'contract', label: 'Договір', type: 'text' },
      { key: 'initiatorId', label: 'Ініціатор', type: 'ref', ref: 'users' },
      { key: 'type', label: 'Тип', type: 'text' },
      { key: 'claim', label: 'Оскаржує', type: 'money' },
      { key: 'openedAt', label: 'Відкрито', type: 'date' },
      { key: 'status', label: 'Статус', type: 'text', badge: true },
    ],
  },
  {
    key: 'reviews', title: 'Відгуки', group: 'Оренда', readOnly: true,
    derive: (s) => s.rentals.filter((r) => r.review).map((r) => ({ id: r.id, contract: r.contract, authorId: r.renterId, ...r.review })),
    fields: [
      { key: 'contract', label: 'Договір', type: 'text' },
      { key: 'authorId', label: 'Автор', type: 'ref', ref: 'users' },
      { key: 'stars', label: 'Оцінка', type: 'stars' },
      { key: 'text', label: 'Текст', type: 'text' },
    ],
  },
  {
    key: 'charges', title: 'Нарахування', group: 'Фінанси', readOnly: true,
    derive: (s) => s.rentals.flatMap((r) => r.charges.map((c, i) => ({ id: `${r.id}-${i}`, contract: r.contract, ...c }))),
    fields: [
      { key: 'contract', label: 'Договір', type: 'text' },
      { key: 'type', label: 'Тип нарахування', type: 'text' },
      { key: 'sum', label: 'Сума', type: 'money' },
    ],
  },
  {
    key: 'payments', title: 'Платежі', group: 'Фінанси', readOnly: true,
    derive: (s) => s.rentals.flatMap((r) => r.payments.map((p, i) => ({ id: `${r.id}-${i}`, contract: r.contract, ...p }))),
    fields: [
      { key: 'contract', label: 'Договір', type: 'text' },
      { key: 'type', label: 'Тип платежу', type: 'text' },
      { key: 'sum', label: 'Сума', type: 'money' },
      { key: 'status', label: 'Статус', type: 'text' },
    ],
  },
  {
    key: 'payouts', title: 'Виплати власникам', group: 'Фінанси', label: (p) => `${p.from} - ${p.to}`,
    fields: [
      { key: 'ownerId', label: 'Власник', type: 'ref', ref: 'users', required: true },
      { key: 'from', label: 'Період з', type: 'date', required: true },
      { key: 'to', label: 'Період по', type: 'date', required: true, after: 'from' },
      { key: 'gross', label: 'Нараховано', type: 'money', required: true, min: 0 },
      { key: 'rate', label: 'Комісія, %', type: 'number', required: true, min: 0, max: 50 },
      { key: 'status', label: 'Статус', type: 'select', options: ['очікує', 'виплачено'], badge: true },
    ],
  },
  {
    key: 'users', title: 'Користувачі', group: 'Користувачі', label: 'name',
    usedBy: [['kits', 'ownerId', ['комплект', 'комплекти', 'комплектів']], ['rentals', 'renterId', ['оренда', 'оренди', 'оренд']], ['platforms', 'ownerId', ['платформа', 'платформи', 'платформ']]],
    fields: [
      { key: 'name', label: 'Ім’я', type: 'text', required: true },
      { key: 'email', label: 'Пошта', type: 'text', required: true, unique: true, pattern: /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i, hint: 'Наприклад, name@example.com' },
      { key: 'roles', label: 'Ролі', type: 'multi', options: Object.keys(ROLES).filter((r) => r !== 'guest'), optionLabels: ROLES, required: true },
      { key: 'licenseStatus', label: 'Допуск', type: 'select', options: ['немає', 'на перевірці', 'підтверджено', 'відхилено'], badge: true },
      { key: 'rating', label: 'Рейтинг', type: 'number', min: 0, max: 5, step: 0.1 },
    ],
  },
  {
    key: 'notifications', title: 'Сповіщення', group: 'Користувачі', label: 'text',
    fields: [
      { key: 'userId', label: 'Користувач', type: 'ref', ref: 'users', required: true },
      { key: 'text', label: 'Текст', type: 'textarea', required: true },
      { key: 'read', label: 'Прочитано', type: 'bool' },
    ],
  },
];

export const findRegistry = (key) => REGISTRIES.find((r) => r.key === key);

export function rowsOf(state, reg) {
  return reg.derive ? reg.derive(state) : state[reg.key] || [];
}

export function labelOf(state, refKey, id) {
  const reg = findRegistry(refKey);
  const row = rowsOf(state, reg).find((x) => x.id === id);
  if (!row) return id == null ? '' : `#${id}`;
  return typeof reg.label === 'function' ? reg.label(row) : row[reg.label];
}
