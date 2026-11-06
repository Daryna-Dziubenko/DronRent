export const fmt = (n) => new Intl.NumberFormat('uk-UA').format(Math.round(n)) + ' ₴';

export const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
export const daysBetween = (a, b) => Math.round((parse(b) - parse(a)) / 86400000) + 1;
export const human = (s) => parse(s).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
export const TODAY = '2026-11-06';

export function dateList(from, to) {
  const out = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

export const overlaps = (a1, a2, b1, b2) => a1 <= b2 && b1 <= a2;

export function busyRanges(state, kitId) {
  const r = state.rentals.filter((x) => x.kitId === kitId && !['скасовано', 'завершено'].includes(x.status)).map((x) => ({ from: x.from, to: x.to, reason: 'заброньовано' }));
  const u = state.unavailable.filter((x) => x.kitId === kitId).map((x) => ({ from: x.from, to: x.to, reason: x.reason }));
  return [...r, ...u];
}

export function isFree(state, kitId, from, to) {
  return !busyRanges(state, kitId).some((b) => overlaps(from, to, b.from, b.to));
}

export function hasLicense(user, to) {
  return !!(user && user.license && user.licenseStatus === 'підтверджено' && user.license.until >= to);
}

// Розрахунок вартості: тариф × коефіцієнти (вихідні, сезон) × знижка за тривалість
export function calcPrice(state, kit, from, to, { withOperator = false, insurance = false, hours = 2 } = {}) {
  const t = state.tariffs.find((x) => x.id === kit.tariffId);
  const co = state.coefficients;
  const days = dateList(from, to);
  const weekend = co.find((c) => c.type === 'вихідні');
  const season = co.find((c) => c.type === 'сезон');
  let base = 0; let weekendDays = 0; let seasonDays = 0;
  for (const d of days) {
    let p = t.day;
    const dow = parse(d).getDay();
    if (weekend && (dow === 0 || dow === 6)) { p *= weekend.mult; weekendDays++; }
    const md = d.slice(5);
    if (season && md >= season.from && md <= season.to) { p *= season.mult; seasonDays++; }
    base += p;
  }
  if (t.type === 'за нальотом') base += t.hour * hours * days.length;
  const len = co.filter((c) => c.type === 'тривалість' && days.length >= c.minDays).sort((a, b) => a.mult - b.mult)[0];
  const rent = base * (len ? len.mult : 1);
  const operator = withOperator ? t.operatorHour * 8 * days.length : 0;
  const ins = insurance ? t.insuranceDay * days.length : 0;
  const lines = [];
  lines.push({ label: `Оренда, ${days.length} ${plural(days.length, 'доба', 'доби', 'діб')} × ${fmt(t.day)}`, sum: t.day * days.length });
  if (t.type === 'за нальотом') lines.push({ label: `Наліт ≈ ${hours} год/добу × ${fmt(t.hour)}`, sum: t.hour * hours * days.length });
  if (weekendDays) lines.push({ label: `Вихідні: ${weekendDays} × ${weekend.mult}`, sum: weekendDays * t.day * (weekend.mult - 1) });
  if (seasonDays) lines.push({ label: `Сезонний коефіцієнт ${season.mult}`, sum: null });
  if (len) lines.push({ label: `Знижка «${len.label.toLowerCase()}»`, sum: rent - base });
  if (withOperator) lines.push({ label: `Оператор, 8 год × ${days.length} × ${fmt(t.operatorHour)}`, sum: operator });
  if (insurance) lines.push({ label: `Страхування, ${days.length} × ${fmt(t.insuranceDay)}`, sum: ins });
  const charges = [{ type: 'оренда', sum: Math.round(rent) }];
  if (withOperator) charges.push({ type: 'послуги оператора', sum: operator });
  if (insurance) charges.push({ type: 'страхування', sum: ins });
  return { days: days.length, rent, operator, ins, total: Math.round(rent + operator + ins), deposit: kit.deposit, lines, charges, tariff: t };
}

export function plural(n, one, few, many) {
  const m10 = n % 10; const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

export const sum = (arr) => arr.reduce((s, x) => s + x.sum, 0);
