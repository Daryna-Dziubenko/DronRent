import React, { useEffect, useState } from 'react';
import { StoreProvider, useStore } from './store.jsx';
import BaseTemplate from './components/templates/BaseTemplate.jsx';
import Catalog from './pages/Catalog.jsx';
import KitPage from './pages/KitPage.jsx';
import Checkout from './pages/Checkout.jsx';
import Renter from './pages/Renter.jsx';
import Owner from './pages/Owner.jsx';
import KitEditor from './pages/KitEditor.jsx';
import Operator from './pages/Operator.jsx';
import Desk from './pages/Desk.jsx';
import Act from './pages/Act.jsx';
import Admin from './pages/Admin.jsx';
import Points from './pages/Points.jsx';
import Login from './pages/Login.jsx';
import Registry from './pages/Registry.jsx';
import UiKit from './pages/UiKit.jsx';

function useHash() {
  const [h, setH] = useState(location.hash || '#/');
  useEffect(() => {
    const f = () => { setH(location.hash || '#/'); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return h;
}

// Сторінки, доступні кожній ролі (гість бачить лише відкриту частину)
const ACCESS = { renter: 'renter', owner: 'owner', 'owner/new': 'owner', operator: 'operator', desk: 'employee', act: 'employee', admin: 'admin', registry: 'admin', checkout: 'renter' };

function Router() {
  const hash = useHash();
  const { state } = useStore();
  const [path, query = ''] = hash.slice(2).split('?');
  const parts = path.split('/');
  const q = Object.fromEntries(new URLSearchParams(query));
  const need = ACCESS[path] || ACCESS[parts[0]];
  const allowed = !need || state.role === need || (need === 'renter' && state.role === 'owner');

  let page;
  if (!allowed) page = <Login need={need} />;
  else if (path === '') page = <Catalog />;
  else if (parts[0] === 'kit') page = <KitPage id={Number(parts[1])} />;
  else if (path === 'checkout') page = <Checkout q={q} />;
  else if (path === 'renter') page = <Renter />;
  else if (path === 'owner') page = <Owner />;
  else if (path === 'owner/new') page = <KitEditor />;
  else if (path === 'operator') page = <Operator />;
  else if (path === 'desk') page = <Desk />;
  else if (parts[0] === 'act') page = <Act id={Number(parts[1])} kind={parts[2]} />;
  else if (path === 'admin') page = <Admin />;
  else if (parts[0] === 'registry') page = <Registry key={parts[1]} regKey={parts[1]} />;
  else if (path === 'ui-kit') page = <UiKit />;
  else if (path === 'points') page = <Points />;
  else if (path === 'login') page = <Login />;
  else page = <Catalog />;

  // Кожна сторінка вставляється в базовий шаблон; ключ route запускає анімацію переходу
  return <BaseTemplate route={'#/' + path}>{page}</BaseTemplate>;
}

export default function App() {
  return <StoreProvider><Router /></StoreProvider>;
}
