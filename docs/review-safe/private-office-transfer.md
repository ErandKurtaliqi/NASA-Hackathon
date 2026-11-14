# Transferencia privada E/F — plan, no ejecutado

11 de noviembre de 2026. `814d044` (Mars Stories E) y `44e6a65` (Apollo 16 F) siguen ausentes como objetos Git en HOME, incluso después de inspeccionar el nuevo master remoto. No se reconstruyen desde PDFs, ni se mezclan commits completos en la revisión segura.

Un bundle contiene objetos e historial, posiblemente audio/PDF y credenciales históricas: **no está cifrado**. No subir a GitHub, adjuntar a un PR, colocar en `public/`, un enlace abierto o una carpeta de XAMPP. Usar un método privado autenticado/cifrado aprobado por los responsables. Este documento no autoriza enviar originales a un repositorio concreto.

## OFFICE: producir una copia sin cambiar worktrees

En PowerShell, sustituir la ruta del repositorio por la ruta real confirmada de OFFICE. No asumir que coincide con HOME. Los comandos no cambian de rama ni incluyen archivos sin commit.

```powershell
$officeRepo = 'RUTA_REAL_DEL_REPOSITORIO_OFFICE'
git -C $officeRepo status --short --branch
git -C $officeRepo worktree list
git -C $officeRepo cat-file -e '814d044^{commit}'
if ($LASTEXITCODE -ne 0) { throw 'Mars E no disponible: detener' }
git -C $officeRepo cat-file -e '44e6a65^{commit}'
if ($LASTEXITCODE -ne 0) { throw 'Apollo 16 F no disponible: detener' }
git -C $officeRepo rev-parse '814d044^{commit}' '44e6a65^{commit}'
```

Registrar ambos hashes completos de 40 caracteres, padres, autores, fechas y `git show --stat` de cada commit. Revisar si hay trabajo sin commit: el bundle no lo contiene; respaldarlo aparte antes de cualquier cambio, sin incorporarlo automáticamente a E/F. Inspeccionar medios/secretos de su rango y conservar autoría real.

Crear referencias nuevas, sin `-f`; si ya existen, detener y comparar, no sobrescribir:

```powershell
git -C $officeRepo show-ref --verify --quiet refs/heads/transfer/office-e-20261111
if ($LASTEXITCODE -eq 0) { throw 'Referencia E existente: revisar antes' }
git -C $officeRepo show-ref --verify --quiet refs/heads/transfer/office-f-20261111
if ($LASTEXITCODE -eq 0) { throw 'Referencia F existente: revisar antes' }
git -C $officeRepo branch transfer/office-e-20261111 814d044
if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear referencia E' }
git -C $officeRepo branch transfer/office-f-20261111 44e6a65
if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear referencia F' }

$transferRoot = $env:AURORALYS_PRIVATE_TRANSFER_DIR
if (-not $transferRoot) { throw 'Configurar un directorio privado externo en AURORALYS_PRIVATE_TRANSFER_DIR' }
if (-not (Test-Path -LiteralPath $transferRoot)) {
  New-Item -ItemType Directory -Path $transferRoot | Out-Null
}
$bundlePath = Join-Path $transferRoot 'office-E-F-20261111.bundle'
if (Test-Path -LiteralPath $bundlePath) { throw 'Bundle existente: no sobrescribir' }
git -C $officeRepo bundle create $bundlePath transfer/office-e-20261111 transfer/office-f-20261111
if ($LASTEXITCODE -ne 0) { throw 'Bundle no creado correctamente' }
git -C $officeRepo bundle verify $bundlePath
if ($LASTEXITCODE -ne 0) { throw 'Bundle inválido' }
git -C $officeRepo bundle list-heads $bundlePath
Get-FileHash -LiteralPath $bundlePath -Algorithm SHA256
```

Este bundle autocontenido conserva la clausura de ancestros de esas dos refs; no usa `--all`, pero puede incluir historia compartida y medios. No se presupone que `e9573da` sea ancestro de E/F ni se excluye una base desconocida para ahorrar tamaño. Si se quiere un bundle incremental, primero acordar hashes de prerequisitos y verificarlos en ambos equipos; no improvisar exclusiones.

Transferir el archivo por el canal privado aprobado. Confirmar SHA256 y hashes E/F por un canal autenticado independiente del propio archivo. Ningún password o token se escribe en comandos publicados o en esta documentación.

## HOME: verificar en cuarentena separada

Primero comprobar SHA256 contra el valor comunicado y los dos heads completos con `git bundle list-heads`. No importar si difieren. La carpeta siguiente debe ser nueva y fuera del webroot:

