import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { AdminApp } from "./admin/AdminApp";
import { usePublicAnalytics } from "./analytics/usePublicAnalytics";
import {
  ADMIN_PATH,
  DENTISTRY_ADVANCED_TREATMENTS,
  DENTISTRY_COMMON_TREATMENTS,
  DENTISTRY_FEATURED_TREATMENT,
  INSTAGRAM_URL,
  MAP_QUERY,
  PHONE_LABEL,
  PHONE_TEL,
  SITE_NAME,
  STREET_ADDRESS,
  GOOGLE_REVIEWS,
  NUTRITION_SERVICES,
  WHATSAPP_NUTRITION_PAGE,
  WHATSAPP_PAGE,
  whatsappPageWithMessage,
} from "./site";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

function LineIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <Icon>
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
      />
    </Icon>
  );
}

function PinIcon() {
  return (
    <Icon>
      <path
        fill="currentColor"
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"
      />
    </Icon>
  );
}

function ToothLineIcon() {
  return (
    <LineIcon>
      <path d="M7.1 4.9c1.5-.8 3.2-.4 4.9.5 1.7-.9 3.4-1.3 4.9-.5 2.5 1.3 2.9 4.4 1.6 7.2-.7 1.5-.9 3.1-1.1 4.7-.2 2.1-.8 3.2-1.8 3.2s-1.4-1.1-1.8-2.7l-.5-2.1c-.2-.8-.6-1.2-1.3-1.2s-1.1.4-1.3 1.2l-.5 2.1c-.4 1.6-.8 2.7-1.8 2.7s-1.6-1.1-1.8-3.2c-.2-1.6-.4-3.2-1.1-4.7-1.3-2.8-.9-5.9 1.6-7.2Z" />
      <path d="M9 7.5c.9.6 1.9.9 3 .9s2.1-.3 3-.9" />
    </LineIcon>
  );
}

function ShieldCheckLineIcon() {
  return (
    <LineIcon>
      <path d="M12 3.2 4.6 6.4v5.4c0 4.6 3.2 8.7 7.4 9.9 4.2-1.2 7.4-5.3 7.4-9.9V6.4L12 3.2Z" />
      <path d="m8.8 12.1 2.1 2.1 4.3-4.4" />
    </LineIcon>
  );
}

function TeamLineIcon() {
  return (
    <LineIcon>
      <circle cx="9" cy="8.1" r="2.7" />
      <path d="M3.8 18.6c.7-3.1 2.8-4.8 5.2-4.8s4.5 1.7 5.2 4.8" />
      <circle cx="16.4" cy="8.6" r="2.2" />
      <path d="M15.4 13.9c2.2.2 4 1.5 4.8 3.8" />
    </LineIcon>
  );
}

function AutoclaveLineIcon() {
  return (
    <LineIcon>
      <path d="M9.4 6.2V4.8h5.2v1.4" />
      <path d="M6.6 7.4h10.8v9.4a2.4 2.4 0 0 1-2.4 2.4H9a2.4 2.4 0 0 1-2.4-2.4V7.4Z" />
      <path d="M6.6 10.6h10.8" />
      <path d="M9.6 15.2c.7.9 1.6 1.35 2.4 1.35s1.7-.45 2.4-1.35" />
    </LineIcon>
  );
}

function AppleLineIcon() {
  return (
    <LineIcon>
      <path
        strokeWidth="1.9"
        d="M12 8.9c-1.8-2-5-2.7-7.3-.9-2.8 2.2-2 7.1.1 10.4 1.8 2.9 4.6 4.2 7.2 2.8 2.6 1.4 5.4.1 7.2-2.8 2.1-3.3 2.9-8.2.1-10.4-2.3-1.8-5.5-1.1-7.3.9Z"
      />
      <path strokeWidth="1.9" d="M12 8.9c0-2.7.8-4.8 2.2-6.1" />
      <path
        strokeWidth="1.9"
        d="M11.8 6.5C10.2 3.8 7.8 2.7 5.2 3.2c.8 2.6 3.1 4 6.6 3.3Z"
      />
      <path strokeWidth="1.9" d="M6.8 11c-1.2 2.4-.6 5.5 1.8 8" />
    </LineIcon>
  );
}

