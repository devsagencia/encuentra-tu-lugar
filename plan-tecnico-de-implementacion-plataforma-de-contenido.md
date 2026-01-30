# Plan técnico de implementación — Plataforma de contenido (adulto digital)

> Nota: Este documento es un plan técnico. No constituye asesoramiento legal. Para operar en producción, valida requisitos legales/financieros con profesionales (cumplimiento, pagos, KYC/edad, etc.).

## Objetivo del producto

Transformar el proyecto hacia una **plataforma de contenido digital para adultos** donde:

- El valor principal es **contenido** (fotos/vídeos/streams) y **suscripción** (acceso a contenido).
- La comunicación y transacciones ocurren **dentro** de la plataforma.
- Se reduce el riesgo de “portal de anuncios/contacto” eliminando o despriorizando señales típicas:
  - sin teléfono/WhatsApp visibles,
  - sin “anuncio”/“tarifas”/“horarios para citas”,
  - moderación y enforcement fuertes.

## Alcance por fases (recomendado)

### Fase 0 — Preparación (1–3 días)
- **Rebranding UX**: vocabulario y rutas.
  - “Anuncio” → “Perfil de creador / Canal”.
  - “Publicar anuncio” → “Crear perfil”.
  - Eliminar CTAs de contacto externo.
- **Inventario del estado actual**:
  - Tablas existentes: `profiles`, `user_roles`, `moderation_logs`, `subscriptions`, `profile_media`.
  - Rutas existentes: `/auth`, `/cuenta`, `/admin`, `/perfil/[id]`.
- **Decisión de política**:
  - qué se muestra público (preview “soft”) y qué es de pago (gated).

### Fase 1 — MVP “Contenido + Suscripción (manual)” (1–2 semanas)
**Objetivo**: plataforma funcional sin pagos reales todavía, pero con gating y control.

- **Roles**
  - `user` (fan/visitante registrado)
  - `creator` (usuario con perfil creador)
  - `admin`/`moderator`

- **Perfiles (creators)**
  - `profiles` deja de ser “anuncio”; pasa a ser “perfil creador”.
  - Campos permitidos: bio/descripcion, idiomas (opcional), ubicación (solo ciudad/provincia a alto nivel si se decide), etc.
  - Campos “contacto externo” y “cita física” se eliminan o se mueven a **no visibles** / no usados.

- **Contenido**
  - Separar “media de perfil” (avatar/cover) de “posts”.
  - Tablas nuevas:
    - `posts` (id, creator_profile_id, caption, visibility: public|subscribers, created_at)
    - `post_media` (id, post_id, media_type, storage_path, position)
  - **Gating**:
    - visitantes ven previews (público),
    - suscriptores ven contenido completo.

- **Suscripciones (manual / admin)**
  - Reutilizar `subscriptions` actual:
    - `plan`, `status`, periodos.
  - El acceso “subscribers-only” se decide por:
    - `subscriptions.status = active` y `plan != free`.

- **Mensajería interna (solo dentro de la plataforma)**
  - Tablas:
    - `threads` (id, creator_profile_id, fan_user_id)
    - `messages` (id, thread_id, sender_user_id, body, created_at)
  - Moderación de mensajes:
    - filtro de links/números/keywords (ver Fase 2).

- **Moderación (manual)**
  - Estados para `profiles` y `posts`:
    - `pending`, `approved`, `rejected`, `suspended`.
  - Herramientas admin:
    - aprobar/suspender,
    - ver historial (ya existe `moderation_logs`, extender para posts).

### Fase 2 — Pagos reales + Compliance mínimo viable (2–4 semanas)
**Objetivo**: monetización real y controles de cumplimiento.

- **Pagos**
  - Stripe (si aplica) con productos/planes por creador o globales:
    - `stripe_customers`, `stripe_subscriptions`, `stripe_webhook_events`.
  - Webhooks:
    - `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`.
  - Sincronización:
    - actualizar `subscriptions` (status/periodos) desde webhooks.

- **Verificación de creadores (edad/identidad)**
  - “KYC/Edad” (proveedor externo o proceso manual):
    - `creator_verifications` (status, method, timestamps, reviewer_admin_id).
  - Requerir verificación para:
    - publicar contenido “subscribers-only”,
    - activar monetización.

- **Términos y enforcement**
  - Aceptación de términos/consentimientos:
    - `user_consents` (tos_version, age_confirmed, content_rights, timestamps).

### Fase 3 — Moderación avanzada + escalado (4–8 semanas)
**Objetivo**: robustez, seguridad, automatización.

