// Демо-дані. У реальній системі вони приходять з бази даних (див. ER-діаграму КП1).

export const ROLES = {
  guest: 'Гість',
  renter: 'Орендар',
  owner: 'Власник техніки',
  operator: 'Оператор-виконавець',
  employee: 'Працівник пункту видачі',
  admin: 'Адміністратор',
};

export const users = [
  { id: 1, name: 'Ірина Коваленко', email: 'iryna@example.com', roles: ['renter'], license: null, licenseStatus: 'немає', rating: 4.8 },
  { id: 2, name: 'Олег Савчук', email: 'oleh@example.com', roles: ['owner', 'renter'], license: { number: 'UA-OP-20417', cls: 'A2', until: '2027-05-01' }, licenseStatus: 'підтверджено', rating: 4.9, iban: 'UA21 3223 1300 0002 6007 2335 6600 1' },
  { id: 3, name: 'Максим Гнатюк', email: 'maksym@example.com', roles: ['operator'], license: { number: 'UA-OP-11873', cls: 'A3', until: '2027-11-15' }, licenseStatus: 'підтверджено', rating: 4.7 },
  { id: 4, name: 'Світлана Мельник', email: 'svitlana@example.com', roles: ['employee'], pointId: 1, rating: null },
  { id: 5, name: 'Андрій Бондар', email: 'admin@example.com', roles: ['admin'], rating: null },
  { id: 6, name: 'Тарас Лисенко', email: 'taras@example.com', roles: ['renter'], license: { number: 'UA-OP-30552', cls: 'A1', until: '2026-12-20' }, licenseStatus: 'на перевірці', rating: 4.5 },
];

export const points = [
  { id: 1, name: 'Пункт «Позняки»', address: 'Київ, просп. Петра Григоренка, 22', hours: 'Пн–Сб 9:00–20:00', phone: '+380 44 000 11 22', x: 68, y: 62, lat: 50.4183, lng: 30.6355 },
  { id: 2, name: 'Пункт «Оболонь»', address: 'Київ, вул. Героїв полку «Азов», 15', hours: 'Щодня 10:00–21:00', phone: '+380 44 000 33 44', x: 46, y: 18, lat: 50.5106, lng: 30.4983 },
  { id: 3, name: 'Пункт «Святошин»', address: 'Київ, просп. Берестейський, 120', hours: 'Пн–Пт 9:00–19:00', phone: '+380 44 000 55 66', x: 14, y: 40, lat: 50.4563, lng: 30.3652 },
];

export const tariffs = [
  { id: 1, name: 'Подобовий базовий', type: 'подобово', day: 1200, hour: 0, operatorHour: 450, insuranceDay: 150, lateFeeDay: 1500, minDays: 1, active: true },
  { id: 2, name: 'Професійний', type: 'подобово', day: 2600, hour: 0, operatorHour: 650, insuranceDay: 320, lateFeeDay: 3000, minDays: 1, active: true },
  { id: 3, name: 'За нальотом', type: 'за нальотом', day: 400, hour: 550, operatorHour: 450, insuranceDay: 150, lateFeeDay: 1500, minDays: 1, active: true },
];

export const coefficients = [
  { id: 1, type: 'вихідні', label: 'Субота й неділя', mult: 1.2 },
  { id: 2, type: 'сезон', label: 'Сезон квітень–вересень', from: '04-01', to: '09-30', mult: 1.1 },
  { id: 3, type: 'тривалість', label: 'Від 3 діб', minDays: 3, mult: 0.9 },
  { id: 4, type: 'тривалість', label: 'Від 7 діб', minDays: 7, mult: 0.8 },
];

