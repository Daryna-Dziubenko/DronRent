import React, { useState } from 'react';
import { useStore } from '../store.jsx';
import { Button, Stepper, DronePhoto } from '../components/ui.jsx';
import { fmt, calcPrice, isFree, hasLicense, human } from '../utils.js';
import FormTemplate from '../components/templates/FormTemplate.jsx';

export default function Checkout({ q }) {
  const { state, dispatch } = useStore();
  const kit = state.kits.find((k) => k.id === Number(q.kit));
  const [step, setStep] = useState(0);
  const [card, setCard] = useState({ number: '', exp: '', cvc: '' });
  const [agree, setAgree] = useState(false);
  if (!kit) return <p>Не обрано комплект. <a href="#/">До каталогу</a></p>;
  const withOperator = q.op === '1'; const insurance = q.ins === '1';
  const user = state.users.find((u) => u.id === state.userId);
  const price = calcPrice(state, kit, q.from, q.to, { withOperator, insurance, hours: Number(q.h) || 2 });
  const pt = state.points.find((p) => p.id === kit.pointId);
  const checks = [
    ['Комплект вільний на обрані дати', isFree(state, kit.id, q.from, q.to)],
    [kit.needsLicense && !withOperator ? 'Ваш допуск чинний до кінця оренди' : withOperator ? 'Допуск не потрібен: керує оператор' : 'Допуск для класу C0 не потрібен', !kit.needsLicense || withOperator || hasLicense(user, q.to)],
    ['Вартість розраховано за тарифом', true],
  ];
  const ok = checks.every((c) => c[1]);
  const digits = card.number.replace(/\D/g, '');
  const cardOk = digits.length === 16 && /^\d{2}\/\d{2}$/.test(card.exp) && /^\d{3}$/.test(card.cvc);

  const finish = () => {
    dispatch({ type: 'book', kitId: kit.id, from: q.from, to: q.to, withOperator, insurance, total: price.total, charges: price.charges });
    dispatch({ type: 'feedback', title: 'Оренду оформлено', text: `Договір на «${kit.name}» підписано, оплату прийнято. Заберіть комплект ${human(q.from)} у пункті «${pt.name.replace('Пункт ', '').replace(/[«»]/g, '')}». Нагадування прийде напередодні.`, actions: [{ label: 'До каталогу', href: '#/' }, { label: 'Мої оренди', href: '#/renter' }] });
    location.hash = '#/renter';
  };

  return (
    <FormTemplate
      className="checkout"
      crumbs={[['Каталог', '#/'], [kit.name, `#/kit/${kit.id}?from=${q.from}&to=${q.to}`], ['Оформлення оренди']]}
      back={['Назад до комплекту', `#/kit/${kit.id}?from=${q.from}&to=${q.to}`]}
      title="Оформлення оренди"
      steps={['Перевірка', 'Оплата і застава', 'Договір']} step={step}
    >
      <div key={step} className="step-panel">
      <div className="checkout__layout">
        <section className="panel">
          {step === 0 && (
            <>
              <h2>Перевіряємо бронювання</h2>
              <ul className="checks">
                {checks.map(([t, v]) => <li key={t} className={v ? 'checks__ok' : 'checks__bad'}><span aria-hidden="true">{v ? '✓' : '✕'}</span>{t}</li>)}
              </ul>
              {!ok && <p className="error">Бронювання неможливе. Поверніться до комплекту й змініть дати або оберіть оренду з оператором.</p>}
              <div className="actions"><Button disabled={!ok} onClick={() => setStep(1)}>Перейти до оплати</Button></div>
            </>
          )}
          {step === 1 && (
            <>
              <h2>Оплата і застава</h2>
              <p className="muted">Оплата оренди списується одразу. Застава блокується на картці й повертається після акта повернення, якщо до комплекту немає претензій.</p>
              <div className="form-grid">
                <label className="field field--wide"><span className="field__label">Номер картки</span>
                  <input inputMode="numeric" placeholder="0000 0000 0000 0000" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value.replace(/[^\d ]/g, '').slice(0, 19) })} /></label>
                <label className="field"><span className="field__label">Діє до</span>
                  <input placeholder="ММ/РР" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value.slice(0, 5) })} /></label>
                <label className="field"><span className="field__label">CVC</span>
                  <input inputMode="numeric" placeholder="123" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 3) })} /></label>
              </div>
              {card.number && digits.length !== 16 && <p className="error">У номері картки має бути 16 цифр, зараз {digits.length}.</p>}
              <p className="small muted">Демо: введіть будь-які 16 цифр, термін у форматі 12/28 і три цифри CVC.</p>
              <div className="actions">
                <Button variant="ghost" onClick={() => setStep(0)}>Назад</Button>
                <Button disabled={!cardOk} onClick={() => setStep(2)}>Сплатити {fmt(price.total)} і заблокувати {fmt(kit.deposit)}</Button>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h2>Договір оренди</h2>
              <div className="contract">
                <p><b>Орендодавець:</b> {state.users.find((u) => u.id === kit.ownerId).name}. <b>Орендар:</b> {user.name}.</p>
                <p><b>Предмет:</b> комплект «{kit.name}» у складі {kit.items.length} позицій згідно з описом.</p>
                <p><b>Строк:</b> з {human(q.from)} по {human(q.to)}. Повернення пізніше - штраф {fmt(price.tariff.lateFeeDay)} за кожну добу.</p>
                <p><b>Застава:</b> {fmt(kit.deposit)}. Пошкодження компенсуються за оціночною вартістю позиції. Незгоду можна оскаржити через спір.</p>
                <p><b>Передача:</b> {pt.name}, за актом з перевіркою кожної позиції та фотофіксацією.</p>
              </div>
              <label className="check"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> Я ознайомилась з умовами й погоджуюсь</label>
              <div className="actions">
                <Button variant="ghost" onClick={() => setStep(1)}>Назад</Button>
                <Button disabled={!agree} onClick={finish}>Підписати договір</Button>
              </div>
            </>
          )}
        </section>
        <aside className="panel summary">
          <DronePhoto small />
          <p className="summary__name">{kit.name}</p>
          <p className="muted">{human(q.from)} - {human(q.to)} · {pt.name}</p>
          <div className="calc">
            {price.lines.map((l) => <div key={l.label} className="calc__row"><span>{l.label}</span><span>{l.sum == null ? '' : (l.sum < 0 ? '−' : '') + fmt(Math.abs(l.sum))}</span></div>)}
            <div className="calc__row calc__total"><span>До сплати</span><span>{fmt(price.total)}</span></div>
            <div className="calc__row calc__dep"><span>Застава</span><span>{fmt(kit.deposit)}</span></div>
          </div>
        </aside>
      </div>
      </div>
    </FormTemplate>
  );
}
