import { useEffect, useMemo, useState, type ReactNode } from "react";
import { SITE_NAME, CLINIC_TIME_ZONE } from "../site";
import { fetchAnalyticsSnapshot, ignoreStaffVisitor } from "./analyticsService";
import {
  ANALYTICS_PENDING_MESSAGE,
  EMPTY_ANALYTICS,
  type AnalyticsSnapshot,
  type HourStat,
  type RecentActivity,
} from "./analyticsTypes";
import { TrendChart } from "./TrendChart";
import { useAuth } from "./AuthContext";
import { recentActivity } from "../analytics/summary";
import { buildReport, clinicDate, type Period, type Breakdown } from "../analytics/report";

function displayValue(value: number | null) {
  if (value === null) {
    return "—";
  }
  return String(value);
}

function displayPercent(value: number | null) {
  if (value === null) {
    return "—";
  }
  return `${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 }).format(value)}%`;
}

function LineIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function PeopleIcon() {
  return (
    <LineIcon>
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="3" />
      <path d="M20 21v-2a3.5 3.5 0 0 0-2.6-3.4" />
      <path d="M16.5 4.2a3 3 0 0 1 0 5.6" />
    </LineIcon>
  );
}

function PersonIcon() {
  return (
    <LineIcon>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </LineIcon>
  );
}

function PhoneIcon() {
  return (
    <LineIcon>
      <path d="M7.2 3.8h3.1l1.1 3.2-1.9 1.2a12.6 12.6 0 0 0 6.3 6.3l1.2-1.9 3.2 1.1v3.1c0 .7-.6 1.4-1.4 1.4C10.6 18.2 5.8 13.4 5.8 5.2c0-.8.7-1.4 1.4-1.4Z" />
    </LineIcon>
  );
}

function PinIcon() {
  return (
    <LineIcon>
      <path d="M12 21s6.5-5.3 6.5-11A6.5 6.5 0 0 0 5.5 10c0 5.7 6.5 11 6.5 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </LineIcon>
  );
}

function TrendIcon() {
  return (
    <LineIcon>
      <path d="M4 16.5 10 10l4 3.5 6-8" />
      <path d="M15 5.5h5v5" />
    </LineIcon>
  );
}

function LogoutIcon() {
  return (
    <LineIcon>
      <path d="M10 4.5H7.5A2.5 2.5 0 0 0 5 7v10a2.5 2.5 0 0 0 2.5 2.5H10" />
      <path d="M10 12h9" />
      <path d="m15.5 8.5 3.5 3.5-3.5 3.5" />
    </LineIcon>
  );
}

function VisitIcon() {
  return (
    <LineIcon>
      <path d="M8 16 16 8" />
      <path d="M9.5 8H16v6.5" />
    </LineIcon>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
      />
    </svg>
  );
}

function actionIcon(action: string) {
  if (action === "WhatsApp") {
    return <WhatsAppIcon />;
  }
  if (action === "Teléfono") {
    return <PhoneIcon />;
  }
  if (action === "Ubicación") {
    return <PinIcon />;
  }
  return <VisitIcon />;
}

function MetricCard({
  label,
  value,
  pending,
  icon,
  periodControls,
}: {
  label: string;
  value: string;
  pending: boolean;
  icon: ReactNode;
  periodControls?: ReactNode;
}) {
  return (
    <article className="admin-metric">
      <span className="admin-icon-tile">{icon}</span>
      <p className="admin-metric-label">{label}</p>
      <p className="admin-metric-value">{value}</p>
      {periodControls}
      {pending ? (
        <p className="admin-metric-note">{ANALYTICS_PENDING_MESSAGE}</p>
      ) : null}
    </article>
  );
}

function StatList({
  title,
  pending,
  empty,
  children,
  periodControls,
}: {
  title: string;
  pending: boolean;
  empty: boolean;
  children: ReactNode;
  periodControls?: ReactNode;
}) {
  return (
    <section className="admin-panel">
      <h2>{title}</h2>
      {periodControls}
      {pending ? (
        <p className="admin-empty">{ANALYTICS_PENDING_MESSAGE}</p>
      ) : empty ? (
        <p className="admin-empty">Todavía no hay datos.</p>
      ) : (
        children
      )}
    </section>
  );
}

