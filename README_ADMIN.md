# Panel de analíticas (`/admin`)

Área privada de Odontología y Nutrición. No aparece en el menú público, el sitemap ni debe indexarse.

El hosting ya sirve la SPA en rutas internas: Cloudflare Workers usa `not_found_handling: "single-page-application"` en `wrangler.jsonc`. Recargar `https://www.odontonutri.com/admin` debe devolver el sitio y React muestra el panel.

## 1. Crear el proyecto en Supabase

1. Entrá a [https://supabase.com/dashboard](https://supabase.com/dashboard) y creá un proyecto (región cercana, por ejemplo `sa-east-1`).
2. Esperá a que termine el aprovisionamiento.
3. En **Project Settings → API Keys** copiá:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Publishable key** (`sb_publishable_...`) → `VITE_SUPABASE_PUBLISHABLE_KEY`
4. El cliente web solo admite una clave que empiece con `sb_publishable_`.
5. Nunca uses `sb_secret_...`, `service_role` ni un JWT (`eyJ...`) en el frontend, en el navegador ni en ninguna variable `VITE_`.

## 2. Desactivar el registro público

1. **Authentication → Providers → Email**: dejá habilitado solo email y contraseña.
2. Desactivá **Confirm email** solo si vas a crear el usuario a mano y querés entrar de inmediato en local. En producción conviene confirmar el email.
3. **Authentication → Providers**: no habilites Google, Apple ni magia de enlace para este panel.
4. En la configuración de Auth, deshabilitá el registro público / sign-ups (o no expongas ninguna pantalla de alta; el sitio no incluye registro).

## 3. Crear el usuario administrador

1. **Authentication → Users → Add user**.
2. Cargá el email de la clínica y una contraseña fuerte.
3. Marcá el usuario como confirmado si el dashboard lo permite.
4. No guardes esa contraseña en el repositorio, en `.env` ni en el código.

## 4. URLs del sitio en Supabase

En **Authentication → URL Configuration**:

- Site URL: `https://www.odontonutri.com`
- Redirect URLs:
  - `https://www.odontonutri.com/admin`
  - `http://localhost:5173/admin`

## 5. Variables locales

1. Copiá `.env.example` a `.env.local` (este archivo está en `.gitignore`).
2. Completá solo URL y publishable key:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

3. Dejá `VITE_GA_MEASUREMENT_ID` y `VITE_CLARITY_PROJECT_ID` vacíos por ahora. No pongas secretos de Google, JSON de service account, `sb_secret_...`, `service_role` ni JWT secrets en variables `VITE_`.
4. Reiniciá `npm run dev` para que Vite lea el archivo.

Si esas dos variables de Supabase faltan o la clave no es `sb_publishable_...`, `/admin` muestra “Configuración pendiente” y no se rompe el resto del sitio.

## 6. Variables en Cloudflare (producción)

El build de Vite incrusta `VITE_*` en el bundle. En Cloudflare Workers Builds / el proyecto `odontonutri` agregá `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` para el comando `npm run build`.

No subas `.env`, `.env.local`, `.dev.vars` ni JSON de cuentas de servicio.

## 7. Probar el acceso

1. `npm run dev`
2. Abrí `http://localhost:5173/admin`
3. Ingresá con el usuario creado en el paso 3.
4. Deberías ver el dashboard con “Analíticas pendientes de conexión”.
5. Recargá la página: la sesión de Supabase debe mantenerse.
6. “Cerrar sesión” debe volver a la pantalla de acceso.

Sin sesión, `/admin` solo muestra el login. No hay atajo en JavaScript ni contraseña de demostración.

## 8. Qué no hace esta etapa

- No conecta Google Analytics, Google Ads, Search Console ni Microsoft Clarity.
- `/api/admin/analytics` exige un encabezado `Authorization: Bearer …` y responde `503` con estado pendiente. Todavía no verifica el JWT en el servidor ni devuelve métricas.
- `robots.txt` incluye `Disallow: /admin`. Eso no reemplaza la autenticación.

## Segunda etapa

Para datos reales hará falta:

1. Verificar en el Worker la sesión de Supabase con el **JWKS oficial**, no con un secreto JWT ni con `sb_secret_...`.
   - Endpoint: `{SUPABASE_URL}/auth/v1/.well-known/jwks.json`
   - Guardá `SUPABASE_URL` como variable del Worker (no es un secreto).
   - Validá el `Authorization: Bearer` contra esas claves públicas y comprobá el permiso de administrador.
   - No pongas `sb_secret_...`, `service_role` ni JWT secrets en `VITE_` ni en el navegador.
2. Credenciales de Google (service account o OAuth) y, si aplica, de Clarity; solo en el servidor (`wrangler secret` / `.dev.vars`).
3. Una función privada que consulte Analytics, Ads, Search Console y Clarity y arme el `AnalyticsSnapshot`.
4. Opcional: eventos propios de clics en WhatsApp, teléfono y mapa, si esas métricas no salen de Ads/GA.
