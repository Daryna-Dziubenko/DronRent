import React, { useEffect } from 'react';
import droneImg from '../assets/drone.jpg';

const STATUS_TONE = {
  'опубліковано': 'ok', 'підтверджено': 'info', 'активний': 'warn', 'завершено': 'muted', 'скасовано': 'muted',
  'спірний': 'bad', 'на модерації': 'warn', 'відхилено': 'bad', 'на ТО': 'bad', 'відкрито': 'bad', 'на розгляді': 'warn',
  'вирішено': 'ok', 'очікує': 'warn', 'прийнято': 'ok', 'відхилено оператором': 'bad', 'виплачено': 'ok',
  'справна': 'ok', 'зношена': 'warn', 'пошкоджена': 'bad', 'відсутня': 'bad', 'підтверджено ': 'ok', 'на перевірці': 'warn', 'немає': 'muted',
};

export function Badge({ children, tone }) {
  return <span className={`badge badge--${tone || STATUS_TONE[children] || 'muted'}`}>{children}</span>;
}

export function Button({ variant = 'primary', ...p }) {
  return <button type="button" {...p} className={`btn btn--${variant} ${p.className || ''}`} />;
}

export function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  );
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="modal__box" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3>{title}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрити">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map(([k, label]) => (
        <button key={k} role="tab" aria-selected={value === k} className={value === k ? 'tab tab--on' : 'tab'} onClick={() => onChange(k)}>{label}</button>
      ))}
    </div>
  );
}

export function Stars({ value }) {
  if (!value) return <span className="muted">нових відгуків ще немає</span>;
  return <span className="stars" aria-label={`Рейтинг ${value} з 5`}>★ {value.toFixed(1)}</span>;
}

export function Empty({ title, children }) {
  return (
    <div className="empty">
      <p className="empty__title">{title}</p>
      {children}
    </div>
  );
}

// Умовна ілюстрація квадрокоптера замість фото
// Фото дрона для оголошень (каталог, сторінка комплекту, мініатюри)
export function DronePhoto({ small }) {
  return <img src={droneImg} alt="" className={small ? 'drone-photo drone-photo--small' : 'drone-photo'} loading="lazy" />;
}

// Motors: [x, y, scale] - rear pair is higher and smaller for perspective
const MOTORS = [[38, 40, 0.8], [162, 40, 0.8], [22, 66, 1], [178, 66, 1]];

export function DroneArt({ small }) {
  const color = '#A3B35F';
  const id = React.useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 200 120" className={small ? 'drone drone--small' : 'drone'} aria-hidden="true">
      <defs>
        <linearGradient id={`b${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6A6A70" /><stop offset=".5" stopColor="#3A3A3E" /><stop offset="1" stopColor="#1D1D1F" />
        </linearGradient>
        <radialGradient id={`p${id}`}><stop offset="0" stopColor="#fff" stopOpacity=".35" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="100" cy="112" rx="58" ry="4" fill="#000" opacity=".35" />
      {/* arms */}
      <g stroke="#2C2C2F" strokeWidth="6" strokeLinecap="round">
        <line x1="80" y1="52" x2="38" y2="42" /><line x1="120" y1="52" x2="162" y2="42" />
        <line x1="78" y1="60" x2="22" y2="68" /><line x1="122" y1="60" x2="178" y2="68" />
      </g>
      <g stroke="#4A4A4F" strokeWidth="1.5" strokeLinecap="round">
        <line x1="78" y1="58" x2="24" y2="66" /><line x1="122" y1="58" x2="176" y2="66" />
      </g>
      {/* motors + blurred props */}
      {MOTORS.map(([x, y, s]) => (
        <g key={x} transform={`translate(${x} ${y}) scale(${s})`}>
          <ellipse cx="0" cy="-7" rx="30" ry="4" fill={`url(#p${id})`} />
          <rect x="-26" y="-8.5" width="52" height="2.4" rx="1.2" fill="#9A9AA0" opacity=".55" />
          <rect x="-6" y="-6" width="12" height="9" rx="2.5" fill="#2C2C2F" />
          <rect x="-6" y="-3" width="12" height="2" fill={color} />
          <line x1="0" y1="3" x2="0" y2="16" stroke="#2C2C2F" strokeWidth="2.4" />
        </g>
      ))}
      {/* body */}
      <path d="M72 50 Q100 36 128 50 L132 64 Q100 74 68 64 Z" fill={`url(#b${id})`} />
      <path d="M80 48 Q100 40 120 48" stroke="#8A8A90" strokeWidth="1.2" fill="none" />
      <rect x="88" y="58" width="24" height="3" rx="1.5" fill={color} />
      <circle cx="76" cy="58" r="1.6" fill={color} /><circle cx="124" cy="58" r="1.6" fill={color} />
      {/* gimbal + camera */}
      <rect x="96" y="68" width="8" height="6" fill="#2C2C2F" />
      <rect x="88" y="74" width="24" height="17" rx="5" fill="#2C2C2F" />
      <circle cx="100" cy="82.5" r="6.5" fill="#1D1D1F" stroke="#6A6A70" strokeWidth="1.5" />
      <circle cx="100" cy="82.5" r="2.6" fill={color} opacity=".85" />
      <circle cx="98" cy="81" r="1" fill="#fff" opacity=".7" />
      {/* landing gear */}
      <g stroke="#2C2C2F" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M82 66 L74 104 M118 66 L126 104" /><path d="M64 104 H86 M114 104 H136" />
      </g>
    </svg>
  );
}

export function Stepper({ steps, current }) {
  return (
    <ol className="stepper">
      {steps.map((s, i) => (
        <li key={s} className={i < current ? 'step step--done' : i === current ? 'step step--on' : 'step'}>
          <span className="step__n">{i < current ? '✓' : i + 1}</span>{s}
        </li>
      ))}
    </ol>
  );
}