function HourChart({ hours }: { hours: HourStat[] }) {
  const max = Math.max(1, ...hours.map((item) => item.value));
  return (
    <div
      className="admin-hours"
      role="img"
      aria-label="Clics de WhatsApp de 8 a 22, horario de Argentina"
    >
      <div className="admin-hours-bars">
        {hours.map((item) => (
          <span
            key={item.hour}
            className="admin-hours-bar"
            style={{
              height: `${Math.max(item.value > 0 ? 12 : 4, (item.value / max) * 100)}%`,
            }}
            title={`${String(item.hour).padStart(2, "0")}:00 · ${item.value}`}
          />
        ))}
      </div>
      <div className="admin-hours-axis" aria-hidden="true">
        {hours.map((item) => (
          <span key={item.hour}>{item.hour}</span>
        ))}
      </div>
    </div>
  );
}

function peakWhatsAppCopy(hours: HourStat[]) {
  const max = Math.max(0, ...hours.map((item) => item.value));
  if (max <= 0) {
    return null;
  }
  const peaks = hours.filter((item) => item.value === max);
  if (peaks.length !== 1) {
    return "Hay varios horarios con la misma cantidad de clics.";
  }
  return `Más WhatsApp a las ${String(peaks[0].hour).padStart(2, "0")}:00.`;
}

function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: CLINIC_TIME_ZONE,
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatDuration(minutes: number | null) {
  if (minutes === null) {
    return null;
  }
  if (minutes < 1) {
    return "menos de 1 min";
  }
  if (minutes === 1) {
    return "1 min";
  }
  return `${minutes} min`;
}

function specialtiesLooked(pages: string[]) {
  const odonto = pages.includes("Odontología");
  const nutri = pages.includes("Nutrición");
  if (odonto && nutri) {
    return "Vio Odontología y Nutrición";
  }
  if (odonto) {
    return "Vio Odontología";
  }
  if (nutri) {
    return "Vio Nutrición";
  }
  return null;
}

function contactDetail(item: RecentActivity) {
  const parts: string[] = [];
  if (item.landing) {
    parts.push(`Entró por ${item.landing}`);
  }
  if (item.pages.length > 0) {
    parts.push(`Recorrido: ${item.pages.join(" → ")}`);
  }
  const duration = formatDuration(item.durationMinutes);
  if (duration) {
    parts.push(`${duration} hasta el clic (tiempo transcurrido)`);
  }
  if (item.pages.length === 1) {
    parts.push("1 página");
  } else if (item.pages.length > 1) {
    parts.push(`${item.pages.length} páginas`);
  }
  const specialties = specialtiesLooked(item.pages);
  if (specialties) {
    parts.push(specialties);
  }
  return parts.join(" · ");
}

function activityDetail(item: RecentActivity) {
  const parts: string[] = [];
  if (item.visitorLabel) {
    parts.push(
      item.visitCount >= 2
        ? `Visitante ${item.visitorLabel} · ${item.visitCount} visitas`
        : `Visitante ${item.visitorLabel}`,
    );
  }
  if (item.isContact) {
    const contact = contactDetail(item);
    if (contact) {
      parts.push(contact);
    }
  }
  return parts.join(" · ");
}

