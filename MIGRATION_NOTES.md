# Migración a Next.js - Notas

Este proyecto ha sido migrado de Vite + React Router a Next.js 14 con App Router.

## Cambios principales

### Estructura de archivos
- ✅ Creada estructura `app/` para App Router de Next.js
- ✅ Migradas todas las páginas a `app/` directory
- ✅ Eliminados archivos de Vite (`vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`)
- ✅ Eliminados archivos de configuración de Vite (`tsconfig.app.json`, `tsconfig.node.json`)

### Configuración
- ✅ `package.json` actualizado con Next.js y scripts actualizados
- ✅ `next.config.js` creado
- ✅ `tsconfig.json` actualizado para Next.js
- ✅ `.eslintrc.json` creado para Next.js
- ✅ `tailwind.config.ts` actualizado para Next.js
- ✅ `.env.local` creado con variables `NEXT_PUBLIC_*` para Supabase

### Componentes y hooks
- ✅ Todos los componentes actualizados para usar `next/navigation` en lugar de `react-router-dom`
- ✅ `Header.tsx` actualizado con `useRouter` y `Link` de Next.js
- ✅ `ProfileCard.tsx` actualizado con `useRouter` de Next.js
- ✅ `AdminSidebar.tsx` actualizado con `useRouter` de Next.js
- ✅ `useAuth.tsx` marcado como `'use client'` para Next.js
- ✅ Creado `Providers.tsx` para manejar providers del lado del cliente

### Rutas migradas
- `/` → `app/page.tsx`
- `/auth` → `app/auth/page.tsx`
- `/admin` → `app/admin/page.tsx`
- `/perfil/:id` → `app/perfil/[id]/page.tsx`
- 404 → `app/not-found.tsx`

### Variables de entorno
Las variables de entorno ahora usan el prefijo `NEXT_PUBLIC_` en lugar de `VITE_`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_PROJECT_ID`

### Próximos pasos

1. **Instalar dependencias:**
   ```bash
   npm install
   # o
   bun install
   ```

2. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   # o
   bun dev
   ```

3. **Construir para producción:**
   ```bash
   npm run build
   npm run start
   ```

4. **Verificar que todas las rutas funcionan correctamente**

5. **Revisar componentes que puedan necesitar ajustes para SSR/SSG**

### Notas importantes

- Todos los componentes que usan hooks de React o navegación deben tener `'use client'` al inicio
- El layout principal (`app/layout.tsx`) es un Server Component por defecto
- Los providers están en un componente cliente separado (`src/providers/Providers.tsx`)
- Supabase client ahora verifica `typeof window !== 'undefined'` antes de usar `localStorage`
