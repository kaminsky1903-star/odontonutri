# Métricas de /admin

## Cambios para revisión local

- Selector global: hoy, últimos 7 días, últimos 30 días y rango personalizado (hasta 366 días). Fechas calendario de Argentina, incluido hoy; no incluye eventos futuros.
- Visitantes: identificador de navegador distinto en los eventos del período. Una persona con varios dispositivos puede contarse varias veces. Si falta el identificador, se usa la sesión y se advierte que es una estimación. Se recupera el visitante de otros eventos de su misma sesión cuando está disponible.
- Sesiones: identificadores de sesión distintos, sin cambiar la identificación existente en sessionStorage. No equivale necesariamente a una sesión GA4 con expiración por inactividad.
- Clics: cantidad de eventos de WhatsApp, teléfono y ubicación; contactos únicos: visitantes con uno o más de esos eventos.
- Conversión: contactos únicos / visitantes del mismo período. Sin visitantes, o con eventos sin ninguna identidad, no se calcula el porcentaje.
- Gráfico: visitantes y contactos únicos de cada día. La suma de días puede superar los visitantes únicos del período.
- Fuentes y campañas se atribuyen a la primera entrada disponible de cada sesión. Una persona puede aparecer en varios grupos. Las páginas de entrada pueden ser parciales cuando la sesión empezó antes del historial consultado.
- WhatsApp histórico y actividad de los últimos 5 minutos se conservan como referencias con períodos propios, indicados explícitamente.
- El tiempo hasta el clic es tiempo transcurrido entre eventos, no tiempo activo de lectura.
- Eventos paginados con orden por fecha e ID y corte temporal fijo. Si falla una página, no se muestran totales parciales como completos.

## Google y anuncios

Se prepara una columna adicional `traffic_attribution` en `analytics_events`. Guarda versión, utm_source, utm_medium, utm_campaign y presencia/tipo de gclid, gbraid o wbraid. No guarda los valores de esos identificadores publicitarios. No cambia visitor_id, session_id ni las exclusiones de dispositivos.

- Google Ads: señal publicitaria de Google o fuente Google con medio de pago.
- `google.com`: nuevo registro con referente Google y sin etiquetas de campaña ni señal publicitaria. Es tráfico orgánico probable, pero no demuestra ausencia de publicidad.
- Google sin determinar: registros históricos o evidencia insuficiente.
- syndicatedsearch.goog se muestra como `syndicatedsearch`; internamente conserva el origen técnico y no se clasifica como anuncio salvo que haya una señal publicitaria explícita.

## Antes de publicar

1. Revisar y aplicar `supabase/migrations/20260908100000_analytics_traffic_attribution.sql` en Supabase. Esta tarea solo preparó el archivo; no ejecutó la migración.
2. Confirmar el etiquetado automático de Google Ads y las UTM de las campañas. No se modificó la cuenta de anuncios.
3. Configurar las variables locales indicadas en `.env.example` para probar una sesión real. La demo en `_site_probe/` está excluida de Git y usa datos ficticios; no está conectada a Supabase.
4. Ejecutar tests, typecheck y build, y publicar solo con autorización.

El lector y el registro mantienen compatibilidad con el esquema previo si falta la nueva columna. Los errores ajenos al esquema no provocan reintentos del nuevo insert, evitando duplicaciones por respuestas ambiguas.

## Datos que aún no existen

No se agregaron un CRM, estados de turnos/pacientes, gasto de Ads, costo por paciente, consultas reales de WhatsApp, búsquedas exactas ni medición de lectura activa. Requieren nuevas fuentes o un flujo de registro específico. El historial de Google no se reclasifica como pago u orgánico por suposición.