function ActivityList({
  items,
  onIgnore,
}: {
  items: RecentActivity[];
  onIgnore: (visitorId: string) => void;
}) {
  const offered = new Set<string>();
  return (
    <div className="admin-activity-table">
      <div className="admin-activity-head" aria-hidden="true">
        <span>Fecha y hora</span>
        <span>Acción</span>
        <span>Página</span>
        <span>Fuente</span>
        <span>Ubicación aproximada</span>
        <span>Dispositivo</span>
      </div>
      <ul className="admin-activity-list">
        {items.map((item) => {
          const detail = activityDetail(item);
          const visitorId = item.visitorId;
          const showIgnore = Boolean(visitorId) && !offered.has(visitorId ?? "");
          if (visitorId) {
            offered.add(visitorId);
          }
          return (
            <li key={item.id}>
              <div className="admin-activity-row">
                <time dateTime={item.at}>{formatWhen(item.at)}</time>
                <span className="admin-activity-action">
                  <span className="admin-activity-action-icon">{actionIcon(item.action)}</span>
                  <strong>{item.action}</strong>
                </span>
                <span>{item.page}</span>
                <span>{item.source}</span>
                <span className="admin-activity-location">
                  {item.location ? (
                    <>
                      <PinIcon />
                      {item.location}
                    </>
                  ) : (
                    "—"
                  )}
                </span>
                <span>{item.device}</span>
              </div>
              {detail ? <p className="admin-activity-detail">{detail}</p> : null}
              {showIgnore && visitorId ? (
                <button
                  type="button"
                  className="admin-activity-ignore"
                  onClick={() => onIgnore(visitorId)}
                  aria-label={`Soy yo, no contar visitante ${item.visitorLabel ?? ""}`.trim()}
                >
                  Soy yo
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function BreakdownTable({ title, items, pending, note, periodControls }: { title: string; items: Breakdown[]; pending: boolean; note?: string; periodControls?: ReactNode }) {
  return <StatList title={title} pending={pending} empty={!items.length} periodControls={periodControls}>
    {note && <p className="admin-empty">{note}</p>}
    <div className="admin-report-table-wrap" tabIndex={0} role="region" aria-label={title}>
      <table className="admin-report-table"><thead><tr><th scope="col">Detalle</th><th scope="col">Visitantes</th><th scope="col">Contactos únicos</th><th scope="col">Clics</th><th scope="col">Conversión</th></tr></thead>
      <tbody>{items.map(item => <tr key={item.name}><th scope="row">{item.name}</th><td>{item.visitors}</td><td>{item.contacts}</td><td>{item.clicks}</td><td>{displayPercent(item.conversion)}</td></tr>)}</tbody></table>
    </div>
  </StatList>;
}

type QuickPeriod = "today" | "7d" | "30d";
type PanelId = "visitors" | "sessions" | "whatsapp" | "phone" | "location" | "conversion" | "trend" | "sources" | "entries" | "pages" | "devices" | "locations" | "pageViews" | "hours" | "activity";
const PANEL_PERIODS_STORAGE_KEY = "odontonutri_admin_panel_periods_v1";
const DEFAULT_PANEL_PERIODS: Record<PanelId, QuickPeriod> = { visitors: "today", sessions: "today", whatsapp: "today", phone: "today", location: "today", conversion: "today", trend: "7d", sources: "30d", entries: "today", pages: "30d", devices: "30d", locations: "30d", pageViews: "30d", hours: "30d", activity: "today" };

function savedPanelPeriods(): Record<PanelId, QuickPeriod> {
  const saved = { ...DEFAULT_PANEL_PERIODS };
  try {
    const value: unknown = JSON.parse(localStorage.getItem(PANEL_PERIODS_STORAGE_KEY) ?? "null");
    if (!value || typeof value !== "object") return saved;
    for (const panel of Object.keys(saved) as PanelId[]) {
      const period = (value as Record<string, unknown>)[panel];
      if (period === "today" || period === "7d" || period === "30d") saved[panel] = period;
    }
  } catch { /* The panel works without local storage. */ }
  return saved;
}

function quickPeriod(preset: QuickPeriod): Period {
  const today = clinicDate();
  return { preset, from: today, to: today };
}

function PeriodShortcuts({ active, onSelect }: { active: QuickPeriod; onSelect: (preset: QuickPeriod) => void }) {
  return <div className="admin-card-period" role="group" aria-label="Resumen del período">
    <span>Resumen del período</span>
    {([['today', 'Hoy'], ['7d', '7 días'], ['30d', '1 mes']] as const).map(([preset, label]) => <button type="button" key={preset} className={active === preset ? "is-active" : undefined} aria-pressed={active === preset} onClick={() => onSelect(preset)}>{label}</button>)}
  </div>;
}

export function AdminDashboard() {
  const { session, signOut } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot>(EMPTY_ANALYTICS);
  const [panelPeriods, setPanelPeriods] = useState<Record<PanelId, QuickPeriod>>(savedPanelPeriods);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ignoring, setIgnoring] = useState(false);
  const reports = useMemo(() => ({ today: buildReport(analytics.events ?? [], quickPeriod("today")), "7d": buildReport(analytics.events ?? [], quickPeriod("7d")), "30d": buildReport(analytics.events ?? [], quickPeriod("30d")) }), [analytics]);
  const reportFor = (panel: PanelId) => reports[panelPeriods[panel]];
  const chartReport = reports[panelPeriods.trend === "today" ? "7d" : panelPeriods.trend];
  const pending = loading || analytics.status !== "ready";
  const activityReport = reportFor("activity");
  const visibleActivity = useMemo(() => recentActivity(activityReport?.events ?? [], new Date()), [activityReport]);
  const whatsappPeak = peakWhatsAppCopy(reportFor("hours")?.hours ?? []);
  const periodControls = (panel: PanelId) => <PeriodShortcuts active={panelPeriods[panel]} onSelect={preset => setPanelPeriods(value => ({ ...value, [panel]: preset }))}/>;

  useEffect(() => {
    try { localStorage.setItem(PANEL_PERIODS_STORAGE_KEY, JSON.stringify(panelPeriods)); } catch { /* The panel works without local storage. */ }
  }, [panelPeriods]);

  useEffect(() => {
    if (!session?.access_token) return;
    let cancelled = false;
    setLoading(true);
    fetchAnalyticsSnapshot().then(snapshot => {
      if (!cancelled) { setAnalytics(snapshot); setLoading(false); }
    }).catch(() => { if (!cancelled) { setAnalytics({ ...EMPTY_ANALYTICS, message: "No se pudieron cargar las métricas." }); setLoading(false); } });
    return () => { cancelled = true; };
  }, [session?.access_token, refresh]);

  async function hideVisitor(visitorId: string) {
    if (ignoring) return;
    setIgnoring(true);
    try { await ignoreStaffVisitor(visitorId); setRefresh(value => value + 1); }
    finally { setIgnoring(false); }
  }
  const metric = (value: number | null | undefined) => pending ? "—" : displayValue(value ?? null);

  return <div className="admin-dashboard">
    <header className="admin-topbar">
      <div className="admin-brand">
        <a className="admin-home-link" href="/" aria-label="Ir al inicio"><img src="/logo.png" alt="" width={40} height={40}/></a>
        <div><p className="admin-kicker">{SITE_NAME}</p><h1>Panel de analíticas</h1></div>
      </div>
      <div className="admin-session"><p className="admin-session-email">{session?.user.email ?? ""}</p><button type="button" className="admin-signout" disabled={loading} onClick={() => setRefresh(value => value + 1)}>Actualizar</button><button type="button" className="admin-signout" onClick={() => void signOut()}><LogoutIcon/>Cerrar sesión</button></div>
    </header>

    <section className="admin-metrics" aria-label="Indicadores principales">
      <MetricCard label="Visitantes únicos" value={metric(reportFor("visitors")?.visitors)} pending={false} icon={<PeopleIcon/>} periodControls={periodControls("visitors")}/>
      <MetricCard label="Visitas / sesiones" value={metric(reportFor("sessions")?.sessions)} pending={false} icon={<VisitIcon/>} periodControls={periodControls("sessions")}/>
      <MetricCard label="Clics en WhatsApp" value={metric(reportFor("whatsapp")?.whatsapp)} pending={false} icon={<WhatsAppIcon/>} periodControls={periodControls("whatsapp")}/>
      <MetricCard label="Clics en teléfono" value={metric(reportFor("phone")?.phone)} pending={false} icon={<PhoneIcon/>} periodControls={periodControls("phone")}/>
      <MetricCard label="Clics en ubicación" value={metric(reportFor("location")?.location)} pending={false} icon={<PinIcon/>} periodControls={periodControls("location")}/>
      <MetricCard label="Porcentaje de conversión" value={pending ? "—" : displayPercent(reportFor("conversion")?.conversion ?? null)} pending={false} icon={<TrendIcon/>} periodControls={periodControls("conversion")}/>
    </section>
    <TrendChart points={chartReport?.daily ?? []} pending={pending} periodLabel={panelPeriods.trend === "today" ? "Últimos 7 días" : panelPeriods.trend === "7d" ? "7 días" : "1 mes"} uniqueVisitors={chartReport?.visitors} periodControls={periodControls("trend")}/>
    <BreakdownTable title="Fuentes de tráfico" items={reportFor("sources")?.sources ?? []} pending={pending} periodControls={periodControls("sources")} note="Un visitante puede volver desde distintas fuentes. No sumes las filas para obtener el total general."/>
    <div className="admin-insight-grid">
      <BreakdownTable title="Páginas de entrada" items={reportFor("entries")?.entries ?? []} pending={pending} periodControls={periodControls("entries")} note="Primera página disponible de cada sesión. Si la sesión empezó antes del historial cargado, la entrada puede ser parcial."/>
      <BreakdownTable title="Clics de contacto por página" items={reportFor("pages")?.pages ?? []} pending={pending} periodControls={periodControls("pages")} note="La conversión de cada página usa sus visitantes. Una persona puede figurar en varias páginas."/>
    </div>
    <div className="admin-insight-grid">
      <BreakdownTable title="Tipo de dispositivo" items={reportFor("devices")?.devices ?? []} pending={pending} periodControls={periodControls("devices")}/>
      <BreakdownTable title="Localidades" items={(reportFor("locations")?.locations ?? []).slice(0, 4)} pending={pending} periodControls={periodControls("locations")} note="Las 4 localidades con más visitantes. La ubicación es aproximada y puede corresponder al proveedor de internet."/>
    </div>
    <div className="admin-insight-grid">
      <StatList title="Páginas y tratamientos más visitados" pending={pending} empty={!reportFor("pageViews")?.pageViews.length} periodControls={periodControls("pageViews")}><ul className="admin-page-counts">{reportFor("pageViews")?.pageViews.map(page => <li key={page.path}><span>{page.title}</span><strong>{page.views} vistas</strong></li>)}</ul></StatList>
      <StatList title="Horario de WhatsApp" pending={pending} empty={!reportFor("hours")?.hours.some(hour => hour.value > 0)} periodControls={periodControls("hours")}>{whatsappPeak && <p className="admin-hours-peak">{whatsappPeak}</p>}<HourChart hours={reportFor("hours")?.hours ?? []}/></StatList>
    </div>

    <section className="admin-whatsapp" aria-labelledby="admin-whatsapp-title"><h2 id="admin-whatsapp-title">WhatsApp</h2><p className="admin-empty">Referencia histórica fija, independiente del período seleccionado.</p><div className="admin-metrics admin-whatsapp-metrics">
      <MetricCard label="Hoy" value={metric(analytics.whatsappClicksToday)} pending={false} icon={<WhatsAppIcon/>}/>
      <MetricCard label="Últimos 7 días" value={metric(analytics.whatsappClicksLast7Days)} pending={false} icon={<WhatsAppIcon/>}/>
      <MetricCard label="Mes pasado" value={metric(analytics.whatsappClicksLastMonth)} pending={false} icon={<WhatsAppIcon/>}/>
    </div></section>
    <p className="admin-live-note"><PersonIcon/>Actividad en los últimos 5 minutos: {metric(analytics.activeNow)} sesiones. No confirma que sigan conectadas. Se actualiza al pulsar Actualizar.</p>

    <section className="admin-panel admin-activity" aria-busy={ignoring}>
      <h2>Visitantes</h2>{periodControls("activity")}<p className="admin-activity-lead">Actividad del período seleccionado. Un código identifica al mismo navegador si volvió. La localidad es aproximada y el tiempo hasta el clic no equivale al tiempo activo de lectura. No se guardan nombres ni datos clínicos.</p>
      {pending ? <p className="admin-empty">{loading ? 'Cargando…' : analytics.message}</p> : <><p className="admin-visitors-count">{activityReport?.visitors ?? 0} visitantes · {activityReport?.sessions ?? 0} sesiones · {activityReport?.contacts ?? 0} contactos únicos</p>{activityReport?.estimatedVisitors && <p className="admin-banner">Hay eventos sin identificador de visitante: se usa la sesión como aproximación. El total de visitantes y la conversión son estimados.</p>}{activityReport?.missingIdentity && <p className="admin-banner">Hay eventos sin visitante ni sesión: se incluyen en los clics, pero no en los visitantes ni contactos únicos. Esos totales son parciales.</p>}{visibleActivity.length ? <ActivityList items={visibleActivity} onIgnore={id => void hideVisitor(id)}/> : <p className="admin-empty">Sin actividad en este período.</p>}</>}
    </section>
  </div>;
}
