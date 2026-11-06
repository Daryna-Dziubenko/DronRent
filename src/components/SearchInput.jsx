import React from 'react';

export default function SearchInput({ value, onChange, placeholder = 'Пошук' }) {
  return (
    <label className="search-input">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      <span className="sr-only">{placeholder}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      {value && <button type="button" className="search-input__clear" onClick={() => onChange('')} aria-label="Очистити пошук">✕</button>}
    </label>
  );
}
