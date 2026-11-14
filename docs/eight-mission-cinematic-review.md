# AURORALYS — integración cinematográfica de ocho misiones

11 de noviembre de 2026. Rama local `review/eight-mission-cinematic`, creada desde `b9de4fe`. Dirección visual Apollo 15 aprobada por el usuario: `7129c6b`. No es una aprobación visual automática de las otras siete misiones.

## Transferencia segura

Se revisaron los 17 archivos de la corrección visual y los 37 de la integración desde `8a77514`. Se transfirieron selectivamente 14 archivos visuales sin solapamiento; no se fusionó ni cherry-pickeó ninguna rama. Las tres rutas compartidas se combinaron explícitamente:

- `Apollo15ScrollStory.module.css`: estilos aprobados más `.reviewRecording` y targets de `.scienceNote a` de la integración.
- `StoryHardware.tsx`: máscara original Apollo 15 más `portraitNote`, preservando la identificación terrestre de Viking/Opportunity. Los nuevos encuadres son detalles de píxeles fotográficos originales, no modelos o partes generadas.
- `storyPresentation.ts`: se parte del catálogo visual de ocho misiones, conservando Apollo 16 y las cuatro entradas de Marte, y se añade la bandera exclusiva de recorte Apollo 15. No se sobrescribió el catálogo de misiones ni el dispatcher.

`CinematicStoryLayout` ofrece slots de introducción, primera lectura, hardware, evidencia, controles y lecturas posteriores. Apollo 16 y Mars reutilizan esa composición mediante extracción de JSX; conservan hooks, callbacks, refs, textos, notas, actividades, quizzes y condiciones de avance. La primera lectura y el reproductor se montan una sola vez. La navegación sigue usando scroll nativo y Previous/Next.

El adaptador Apollo 15 y `CinematicStoryLayout.module.css` permanecen exactamente iguales a `7129c6b`; los estilos compartidos mantienen íntegro el prefijo aprobado. Los cambios adicionales de escenas y marcos se restringen a las otras misiones. La comparación en Chrome del build aprobado y el integrado confirmó siete cajas principales con geometría equivalente a menos de un píxel, mismas fuentes y colores. Se verificó el hash del HTML del servidor aprobado contra su registro de QA. No se afirma identidad píxel a píxel de capturas tomadas en distintos momentos de la transición de opacidad de imágenes.

## Ocho identidades, 40 capítulos

| Misión / story ID | Presentación y escena | Estado de voz en esta revisión |
| --- | --- | --- |
| Apollo 11 / `apollo-11-reflector` | Diagrama educativo del reflector pasivo con 100 corner cubes, sin ruedas; panorama NASA Tranquility Base jsc2008e040725; evidencia real separada | Interfaz y guiones conservados; originales privados omitidos |
| Apollo 15 / `apollo-15-rover` | LRV-1, máscara fotográfica y panorama Station 8 originales del diseño aprobado; lanzamiento S71-41356 | Grabaciones heredadas disponibles, reproducción real comprobada |
| Apollo 16 / `apollo-16-rover` | Detalle fotográfico de LRV-2 AS16-116-18578 y foto completa documental; panorama Station 10 jsc2011e118362 | Interfaz de 18 grabaciones conservada; originales omitidos |
| Apollo 17 / `apollo-17-rover` | Foto auténtica de LRV-3/Schmitt; panorama Station 5 jsc2004e20304, sin paisaje Apollo 15 | Interfaz y guiones conservados; originales omitidos |
| Sojourner / `sojourner` | Detalle de Sojourner/Yogi, fotografía completa y panorama Pathfinder PIA01005 | Interfaz de 19 grabaciones conservada; originales omitidos |
| Opportunity / `opportunity` | Ensamblaje terrestre explícitamente identificado, sin fingir que es una foto sobre Marte; paisaje de Opportunity PIA18393 | Interfaz de 19 grabaciones conservada; originales omitidos |
| Viking 1 / `viking-1` | Modelo de lander fotografiado en Tierra y etiquetado, sin ruedas; imagen de superficie de Viking 1 PIA00563 | Interfaz de 18 grabaciones conservada; originales omitidos; duplicados Opportunity no importados |
| Ingenuity / `ingenuity` | Detalle del helicóptero PIA24581 y fotografía completa; imagen aérea de su vuelo 9 PIA24727, identificada como aérea | Interfaz de 19 grabaciones conservada; originales omitidos |

