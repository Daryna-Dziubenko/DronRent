import React from 'react';
import PageTemplate from './PageTemplate.jsx';
import { Tabs } from '../ui.jsx';

// Шаблон кабінету (успадковує PageTemplate): додає вкладки і плавну зміну їх вмісту
export default function CabinetTemplate({ tabs, tab, onTab, children, ...page }) {
  return (
    <PageTemplate className="cabinet" {...page}>
      {tabs && <Tabs value={tab} onChange={onTab} tabs={tabs} />}
      <div key={tab} className="tab-panel">{children}</div>
    </PageTemplate>
  );
}
