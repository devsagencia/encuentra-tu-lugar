# 📊 Estado del Desarrollo - Encuentra tu Lugar

**Fecha de revisión:** 29 de enero de 2026  
**Última actualización:** Integración completa de Stripe con 4 tarifas

---

## ✅ FUNCIONALIDADES IMPLEMENTADAS

### 🔐 Autenticación y Usuarios
- ✅ Sistema de autenticación completo (email/password)
- ✅ Roles de usuario: `admin`, `moderator`, `user`
- ✅ Gestión de roles en tabla `user_roles`
- ✅ Protección de rutas según roles
- ✅ Panel de administración con acceso controlado

### 👤 Perfiles y Anuncios
- ✅ Creación de perfiles/anuncios (`/crear-anuncio`)
- ✅ Visualización de perfiles públicos (`/perfil/[id]`)
- ✅ Sistema de moderación (pending, approved, rejected, suspended)
- ✅ Verificación de perfiles (badge verified)
- ✅ Estadísticas de perfiles (views_count, rating, reviews_count)
- ✅ Categorías (aunque neutralizadas, mantiene compatibilidad)
- ✅ Campos completos: edad, idiomas, ubicación, características físicas, etc.

### 📸 Gestión de Media
- ✅ Subida de fotos y vídeos
- ✅ Sistema de visibilidad: `public`, `registered`, `paid`, `vip`
- ✅ Contadores de media privada por perfil
- ✅ Galería de perfiles con carrusel
- ✅ Storage en Supabase con políticas RLS

### ⭐ Sistema de Valoraciones
- ✅ Valoraciones 1-5 estrellas por usuario
- ✅ Registro automático de vistas de perfiles
- ✅ Cálculo automático de rating promedio y reviews_count
- ✅ Triggers para sincronizar estadísticas

### ❤️ Favoritos
- ✅ Sistema de favoritos por usuario
- ✅ Límite según plan de suscripción
- ✅ Página de favoritos (`/favoritos`)

### 📧 Contacto y Reportes
- ✅ Formulario de contacto (`/contacto`)
- ✅ Sistema de reportes de perfiles
- ✅ Motivos de reporte: spam, inapropiado, falso, acoso, otro
- ✅ Gestión de reportes en panel admin

### 💳 Sistema de Suscripciones y Pagos (STRIPE)
- ✅ **4 tarifas configuradas:**
  - Premium Visitante (19.99€/mes)
  - VIP Visitante (39.99€/mes)
  - Premium Anunciante (29.99€/mes)
  - VIP Anunciante (59.99€/mes)
- ✅ Página de suscripciones (`/suscripcion`) con pestañas separadas
- ✅ Integración completa con Stripe Checkout
- ✅ API de creación de sesiones de pago (`/api/create-checkout-session`)
- ✅ Webhook de Stripe configurado (`/api/webhooks/stripe`)
- ✅ Sincronización automática de suscripciones desde Stripe
- ✅ Tabla `subscriptions` con estados: inactive, active, past_due, canceled
- ✅ Planes guardados con formato: `premium_visitante`, `vip_anunciante`, etc.
- ✅ Variables de entorno configuradas en Vercel

### 🛡️ Panel de Administración
- ✅ Dashboard con estadísticas generales
- ✅ Gestión de perfiles (aprobar/rechazar/suspender)
- ✅ Gestión de usuarios y roles
- ✅ Gestión de suscripciones
- ✅ Moderación de contenido
- ✅ Gestión de reportes
- ✅ Gestión de consultas de contacto
- ✅ Estadísticas avanzadas (solo admin)
- ✅ Sidebar responsive (oculto en móvil, visible en desktop)
- ✅ Tablas responsive con scroll horizontal en móvil

### 🎨 UI/UX
- ✅ Diseño responsive completo
- ✅ Componentes shadcn/ui implementados
- ✅ Tema claro/oscuro (next-themes)
- ✅ Navegación intuitiva
- ✅ Filtros de búsqueda avanzados
- ✅ Hero con estadísticas dinámicas
- ✅ Cards de perfiles con información completa

### 📄 Páginas Legales y Informativas
- ✅ `/como-funciona` - Guía para usuarios
- ✅ `/informacion` - Información general
- ✅ `/legal/aviso-legal`
- ✅ `/legal/privacidad`
- ✅ `/legal/terminos`
- ✅ `/legal/cookies`

### 🗄️ Base de Datos (Supabase)
- ✅ **21 migraciones implementadas**
- ✅ Tablas principales:
  - `profiles` - Perfiles/anuncios
  - `user_roles` - Roles de usuario
  - `subscriptions` - Suscripciones
  - `profile_media` - Media de perfiles
  - `profile_ratings` - Valoraciones
  - `profile_stats` - Estadísticas diarias
  - `favorites` - Favoritos
  - `reports` - Reportes
  - `contact_submissions` - Consultas de contacto
  - `moderation_logs` - Logs de moderación
- ✅ Row Level Security (RLS) configurado
- ✅ Funciones RPC: `has_role`, `record_profile_view`, `get_user_emails_for_admin`
- ✅ Triggers para sincronización automática

---

## 🚧 FUNCIONALIDADES PENDIENTES / MEJORAS

