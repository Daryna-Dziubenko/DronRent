import React, { useState } from 'react';
import { useStore } from '../store.jsx';
import { Modal, Button } from '../components/ui.jsx';
import RegistryTemplate from '../components/templates/RegistryTemplate.jsx';
import DataTable from '../components/registry/DataTable.jsx';
import RecordForm from '../components/registry/RecordForm.jsx';
import ConfirmDialog from '../components/registry/ConfirmDialog.jsx';
import RegistrySidebar from '../components/registry/RegistrySidebar.jsx';
import { REGISTRIES, findRegistry, rowsOf, labelOf } from '../data/registry.js';
import { plural } from '../utils.js';

// Одна сторінка обслуговує всі реєстри: що показувати, визначає опис із data/registry.js
export default function Registry({ regKey }) {
  const { state, dispatch } = useStore();
  const reg = findRegistry(regKey) || REGISTRIES[0];
  const rows = rowsOf(state, reg);
  const [edit, setEdit] = useState(null); // null | {} (новий) | запис
  const [del, setDel] = useState(null);
  const [flash, setFlash] = useState(null); // рядок, який підсвічується після додавання чи редагування
  const [removing, setRemoving] = useState(null); // рядок, що плавно зникає перед видаленням

  const links = (row) => (reg.usedBy || [])
    .map(([coll, fk, word]) => [state[coll].filter((x) => x[fk] === row.id).length, word])
    .filter(([n]) => n > 0);

  const save = (data) => {
    if (edit.id) {
      dispatch({ type: 'crudUpdate', coll: reg.key, id: edit.id, item: data, toastText: 'Зміни збережено' });
      setFlash(edit.id);
      setTimeout(() => setFlash(null), 2600);
    } else {
      const id = Math.max(0, ...state[reg.key].map((x) => Number(x.id) || 0)) + 1;
      dispatch({ type: 'crudAdd', coll: reg.key, item: data, toastText: 'Запис додано' });
      setFlash(id);
      setTimeout(() => setFlash(null), 2600);
    }
    setEdit(null);
  };

  const blocked = del && links(del).length ? `Не можна видалити: на цей запис посилаються ${links(del).map(([n, w]) => `${n} ${plural(n, ...w)}`).join(', ')}. Спочатку змініть або видаліть їх.` : null;

  return (
    <>
      <RegistryTemplate
          sidebar={<RegistrySidebar current={reg.key} />}
          crumbs={[['Головна', '#/'], ['Керування', '#/admin'], ['Реєстри', '#/registry/kits'], [reg.title]]}
          eyebrow="Реєстр даних"
          title={reg.title}
          subtitle={reg.readOnly ? 'Записи формуються під час оренди, тут їх можна переглянути, знайти й вивантажити.' : 'Перегляд, пошук, додавання, редагування й видалення записів.'}
          actions={!reg.readOnly && <Button onClick={() => setEdit({})}>+ Новий запис</Button>}
      >
        <DataTable key={reg.key} fields={reg.fields} rows={rows} readOnly={reg.readOnly} exportName={reg.title} flash={flash} removing={removing} onEdit={(r) => setEdit(r)} onDelete={(r) => setDel(r)} />
      </RegistryTemplate>

      {edit && (
        <Modal title={edit.id ? `Редагування: ${labelOf(state, reg.key, edit.id)}` : `Новий запис - ${reg.title.toLowerCase()}`} onClose={() => setEdit(null)}>
          <RecordForm fields={reg.fields} initial={edit.id ? edit : null} rows={rows} onSave={save} onCancel={() => setEdit(null)} />
        </Modal>
      )}
      {del && (
        <ConfirmDialog
          title="Видалити запис?"
          text={`«${labelOf(state, reg.key, del.id)}» буде видалено з реєстру «${reg.title}». Цю дію не можна скасувати.`}
          blocked={blocked}
          onConfirm={() => {
            const id = del.id;
            setDel(null);
            setRemoving(id);
            setTimeout(() => { dispatch({ type: 'crudDelete', coll: reg.key, id, toastText: 'Запис видалено' }); setRemoving(null); }, 380);
          }}
          onClose={() => setDel(null)}
        />
      )}
    </>
  );
}
