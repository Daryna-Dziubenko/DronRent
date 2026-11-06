import React, { useState } from 'react';
import { Badge, Button, Field, Tabs, Stars, Empty, Stepper, Modal, DronePhoto } from '../components/ui.jsx';
import PageHeader from '../components/PageHeader.jsx';
import SearchInput from '../components/SearchInput.jsx';
import Pagination from '../components/Pagination.jsx';
import DataTable from '../components/registry/DataTable.jsx';
import RecordForm from '../components/registry/RecordForm.jsx';
import ConfirmDialog from '../components/registry/ConfirmDialog.jsx';
import PageTemplate from '../components/templates/PageTemplate.jsx';

const demoFields = [
  { key: 'name', label: 'Назва', type: 'text', required: true },
  { key: 'price', label: 'Ціна', type: 'money', required: true, min: 100 },
  { key: 'date', label: 'Дата', type: 'date' },
  { key: 'status', label: 'Статус', type: 'select', options: ['опубліковано', 'на модерації', 'відхилено'], badge: true },
  { key: 'active', label: 'Активний', type: 'bool' },
];
const demoRows = [
  { id: 1, name: 'DJI Mini 4 Pro', price: 1200, date: '2026-11-10', status: 'опубліковано', active: true },
  { id: 2, name: 'Mavic 3 Thermal', price: 2600, date: '2026-11-12', status: 'на модерації', active: true },
  { id: 3, name: 'Autel EVO II', price: 1200, date: '2026-11-15', status: 'відхилено', active: false },
];

function Section({ title, note, children }) {
  return (
    <section className="kit-sec">
      <div className="kit-sec__head"><h2>{title}</h2>{note && <p className="muted small">{note}</p>}</div>
      <div className="kit-sec__body">{children}</div>
    </section>
  );
}

export default function UiKit() {
  const [tab, setTab] = useState('a');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(2);
  const [modal, setModal] = useState(false);
  const [confirm, setConfirm] = useState(false);
  return (
    <PageTemplate className="uikit" crumbs={[['Головна', '#/'], ['Керування', '#/admin'], ['UI Kit']]} eyebrow="Бібліотека компонентів" title="UI Kit ДронПрокат" subtitle="Усі сторінки системи зібрано з цих компонентів. Зміна компонента одразу змінює його на всіх сторінках.">
      <Section title="Кольори" note="CSS-змінні з styles.css">
        <div className="swatches">
          {[['--ink', 'Основний'], ['--accent', 'Акцент'], ['--accent-soft', 'Акцент м’який'], ['--bg', 'Фон'], ['--ok', 'Успіх'], ['--warn', 'Увага'], ['--bad', 'Помилка'], ['--info', 'Інформація']].map(([v, l]) => (
            <div key={v} className="swatch"><span style={{ background: `var(${v})` }} /><b>{l}</b><code>{v}</code></div>
          ))}
        </div>
      </Section>
      <Section title="Button" note="Варіанти primary, ghost, danger і неактивний стан">
        <div className="row"><Button>Забронювати</Button><Button variant="ghost">Скасувати</Button><Button className="btn--danger">Видалити</Button><Button disabled>Неактивна</Button><button type="button" className="btn btn--ghost btn--sm">Мала кнопка</button></div>
      </Section>
      <Section title="Badge" note="Колір визначається статусом автоматично">
        <div className="row">{['опубліковано', 'на модерації', 'підтверджено', 'спірний', 'завершено', 'справна', 'пошкоджена'].map((s) => <Badge key={s}>{s}</Badge>)}</div>
      </Section>
      <Section title="Field, SearchInput" note="Поле з підписом і підказкою, пошук з кнопкою очищення">
        <div className="kit-grid">
          <Field label="Назва комплекту" hint="Щонайменше 5 символів"><input placeholder="DJI Mini 4 Pro" /></Field>
          <Field label="Пункт видачі"><select><option>Пункт «Позняки»</option></select></Field>
          <SearchInput value={q} onChange={setQ} placeholder="Пошук по всіх полях" />
        </div>
      </Section>
      <Section title="Tabs, Stepper, Pagination">
        <Tabs value={tab} onChange={setTab} tabs={[['a', 'Комплекти'], ['b', 'Доступність'], ['c', 'Виплати']]} />
        <Stepper steps={['Перевірка', 'Оплата і застава', 'Договір']} current={1} />
        <Pagination page={page} pages={4} onChange={setPage} />
      </Section>
      <Section title="Stars, Empty, DronePhoto">
        <div className="kit-grid"><div><Stars value={4.8} /><br /><Stars value={0} /></div><Empty title="Нічого не знайдено"><p className="muted">Змініть фільтри.</p></Empty><DronePhoto /></div>
      </Section>
      <Section title="DataTable" note="Пошук, сортування, сторінки, дії, CSV - для будь-якого набору полів">
        <DataTable fields={demoFields} rows={demoRows} exportName="демо" onEdit={() => setModal(true)} onDelete={() => setConfirm(true)} />
      </Section>
      <Section title="RecordForm" note="Форма будується з опису полів, перевірки працюють автоматично - натисніть «Додати запис» з порожніми полями">
        <div className="panel"><RecordForm fields={demoFields} rows={demoRows} onSave={() => setModal(false)} onCancel={() => {}} /></div>
      </Section>
      <Section title="Modal, ConfirmDialog">
        <div className="row"><Button variant="ghost" onClick={() => setModal(true)}>Відкрити Modal</Button><Button variant="ghost" onClick={() => setConfirm(true)}>Відкрити ConfirmDialog</Button></div>
      </Section>
      {modal && <Modal title="Приклад модального вікна" onClose={() => setModal(false)}><p>Закривається кнопкою, кліком поза вікном або клавішею Esc.</p></Modal>}
      {confirm && <ConfirmDialog title="Видалити запис?" text="Цю дію не можна скасувати." onConfirm={() => setConfirm(false)} onClose={() => setConfirm(false)} />}
    </PageTemplate>
  );
}
