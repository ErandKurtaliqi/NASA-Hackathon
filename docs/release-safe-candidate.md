# AURORALYS — candidato de publicación saneado

## Alcance y procedencia

Rama: `review/eight-mission-release-safe`. Base publicada: `8a77514c8841c6f518b0b2d71421f455b6ef9702`. Snapshot funcional y visual de origen: `f0996303f9e899aa5913db2cbb169a393a49dc9b`.

El árbol final se trasladó mediante `git merge --squash --no-commit review/eight-mission-cinematic` sobre un worktree nuevo y limpio basado en 8a77514. No hubo conflictos. Se crea un único commit hijo de esa base; los commits locales originales no se fusionan ni cherry-pickean. Las ramas y los respaldos originales se conservan.

No se rediseñó ninguna misión. Todos los archivos de `src/`, `public/`, dependencias y configuración de build conservan los mismos blobs que f099630. Se mantienen ocho misiones y cuarenta capítulos, sus escenas aprobadas, narrativa, audio/captions, actividades/quizzes, navegación, accesibilidad, progreso y badges. Homepage, GIS/3D, coordenadas y mapas permanecen intactos.

## Saneamiento autorizado

Las rutas de perfil personal y las rutas fijas del equipo se sustituyen por rutas relativas o configuración explícita en documentación y QA. No se incluyen nombres reales de usuarios o carpetas personales como valores de ejemplo.

- `docs/mission-integration/README.md`, `docs/visual-correction-review.md` y `scripts/story-design-qa.mjs`: se eliminan ubicaciones personales de paquetes y referencias.
- Se hacen portables las rutas de los otros informes/checklists y del procedimiento de transferencia privada. Los valores privados se configuran fuera de Git mediante variables de entorno.
- El script visual exige un directorio QA externo y una referencia existente. Rechaza el checkout como destino y también junctions/symlinks que resuelvan dentro de él antes de crear el directorio. Los nombres de salida siguen confinados al directorio QA elegido.
- Tres pruebas dependían de objetos Git no publicados. Sus contratos de regresión se conservan con SHA-256 revisados en `tests/fixtures/release-source-baselines.json`, normalizando LF o JSON canónico según el caso. No se copian scripts originales adicionales, grabaciones ni PDFs a los fixtures. Los hashes de procedencia son metadatos, no ancestros Git.
- `tests/release-safety.test.mjs` comprueba argumentos obligatorios, configuración por entorno, confinamiento de salidas y restricción a orígenes loopback.

Las variables utilizadas son `AURORALYS_QA_DIR`, `AURORALYS_APOLLO15_REFERENCE`, `AURORALYS_QA_BASE_URL` y `CHROME_QA_PORT`; las instrucciones operativas antiguas también identifican variables para los worktrees y entradas privadas. No hacen falta paquetes privados para compilar o ejecutar las pruebas de esta revisión.

## Validación actual

- Suite completa nueva: **260 pruebas aprobadas, cero fallos/omitidos**.
- TypeScript (`npx.cmd tsc -b --pretty false`) y producción (`npm.cmd run build`): correctos. Se mantiene el warning previo del chunk Three.js.
- Cinco pruebas nuevas de configuración/confinamiento QA, más las regresiones completas de ocho misiones y persistencia.

Chrome sobre el build de este candidato verificó las cuarenta rutas a escritorio y móvil, las ocho aperturas en tamaños pequeños/tablet y reduced motion: 106 capturas de rutas/variantes, más evidencia de actividades/finalización. Sin overflow horizontal, imágenes rotas, errores JavaScript ni requests de grabaciones privadas. Se comprobaron reproducción disponible de Apollo 15, Pause/Resume, cambio de segmento sin autoplay, quizzes, completion, recarga, badges idempotentes, Escape/Tab/Enter y touch emulado. El favicon.ico heredado continúa devolviendo 404.

`story-design-qa.mjs` se ejecutó realmente con argumentos CLI y otra vez usando solo variables de entorno, ambas contra el candidato: cada pasada validó 1440×900, 1024×768 y 390×844, comparativas y acceso a controles de audio tras cambiar segmento. Las capturas OLD son copias byte-idénticas de los registros anteriores; no se generó un falso ANTES desde el nuevo build.

La comparación adicional de Apollo 15 contra el build fuente confirmó geometría, fuentes y colores en siete elementos principales a 1440×900 y 390×844. La igualdad de los blobs de aplicación es el criterio de preservación del snapshot; no se afirma igualdad byte por byte de los artefactos generados, cuyos hashes pueden variar con finales de línea del checkout.

Los registros nuevos, las comparativas y los informes de privacidad permanecen en el directorio QA externo configurado, sin agregarse a Git. La reproducción de una clonación independiente se registra en esos artefactos al cerrar la entrega. Las pruebas históricas existentes requieren una clonación completa con las referencias ya publicadas; no necesitan los tres commits locales descartados.

## Reproducción portable

Desde la raíz del nuevo worktree:

```powershell
node --test --test-concurrency=1 tests/*.test.mjs
npx.cmd tsc -b --pretty false
npm.cmd run build
npm.cmd run preview -- --port 5206 --strictPort
```

Para QA, configurar `CHROME_EXE` con el ejecutable instalado, `AURORALYS_QA_DIR` con una carpeta externa y `AURORALYS_APOLLO15_REFERENCE` con la referencia autorizada local. No guardar esos valores personales en archivos versionados. Copiar en el directorio QA las capturas OLD auténticas antes de ejecutar el script de comparación; no reemplazarlas por capturas del candidato.

```powershell
$env:CHROME_QA_PORT = '9342'
$env:AURORALYS_QA_BASE_URL = 'http://127.0.0.1:5206'
if (-not $env:CHROME_EXE) { throw 'Configurar CHROME_EXE' }
$qaProfile = Join-Path $env:TEMP ('auroralys-release-qa-' + [guid]::NewGuid().ToString('N'))
Start-Process -FilePath $env:CHROME_EXE -WindowStyle Hidden -ArgumentList '--headless=new','--remote-debugging-port=9342',"--user-data-dir=$qaProfile",'--no-first-run','about:blank'
node scripts/story-visual-qa.mjs "$env:AURORALYS_QA_DIR/routes" http://127.0.0.1:5206 --all-missions
node scripts/story-design-qa.mjs
```

La última línea usa la configuración por entorno. También acepta argumentos explícitos: directorio QA, archivo de referencia y URL local.

## Medios, privacidad y límites

No se agregan MP3, PDF, ZIP, imágenes binarias, modelos, caches ni secretos. Los 22 MP3 heredados y demás recursos públicos son idénticos a la base publicada. Las URLs NASA y sus créditos se conservan; los manifiestos contienen referencias/hashes, no los archivos privados.

Apollo 11/16/17, Sojourner, Opportunity, Viking 1 e Ingenuity conservan interfaces y lectura, pero sus siete grupos de grabaciones permanecen deliberadamente excluidos mediante la política y el adaptador existentes. No se inventa audio, TTS, sincronización precisa ni autorización de redistribución. Las observaciones editoriales/científicas pendientes, derechos de voz/PDF y pruebas físicas/Safari/lectores de pantalla siguen siendo límites de entrega, no nuevas aprobaciones.

Solo se permite el commit local de este candidato. Esta preparación no autoriza push, PR, merge en ramas protegidas ni publicación de los medios excluidos. La historia saliente debe auditarse como exactamente un commit sobre origin/review/haroon-visual-storytelling antes de cualquier autorización humana de publicación.
