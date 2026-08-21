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
  WHATSAPP_URL,
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

export default function App() {
  return (
    <>
      <header>
        <div className="brand">
          <img
            className="brand-logo"
            src="/logo.png"
            alt={SITE_NAME}
            width={40}
            height={40}
          />
          <span>{SITE_NAME}</span>
        </div>
      </header>

      <main>
        <section className="hero">
          <div>
            <p className="eyebrow">Bella Vista · San Miguel</p>
            <h1>{SITE_NAME}</h1>
            <p className="lead">
              Implantes dentales, rehabilitación y estética. Nutrición clínica y
              deportiva, en un mismo espacio.
            </p>
          </div>

          <aside className="hero-card">
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
                href={WHATSAPP_URL}
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
        </section>

        <section className="services">
          <article className="service">
            <h3>Odontología</h3>
            <p>
              Implantes dentales, rehabilitación oral, endodoncia y estética.
              Atención a cargo del Dr. Kaminsky.
            </p>
          </article>
          <article className="service">
            <h3>Nutrición</h3>
            <p>
              Nutrición clínica y deportiva, con planes para una alimentación
              saludable. Atención a cargo de la Lic. González.
            </p>
          </article>
        </section>

        <section className="map-wrap" aria-label="Mapa de la clínica">
          <iframe
            title={`${SITE_NAME} en Google Maps`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${MAP_QUERY}&z=16&output=embed`}
          />
        </section>
      </main>

      <footer>
        <p>
          {STREET_ADDRESS}, Bella Vista
        </p>
        <ThemeSwitch />
      </footer>

      <a
        className="whatsapp-float"
        href={WHATSAPP_URL}
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
