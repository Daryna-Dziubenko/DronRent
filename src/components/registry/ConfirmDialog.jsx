import React from 'react';
import { Modal, Button } from '../ui.jsx';

export default function ConfirmDialog({ title, text, blocked, confirmLabel = 'Видалити', onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p>{text}</p>
      {blocked && <p className="book__warn">{blocked}</p>}
      <div className="actions">
        <Button variant="ghost" onClick={onClose}>{blocked ? 'Зрозуміло' : 'Скасувати'}</Button>
        {!blocked && <Button className="btn--danger" onClick={onConfirm}>{confirmLabel}</Button>}
      </div>
    </Modal>
  );
}
