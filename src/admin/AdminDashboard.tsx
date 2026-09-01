import { useEffect, useMemo, useState, type ReactNode } from "react";
import { SITE_NAME, SITE_URL_FROM_INSTAGRAM } from "../site";
import { fetchAnalyticsSnapshot } from "./analyticsService";
import {
  ANALYTICS_PENDING_MESSAGE,
  EMPTY_ANALYTICS,
  type AnalyticsSnapshot,
  type DailyVisit,
  type DeviceStat,
  type HourStat,
  type PageViewStat,
  type RecentActivity,
  type TrafficSource,
} from "./analyticsTypes";
import { useAuth } from "./AuthContext";
import {
  filterActivityByRange,
  visitorsForRange,
  type VisitorActivityRange,
} from "../analytics/summary";

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
  return `${value}%`;
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

function CalendarIcon() {
  return (
    <LineIcon>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M8 3.5v3" />
      <path d="M16 3.5v3" />
      <path d="M3.5 10h17" />
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
}: {
  label: string;
  value: string;
  pending: boolean;
  icon: ReactNode;
}) {
  return (
    <article className="admin-metric">
      <span className="admin-icon-tile">{icon}</span>
      <p className="admin-metric-label">{label}</p>
      <p className="admin-metric-value">{value}</p>
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
  hint,
  children,
}: {
  title: string;
  pending: boolean;
  empty: boolean;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="admin-panel">
      <h2>{title}</h2>
      {hint}
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

function PercentBars({
  items,
}: {
  items: { key: string; label: string; percent: number | null }[];
}) {
  return (
    <ul className="admin-bar-list">
      {items.map((item) => {
        const percent = Math.min(100, Math.max(0, item.percent ?? 0));
        return (
          <li key={item.key}>
            <div className="admin-bar-meta">
              <span>{item.label}</span>
              <span>{displayPercent(item.percent)}</span>
            </div>
            <div className="admin-lollipop" aria-hidden="true">
              <span className="admin-lollipop-line" style={{ width: `${percent}%` }} />
              <span
                className="admin-lollipop-dot"
                style={{ left: `${percent}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function TrafficList({ items }: { items: TrafficSource[] }) {
  return (
    <PercentBars
      items={items.map((item) => ({
        key: item.name,
        label: item.name,
        percent: item.percent,
      }))}
    />
  );
}

function PageList({ items }: { items: PageViewStat[] }) {
  return (
    <PercentBars
      items={items.map((item) => ({
        key: item.path,
        label: item.title,
        percent: item.percent,
      }))}
    />
  );
}

function DeviceList({ items }: { items: DeviceStat[] }) {
  return (
    <PercentBars
      items={items.map((item) => ({
        key: item.type,
        label: item.label,
        percent: item.percent,
      }))}
    />
  );
}

function TrendChart({ points }: { points: DailyVisit[] }) {
  const series =
    points.length > 0
      ? points
      : Array.from({ length: 30 }, (_, index) => ({
          date: String(index),
          value: 0,
        }));
  const width = 640;
  const height = 148;
  const padX = 14;
  const padY = 18;
  const innerWidth = width - padX * 2;
  const innerHeight = height - padY * 2;
  const max = Math.max(1, ...series.map((point) => point.value));
  const step = series.length > 1 ? innerWidth / (series.length - 1) : innerWidth;
  const coords = series.map((point, index) => {
    const x = padX + index * step;
    const y = padY + innerHeight - (point.value / max) * innerHeight;
    return { x, y, value: point.value };
  });
  const line = coords
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
  const barWidth = Math.max(2.2, step * 0.42);

  return (
    <svg
      className="admin-chart-svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Tendencia de visitas de los últimos 30 días"
    >
      {coords.map((point, index) => (
        <rect
          key={`bar-${series[index]?.date ?? index}`}
          x={point.x - barWidth / 2}
          y={point.y}
          width={barWidth}
          height={Math.max(2, padY + innerHeight - point.y)}
          rx="1.2"
          fill="currentColor"
          opacity="0.12"
        />
      ))}
      <path d={line} fill="none" stroke="currentColor" strokeWidth="2.1" />
      {coords.map((point, index) => (
        <circle
          key={`dot-${series[index]?.date ?? index}`}
          cx={point.x}
          cy={point.y}
          r="3.3"
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

function HourChart({ hours }: { hours: HourStat[] }) {
  const max = Math.max(1, ...hours.map((item) => item.value));
  return (
    <div
      className="admin-hours"
      role="img"
      aria-label="Clics de WhatsApp por hora, horario de Argentina"
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
        <span>00</span>
        <span>06</span>
        <span>12</span>
        <span>18</span>
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
    parts.push(`${duration} en el sitio`);
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
    const city = item.city ? ` (${item.city})` : "";
    parts.push(
      item.visitCount >= 2
        ? `Visitante ${item.visitorLabel}${city} · ${item.visitCount} visitas`
        : `Visitante ${item.visitorLabel}${city}`,
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

function visitorsRangeCopy(range: VisitorActivityRange, count: number | null) {
  if (count === null) {
    return "—";
  }
  const noun = count === 1 ? "visitante" : "visitantes";
  if (range === "today") {
    if (count === 0) {
      return "Hoy no entró ningún visitante.";
    }
    if (count === 1) {
      return "Hoy entró 1 visitante.";
    }
    return `Hoy entraron ${count} visitantes.`;
  }
  if (range === "7d") {
    return `En los últimos 7 días entraron ${count} ${noun}.`;
  }
  return `En el último mes entraron ${count} ${noun}.`;
}

function ActivityList({ items }: { items: RecentActivity[] }) {
  return (
    <div className="admin-activity-table">
      <div className="admin-activity-head" aria-hidden="true">
        <span>Fecha y hora</span>
        <span>Acción</span>
        <span>Página</span>
        <span>Fuente</span>
        <span>Dispositivo</span>
      </div>
      <ul className="admin-activity-list">
        {items.map((item) => {
          const detail = activityDetail(item);
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
                <span>{item.device}</span>
              </div>
              {detail ? <p className="admin-activity-detail">{detail}</p> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function AdminDashboard() {
  const { session, signOut } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot>(EMPTY_ANALYTICS);
  const [visitorRange, setVisitorRange] = useState<VisitorActivityRange>("today");
  const email = session?.user.email ?? "";
  const pending = analytics.status !== "ready";
  const visibleActivity = useMemo(
    () => filterActivityByRange(analytics.recentActivity, visitorRange),
    [analytics.recentActivity, visitorRange],
  );
  const visitorCount = visitorsForRange(analytics, visitorRange);
  const whatsappPeak = peakWhatsAppCopy(analytics.whatsappHours);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }
    let cancelled = false;
    fetchAnalyticsSnapshot().then((snapshot) => {
      if (!cancelled) {
        setAnalytics(snapshot);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  return (
    <div className="admin-dashboard">
      <header className="admin-topbar">
        <div className="admin-brand">
          <img src="/logo.png" alt="" width={40} height={40} />
          <div>
            <p className="admin-kicker">{SITE_NAME}</p>
            <h1>Panel de analíticas</h1>
          </div>
        </div>
        <div className="admin-session">
          {email ? <p className="admin-session-email">{email}</p> : null}
          <button type="button" className="admin-signout" onClick={() => void signOut()}>
            <LogoutIcon />
            Cerrar sesión
          </button>
        </div>
      </header>

      <section className="admin-panel admin-chart">
        <h2 role="status">{analytics.message}</h2>
        <TrendChart points={analytics.dailyVisits} />
      </section>

      <section className="admin-metrics" aria-label="Indicadores principales">
        <MetricCard
          label="Visitantes de hoy"
          value={displayValue(analytics.visitorsToday)}
          pending={pending}
          icon={<PeopleIcon />}
        />
        <MetricCard
          label="Personas conectadas ahora"
          value={displayValue(analytics.activeNow)}
          pending={pending}
          icon={<PersonIcon />}
        />
        <MetricCard
          label="Clics en teléfono"
          value={displayValue(analytics.phoneClicks)}
          pending={pending}
          icon={<PhoneIcon />}
        />
        <MetricCard
          label="Clics en ubicación"
          value={displayValue(analytics.locationClicks)}
          pending={pending}
          icon={<PinIcon />}
        />
        <MetricCard
          label="Porcentaje de conversión"
          value={displayPercent(analytics.conversionRate)}
          pending={pending}
          icon={<TrendIcon />}
        />
      </section>

      <section className="admin-whatsapp" aria-labelledby="admin-whatsapp-title">
        <h2 id="admin-whatsapp-title">WhatsApp</h2>
        <div className="admin-metrics admin-whatsapp-metrics">
          <MetricCard
            label="Hoy"
            value={displayValue(analytics.whatsappClicksToday)}
            pending={pending}
            icon={<WhatsAppIcon />}
          />
          <MetricCard
            label="Últimos 7 días"
            value={displayValue(analytics.whatsappClicksLast7Days)}
            pending={pending}
            icon={<CalendarIcon />}
          />
          <MetricCard
            label="Mes pasado"
            value={displayValue(analytics.whatsappClicksLastMonth)}
            pending={pending}
            icon={<CalendarIcon />}
          />
        </div>
      </section>

      <div className="admin-insight-grid">
        <StatList
          title="Conversiones por página"
          pending={pending}
          empty={analytics.conversionsByPage.length === 0}
        >
          <PageList items={analytics.conversionsByPage} />
        </StatList>
        <StatList
          title="Horario de WhatsApp"
          pending={pending}
          empty={!analytics.whatsappHours.some((item) => item.value > 0)}
        >
          <>
            {whatsappPeak ? (
              <p className="admin-hours-peak">{whatsappPeak}</p>
            ) : null}
            <HourChart hours={analytics.whatsappHours} />
          </>
        </StatList>
      </div>

      <div className="admin-grid">
        <StatList
          title="Fuentes de tráfico"
          pending={pending}
          empty={analytics.trafficSources.length === 0}
          hint={
            <p className="admin-hint">
              Para que Instagram no cuente como Directo, pegá este link en la
              bio:{" "}
              <code>{SITE_URL_FROM_INSTAGRAM}</code>
            </p>
          }
        >
          <TrafficList items={analytics.trafficSources} />
        </StatList>
        <StatList
          title="Páginas y tratamientos más visitados"
          pending={pending}
          empty={analytics.topPages.length === 0}
        >
          <PageList items={analytics.topPages} />
        </StatList>
        <StatList
          title="Tipo de dispositivo"
          pending={pending}
          empty={analytics.devices.length === 0}
        >
          <DeviceList items={analytics.devices} />
        </StatList>
      </div>

      <section className="admin-panel admin-activity">
        <div className="admin-panel-heading">
          <span className="admin-icon-tile">
            <PeopleIcon />
          </span>
          <h2>Visitantes</h2>
        </div>
        <p className="admin-activity-lead">
          Por defecto ves quiénes entraron hoy. Podés cargar hasta el último
          mes. Un código identifica al mismo navegador si volvió. No se guardan
          nombres ni datos personales.
        </p>
        <div className="admin-range-actions" role="group" aria-label="Período de visitantes">
          <button
            type="button"
            className={visitorRange === "today" ? "is-active" : undefined}
            aria-pressed={visitorRange === "today"}
            disabled={pending}
            onClick={() => setVisitorRange("today")}
          >
            Hoy
          </button>
          <button
            type="button"
            className={visitorRange === "7d" ? "is-active" : undefined}
            aria-pressed={visitorRange === "7d"}
            disabled={pending}
            onClick={() => setVisitorRange("7d")}
          >
            Cargar últimos 7 días
          </button>
          <button
            type="button"
            className={visitorRange === "month" ? "is-active" : undefined}
            aria-pressed={visitorRange === "month"}
            disabled={pending}
            onClick={() => setVisitorRange("month")}
          >
            Cargar último mes
          </button>
        </div>
        {pending ? (
          <p className="admin-empty">{ANALYTICS_PENDING_MESSAGE}</p>
        ) : (
          <>
            <p className="admin-visitors-count">
              {visitorsRangeCopy(visitorRange, visitorCount)}
            </p>
            {visibleActivity.length > 0 ? (
              <ActivityList items={visibleActivity} />
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