export const platforms = [
  { id: 1, ownerId: 2, maker: 'DJI', model: 'Mini 4 Pro', serial: '1581F6Q8D241', cls: 'C0', mass: 0.249, flightMin: 34, hours: 126, hoursSinceService: 46, serviceInterval: 50, state: 'справна' },
  { id: 2, ownerId: 2, maker: 'DJI', model: 'Air 3', serial: '1581F5BKD23A', cls: 'C1', mass: 0.72, flightMin: 46, hours: 210, hoursSinceService: 12, serviceInterval: 60, state: 'справна' },
  { id: 3, ownerId: 2, maker: 'DJI', model: 'Mavic 3 Thermal', serial: '1581F4QWB22T', cls: 'C2', mass: 0.92, flightMin: 45, hours: 340, hoursSinceService: 21, serviceInterval: 60, state: 'справна' },
  { id: 4, ownerId: 2, maker: 'Autel', model: 'EVO II Pro 6K', serial: '7SED22B10045', cls: 'C2', mass: 1.19, flightMin: 40, hours: 95, hoursSinceService: 5, serviceInterval: 60, state: 'справна' },
  { id: 5, ownerId: 2, maker: 'DJI', model: 'Matrice 30T', serial: '1ZNBJ7R00C', cls: 'C3', mass: 3.77, flightMin: 41, hours: 410, hoursSinceService: 30, serviceInterval: 80, state: 'справна' },
  { id: 6, ownerId: 2, maker: 'DJI', model: 'Avata 2', serial: '1581F8C1D24P', cls: 'C1', mass: 0.377, flightMin: 23, hours: 58, hoursSinceService: 18, serviceInterval: 40, state: 'справна' },
];

const it = (type, name, value, qty = 1, serial = '') => ({ type, name, value, qty, serial, state: 'справна' });

export const kits = [
  {
    id: 1, ownerId: 2, platformId: 1, tariffId: 1, pointId: 1, status: 'опубліковано', color: '#3F6E8C',
    name: 'DJI Mini 4 Pro - комплект для зйомки', purpose: 'Зйомка заходів, нерухомості, тревел-відео',
    description: 'Легкий дрон до 250 г. Три акумулятори дають близько півтори години зйомки. Допуск не потрібен.',
    deposit: 8000, withOperator: true, needsLicense: false, limits: 'Без польотів над натовпом і в закритих зонах.',
    rating: 4.9, reviews: 23,
    items: [it('дрон', 'DJI Mini 4 Pro', 32000, 1, '1581F6Q8D241'), it('акумулятор', 'Intelligent Flight Battery Plus', 3200, 3), it('пульт', 'DJI RC 2 з екраном', 9000), it('зарядний пристрій', 'Зарядний хаб на 3 батареї', 2200), it('пропелери', 'Запасні пропелери', 400, 2), it('кейс', 'Сумка через плече', 1500)],
  },
  {
    id: 2, ownerId: 2, platformId: 2, tariffId: 1, pointId: 2, status: 'опубліковано', color: '#5A6B4E',
    name: 'DJI Air 3 Fly More', purpose: 'Аерофото з двома камерами, панорами',
    description: 'Дві камери: ширококутна і телевик з 3× наближенням. Без допуску - лише оренда з оператором.',
    deposit: 15000, withOperator: true, needsLicense: true, limits: 'Тільки денні польоти.',
    rating: 4.8, reviews: 17,
    items: [it('дрон', 'DJI Air 3', 48000, 1, '1581F5BKD23A'), it('акумулятор', 'Intelligent Flight Battery', 3900, 3), it('пульт', 'DJI RC-N2', 4500), it('зарядний пристрій', 'Хаб з функцією павербанка', 2600), it('фільтри', 'Набір ND-фільтрів', 2400), it('кейс', 'Жорсткий кейс', 3500)],
  },
  {
    id: 3, ownerId: 2, platformId: 3, tariffId: 2, pointId: 1, status: 'опубліковано', color: '#7A4A3A',
    name: 'Mavic 3 Thermal - інспекційний', purpose: 'Обстеження дахів, сонячних станцій, пошук тепловтрат',
    description: 'Тепловізор 640×512 і камера 48 Мп. Підходить для енергоаудиту та огляду дахів.',
    deposit: 40000, withOperator: true, needsLicense: true, limits: 'Для робіт над об’єктами інфраструктури - тільки з оператором.',
    rating: 5.0, reviews: 9,
    items: [it('дрон', 'DJI Mavic 3T', 210000, 1, '1581F4QWB22T'), it('акумулятор', 'Battery Mavic 3 Enterprise', 6500, 4), it('пульт', 'DJI RC Pro Enterprise', 32000), it('модуль', 'RTK-модуль', 28000), it('кейс', 'Транспортний кейс', 6000)],
  },
  {
    id: 4, ownerId: 2, platformId: 4, tariffId: 1, pointId: 3, status: 'опубліковано', color: '#B5651D',
    name: 'Autel EVO II Pro 6K', purpose: 'Кінозйомка, реклама',
    description: 'Матриця 1 дюйм, відео 6K. Добре тримає вітер до 12 м/с.',
    deposit: 20000, withOperator: false, needsLicense: true, limits: 'Тільки з чинним допуском.',
    rating: 4.6, reviews: 11,
    items: [it('дрон', 'Autel EVO II Pro 6K', 62000, 1, '7SED22B10045'), it('акумулятор', 'Battery EVO II', 4200, 3), it('пульт', 'Smart Controller SE', 12000), it('кейс', 'Жорсткий кейс', 3800)],
  },
  {
    id: 5, ownerId: 2, platformId: 5, tariffId: 2, pointId: 2, status: 'на модерації', color: '#4A4E69',
    name: 'Matrice 30T з оператором', purpose: 'Промислові інспекції, пошукові роботи',
    description: 'Промисловий дрон з тепловізором, лазерним далекоміром і захистом IP55. Видається тільки разом з оператором.',
    deposit: 90000, withOperator: true, needsLicense: true, limits: 'Тільки оренда з оператором.',
    rating: 0, reviews: 0,
    items: [it('дрон', 'DJI Matrice 30T', 420000, 1, '1ZNBJ7R00C'), it('акумулятор', 'TB30 Battery', 11000, 4), it('пульт', 'DJI RC Plus', 38000), it('зарядний пристрій', 'BS30 Battery Station', 24000), it('кейс', 'Транспортний кейс', 9000)],
  },
  {
    id: 6, ownerId: 2, platformId: 6, tariffId: 3, pointId: 3, status: 'опубліковано', color: '#2F5D50',
    name: 'DJI Avata 2 FPV-набір', purpose: 'FPV-прольоти, динамічне відео',
    description: 'Окуляри Goggles 3 і пульт руху: політ від першої особи. Оплата за годинами нальоту.',
    deposit: 12000, withOperator: false, needsLicense: true, limits: 'Політ лише з помічником-спостерігачем.',
    rating: 4.7, reviews: 14,
    items: [it('дрон', 'DJI Avata 2', 21000, 1, '1581F8C1D24P'), it('акумулятор', 'Avata 2 Battery', 2900, 3), it('окуляри', 'DJI Goggles 3', 22000), it('пульт', 'RC Motion 3', 5600), it('кейс', 'Сумка Fly More', 1700)],
  },
];

