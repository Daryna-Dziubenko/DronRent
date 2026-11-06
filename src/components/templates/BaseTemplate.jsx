import React from 'react';
import { useStore } from '../../store.jsx';
import Header from '../Header.jsx';
import FeedbackDialog from '../FeedbackDialog.jsx';

// Базовий шаблон - корінь ієрархії. Задає каркас, спільний для всіх сторінок:
// шапку, область вмісту з анімацією переходу, підвал, спливаюче повідомлення і вікно зворотного зв'язку.
// Сторінка (або похідний шаблон) підставляє лише вміст у слот children.
export default function BaseTemplate({ route, children }) {
  const { state } = useStore();
  return (
    <>
      <Header route={route} />
      <main className="main">
        <div key={route} className="route">{children}</div>
      </main>
      {state.toast && <div className="toast" role="status">{state.toast}</div>}
      <FeedbackDialog />
      <footer className="footer">
        <span>ДронПрокат - навчальний прототип, Дзюбенко Дарина</span>
      </footer>
    </>
  );
}