### 🔴 Crítico / Alta Prioridad
- ✅ ~~Probar flujo completo de pago Stripe~~ (probado; webhook + sync-checkout-session OK con service_role key)
- ⚠️ **Gating de contenido según suscripción** (mostrar/ocultar según plan: public / registered / paid / vip)
- ⚠️ **Panel de creador/anunciante** (gestión de su propio perfil y contenido desde /cuenta o panel dedicado)

### 🟡 Media Prioridad
- ⚠️ **Mensajería interna** (sistema de mensajes entre usuarios)
- ⚠️ **Notificaciones** (email/push cuando hay cambios)
- ⚠️ **Búsqueda avanzada** (filtros por múltiples criterios)
- ⚠️ **Paginación** en listados (actualmente carga 50 perfiles)
- ⚠️ **Verificación de teléfono** (SMS/verificación)
- ⚠️ **KYC/Verificación de edad** para creadores

### 🟢 Baja Prioridad / Futuro
- ⚠️ **Moderación automática** (detección de contenido inapropiado)
- ⚠️ **Sistema de posts** (separado de media de perfil)
- ⚠️ **Streaming en vivo** (si aplica)
- ⚠️ **Analytics avanzados** para creadores
- ⚠️ **Suscripciones por creador** (además de globales)
- ⚠️ **Sistema de propinas** (tips)

---

## 🔧 CONFIGURACIÓN TÉCNICA

### ✅ Completado
- ✅ Next.js 16.1.6 con App Router
- ✅ TypeScript configurado
- ✅ Supabase integrado (Auth + Database + Storage)
- ✅ Stripe integrado (Checkout + Webhooks)
- ✅ Tailwind CSS + shadcn/ui
- ✅ Deploy en Vercel
- ✅ Variables de entorno configuradas
- ✅ Git y GitHub configurado

### ✅ Verificado en producción
- ✅ Webhook de Stripe (checkout.session.completed, customer.subscription.created/updated/deleted)
- ✅ SUPABASE_SERVICE_ROLE_KEY configurada (clave secreta) en Vercel
- ✅ Sync de suscripción en Cuenta (Premium/VIP visible tras pago)

---

## 📈 ESTADO ACTUAL DEL PROYECTO

### Progreso General: **~75% completado**

**Fase actual:** Entre Fase 1 y Fase 2 del plan técnico

- ✅ **Fase 0 (Preparación):** 100% completada
- ✅ **Fase 1 (MVP Contenido + Suscripción manual):** ~90% completada
  - Falta: Gating de contenido según suscripción
  - Falta: Panel de creador
- 🟡 **Fase 2 (Pagos reales + Compliance):** ~60% completada
  - ✅ Stripe integrado
  - ✅ Webhook configurado
  - ⚠️ Falta probar en producción
  - ⚠️ Falta verificación KYC/edad
- ⚠️ **Fase 3 (Moderación avanzada):** 0% completada

---

## 🎯 ROADMAP — QUÉ SEGUIR PROGRAMANDO

### Fase inmediata (antes de lanzar)

| Orden | Tarea | Descripción |
|-------|------|-------------|
| 1 | **Gating de contenido** | Respetar visibilidad de media (`public` / `registered` / `paid` / `vip`) según si el usuario está logueado y su plan en `subscriptions`. Sin esto, pagar no cambia qué se ve. |
| 2 | **Límites de favoritos** | Aplicar en backend y UI el límite de favoritos según plan (free vs premium vs vip) para que VIP tenga ventaja real. |
| 3 | **Panel de creador** | En `/cuenta` o sección dedicada: que el anunciante vea y edite su perfil, suba/organice media y (opcional) estadísticas básicas. |

### Siguiente fase (mejoras de producto)

| Orden | Tarea | Descripción |
|-------|------|-------------|
| 4 | **Paginación** | Listados de perfiles (inicio, búsqueda) con paginación o “cargar más” en lugar de cargar 50 de golpe. |
| 5 | **Búsqueda/filtros** | Afinar filtros (ubicación, edad, idiomas, etc.) y que la búsqueda sea usable en móvil. |
| 6 | **Emails de verificación** | Plantilla profesional ya creada en `supabase-email-templates/`; configurar en Supabase y (opcional) SMTP propio cuando tengas dominio. |
| 7 | **Notificaciones** | Avisos por email (o in-app) para: perfil aprobado/rechazado, nuevo mensaje (si hay mensajería), renovación de suscripción. |

### Después (mensajería y compliance)

| Orden | Tarea | Descripción |
|-------|------|-------------|
| 8 | **Mensajería interna** | Chats entre visitantes y anunciantes dentro de la plataforma (tablas `threads` / `messages`, UI de conversaciones). |
| 9 | **Verificación de teléfono** | Opcional para anunciantes (badge “teléfono verificado”) usando Supabase o proveedor SMS. |
| 10 | **KYC / verificación de edad** | Si el plan técnico lo exige: flujo para creadores (verificación manual o proveedor externo) antes de publicar contenido de pago. |

### Más adelante

- Moderación automática (detección de texto/enlaces, opcionalmente imágenes).
- Analytics para creadores (vistas, favoritos, conversiones).
- Cambio/cancelación de suscripción desde la app (Stripe Customer Portal o flujo propio).

---

## 📝 NOTAS IMPORTANTES

- **Stripe y webhook** están probados en producción (service_role key correcta; suscripción se actualiza en Cuenta).
- **Gating de contenido** sigue pendiente: hay que aplicar `profile_media.visibility` y `subscriptions.plan`/`status` en la UI y en las consultas.

---

**Última actualización:** 29 de enero de 2026
