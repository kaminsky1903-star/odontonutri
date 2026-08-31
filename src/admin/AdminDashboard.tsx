import { useEffect, useState, type ReactNode } from "react";
import { SITE_NAME } from "../site";
import { fetchAnalyticsSnapshot } from "./analyticsService";
import {
  ANALYTICS_PENDING_MESSAGE,
  EMPTY_ANALYTICS,
  type AnalyticsSnapshot,
  type DeviceStat,
  type PageViewStat,
  type TrafficSource,
} from "./analyticsTypes";
import { useAuth } from "./AuthContext";

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

function MetricCard({
  label,
  value,
  pending,
}: {
  label: string;
  value: string;
  pending: boolean;
}) {
  return (
    <article className="admin-metric">
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
  children,
}: {
  title: string;
  pending: boolean;
  empty: boolean;
  children: ReactNode;
}) {
  return (
    <section className="admin-panel">
      <h2>{title}</h2>
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

function TrafficList({ items }: { items: TrafficSource[] }) {
  return (
    <ul className="admin-stat-list">
      {items.map((item) => (
        <li key={item.name}>
          <span>{item.name}</span>
          <span>{displayValue(item.sessions)}</span>
        </li>
      ))}
    </ul>
  );
}

function PageList({ items }: { items: PageViewStat[] }) {
  return (
    <ul className="admin-stat-list">
      {items.map((item) => (
        <li key={item.path}>
          <span>{item.title}</span>
          <span>{displayValue(item.views)}</span>
        </li>
      ))}
    </ul>
  );
}

function DeviceList({ items }: { items: DeviceStat[] }) {
  return (
    <ul className="admin-stat-list">
      {items.map((item) => (
        <li key={item.type}>
          <span>{item.label}</span>
          <span>{displayValue(item.visitors)}</span>
        </li>
      ))}
    </ul>
  );
}

export function AdminDashboard() {
  const { session, signOut } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot>(EMPTY_ANALYTICS);
  const email = session?.user.email ?? "";
  const pending = analytics.status !== "ready";

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
            Cerrar sesión
          </button>
        </div>
      </header>

      <p className="admin-banner" role="status">
        {analytics.message}
      </p>

      <section className="admin-metrics" aria-label="Indicadores principales">
        <MetricCard
          label="Visitantes de hoy"
          value={displayValue(analytics.visitorsToday)}
          pending={pending}
        />
        <MetricCard
          label="Visitantes de los últimos 7 días"
          value={displayValue(analytics.visitorsLast7Days)}
          pending={pending}
        />
        <MetricCard
          label="Visitantes de los últimos 30 días"
          value={displayValue(analytics.visitorsLast30Days)}
          pending={pending}
        />
        <MetricCard
          label="Personas conectadas ahora"
          value={displayValue(analytics.activeNow)}
          pending={pending}
        />
        <MetricCard
          label="Clics en WhatsApp"
          value={displayValue(analytics.whatsappClicks)}
          pending={pending}
        />
        <MetricCard
          label="Clics en teléfono"
          value={displayValue(analytics.phoneClicks)}
          pending={pending}
        />
        <MetricCard
          label="Clics en ubicación"
          value={displayValue(analytics.locationClicks)}
          pending={pending}
        />
        <MetricCard
          label="Porcentaje de conversión"
          value={displayPercent(analytics.conversionRate)}
          pending={pending}
        />
      </section>

      <div className="admin-grid">
        <StatList
          title="Fuentes de tráfico"
          pending={pending}
          empty={analytics.trafficSources.length === 0}
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
        <StatList title="Ciudad aproximada" pending={pending} empty>
          {null}
        </StatList>
        <StatList
          title="Tipo de dispositivo"
          pending={pending}
          empty={analytics.devices.length === 0}
        >
          <DeviceList items={analytics.devices} />
        </StatList>
      </div>
    </div>
  );
}
