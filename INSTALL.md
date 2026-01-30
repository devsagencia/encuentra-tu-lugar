# Instrucciones de Instalación

## Problema: npm no está disponible

Si `npm install` no funciona porque npm no está en tu PATH, aquí tienes varias soluciones:

## Solución 1: Instalar Node.js y npm

1. **Descarga Node.js** desde: https://nodejs.org/
   - Recomendado: Versión LTS (Long Term Support)
   - Esto instalará tanto Node.js como npm

2. **Reinicia tu terminal** después de instalar

3. **Verifica la instalación:**
   ```bash
   node --version
   npm --version
   ```

4. **Instala las dependencias:**
   ```bash
   npm install
   ```

## Solución 2: Usar Bun (más rápido)

Si ya tienes Bun instalado o prefieres usarlo:

1. **Instala Bun** (si no lo tienes):
   ```bash
   # Windows (PowerShell)
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```

2. **Instala las dependencias:**
   ```bash
   bun install
   ```

3. **Ejecuta el proyecto:**
   ```bash
   bun dev
   ```

## Solución 3: Usar yarn

Si tienes yarn instalado:

1. **Instala las dependencias:**
   ```bash
   yarn install
   ```

2. **Ejecuta el proyecto:**
   ```bash
   yarn dev
   ```

## Solución 4: Usar pnpm

Si prefieres pnpm:

1. **Instala pnpm:**
   ```bash
   npm install -g pnpm
   # o con PowerShell
   iwr https://get.pnpm.io/install.ps1 -useb | iex
   ```

2. **Instala las dependencias:**
   ```bash
   pnpm install
   ```

3. **Ejecuta el proyecto:**
   ```bash
   pnpm dev
   ```

## Verificar que funciona

Después de instalar las dependencias, ejecuta:

```bash
npm run dev
# o
bun dev
# o
yarn dev
# o
pnpm dev
```

El servidor de desarrollo debería iniciarse en `http://localhost:3000`

## Problemas comunes

### Error: "Cannot find module 'next'"
- Asegúrate de haber ejecutado `npm install` o `bun install` primero
- Elimina `node_modules` y `package-lock.json` (o `bun.lockb`) y vuelve a instalar

### Error: "Port 3000 is already in use"
- Cambia el puerto en `next.config.js` o usa: `npm run dev -- -p 3001`

### Error con variables de entorno
- Asegúrate de tener un archivo `.env.local` con las variables de Supabase
- Las variables deben empezar con `NEXT_PUBLIC_`

## Estructura del proyecto

- `app/` - Páginas y rutas de Next.js (App Router)
- `src/components/` - Componentes React reutilizables
- `src/hooks/` - Custom hooks
- `src/integrations/` - Integraciones (Supabase, etc.)
- `public/` - Archivos estáticos