```powershell
$homeRepo = $env:AURORALYS_HOME_REPO
if (-not $homeRepo) { throw 'Configurar AURORALYS_HOME_REPO' }
$transferRoot = $env:AURORALYS_PRIVATE_TRANSFER_DIR
if (-not $transferRoot) { throw 'Configurar AURORALYS_PRIVATE_TRANSFER_DIR' }
$bundlePath = Join-Path $transferRoot 'office-E-F-20261111.bundle'
$expectedSha256 = 'SHA256_CONFIRMADO_POR_EL_EQUIPO'
if ((Get-FileHash -LiteralPath $bundlePath -Algorithm SHA256).Hash -ne $expectedSha256) {
  throw 'Hash del bundle no coincide'
}
git -C $homeRepo bundle verify $bundlePath
if ($LASTEXITCODE -ne 0) { throw 'Bundle inválido o prerequisitos ausentes' }
git -C $homeRepo bundle list-heads $bundlePath

$quarantineRepo = Join-Path $transferRoot 'office-quarantine-20261111.git'
if (Test-Path -LiteralPath $quarantineRepo) { throw 'Cuarentena existente: no sobrescribir' }
git init --bare $quarantineRepo
if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear cuarentena' }
git -C $quarantineRepo fetch --no-tags $bundlePath 'refs/heads/transfer/office-e-20261111:refs/heads/incoming/office-e'
if ($LASTEXITCODE -ne 0) { throw 'Importación E falló' }
git -C $quarantineRepo fetch --no-tags $bundlePath 'refs/heads/transfer/office-f-20261111:refs/heads/incoming/office-f'
if ($LASTEXITCODE -ne 0) { throw 'Importación F falló' }
git -C $quarantineRepo rev-parse refs/heads/incoming/office-e refs/heads/incoming/office-f
```

Comparar esos dos hashes completos con los de OFFICE. Revisar `git log`, padres, `git diff --name-status`, manifiestos, IDs, assets, licencias, scripts de instalación/hooks, dependencias, store y cambios GIS antes de ejecutar código o instalar dependencias. No usar `git clone --shared`, copiar `.git` sobre el proyecto, ni ejecutar código recibido como prueba automática de confianza.

Solo después de revisar y aprobar contenido, se pueden importar refs nuevas al repositorio local de desarrollo, sin tocar sus ramas actuales:

```powershell
git -C $homeRepo show-ref --verify --quiet refs/incoming/office-e-20261111
if ($LASTEXITCODE -eq 0) { throw 'Ref local E existente: revisar antes' }
git -C $homeRepo show-ref --verify --quiet refs/incoming/office-f-20261111
if ($LASTEXITCODE -eq 0) { throw 'Ref local F existente: revisar antes' }
git -C $homeRepo fetch --no-tags --no-write-fetch-head $quarantineRepo 'refs/heads/incoming/office-e:refs/incoming/office-e-20261111'
if ($LASTEXITCODE -ne 0) { throw 'Importación local E falló' }
git -C $homeRepo fetch --no-tags --no-write-fetch-head $quarantineRepo 'refs/heads/incoming/office-f:refs/incoming/office-f-20261111'
if ($LASTEXITCODE -ne 0) { throw 'Importación local F falló' }
```

El fetch trae objetos, no modifica archivos de worktrees ni integra código. No incluir esas refs en un push genérico. Una futura revisión podrá abrir nuevos worktrees detached en rutas inexistentes fuera del webroot; no se reutilizan o borran los actuales. No hay merge, cherry-pick o rebase autorizado para la integración final en esta fase.

## Contratos que revisar antes de integrar

- Apollo 16: registro real story/hardware, cinco capítulos, identidad LRV correcta, quiz/reward, 18 MP3 y scripts, permisos, comparación de hashes del paquete y lifecycle de voz. No inventar IDs antes de leer F.
- Mars E: Sojourner, Opportunity y Viking 1, cada identidad/categoría real; capítulos, fuentes y assets originales, narración disponible, quiz/progreso y posibles dependencias comunes. Viking 1 es lander, no rover.
- Ingenuity: esperar paquete aprobado; su perfil informativo no demuestra una historia implementada. Conservar identidad de helicóptero.
- No reintroducir Perseverance al catálogo final. Conservar sus registros de progreso y evidencia histórica. Erand debe acordar el filtro de atlas/pins y créditos; no borrar Jezero o coordenadas científicas.
- Revisar por separado el master remoto `095cd1b` de cámara/animación, sin mezclarlo con E/F ni asumir aprobado el contrato GIS. La integración protegida no se movió.
- Ejecutar suites por implementación y combinada, sin sumar conteos independientes; luego QA real de navegador/audio. No publicar nuevos originales o bundle a GitHub sin autorización específica del destino.
