# Solución para el problema de npm install

## Problema
npm está configurado para usar solo caché (`cache mode is 'only-if-cached'`), lo que impide descargar paquetes nuevos.

## Solución rápida

### Opción 1: Usar el script de instalación (Recomendado)

Ejecuta en PowerShell desde la raíz del proyecto:

```powershell
.\install.ps1
```

nvm use 20.20.0
npm run dev -- -p 3005

Este script:
- Activa Node.js 20 con nvm
- Configura npm correctamente
- Instala las dependencias con `--legacy-peer-deps`

### Opción 2: Instalación manual

1. **Activa Node.js 20:**
   ```powershell
   nvm use 20
   ```

2. **Configura npm para permitir descargas:**
   ```powershell
   npm config delete cache --global
   npm config set fetch-retries 3
   ```

3. **Instala dependencias:**
   ```powershell
   npm install --legacy-peer-deps
   ```

### Opción 3: Usar Bun (Alternativa)

Si npm sigue dando problemas, puedes usar Bun:

```powershell
bun install
```

Luego ejecuta:
```powershell
bun dev
```

## Nota importante

Cada vez que abras una nueva terminal, necesitarás ejecutar:
```powershell
nvm use 20
```

Para evitar esto, puedes configurar una versión por defecto:
```powershell
nvm alias default 20.20.0
```

## Verificar instalación

Después de instalar, verifica que todo funciona:

```powershell
npm run dev
```

El servidor debería iniciarse en `http://localhost:3000`


To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.


Qué hacer ahora (elige 1)
Opción A (más rápida): usar otro puerto
npm run dev -- -p 3010
Opción B: liberar el puerto 3005
En PowerShell:
netstat -ano | findstr :3005
Te saldrá un PID. Luego:
Stop-Process -Id <PID> -Force
Y después:
npm run dev -- -p 3005

node -p "process.execPath"; if (Test-Path "C:\nvm4w\nodejs\node.exe") { "exists" } else { "missing" }

node -e "const {spawn}=require('child_process'); const p=spawn(process.execPath,['-v'],{stdio:'inherit'}); p.on('error',e=>{console.error('spawn error',e); process.exit(1)});"