function ArrowLineIcon() {
  return (
    <LineIcon>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </LineIcon>
  );
}

function ArrowDownLineIcon() {
  return (
    <LineIcon>
      <path d="M12 5v14" />
      <path d="M6 13l6 6 6-6" />
    </LineIcon>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M10 1.6 12.4 6.5l5.4.8-3.9 3.8.9 5.4L10 14.1 5.2 16.5l.9-5.4-3.9-3.8 5.4-.8z"
      />
    </svg>
  );
}

function PersonLineIcon() {
  return (
    <LineIcon>
      <circle cx="12" cy="8" r="3.1" />
      <path d="M5.5 19c.8-3.2 3.2-5 6.5-5s5.7 1.8 6.5 5" />
    </LineIcon>
  );
}

function CalorieSparkline() {
  const points = [
    [8, 22],
    [26, 26],
    [44, 10],
    [62, 24],
    [80, 14],
    [98, 18],
    [114, 8],
  ] as const;
  const line =
    "M8 22 C11 22.7, 20 28, 26 26 C32 24, 38 10.3, 44 10 C50 9.7, 56 23.3, 62 24 C68 24.7, 74 15, 80 14 C86 13, 92.3 19, 98 18 C103.7 17, 111.3 9.7, 114 8";

  return (
    <svg
      className="nutri-stat-spark"
      viewBox="0 0 120 36"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="nutri-spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.38" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L114 36 L8 36 Z`} fill="url(#nutri-spark-fill)" />
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.15" fill="currentColor" />
      ))}
    </svg>
  );
}

function ProteinGauge() {
  return (
    <svg
      className="nutri-stat-gauge"
      viewBox="0 0 72 42"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="nutri-stat-gauge-track"
        d="M8 36 A 28 28 0 0 1 64 36"
        fill="none"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        className="nutri-stat-gauge-value"
        d="M8 36 A 28 28 0 0 1 64 36"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        pathLength="100"
        strokeDasharray="90 100"
      />
    </svg>
  );
}

function WaterGlassIcon() {
  return (
    <svg
      className="nutri-stat-glass"
      viewBox="0 0 32 40"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6.4 7.2h19.2l-3.15 24.6c-.35 2.7-2.4 4.7-5.15 4.7h-2.6c-2.75 0-4.8-2-5.15-4.7Z"
        fill="#eaf7fd"
        stroke="#4aa3d4"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <ellipse
        cx="16"
        cy="7.2"
        rx="9.6"
        ry="2.35"
        fill="#f7fcfe"
        stroke="#4aa3d4"
        strokeWidth="1.7"
      />
      <path
        d="M9.15 16.4h13.7l-1.55 14.1c-.22 1.7-1.55 2.9-3.25 2.9h-4.1c-1.7 0-3.03-1.2-3.25-2.9Z"
        fill="#3db4e6"
      />
      <ellipse cx="16" cy="16.4" rx="6.85" ry="1.55" fill="#2b9fd0" />
    </svg>
  );
}

function BowlLineIcon() {
  return (
    <LineIcon>
      <path d="M4 11h16c-.4 5-4.2 8-8 8s-7.6-3-8-8Z" />
      <path d="M8 8.5c.8-1.6 1.6-2.5 4-2.5s3.2.9 4 2.5" />
    </LineIcon>
  );
}

function ChartLineIcon() {
  return (
    <LineIcon>
      <path d="M4 18h16" />
      <path d="M7 18v-5" />
      <path d="M12 18V8" />
      <path d="M17 18V5" />
    </LineIcon>
  );
}

function HeartHandsIcon() {
  return (
    <LineIcon>
      <path d="M12 18s-6.2-3.8-6.2-8.1A3.4 3.4 0 0 1 12 7.6a3.4 3.4 0 0 1 6.2 2.3C18.2 14.2 12 18 12 18Z" />
    </LineIcon>
  );
}

function ScaleLineIcon() {
  return (
    <LineIcon>
      <path d="M12 4v3" />
      <path d="M5 9h14" />
      <path d="M5 9 3 16h4L5 9Z" />
      <path d="M19 9l-2 7h4l-2-7Z" />
      <path d="M8 20h8" />
      <path d="M12 7v13" />
    </LineIcon>
  );
}

function ClipboardLineIcon() {
  return (
    <LineIcon>
      <path d="M8.5 5.5h7v14h-7z" />
      <path d="M10 5.5V4.2A1.2 1.2 0 0 1 11.2 3h1.6A1.2 1.2 0 0 1 14 4.2v1.3" />
      <path d="M10.5 10.5h3" />
      <path d="M10.5 14h3" />
    </LineIcon>
  );
}

function CheckCircleLineIcon() {
  return (
    <LineIcon>
      <circle cx="12" cy="12" r="8" />
      <path d="M8.8 12.2 11 14.4l4.4-5.2" />
    </LineIcon>
  );
}

function CalendarLineIcon() {
  return (
    <LineIcon>
      <rect x="4.5" y="6" width="15" height="13.5" rx="2" />
      <path d="M8 4.5v3M16 4.5v3M4.5 10.5h15" />
    </LineIcon>
  );
}

function BadgeStarIcon() {
  return (
    <LineIcon>
      <path d="M12 4.8 13.6 9.2l4.7.4-3.6 3.1 1.1 4.5L12 14.9 8.2 17.2l1.1-4.5-3.6-3.1 4.7-.4Z" />
    </LineIcon>
  );
}

function ServiceFeatureIcon({ label }: { label: string }) {
  switch (label) {
    case "Hábitos":
      return <AppleLineIcon />;
    case "Equilibrio":
      return <ScaleLineIcon />;
    case "Rendimiento":
      return <ChartLineIcon />;
    case "Composición corporal":
      return <PersonLineIcon />;
    case "Evaluación profesional":
      return <ClipboardLineIcon />;
    case "Seguimiento":
      return <CheckCircleLineIcon />;
    case "Déficit saludable":
      return <ScaleLineIcon />;
    case "Hábitos sostenibles":
      return <AppleLineIcon />;
    default:
      return <HeartHandsIcon />;
  }
}

function MenuIcon() {
  return (
    <LineIcon>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </LineIcon>
  );
}

function CloseIcon() {
  return (
    <LineIcon>
      <path d="M6 6l12 12M18 6L6 18" />
    </LineIcon>
  );
}

function AppleMapsIcon() {
  return (
    <Icon>
      <path
        fill="currentColor"
        d="M20.5 3h-17A1.5 1.5 0 0 0 2 4.5v15A1.5 1.5 0 0 0 3.5 21h17a1.5 1.5 0 0 0 1.5-1.5v-15A1.5 1.5 0 0 0 20.5 3zM8 18.5 4 14l4-3.5 4 3.2zm8 .2-4-3.2 4-3.5 4 3.5zm4.5-5.4-4-3.5-4 3.5-4-3.2 4-3.6 4 3.2 4.5-3.9v7.5z"
      />
    </Icon>
  );
}

function PhoneIcon() {
  return (
    <Icon>
      <path
        fill="currentColor"
        d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
      />
    </Icon>
  );
}

function InstagramIcon() {
  return (
    <Icon>
      <path
        fill="currentColor"
        d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
      />
    </Icon>
  );
}

function currentPath() {
  return window.location.pathname.replace(/\/+$/, "") || "/";
}

function scrollToContacto(behavior: ScrollBehavior = "smooth") {
  const target = document.getElementById("contacto");
  const header = document.querySelector("header");
  if (!target) return;
  const headerHeight = header instanceof HTMLElement ? header.offsetHeight : 0;
  const top = window.scrollY + target.getBoundingClientRect().top - headerHeight;
  window.scrollTo({ top: Math.max(0, top), behavior });
}

function scrollToServiciosNutricion(behavior: ScrollBehavior = "smooth") {
  const target = document.getElementById("servicios-nutricion");
  const header = document.querySelector("header");
  if (!target) return;
  const headerHeight = header instanceof HTMLElement ? header.offsetHeight : 0;
  const top =
    window.scrollY + target.getBoundingClientRect().top - headerHeight - 12;
  window.scrollTo({ top: Math.max(0, top), behavior });
}

function NavArrow() {
  return (
    <span className="nav-arrow" aria-hidden="true">
      →
    </span>
  );
}

function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [hash, setHash] = useState(() => window.location.hash);
  const path = currentPath();
  const home = path === "/" && hash !== "#contacto";

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    const media = window.matchMedia("(width <= 767px)");
    const onChange = () => {
      if (!media.matches) setOpen(false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <header className={open ? "is-nav-open" : undefined}>
      <div className="page-container header-bar">
        <a className="brand" href="/" onClick={closeMenu}>
          <img
            className="brand-logo"
            src="/logo.png"
            alt=""
            width={40}
            height={40}
          />
          <span>{SITE_NAME}</span>
        </a>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
        <nav
          id="site-nav"
          className={open ? "site-nav is-open" : "site-nav"}
          aria-label="Principal"
        >
          <a href="/" aria-current={home ? "page" : undefined} onClick={closeMenu}>
            Inicio
            <NavArrow />
          </a>
          <a
            href="/odontologia"
            aria-current={path === "/odontologia" ? "page" : undefined}
            onClick={closeMenu}
          >
            Odontología
            <NavArrow />
          </a>
          <a
            href="/nutricion"
            aria-current={path === "/nutricion" ? "page" : undefined}
            onClick={closeMenu}
          >
            Nutrición
            <NavArrow />
          </a>
          <a
            href={path === "/" ? "#contacto" : "/#contacto"}
            aria-current={path === "/" && hash === "#contacto" ? "page" : undefined}
            onClick={(event) => {
              closeMenu();
              if (path !== "/") return;
              if (!document.getElementById("contacto")) return;
              event.preventDefault();
              window.history.replaceState(null, "", "#contacto");
              setHash("#contacto");
              scrollToContacto("smooth");
            }}
          >
            Contacto
            <NavArrow />
          </a>
        </nav>
      </div>
    </header>
  );
}

function ClinicMap() {
  return (
    <section className="map-block page-container" aria-label="Mapa de la clínica">
      <div className="map-panel">
        <p className="map-panel-label">Visítanos</p>
        <h2>Estamos cerca para acompañarte</h2>
        <p className="map-panel-lead">
          Un espacio cálido y profesional, preparado para cuidar tu sonrisa y
          acompañar tus objetivos de salud.
        </p>
        <address className="map-panel-address">
          {STREET_ADDRESS}
          <br />
          Bella Vista, Buenos Aires
        </address>
      </div>
      <div className="map-wrap">
        <iframe
          title={`${SITE_NAME} en Google Maps`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://maps.google.com/maps?q=${MAP_QUERY}&z=16&output=embed`}
        />
      </div>
    </section>
  );
}