- **Moderación automática**
  - Pipeline:
    - texto: regex + listas de keywords (números, WhatsApp, “cita”, “hotel”, “tarifa”, etc.).
    - imágenes/vídeo: integración con proveedor de detección (si aplica).
  - Estado:
    - `queued`, `flagged`, `approved`, `rejected`.

- **Anti-abuso**
  - Rate limiting (edge / server).
  - Auditoría:
    - logs de acciones admin,
    - detección de spam.

- **Panel admin ampliado**
  - cola de moderación,
  - reportes de usuarios,
  - herramientas de suspensión/baneo.

## Arquitectura técnica (recomendada)

### Frontend (Next.js App Router)
- Páginas:
  - `/` (explorar creadores/preview)
  - `/creador/[id]` (perfil público con previews)
  - `/post/[id]` (contenido; gated)
  - `/cuenta` (panel fan)
  - `/creador/panel` (panel creador)
  - `/admin` (panel admin)
  - `/auth` (login/registro)

### Backend (Supabase)
- Auth: email/password (+ 2FA opcional futura).
- DB: Postgres + RLS.
- Storage: buckets separados:
  - `creator-public` (avatar/cover, previews)
  - `creator-private` (contenido gated, acceso por signed URLs)
- Edge Functions:
  - generación de **signed URLs** para contenido privado,
  - webhooks de Stripe.

## Modelo de datos (tabla mínima objetivo)

### Usuarios / roles
- `user_roles` (ya existe)
- `profiles` (convertir a “creator profile”)
  - `status`, `verified` (verificación interna de perfil)
  - **evitar** contacto externo en público

### Contenido
- `posts`
- `post_media`

### Suscripción
- `subscriptions` (ya existe, reforzar con provider real)
- `subscription_entitlements` (opcional): qué desbloquea cada plan.

### Mensajería
- `threads`
- `messages`

### Moderación
- `moderation_logs` (ya existe; extender)
- `reports` (denuncias)

## Seguridad (RLS) — principios

- Todo contenido **privado** se lee solo si:
  - `auth.uid()` tiene una suscripción activa al creador, o
  - `auth.uid()` es `admin/moderator`, o
  - el contenido es del propio creador.
- Storage:
  - contenido privado con **signed URLs** (no public bucket).
  - policies estrictas por carpeta (uid/).

## Migración desde el estado actual (este repo)

### Cambios recomendados
- **Renombrar UI**:
  - “Crear anuncio” → “Crear perfil”
  - “Panel anunciante” → “Panel creador”
- **Retirar/ocultar** campos actuales orientados a contacto:
  - `phone`, `whatsapp` (no mostrar público; idealmente eliminar a futuro)
  - `schedule`, `zone`, etc. revisarlos según política.
- **Separar**:
  - `profile_media` (avatar/galería pública)
  - `post_media` (contenido de pago)

### Compatibilidad
Se puede hacer “soft migration”:
- mantener tablas existentes,
- dejar de usarlas públicamente,
- ir moviendo UX a `posts` + gating.

## UX profesional (guidelines)

- **Dos áreas claras**
  - Pública: descubrimiento + previews
  - Privada: contenido y mensajes (tras login y/o suscripción)
- **CTAs claros**
  - “Seguir/ Suscribirse” (no “contactar”)
  - “Ver contenido” (si tiene acceso)
- **Panel creador**
  - estado de verificación,
  - publicación de posts,
  - métricas (vistas, suscriptores),
  - configuración de planes.
- **Panel admin**
  - cola de moderación,
  - verificación de creadores,
  - gestión de suscripciones, baneos y reportes.

## Riesgos y mitigaciones (técnicos)

- **Gating con public bucket**: filtra contenido.
  - Mitigar: usar `creator-private` + signed URLs.
- **RLS incompleto**: exposición accidental.
  - Mitigar: tests de políticas + revisión por roles.
- **Pagos**: requisitos del proveedor.
  - Mitigar: separar “pago por contenido” y evitar “pago por contacto”.

## Entregables (checklist)

- [ ] Rebranding de textos/rutas (sin “anuncio”)
- [ ] Tablas `posts`/`post_media`
- [ ] Buckets públicos/privados + policies
- [ ] Signed URLs (Edge Function)
- [ ] Panel creador (subir posts, gestionar acceso)
- [ ] Panel fan (suscripciones, acceso)
- [ ] Panel admin (moderación, verificación, suscripciones)
- [ ] Webhooks Stripe + sincronización
- [ ] Verificación de creadores (manual o proveedor)

