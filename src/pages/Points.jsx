import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useStore } from '../store.jsx';
import { points as SEED } from '../data/mock.js';
import CabinetTemplate from '../components/templates/CabinetTemplate.jsx';

// Координати беремо з демо-даних: збережений у браузері стан може бути старішим і без них
const coords = (p) => {
  const s = SEED.find((x) => x.id === p.id);
  return [p.lat ?? s?.lat, p.lng ?? s?.lng];
};

const pinIcon = (label, on) => L.divIcon({
  className: '',
  html: `<span class="map__pin${on ? ' map__pin--on' : ''}"><i></i>${label}</span>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

export default function Points() {
  const { state } = useStore();
  const box = useRef(null);
  const map = useRef(null);
  const markers = useRef({});
  const [active, setActive] = useState(null);

  useEffect(() => {
    const m = L.map(box.current, { scrollWheelZoom: false, zoomControl: true });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(m);
    const latlngs = state.points.map((p) => {
      const ll = coords(p);
      const mk = L.marker(ll, { icon: pinIcon(p.name.replace('Пункт ', ''), false) })
        .addTo(m)
        .bindPopup(`<b>${p.name}</b><br>${p.address}<br><span style="color:#76767C">${p.hours}</span>`)
        .on('click', () => setActive(p.id));
      markers.current[p.id] = mk;
      return ll;
    });
    m.fitBounds(latlngs, { padding: [50, 50] });
    map.current = m;
    return () => { m.remove(); markers.current = {}; };
  }, [state.points]);

  useEffect(() => {
    state.points.forEach((p) => markers.current[p.id]?.setIcon(pinIcon(p.name.replace('Пункт ', ''), p.id === active)));
  }, [active, state.points]);

  const focus = (p) => {
    setActive(p.id);
    map.current?.flyTo(coords(p), 15, { duration: 0.8 });
    markers.current[p.id]?.openPopup();
  };

  return (
    <CabinetTemplate crumbs={[['Головна', '#/'], ['Пункти видачі']]} title="Пункти видачі" subtitle="Тут ви отримуєте й повертаєте комплект. Працівник перевіряє кожну позицію разом з вами.">
      <div className="two-col two-col--map">
        <div className="map" ref={box} aria-label="Карта Києва з пунктами видачі" />
        <ul className="points">
          {state.points.map((p) => {
            const [lat, lng] = coords(p);
            return (
              <li key={p.id} className={p.id === active ? 'panel point point--on' : 'panel point'}>
                <button type="button" className="point__btn" onClick={() => focus(p)}>
                  <b>{p.name}</b>
                  <span>{p.address}</span>
                  <span className="muted">{p.hours} · {p.phone}</span>
                  <span className="small">Комплектів тут: {state.kits.filter((k) => k.pointId === p.id && k.status === 'опубліковано').length}</span>
                </button>
                <a className="small" href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`} target="_blank" rel="noreferrer">Прокласти маршрут ↗</a>
              </li>
            );
          })}
        </ul>
      </div>
    </CabinetTemplate>
  );
}