export const unavailable = [
  { id: 1, kitId: 1, from: '2026-11-20', to: '2026-11-22', reason: 'блокування власником', auto: false },
  { id: 2, kitId: 4, from: '2026-11-10', to: '2026-11-12', reason: 'ТО', auto: true },
];

// Оренда = бронювання + договір + акти + нарахування в одному об'єкті (для простоти демо)
export const rentals = [
  {
    id: 1001, kitId: 2, renterId: 1, from: '2026-11-07', to: '2026-11-09', withOperator: true, operatorId: 3, operatorStatus: 'прийнято',
    insurance: true, status: 'підтверджено', contract: 'ДП-2026-1001', createdAt: '2026-11-03',
    charges: [{ type: 'оренда', sum: 3888 }, { type: 'послуги оператора', sum: 10800 }, { type: 'страхування', sum: 450 }],
    payments: [{ type: 'оплата оренди', sum: 15138, status: 'успішний' }, { type: 'внесення застави', sum: 15000, status: 'успішний' }],
    acts: [], dispute: null, review: null,
  },
  {
    id: 1002, kitId: 1, renterId: 1, from: '2026-10-24', to: '2026-10-26', withOperator: false, operatorId: null, insurance: false,
    status: 'спірний', contract: 'ДП-2026-0987', createdAt: '2026-10-20', returnedAt: '2026-10-27',
    charges: [{ type: 'оренда', sum: 3888 }, { type: 'штраф за прострочення', sum: 1500 }],
    payments: [{ type: 'оплата оренди', sum: 3888, status: 'успішний' }, { type: 'внесення застави', sum: 8000, status: 'успішний' }],
    acts: [
      { type: 'видача', at: '2026-10-24 10:12', employeeId: 4, hours: 118, items: ['справна', 'справна', 'справна', 'справна', 'справна', 'справна'], comment: 'Без зауважень', confirmed: true },
      { type: 'повернення', at: '2026-10-27 18:40', employeeId: 4, hours: 124, items: ['справна', 'пошкоджена', 'справна', 'справна', 'справна', 'зношена'], comment: 'Один акумулятор здутий', confirmed: false },
    ],
    dispute: { id: 77, initiatorId: 1, type: 'пошкодження', text: 'Акумулятор був здутий ще при видачі, я помітила це лише ввечері.', claim: 3200, status: 'на розгляді', openedAt: '2026-10-28' },
    review: null,
  },
  {
    id: 1003, kitId: 3, renterId: 6, from: '2026-11-06', to: '2026-11-08', withOperator: true, operatorId: 3, operatorStatus: 'очікує', insurance: true,
    status: 'підтверджено', contract: 'ДП-2026-1003', createdAt: '2026-11-04',
    charges: [{ type: 'оренда', sum: 7020 }, { type: 'послуги оператора', sum: 15600 }, { type: 'страхування', sum: 960 }],
    payments: [{ type: 'оплата оренди', sum: 23580, status: 'успішний' }, { type: 'внесення застави', sum: 40000, status: 'успішний' }],
    acts: [], dispute: null, review: null,
  },
  {
    id: 1004, kitId: 6, renterId: 2, from: '2026-11-02', to: '2026-11-05', withOperator: false, insurance: false,
    status: 'активний', contract: 'ДП-2026-0999', createdAt: '2026-10-30',
    charges: [{ type: 'оренда', sum: 4320 }],
    payments: [{ type: 'оплата оренди', sum: 4320, status: 'успішний' }, { type: 'внесення застави', sum: 12000, status: 'успішний' }],
    acts: [{ type: 'видача', at: '2026-11-02 11:05', employeeId: 4, hours: 52, items: ['справна', 'справна', 'справна', 'справна', 'справна'], comment: '', confirmed: true }],
    dispute: null, review: null,
  },
  {
    id: 990, kitId: 2, renterId: 6, from: '2026-10-10', to: '2026-10-12', withOperator: false, insurance: true,
    status: 'завершено', contract: 'ДП-2026-0950', createdAt: '2026-10-05', returnedAt: '2026-10-12',
    charges: [{ type: 'оренда', sum: 3888 }, { type: 'страхування', sum: 450 }],
    payments: [{ type: 'оплата оренди', sum: 4338, status: 'успішний' }, { type: 'внесення застави', sum: 15000, status: 'успішний' }, { type: 'повернення застави', sum: 15000, status: 'успішний' }],
    acts: [], dispute: null, review: { stars: 5, text: 'Все чисто, дуже рекомендую.' },
  },
];

export const payouts = [
  { id: 31, ownerId: 2, from: '2026-09-01', to: '2026-09-30', gross: 46200, rate: 15, status: 'виплачено', paidAt: '2026-10-03' },
  { id: 32, ownerId: 2, from: '2026-10-01', to: '2026-10-31', gross: 38750, rate: 15, status: 'очікує', paidAt: null },
];

export const notifications = [
  { id: 1, userId: 1, text: 'Нагадування: видача DJI Air 3 завтра о 10:00, пункт «Оболонь».', read: false },
  { id: 2, userId: 1, text: 'Спір за орендою ДП-2026-0987 прийнято до розгляду.', read: true },
  { id: 3, userId: 2, text: 'Комплект «Matrice 30T з оператором» відправлено на модерацію.', read: false },
  { id: 4, userId: 3, text: 'Нове замовлення з оператором: Mavic 3 Thermal, 6–8 листопада.', read: false },
  { id: 5, userId: 5, text: 'Новий спір за орендою ДП-2026-0987.', read: false },
];
