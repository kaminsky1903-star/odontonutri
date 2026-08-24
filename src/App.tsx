import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  INSTAGRAM_URL,
  MAP_QUERY,
  PHONE_LABEL,
  PHONE_TEL,
  SITE_NAME,
  STREET_ADDRESS,
  THEME_KEY,
  WHATSAPP_PAGE,
  type ThemeMode,
} from "./site";
import { applyTheme, readTheme } from "./theme";

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

function SunIcon() {
  return (
    <Icon>
      <path
        fill="currentColor"
        d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5.25a1 1 0 0 1 1 1V4.5a1 1 0 1 1-2 0V2.75a1 1 0 0 1 1-1zm0 16.5a1 1 0 0 1 1 1v1.75a1 1 0 1 1-2 0V19.25a1 1 0 0 1 1-1zM2.75 11a1 1 0 0 1 1-1H5.5a1 1 0 1 1 0 2H3.75a1 1 0 0 1-1-1zm16.5 0a1 1 0 0 1 1-1h1.75a1 1 0 1 1 0 2H20.25a1 1 0 0 1-1-1zM5.05 5.05a1 1 0 0 1 1.41 0l1.24 1.24a1 1 0 0 1-1.41 1.41L5.05 6.46a1 1 0 0 1 0-1.41zm11.25 11.25a1 1 0 0 1 1.41 0l1.24 1.24a1 1 0 1 1-1.41 1.41l-1.24-1.24a1 1 0 0 1 0-1.41zM18.95 5.05a1 1 0 0 1 0 1.41l-1.24 1.24a1 1 0 1 1-1.41-1.41l1.24-1.24a1 1 0 0 1 1.41 0zM7.7 16.3a1 1 0 0 1 0 1.41L6.46 18.95a1 1 0 1 1-1.41-1.41l1.24-1.24a1 1 0 0 1 1.41 0z"
      />
    </Icon>
  );
}

function MoonIcon() {
  return (
    <Icon>
      <path
        fill="currentColor"
        d="M12.4 2.1a1 1 0 0 1 .98 1.28A8 8 0 1 0 20.62 10.6a1 1 0 0 1 1.9.36A10 10 0 1 1 11.1 2.02a1 1 0 0 1 1.3.08z"
      />
    </Icon>
  );
}

function AutoIcon() {
  return (
    <Icon>
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2v16a8 8 0 0 0 0-16z"
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

const THEME_OPTIONS: { id: ThemeMode; label: string; icon: ReactNode }[] = [
  { id: "light", label: "Día", icon: <SunIcon /> },
  { id: "dark", label: "Noche", icon: <MoonIcon /> },
  { id: "auto", label: "Auto", icon: <AutoIcon /> },
];

function ThemeSwitch() {
  const [mode, setMode] = useState<ThemeMode>(readTheme);

  useEffect(() => {
    applyTheme(mode);
    try {
      localStorage.setItem(THEME_KEY, mode);
    } catch {
      /* ignore */
    }
    if (mode !== "auto") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("auto");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  return (
    <div className="theme-switch" role="group" aria-label="Tema">
      {THEME_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-label={option.label}
          title={option.label}
          aria-pressed={mode === option.id}
          onClick={() => setMode(option.id)}
        >
          {option.icon}
        </button>
      ))}
    </div>
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

function SiteHeader() {
  const [open, setOpen] = useState(false);
  const path = currentPath();
  const hash = window.location.hash;
  const home = path === "/" && hash !== "#contacto";

  return (
    <header>
      <div className="page-container header-bar">
        <a className="brand" href="/">
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
          <a href="/" aria-current={home ? "page" : undefined}>
            Inicio
          </a>
          <a
            href="/odontologia"
            aria-current={path === "/odontologia" ? "page" : undefined}
          >
            Odontología
          </a>
          <a
            href="/nutricion"
            aria-current={path === "/nutricion" ? "page" : undefined}
          >
            Nutrición
          </a>
          <a
            href={path === "/" ? "#contacto" : "/#contacto"}
            aria-current={path === "/" && hash === "#contacto" ? "page" : undefined}
            onClick={(event) => {
              if (path !== "/") return;
              if (!document.getElementById("contacto")) return;
              event.preventDefault();
              setOpen(false);
              window.history.replaceState(null, "", "#contacto");
              scrollToContacto("smooth");
            }}
          >
            Contacto
          </a>
        </nav>
      </div>
    </header>
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
                src="/nosotros-hero.png"
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
            <li className="process-step" tabIndex={0}>
              <span className="process-num" aria-hidden="true">
                01
              </span>
              <h3>Consulta y diagnóstico</h3>
              <p>Evaluamos tu caso y realizamos los estudios necesarios.</p>
            </li>
            <li className="process-step" tabIndex={0}>
              <span className="process-num" aria-hidden="true">
                02
              </span>
              <h3>Plan personalizado</h3>
              <p>Te explicamos las alternativas, etapas, tiempos y presupuesto.</p>
            </li>
            <li className="process-step" tabIndex={0}>
              <span className="process-num" aria-hidden="true">
                03
              </span>
              <h3>Tratamiento</h3>
              <p>Realizamos cada procedimiento de manera planificada y cuidada.</p>
            </li>
            <li className="process-step" tabIndex={0}>
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
    </main>
  );
}

export default function App() {
  const path = currentPath();

  return (
    <>
      <SiteHeader />
      {path === "/odontologia" ? (
        <main>
          <section className="specialty page-container">
            <p className="eyebrow">Odontología</p>
            <h1>Odontología</h1>
            <p className="lead">
              Implantes dentales, rehabilitación oral, endodoncia y estética.
              Atención a cargo del Dr. Kaminsky.
            </p>
          </section>
          <VisitCard />
        </main>
      ) : path === "/nutricion" ? (
        <main>
          <section className="specialty page-container">
            <p className="eyebrow">Nutrición</p>
            <h1>Nutrición</h1>
            <p className="lead">
              Nutrición clínica y deportiva, con planes para una alimentación
              saludable. Atención a cargo de la Lic. González.
            </p>
          </section>
          <VisitCard />
        </main>
      ) : (
        <HomePage />
      )}
      <footer>
        <div className="page-container footer-bar">
          <p>
            {STREET_ADDRESS}, Bella Vista
          </p>
          <ThemeSwitch />
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
