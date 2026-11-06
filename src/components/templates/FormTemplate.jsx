import React from 'react';
import PageTemplate from './PageTemplate.jsx';
import { Stepper } from '../ui.jsx';

// Шаблон форми (успадковує PageTemplate): посилання назад, необов'язкові кроки процесу
export default function FormTemplate({ steps, step, className = '', children, ...page }) {
  return (
    <PageTemplate className={`form-tpl ${className}`} {...page}>
      {steps && <Stepper steps={steps} current={step} />}
      {children}
    </PageTemplate>
  );
}
