import React from 'react';
import { useStore } from '../store.jsx';
import { Modal } from './ui.jsx';

// Універсальне вікно зворотного зв'язку після важливих дій: що сталося і куди перейти далі
export default function FeedbackDialog() {
  const { state, dispatch } = useStore();
  const fb = state.feedback;
  if (!fb) return null;
  const close = () => dispatch({ type: 'closeFeedback' });
  return (
    <Modal title={fb.title} onClose={close}>
      <div className="fb">
        <svg className="fb__icon" viewBox="0 0 52 52" aria-hidden="true">
          <circle cx="26" cy="26" r="24" />
          <path d="M15 27l7 7 15-15" />
        </svg>
        <p>{fb.text}</p>
        <div className="actions">
          {fb.actions.map((a, i) => (
            <a key={a.href} href={a.href} className={i === fb.actions.length - 1 ? 'btn btn--primary' : 'btn btn--ghost'} onClick={close}>{a.label}</a>
          ))}
        </div>
      </div>
    </Modal>
  );
}
