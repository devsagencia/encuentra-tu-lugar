# Plantillas de email para Supabase Auth

Para que los correos de verificación (y otros) se vean profesionales y con la marca Contactalia.

## 1. Configuración básica en Supabase

1. Entra en **Supabase** → tu proyecto → **Authentication** → **Email Templates**.
2. Elige **Confirm signup** (confirmación de registro).
3. **Subject** (asunto): por ejemplo  
   `Confirma tu correo en Contactalia`
4. En **Message body** pega el contenido del archivo `confirm-signup.html` (todo el HTML, desde `<!DOCTYPE html>` hasta `</html>`).

Guarda los cambios.

## 2. Site URL y logo

- En **Authentication** → **URL Configuration**:
  - **Site URL**: la URL pública de tu app. **Si aún no tienes dominio**, usa la de Vercel (ej. `https://contactalia.vercel.app` o `https://tu-proyecto.vercel.app`). Cuando compres el dominio, solo tendrás que cambiarla aquí.
  - Así el enlace de confirmación y el logo funcionan bien.

- **Logo en el correo**: la plantilla usa `{{ .SiteURL }}/logo-email.png`.
  - Sube una imagen de logo a tu proyecto en `public/logo-email.png` (por ejemplo 320×96 px o similar, formato PNG).
  - Tras el próximo deploy, la URL será `https://tu-dominio.com/logo-email.png` y se verá en el email.
  - Si no tienes logo aún, puedes quitar la etiqueta `<img>` del HTML o usar otra ruta (ej. `favicon.ico`).

## 3. (Recomendado) SMTP propio para que lleguen los correos

Por defecto Supabase envía desde sus servidores; a veces los correos caen en spam o no llegan. Con **SMTP personalizado** suele mejorar la entrega.

- **Si ya tienes dominio**: configura Custom SMTP (Resend, SendGrid, etc.) con un correo tipo `noreply@tudominio.com`.
- **Si aún no tienes dominio**: puedes seguir usando el envío por defecto de Supabase. Revisa la carpeta de **spam** por si el correo de confirmación llega ahí. Cuando tengas dominio, añades SMTP con ese dominio para que los correos lleguen mejor.

Si quieres SMTP sin dominio propio, algunos proveedores (ej. Resend) permiten enviar desde su dominio de prueba; la bandeja de entrada puede variar.

## 4. Redirect URLs

En **Authentication** → **URL Configuration** → **Redirect URLs**, añade las URLs a las que puede redirigir Supabase tras confirmar el correo, por ejemplo:

- `https://contactalia.vercel.app/**`
- `https://contactalia.vercel.app/auth**
- `http://localhost:3000/**` (solo desarrollo)

Así, al hacer clic en “Confirmar correo” el usuario vuelve a tu app y no a una URL bloqueada.

## 5. Probar

1. Registra un usuario nuevo con un email que puedas revisar.
2. Comprueba que llega el correo con el diseño nuevo.
3. Revisa también la carpeta de **spam** si no lo ves en la bandeja principal.

## Variables de la plantilla (Supabase)

- `{{ .ConfirmationURL }}`: enlace para confirmar el correo (no lo cambies).
- `{{ .SiteURL }}`: URL de tu sitio (la que configuras en URL Configuration).
- `{{ .Email }}`: email del usuario que se registra.

No elimines `{{ .ConfirmationURL }}` del enlace del botón ni del enlace de respaldo.