Las ocho historias conservan cinco capítulos y sus IDs. `MachineStoryPage.tsx`, `storyCatalog.ts`, `ReviewStoryRecording.tsx`, `reviewMediaPolicy.ts`, `store.ts`, datos de guiones y preguntas quedan sin cambios contra `b9de4fe`. Se mantienen badges, esquema y clave `beyond-earth-progress`; ningún perfil de usuario se resetea.

## Evidencia, recursos y límites

`missionStageAssets.ts` configura únicamente paisajes por misión. `MissionSceneCredits` enlaza cada fuente y distingue una composición de una fotografía única o una reconstrucción geográfica. Los panoramas NASA pueden incluir ensamblaje/procesado original de la agencia. El diagrama de Apollo 11 nunca se etiqueta como una fotografía.

`docs/mission-cinematic-assets.json` registra URLs primarias, tamaños y hashes de las nuevas fuentes inspeccionadas. La atribución permanece visible. Ejemplos: [Pathfinder PIA01005](https://science.nasa.gov/photojournal/360-degree-color-panorama/), [Opportunity PIA18393](https://science.nasa.gov/photojournal/pillinger-point-overlooking-endeavour-crater-on-mars/), [Viking 1 PIA00563](https://science.nasa.gov/resource/first-color-image-from-viking-lander-1/). No se implica aval NASA ni permiso universal sobre material de terceros.

No se agrega ningún MP3, PDF, ZIP, JPEG, PNG, textura o modelo a Git. Descargas de inspección, capturas y referencias quedan en QA externo. Continúa la omisión deliberada de siete grupos de grabaciones: Apollo 11/16/17, Sojourner, Opportunity, Viking 1 e Ingenuity. Los textos siguen legibles; no se inventa TTS, duración o sincronización por palabra para suplirlos.

Los seis hardware sin máscara Apollo 15 y el diagrama del reflector no se convierten en renders aislados de calidad equivalente por aplicar el layout. Se usan marcos fotográficos honestos; las revisiones futuras pueden aportar recortes autorizados de mayor resolución. Viking conserva un modelo terrestre y Opportunity una foto de ensamblaje. La imagen Viking es histórica de resolución limitada; el paisaje de Ingenuity es aéreo. No se simula una misma perspectiva física entre estos documentos y los retratos.

Los fondos dependen de NASA/CDN; Apollo 16 y 17 usan panoramas de aproximadamente 1.5 y 1.9 MB. La escena nueva ofrece fallback SVG decorativo si falla su foto; hardware/evidencia conservan descripciones y acceso a fuentes. No se agregan dependencias ni se carga WebGL en estas presentaciones. Se mantiene el warning previo de chunk Three.js >500 kB, ajeno al cambio.

Las aclaraciones científicas/editoriales existentes permanecen: fechas y biología de Viking, afirmaciones del guion Sojourner, matices de Apollo 16 e inferencias geológicas/futuras de Ingenuity. Activar originales privados y resolver esas revisiones requiere una entrega editorial/autorizada separada.

## Validación ejecutada

- Suite completa final, ejecutada sin build/QA concurrentes: **255 aprobados, cero fallos/omitidos**. Son 16 pruebas adicionales respecto de las 239 de la integración original.
- Pruebas focalizadas de layout, fuentes, hardware y las ocho misiones: **19 aprobadas**. Incluyen los 40 capítulos, primera lectura única, un solo grupo de controles y selección accesible, además de protección exacta de Apollo 15/catálogo/progreso.

- Producción: `npm.cmd run build`, incluido TypeScript, correcto. `npx.cmd tsc -b --pretty false` correcto.
- Chrome headless real sobre producción local, no SSR presentado como prueba visual. Contextos incognito desechables, sin leer el progreso del usuario.
- 40 rutas completas a 1366×768 y 390×844; ocho aperturas adicionales a 360×800, 439×591 y 1024×768, y variantes reduced motion: 106 capturas de rutas/variantes, más capturas de actividades/finalización/evidencia.
- Las ocho aperturas para revisión visual se capturan a 1440×900, 1024×768 y 390×844: 24 imágenes, contact sheet de escritorio/móvil y comparación contra Apollo 15 aprobado. Se mantienen proporciones y las imágenes originales completas en los paneles de comparación.
- Verificados: un main, capítulos y hardware correctos, ausencia de overflow horizontal, carga de imágenes, ningún error JavaScript ni solicitud a audio privado. Reproducción MP3 Apollo 15, Pause/Resume y cancelación al cambiar segmento; quiz, completion, recarga, idempotencia de badges, actividad martillo/pluma, Escape, Tab, Enter y swipe táctil emulado.
- La primera pasada detectó una colisión local de nombre `surface`, corregida a `stageSurface`. Dos aserciones nuevas asumían equivocadamente que Apollo 11/17 tenían navegación numérica de segmentos; se corrigieron para comprobar su interfaz real, sin cambiar las historias.
- Una captura inicial registró imágenes pendientes tras la espera genérica de seis segundos; el QA de rutas ahora espera imágenes realmente cargadas antes de capturar. Repetición final de Chrome aprobada, sin ocultar errores de imagen/red. Único HTTP 404 observado: favicon.ico heredado.
- Una pasada de tests simultánea con build/capturas agotó el timeout SSR de cinco segundos. Se conserva ese timeout y se repite el cierre de la suite sin esas cargas concurrentes; no se relajan protecciones.

No se afirma validación en dispositivos físicos, Safari/iOS ni lector de pantalla real. Quedan revisión humana de las siete nuevas composiciones, zoom 200%, escucha autorizada, timestamps verificados, resiliencia/offline y refinamiento de recortes.

## Evidencia local y reproducción

QA externo: `$env:AURORALYS_QA_DIR (directorio externo elegido para esta revisión)`.

- `openings/contact-sheet-desktop.png`, `openings/contact-sheet-mobile.png`.
- `openings/apollo15-approved-vs-integrated.png`.
- `openings/opening-<story-id>-1440.jpg`, `-1024.jpg`, `-390.jpg`.
- `openings/cinematic-verification.json`: build hash, fuente y SHA de la captura aprobada, métricas y capturas.
- `apollo15-approved-layout-verification.json`: comparación del build aprobado y geometría calculada.
- `regression-final/verification.json`: 40 rutas y verificaciones funcionales.
- `tests-final.log`, `tests-focused-final.log`, `build.log`, inventarios y auditoría de publicación.

Desde `la raíz del worktree de revisión cinematográfica`:

```powershell
npm.cmd run build
npm.cmd run preview -- --port 5204 --strictPort
node --test --test-concurrency=1 tests/*.test.mjs
npx.cmd tsc -b --pretty false
```

Abrir `http://127.0.0.1:5204/story/<story-id>/1` usando los ocho IDs de la tabla. El servidor preview queda disponible en ese puerto al entregar. No borrar localStorage para abrir capítulos: usar Next Chapter o un contexto de QA independiente.

Las herramientas `scripts/story-cinematic-qa.mjs` y `scripts/story-visual-qa.mjs --all-missions` usan Chrome QA dedicado; el puerto se configura con `CHROME_QA_PORT`. No utilizan el perfil habitual. Pasar la captura aprobada existente como cuarto argumento de story-cinematic-qa; no recapturar un falso ANTES desde la nueva aplicación.

## Seguridad

Commit únicamente local en la nueva rama. Sin push, merge, cherry-pick, PR ni modificación de ramas originales/protegidas. Stash y demás worktrees conservados. Fuera de alcance y sin cambios: homepage, exploradores, GIS/3D, coordenadas, mapas, Esri, datos científicos y almacenamiento. No hay nueva autorización de publicación de documentos o voces privadas.

## Inventario exacto de esta integración (26 archivos)

- `docs/eight-mission-cinematic-review.md`
- `docs/mission-cinematic-assets.json`
- `docs/visual-correction-review.md`
- `docs/visual-stage-assets.json`
- `scripts/story-cinematic-qa.mjs`
- `scripts/story-design-qa.mjs`
- `scripts/story-visual-qa.mjs`
- `src/components/storytelling/Apollo15ScrollStory.module.css`
- `src/components/storytelling/Apollo15ScrollStory.tsx`
- `src/components/storytelling/Apollo16ScrollStory.tsx`
- `src/components/storytelling/CinematicStoryLayout.module.css`
- `src/components/storytelling/CinematicStoryLayout.tsx`
- `src/components/storytelling/MarsScrollStory.tsx`
- `src/components/storytelling/MissionSceneCredits.tsx`
- `src/components/storytelling/MoonPackageStory.tsx`
- `src/components/storytelling/StoryEnvironment.tsx`
- `src/components/storytelling/StoryHardware.tsx`
- `src/components/storytelling/StoryPresentation.module.css`
- `src/features/storytelling/missionStageAssets.ts`
- `src/features/storytelling/storyPresentation.ts`
- `src/features/storytelling/storyStageAssets.ts`
- `tests/cinematic-story.test.mjs`
- `tests/eight-mission-cinematic.test.mjs`
- `tests/helpers/cinematic-contract.mjs`
- `tests/helpers/story-visual-contract.mjs`
- `tests/story-presentation.test.mjs`