function VisitCard() {
  useEffect(() => {
    if (window.location.hash !== "#contacto") return;
    const frame = window.requestAnimationFrame(() => {
      scrollToContacto("auto");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <aside className="hero-card page-container" id="contacto">
      <h2>Visítanos</h2>
      <div className="meta">
        <div>
          <strong>Dirección</strong>
          <address>
            {STREET_ADDRESS}
            <br />
            Bella Vista, San Miguel, Buenos Aires
          </address>
        </div>
        <p>
          <strong>Teléfono</strong>
          <a href={`tel:${PHONE_TEL}`}>{PHONE_LABEL}</a>
        </p>
      </div>
      <div className="actions">
        <a
          className="btn primary"
          href={WHATSAPP_PAGE}
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsAppIcon />
          WhatsApp
        </a>
        <a
          className="btn"
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <InstagramIcon />
          Instagram
        </a>
        <a
          className="btn"
          href={`https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`}
          target="_blank"
          rel="noopener"
        >
          <PinIcon />
          Google Maps
        </a>
        <a
          className="btn"
          href={`https://maps.apple.com/?q=${MAP_QUERY}`}
          target="_blank"
          rel="noopener"
        >
          <AppleMapsIcon />
          Apple Maps
        </a>
        <a className="btn" href={`tel:${PHONE_TEL}`}>
          <PhoneIcon />
          Llamar
        </a>
      </div>
    </aside>
  );
}

function HomePage() {
  return (
    <main>
      <section className="hero page-container">
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="hero-intro">
              <p className="eyebrow">Bella Vista · San Miguel</p>
              <h1>
                Odontología{" "}
                <br />
                y Nutrición
              </h1>
              <p className="hero-tagline">
                Cuidamos tu sonrisa. Acompañamos tu
                <br />
                <span className="hero-tagline-last-line">bienestar.</span>
              </p>
              <p className="lead">
                Atención profesional y personalizada, con una mirada integral
                que contempla tus necesidades, tus objetivos y tu bienestar.
              </p>
            </div>
            <div className="hero-actions">
              <div className="hero-ctas">
                <a className="hero-btn hero-btn-odonto" href="/odontologia">
                  <ToothLineIcon />
                  Odontología
                  <ArrowLineIcon />
                </a>
                <a className="hero-btn hero-btn-nutri" href="/nutricion">
                  <AppleLineIcon />
                  Nutrición
                  <ArrowLineIcon />
                </a>
              </div>
              <a
                className="hero-whatsapp"
                href={WHATSAPP_PAGE}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon />
                Sacá tu turno por WhatsApp
              </a>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-stage">
              <img
                className="hero-bg"
                src="/odontonutri-hero-background.svg"
                alt=""
                width={1000}
                height={1000}
              />
              <img
                className="hero-photo"
                src="/nosotros-hero.webp"
                alt="Dr. Kaminsky y Lic. González"
                width={851}
                height={916}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="process page-container" aria-labelledby="process-title">
        <div className="process-inner">
          <h2 id="process-title">
            Una atención clara
            <br />
            desde la primera visita
          </h2>
          <ol className="process-steps">
            <li className="process-step">
              <span className="process-num" aria-hidden="true">
                01
              </span>
              <h3>Consulta y diagnóstico</h3>
              <p>Evaluamos tu caso y realizamos los estudios necesarios.</p>
            </li>
            <li className="process-step">
              <span className="process-num" aria-hidden="true">
                02
              </span>
              <h3>Plan personalizado</h3>
              <p>Te explicamos las alternativas, etapas, tiempos y presupuesto.</p>
            </li>
            <li className="process-step">
              <span className="process-num" aria-hidden="true">
                03
              </span>
              <h3>Tratamiento</h3>
              <p>Realizamos cada procedimiento de manera planificada y cuidada.</p>
            </li>
            <li className="process-step">
              <span className="process-num" aria-hidden="true">
                04
              </span>
              <h3>Seguimiento y controles</h3>
              <p>Controlamos los resultados y acompañamos tu evolución.</p>
            </li>
          </ol>
        </div>
      </section>

      <VisitCard />
      <ClinicMap />
    </main>
  );
}

function NutritionHero() {
  return (
    <section className="nutri-hero page-container">
      <div className="nutri-hero-shell">
        <div className="nutri-hero-top">
          <div className="nutri-hero-copy">
            <h1>
              Comé mejor.
              <span className="nutri-hero-title-line">
                Viví <span>más saludable.</span>
              </span>
            </h1>
            <p className="nutri-hero-lead">
              Orientación nutricional personalizada, adaptada a tus necesidades,
              hábitos y objetivos.
            </p>
            <div className="nutri-hero-actions">
              <a
                className="nutri-hero-primary"
                href={WHATSAPP_NUTRITION_PAGE}
                target="_blank"
                rel="noopener noreferrer"
              >
                Agendá tu consulta
                <ArrowLineIcon />
              </a>
              <a
                className="nutri-hero-secondary"
                href="#servicios-nutricion"
                onClick={(event) => {
                  if (!document.getElementById("servicios-nutricion")) return;
                  event.preventDefault();
                  window.history.replaceState(null, "", "#servicios-nutricion");
                  scrollToServiciosNutricion("smooth");
                }}
              >
                Ver servicios
                <ArrowDownLineIcon />
              </a>
            </div>
            <p className="nutri-hero-proof">
              <span className="nutri-hero-stars" aria-hidden="true">
                <StarIcon />
                <StarIcon />
                <StarIcon />
                <StarIcon />
                <StarIcon />
              </span>
            </p>
          </div>

          <div className="nutri-hero-visual">
            <div className="nutri-hero-stage">
              <div className="nutri-hero-photo-clip">
                <img
                  className="nutri-hero-photo"
                  src="/nutricion-hero.webp"
                  alt="Orientación nutricional personalizada"
                  width={1024}
                  height={1536}
                  fetchPriority="high"
                />
              </div>
              <ul className="nutri-stat-cards">
                <li className="nutri-stat nutri-stat-calories">
                  <p className="nutri-stat-label">Calorías diarias</p>
                  <p className="nutri-stat-value">1,620 kcal</p>
                  <CalorieSparkline />
                  <p className="nutri-stat-trend">
                    <span>↑ 12%</span> respecto de ayer
                  </p>
                </li>
                <li className="nutri-stat nutri-stat-goal">
                  <p className="nutri-stat-label">Progreso del objetivo</p>
                  <p className="nutri-stat-value">75%</p>
                  <p className="nutri-stat-note">¡Seguí así! 💪</p>
                  <span className="nutri-stat-bar" aria-hidden="true">
                    <span />
                  </span>
                </li>
                <li className="nutri-stat nutri-stat-protein">
                  <p className="nutri-stat-label">Proteínas</p>
                  <div className="nutri-stat-protein-row">
                    <p className="nutri-stat-value">150 g</p>
                    <ProteinGauge />
                  </div>
                  <p className="nutri-stat-percent">90%</p>
                  <p className="nutri-stat-note">del objetivo diario</p>
                </li>
                <li className="nutri-stat nutri-stat-water">
                  <p className="nutri-stat-label">Hidratación</p>
                  <p className="nutri-stat-value">6/8 vasos</p>
                  <p className="nutri-stat-note nutri-stat-water-note">
                    ¡Muy bien!
                    <WaterGlassIcon />
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <ul className="nutri-benefits">
          <li>
            <span className="nutri-benefit-icon" aria-hidden="true">
              <PersonLineIcon />
            </span>
            <strong>Plan personalizado</strong>
            <p>Según tus necesidades y objetivos.</p>
          </li>
          <li>
            <span className="nutri-benefit-icon" aria-hidden="true">
              <BowlLineIcon />
            </span>
            <strong>Alimentación práctica</strong>
            <p>Propuestas simples para tu rutina.</p>
          </li>
          <li>
            <span className="nutri-benefit-icon" aria-hidden="true">
              <ChartLineIcon />
            </span>
            <strong>Seguimiento profesional</strong>
            <p>Evaluación y ajustes durante el proceso.</p>
          </li>
          <li>
            <span className="nutri-benefit-icon" aria-hidden="true">
              <HeartHandsIcon />
            </span>
            <strong>Acompañamiento cercano</strong>
            <p>Orientación clara en cada etapa.</p>
          </li>
        </ul>
      </div>
    </section>
  );
}

function NutritionServices() {
  useEffect(() => {
    if (window.location.hash !== "#servicios-nutricion") return;
    const frame = window.requestAnimationFrame(() => {
      scrollToServiciosNutricion("auto");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="nutri-services page-container">
      <h2 className="nutri-services-title" id="servicios-nutricion">
        Nutrición pensada <span>para vos</span>
      </h2>
      <p className="nutri-services-lead">
        Acompañamiento personalizado para cuidar tu salud y alcanzar tus
        objetivos.
      </p>
      <h3 className="nutri-services-kicker">Servicios de nutrición</h3>
      <ul className="nutri-service-grid">
        {NUTRITION_SERVICES.map((service) => (
          <li key={service.title}>
            <article className="nutri-service-card">
              <div className="nutri-service-visual">
                <img
                  src={service.image}
                  alt={service.title}
                  width={480}
                  height={480}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="nutri-service-body">
                <h4>{service.title}</h4>
                <p>{service.description}</p>
                <ul>
                  {service.features.map((feature) => (
                    <li key={feature}>
                      <span aria-hidden="true">
                        <ServiceFeatureIcon label={feature} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <a
                className="nutri-service-go"
                href={whatsappPageWithMessage(service.message)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Consultar ${service.title} por WhatsApp`}
              >
                <ArrowLineIcon />
              </a>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ReviewStars() {
  return (
    <span className="review-stars" aria-label="5 estrellas">
      <StarIcon />
      <StarIcon />
      <StarIcon />
      <StarIcon />
      <StarIcon />
    </span>
  );
}

function GoogleReviews() {
  return (
    <section className="google-reviews" aria-labelledby="resenas-title">
      <p className="reviews-watermark" aria-hidden="true">
        RESEÑAS
      </p>
      <div className="reviews-container">
        <div className="reviews-header">
          <p className="reviews-kicker">Experiencias de pacientes</p>
          <h2 id="resenas-title" className="reviews-title">
            <span>Historias reales.</span>
            <span className="reviews-title-accent">Confianza real.</span>
          </h2>
        </div>
        <ul className="reviews-cards">
          {GOOGLE_REVIEWS.map((review) => (
            <li
              key={review.name}
              className={
                review.featured
                  ? "review-item review-item-featured"
                  : "review-item"
              }
            >
              <article
                className={
                  review.featured
                    ? "review-card review-card-featured"
                    : "review-card"
                }
              >
                <span className="review-mark" aria-hidden="true">
                  “
                </span>
                <ReviewStars />
                <p className="review-quote">{review.quote}</p>
                <div className="review-author">
                  <img
                    src={review.image}
                    alt={review.name}
                    width={review.featured ? 40 : 32}
                    height={review.featured ? 40 : 32}
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <strong>{review.name}</strong>
                    <span>{review.meta}</span>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const DENTISTRY_HERO_HIGHLIGHTS = [
  {
    title: "Seguridad y confianza",
    text: "Protocolos estrictos y materiales certificados.",
    icon: <ShieldCheckLineIcon />,
  },
  {
    title: "Equipo especializado",
    text: "Profesionales con amplia experiencia y formación continua.",
    icon: <TeamLineIcon />,
  },
  {
    title: "Tecnología avanzada",
    text: "Equipamiento de última generación para mejores resultados.",
    icon: <AutoclaveLineIcon />,
  },
  {
    title: "Atención personalizada",
    text: "Planes de tratamiento adaptados a tus necesidades.",
    icon: <HeartHandsIcon />,
  },
] as const;

function DentistryMisServicios() {
  const featured = DENTISTRY_FEATURED_TREATMENT;

  return (
    <section
      id="tratamientos-odontologia"
      className="odonto-services page-container"
      aria-labelledby="odonto-services-title"
    >
      <div className="odonto-services-header">
        <h2 id="odonto-services-title">
          Odontología pensada <span>para vos</span>
        </h2>
        <p className="odonto-services-lead">
          Acompañamiento personalizado para cuidar tu salud y alcanzar tus
          objetivos.
        </p>
      </div>

      <article className="odonto-featured">
        <div className="odonto-featured-visual">
          <img
            src={featured.image}
            alt={featured.alt}
            width={960}
            height={720}
            loading="lazy"
            decoding="async"
            style={{ objectPosition: featured.objectPosition }}
          />
        </div>
        <div className="odonto-featured-body">
          <p className="odonto-featured-badge">
            <BadgeStarIcon />
            Tratamiento destacado
          </p>
          <h3 className="odonto-featured-title">{featured.title}</h3>
          <p className="odonto-featured-text">{featured.description}</p>
          <ul className="odonto-featured-benefits">
            {featured.benefits.map((benefit) => (
              <li key={benefit}>
                <CheckCircleLineIcon />
                {benefit}
              </li>
            ))}
          </ul>
          <div className="odonto-featured-actions">
            <a
              className="odonto-featured-cta"
              href={whatsappPageWithMessage(featured.message)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <CalendarLineIcon />
              Solicitar turno
            </a>
          </div>
        </div>
      </article>

      <div className="odonto-advanced">
        <ul className="odonto-advanced-grid">
          {DENTISTRY_ADVANCED_TREATMENTS.map((treatment) => (
            <li key={treatment.title}>
              <article className="odonto-advanced-card">
                <div className="odonto-advanced-visual">
                  <img
                    src={treatment.image}
                    alt={treatment.alt}
                    width={720}
                    height={480}
                    loading="lazy"
                    decoding="async"
                    style={{ objectPosition: treatment.objectPosition }}
                  />
                </div>
                <div className="odonto-advanced-body">
                  <h4>{treatment.title}</h4>
                  <p>{treatment.description}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>

      <div className="odonto-common">
        <ul className="odonto-common-grid">
          {DENTISTRY_COMMON_TREATMENTS.map((treatment) => (
            <li key={treatment.title}>
              <article className="odonto-common-card">
                <div className="odonto-common-visual">
                  <img
                    src={treatment.image}
                    alt={treatment.alt}
                    width={480}
                    height={360}
                    loading="lazy"
                    decoding="async"
                    style={{ objectPosition: treatment.objectPosition }}
                  />
                </div>
                <div className="odonto-common-body">
                  <h4>{treatment.title}</h4>
                  <p>{treatment.description}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function DentistryPage() {
  return (
    <main>
      <section
        className="dentistry-hero page-container"
        aria-labelledby="dentistry-hero-title"
      >
        <div className="dentistry-hero-copy">
          <p className="dentistry-hero-kicker">
            IMPLANTES · REHABILITACIÓN · ESTÉTICA
          </p>
          <h1 id="dentistry-hero-title">
            Volvé a sonreír{" "}
            <span className="dentistry-hero-title-line">
              con <span>confianza.</span>
            </span>
          </h1>
          <p className="dentistry-hero-lead">
            Tratamientos personalizados para{" "}
            <span className="dentistry-hero-lead-line">
              recuperar función, estética y seguridad.
            </span>
          </p>
          <div className="nutri-hero-actions">
            <a
              className="nutri-hero-primary"
              href={WHATSAPP_PAGE}
              target="_blank"
              rel="noopener noreferrer"
            >
              Agendá tu consulta
              <ArrowLineIcon />
            </a>
            <a className="nutri-hero-secondary" href="#tratamientos-odontologia">
              Ver servicios
              <ArrowDownLineIcon />
            </a>
          </div>
          <p className="dentistry-hero-stars" aria-hidden="true">
            <StarIcon />
            <StarIcon />
            <StarIcon />
            <StarIcon />
            <StarIcon />
          </p>
        </div>
        <div className="dentistry-hero-photo-wrap">
          <img
            className="dentistry-hero-photo"
            src="/hero-odonto.webp"
            alt="Dr. Kaminsky con una paciente en el sillón odontológico"
            width={1672}
            height={941}
            fetchPriority="high"
          />
        </div>
        <ul className="dentistry-hero-band" aria-label="Por qué elegirnos">
          {DENTISTRY_HERO_HIGHLIGHTS.map((item) => (
            <li key={item.title}>
              {item.icon}
              <div className="dentistry-hero-band-copy">
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <DentistryMisServicios />

      <section className="dentistry-plan page-container">
        <div>
          <p className="eyebrow">Tu consulta</p>
          <h2>Un plan pensado para tu caso</h2>
        </div>
        <p>
          Evaluamos tu salud bucal, conversamos sobre tus necesidades y
          definimos los próximos pasos antes de comenzar el tratamiento.
        </p>
      </section>

      <VisitCard />
      <ClinicMap />
    </main>
  );
}

export default function App() {
  const path = currentPath();
  const isAdmin = path === ADMIN_PATH || path.startsWith(`${ADMIN_PATH}/`);
  usePublicAnalytics(!isAdmin);

  if (isAdmin) {
    return <AdminApp />;
  }

  return (
    <>
      <SiteHeader />
      {path === "/odontologia" ? (
        <DentistryPage />
      ) : path === "/nutricion" ? (
        <main>
          <NutritionHero />
          <NutritionServices />
          <GoogleReviews />
          <VisitCard />
          <ClinicMap />
        </main>
      ) : (
        <HomePage />
      )}
      <footer className="site-footer">
        <div className="page-container footer-bar">
          <p>
            {STREET_ADDRESS}, Bella Vista
          </p>
        </div>
      </footer>
      <a
        className="whatsapp-float"
        href={WHATSAPP_PAGE}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        title="Contactar por WhatsApp"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            fill="currentColor"
            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
          />
        </svg>
      </a>
    </>
  );
}
