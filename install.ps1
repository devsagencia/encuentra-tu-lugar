# Script de instalación para Windows con nvm
# Ejecuta este script en PowerShell: .\install.ps1

Write-Host "Activando Node.js 20 con nvm..." -ForegroundColor Cyan
nvm use 20

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: No se pudo activar Node.js 20" -ForegroundColor Red
    Write-Host "Verifica que tengas Node.js 20 instalado con: nvm list" -ForegroundColor Yellow
    exit 1
}

Write-Host "Verificando npm..." -ForegroundColor Cyan
$nvmRoot = "$env:LOCALAPPDATA\nvm"
$nodeVersion = (nvm list | Select-String -Pattern "^\s+\d+\.\d+\.\d+" | Select-Object -First 1).ToString().Trim()

# Buscar npm en las versiones disponibles
$npmPath = $null
$versions = Get-ChildItem "$nvmRoot\v20*" -Directory | Sort-Object Name -Descending
foreach ($version in $versions) {
    $testPath = Join-Path $version.FullName "npm.cmd"
    if (Test-Path $testPath) {
        $npmPath = $testPath
        break
    }
}

if (-not $npmPath) {
    Write-Host "Error: No se encontró npm" -ForegroundColor Red
    exit 1
}

Write-Host "Usando npm desde: $npmPath" -ForegroundColor Green
& $npmPath --version

# Limpiar configuración de caché problemática
Write-Host "Configurando npm..." -ForegroundColor Cyan
& $npmPath config delete cache --global 2>$null
& $npmPath config set fetch-retries 3
& $npmPath config set fetch-retry-mintimeout 20000
& $npmPath config set fetch-retry-maxtimeout 120000

# Instalar dependencias
Write-Host "Instalando dependencias..." -ForegroundColor Cyan
& $npmPath install --legacy-peer-deps

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n¡Instalación completada exitosamente!" -ForegroundColor Green
    Write-Host "Ahora puedes ejecutar: npm run dev" -ForegroundColor Cyan
} else {
    Write-Host "`nError durante la instalación. Intenta ejecutar manualmente:" -ForegroundColor Red
    Write-Host "nvm use 20" -ForegroundColor Yellow
    Write-Host "npm install --legacy-peer-deps" -ForegroundColor Yellow
}
