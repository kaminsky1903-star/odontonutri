import { useEffect, useId, useRef, useState } from "react";
import { CLINIC_TIME_ZONE } from "../site";
import type { DailyVisit } from "./analyticsTypes";

const dateLabel = (date: string) => new Intl.DateTimeFormat("es-AR", {
  timeZone: CLINIC_TIME_ZONE, day: "numeric", month: "short",
}).format(new Date(date));

export function TrendChart({ points, pending = false, periodLabel, uniqueVisitors }: {
  points: (DailyVisit & { contacts?: number })[]; pending?: boolean; periodLabel?: string; uniqueVisitors?: number;
}) {
  const [days, setDays] = useState<7 | 30>(7);
  const [selected, setSelected] = useState<string | null>(null);
  const gradient = useId();
  const contactGradient = useId();
  const container = useRef<HTMLElement>(null);
  const [width, setWidth] = useState(720);
  useEffect(() => {
    if (!container.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(260, Math.min(720, entry.contentRect.width))));
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  const plotWidth = width - 70;
  const series = periodLabel ? points : points.slice(-days);
  const active = series.findIndex(point => point.date === selected);
  const index = active >= 0 ? active : series.length - 1;
  const current = series[index];
  const total = series.reduce((sum, point) => sum + point.value, 0);
  const max = Math.max(4, Math.ceil(Math.max(0, ...series.map(point => Math.max(point.value, point.contacts ?? 0))) / 4) * 4);
  const coords = series.map((point, i) => ({
    ...point, x: 46 + (series.length > 1 ? i / (series.length - 1) : 0.5) * plotWidth,
    y: 210 - point.value / max * 180,
  }));
  // Horizontal control points keep each curve within its two recorded values.
  const line = coords.map((point, i) => {
    if (!i) return `M ${point.x} ${point.y}`;
    const prev = coords[i - 1];
    const middle = (prev.x + point.x) / 2;
    return `C ${middle} ${prev.y}, ${middle} ${point.y}, ${point.x} ${point.y}`;
  }).join(" ");
  const chosen = coords[index];
  const contactLine = coords.map((point, i) => {
    const y = 210 - (point.contacts ?? 0) / max * 180;
    if (!i) return `M ${point.x} ${y}`;
    const prev = coords[i - 1];
    const middle = (prev.x + point.x) / 2;
    return `C ${middle} ${210 - (prev.contacts ?? 0) / max * 180}, ${middle} ${y}, ${point.x} ${y}`;
  }).join(" ");
  const unit = periodLabel ? "visitantes" : "sesiones";

  return <section ref={container} className="admin-panel admin-trend" aria-label="Evolución de visitas">
    <div className="admin-trend-heading">
      <div><h2>Evolución de visitas</h2><p>{periodLabel ? "Visitantes y contactos únicos por día" : "Sesiones por día"} · horario de Argentina</p></div>
      {!periodLabel && <div className="admin-range-actions" role="group" aria-label="Período del gráfico">
        {([7, 30] as const).map(value => <button key={value} type="button"
          aria-pressed={days === value} className={days === value ? "is-active" : undefined}
          onClick={() => { setDays(value); setSelected(null); }}>
          {value === 7 ? "7 días" : "1 mes"}
        </button>)}
      </div>}
    </div>
    {pending ? <p className="admin-empty">Analíticas pendientes de conexión</p> : <>
      <div className="admin-trend-summary"><strong>{uniqueVisitors ?? total}</strong><span>{periodLabel ? "visitantes únicos en el período" : `sesiones acumuladas en ${days} días`}</span></div>
      <p className="admin-trend-dates">{series.length ? `${dateLabel(series[0].date)} — ${dateLabel(series[series.length - 1].date)}` : "Sin datos"}</p>
      {periodLabel && <div className="admin-trend-legend" aria-hidden="true"><span className="is-visitors">Visitantes</span><span className="is-contacts">Contactos</span></div>}
      {series.length > 0 && <>
        <div className="admin-trend-detail" aria-live="polite">{current && <><span>{dateLabel(current.date)}</span><strong>{current.value} {unit}{periodLabel ? ` · ${current.contacts ?? 0} contactos` : ""}</strong></>}</div>
        <svg className="admin-trend-svg" viewBox={`0 0 ${width} 250`} role="img" aria-label={periodLabel ? `Visitantes y contactos: ${periodLabel}` : `Sesiones diarias de los últimos ${days} días`}>
          <defs>
            <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#56836b" stopOpacity="0.3"/><stop offset="100%" stopColor="#56836b" stopOpacity="0.015"/></linearGradient>
            <linearGradient id={contactGradient} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b57b42" stopOpacity="0.12"/><stop offset="100%" stopColor="#b57b42" stopOpacity="0"/></linearGradient>
            <filter id={`${gradient}-shadow`} x="-10%" y="-20%" width="120%" height="150%"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#294b3a" floodOpacity="0.12"/></filter>
          </defs>
          {[0, 1, 2, 3, 4].map(tick => <g key={tick}><line x1="46" x2={width - 24} y1={210 - tick * 45} y2={210 - tick * 45} stroke="#e6eae3" strokeDasharray="3 5"/><text x="32" y={215 - tick * 45} textAnchor="end">{max * tick / 4}</text></g>)}
          <path d={`${line} L ${coords[coords.length - 1].x} 210 L ${coords[0].x} 210 Z`} fill={`url(#${gradient})`}/>
          <path d={line} fill="none" stroke="#3f6b53" strokeWidth="3.5" strokeLinecap="round" filter={`url(#${gradient}-shadow)`}/>
          {periodLabel && <path d={contactLine} fill="none" stroke="#b57b42" strokeWidth="2.75" strokeLinecap="round" strokeDasharray="7 5"/>}
          {chosen && <line x1={chosen.x} x2={chosen.x} y1="24" y2="210" stroke="#9eaf9d" strokeDasharray="4 4"/>}
          {coords.map((point, i) => <g key={point.date}>
            <circle cx={point.x} cy={point.y} r={i === index ? 5.5 : 3.25} fill={i === index ? "#3f6b53" : "#fff"} stroke="#3f6b53" strokeWidth="2"/>
            {(i === 0 || i === coords.length - 1 || i === Math.floor((coords.length - 1) / 2)) && <text x={point.x} y="240" textAnchor={i === 0 ? "start" : i === coords.length - 1 ? "end" : "middle"}>{dateLabel(point.date)}</text>}
            <rect x={point.x - plotWidth / Math.max(1, series.length - 1) / 2} y="20" width={plotWidth / Math.max(1, series.length - 1)} height="195" fill="transparent" onPointerMove={() => setSelected(point.date)} onClick={() => setSelected(point.date)}><title>{dateLabel(point.date)}: {point.value} {unit} · {point.contacts ?? 0} contactos</title></rect>
          </g>)}
        </svg>
        <label className="admin-trend-scrubber">Explorar día
          <input type="range" min="0" max={series.length - 1} value={index} onChange={event => setSelected(series[Number(event.target.value)].date)} aria-valuetext={`${dateLabel(current.date)}: ${current.value} ${unit}${periodLabel ? `, ${current.contacts ?? 0} contactos` : ""}`}/>
        </label>
      </>}
      {total === 0 && <p className="admin-empty">Sin visitas registradas en este período.</p>}
      <p className="admin-trend-note">{periodLabel ? "Verde: visitantes · Ocre discontinuo: visitantes que hicieron contacto. Un visitante puede aparecer en varios días; el total del período se cuenta una sola vez." : "Cada punto representa un día. Una persona puede generar más de una sesión. 1 mes muestra los últimos 30 días, incluido hoy."}</p>
    </>}
  </section>;
}
