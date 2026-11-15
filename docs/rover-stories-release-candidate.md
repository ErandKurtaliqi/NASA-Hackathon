# Candidato local de Rover Stories — 9 de noviembre de 2026

Objetivo de revisión de Haroon: 10 de noviembre. Este informe distingue el candidato combinado de los workstreams aislados; sus resultados no se suman como si fueran un único build.

## Estado Git y procedencia

- Repositorio raíz: `la raíz del repositorio`, rama protegida `integration/main-feature-review`, commit `8120d9ecba6babb9e2c0695c02c6ef96234b359b`.
- Candidato: rama `review/rover-stories-release-candidate`, worktree `rover-stories-release-candidate`, creado desde esa base.
- **HEAD del candidato sigue en 8120d9e. Los cambios combinados están sin commit, sin staging de contenido y sin push**, pendientes de revisión. Se aplicaron patches binarios inspeccionados con `git apply --check` y `git apply`; no se ejecutó un merge ni se modificó la ascendencia de las ramas originales.
- Se consultaron las referencias reales de GitHub mediante `git ls-remote --heads origin`; coinciden con los objetos locales siguientes. Todas tienen merge-base `8120d9e`.

| Workstream remoto | HEAD verificado | Resultado de revisión |
|---|---|---|
| A — audio | `a6a8629354691655ff632131e49df5607450628e` | 12 archivos: reviewer/candidatos ASR y correcciones de reproducción/cues. Inspeccionado; **no integrado**. 0/19 grabaciones certificadas por escucha, cues de producción pendientes. |
| B — Apollo 17 | `f1bd132f202ec0006a0f41674100466b3e84db7d` | 18 archivos revisados y aplicados localmente al candidato. Presentación 2D/scroll y voz opcional del navegador, sin MP3 inventados. |
| C — actividad | `64c046273074e135e3c4759ee56a83b43618b924` | 9 archivos nuevos, sin solapamiento directo con B. Aplicados y conectados como actividad opcional en Apollo 15, capítulo 4. |
| D — contrato de mapas | `3e8fa5922aaa7718e9c8e57d272ba8fdb9805574` | 2 documentos inspeccionados; contrato propuesto, no aprobado por Erand. Sin código GIS integrado. |

Los documentos B/C copiados al candidato describen su revisión original del 8 de noviembre y conservan ese contexto histórico. Este informe registra la integración local actual.

E permanece independiente en `mars-stories`, rama `review/workstream-e-mars-stories`, commit local `814d0443f65c77164635bc43b643a2aea2799d5f`: **92 archivos comprometidos localmente y worktree limpio**. Sojourner/Opportunity/Viking 1 no se incorporaron al candidato; sus 56 MP3 y tres PDF siguen locales con permiso de redistribución pendiente.

F quedó implementado por separado en `apollo16`, rama `review/workstream-f-apollo16`, desde `8120d9e`, sin commit ni staging: **43 archivos, 9 modificados y 34 nuevos**. Sus resultados y reservas editoriales se documentan en su informe independiente de Apollo 16. No se copian sus grabaciones ni PDF al candidato.

Estado comprobado de Apollo 16: identidad `apollo-16-rover`, hardware `lrv-2`, cinco capítulos y quiz original B/A/B de cuatro opciones. Reutiliza layout, scroll, reproductor, evidencia y confirmación de guardado; los quince textos originales permanecen acompañados de notas editoriales y la voz sólo se inicia mediante acción explícita. Los 18 MP3 (4/4/3/4/3; 4.111.629 bytes) conservan todos sus bytes y etiquetas. Seis imágenes NASA de Apollo 16, 353.377 bytes, con fotografías y fotogramas distinguidos; no se usan fotos de otra misión como sustitutos. El PDF de ocho páginas sigue dentro del ZIP externo, fuera de public/dist.

Validación F independiente: **176/176 tests, cero omitidos**, repetida por el coordinador, build de producción y TypeScript correctos, whitespace del diff y de todos los textos nuevos correcto. Render de cinco rutas nuevas, preservación de las quince anteriores, 64 combinaciones del quiz, navegación/progreso real/rechazo de storage/retry/insignias y reproductor compartido. Preview de producción local `http://127.0.0.1:5187/story/apollo-16-rover/1`; cinco rutas y Hardware/Dashboard sirven HTML; 18 audios y seis imágenes coinciden por HTTP con sus hashes y el audio admite Range 206. No se declara validación visual ni auditiva real.

Las 18 grabaciones F contienen ID3v2.4/GEOB `application/c2pa` con declaraciones Eleven Labs Inc. y trainedAlgorithmicMedia, preservadas sin modificación. No se verificó criptográficamente la firma ni se deducen derechos de esas etiquetas; permiso de redistribución pendiente. Las notas científicas distinguen fechas UTC/EST, metáforas del guion, límites del recorrido a pie, Stone Mountain/North Ray, el guardabarros y la cámara ultravioleta independiente. El recuento original de fuentes ultravioletas requiere revisión especializada. Todos los cues siguen `pending`.

**176 no se suma a 188:** F aún no está integrado en el candidato B+C. Cualquier integración futura debe coordinar catálogo/registro/página y sus tests, y pasar una nueva suite combinada.

No se hizo commit/push/PR, merge, rebase ni despliegue público en esta preparación. Se preservan main, la integración protegida, A–D, E, los worktrees, respaldos y stashes. Los servidores de revisión se vinculan únicamente a `127.0.0.1`.

## Qué está integrado realmente

El candidato contiene **tres historias y quince capítulos**:

1. Apollo 15: conserva identidad `apollo-15-rover` / hardware `lrv-1`, sus 19 MP3, guiones, capítulos, controles, quiz, premios y guardado. Se añade únicamente el ejercicio opcional de C al capítulo de legado, donde está el experimento histórico del martillo y la pluma.
2. Apollo 17: conserva identidad `apollo-17-rover` / hardware `lrv`, registro científico, preguntas y premio. B sustituye su presentación por el layout compartido Rover Story, selección por scroll, botones, fuentes y voz opcional del navegador. No hay nuevas grabaciones aprobadas para esta misión.
3. Perseverance: conserva los cinco capítulos existentes, piloto, modelo, navegación, quiz, confirmación de completado y guardado.

La actividad de predicción tiene radios y envío explícitos, feedback específico, fuente NASA, reintento y foco. **No guarda progreso, no entrega insignias y no bloquea avanzar**. No tiene callbacks de completado, store, audio ni navegación propios. Está incluida en el bundle normal de producción, no solamente en `activity-preview.html`; esa página sigue siendo una demo de desarrollo.

No se integran todavía Apollo 16, Sojourner, Opportunity o Viking 1 en este candidato. No se crean pins ni relaciones geográficas nuevas.

## Conflictos y resoluciones

- B y C no compartían archivos modificados: aplicación limpia de ambos patches, sin conflictos Git de texto/binario.
- C era una demo aislada y no estaba montada en el producto. Se añadieron **dos imports y una línea de render** a `Apollo15ScrollStory.tsx`, sólo bajo `index === 3`.
- El test de ownership de B exigía que todo Apollo 15 fuera idéntico a la base. Falló al montar C. Se añadió `withoutReleaseActivity`, que elimina exactamente esas tres líneas al comparar; todo lo demás sigue protegido por igualdad de fuente. No se retiró el test.
- Los hosts React escritos a mano no exponían `useId`, usado por los radios accesibles de C. Se añadió el hook estable a esos hosts, sin sustituir el componente real ni el adaptador de persistencia. La actividad continúa teniendo identificadores separados por instancia.
- En Windows, el checkout CRLF del guion Apollo 15 fallaba una comparación histórica de bytes contra Git. Se restauró el archivo a los bytes exactos del blob de `8120d9e`, sin cambio de contenido ni diff Git. Su hash Git sigue siendo `8a4f0c9ad8483f62f5d144d9000165d4e3d3c4de`; el índice sólo refrescó su estado, sin cambio staged.
- A modificaría `Apollo15ScrollStory.tsx` y `StoryRecording.tsx` y requeriría coordinar el nuevo punto de montaje y guards de B. No se aplicó por inercia. Sus candidatos ASR no son timestamps aprobados.

## Validación del candidato combinado

| Fase | Pruebas focalizadas | Suite completa | TypeScript / producción |
|---|---:|---:|---|
| Base reproducida | — | 165/165 | Correctos |
| B aplicado | 50/50 (B + progreso real) | 173/173 | Correctos |
| B + C, antes de conectar la actividad | 14/14 (B + C) | 181/181 | Verificados con el montaje final siguiente |
| C conectado en Apollo 15 | 61/61 (B, C, progreso e integración) | 184/184 | Correctos |
| Auditoría adicional del candidato | 4/4 | **188/188, cero fallos** | Build final de aplicación correcto; `tsc -p tsconfig.app.json --noEmit --pretty false` correcto |

Comandos: `node --test tests/*.test.mjs`, `npm.cmd run build`, `node_modules/.bin/tsc.cmd -p tsconfig.app.json --noEmit --pretty false`.

Las tres pruebas nuevas dentro del host de persistencia ejercitan predicción correcta e incorrectas desde la página real: selección, envío, foco, evidencia, reintento, almacenamiento rechazado sin intento de escritura de la actividad, pista de audio conservada y paso posterior al quiz sin completarlo automáticamente. El store real se conserva; sólo se aíslan router/GPU/audio y hooks del host de test.

`tests/release-candidate.test.mjs` comprueba además:

- Inventario y bytes de **todos los MP3 preexistentes** idénticos a la base.
- Ausencia de nuevos audios/PDF E/F en el candidato.
- Homepage, exploradores, identidades de misiones, registros científicos, GIS/3D y store iguales a la base.
- Fuentes de producción B/C idénticas a sus ramas revisadas.
- Render React de los quince capítulos: C aparece solamente en Apollo 15, capítulo 4; Apollo 17 usa su rama nueva.

`git diff --check` correcto; también se comprobaron los archivos de texto nuevos con `git diff --no-index --check NUL <archivo>`. Pueden aparecer avisos LF/CRLF de Git en Windows; no se alteró la configuración Git.

Build final: 2.654 módulos. Permanece el aviso preexistente de React Three Fiber, 823,49 kB minificados. El chunk de historia combinado es aproximadamente 120,39 kB; no se promete una mejora de rendimiento móvil sin medición.

## Medios, ciencia y permisos

Las cuatro imágenes B conservan sus hashes y procedencia NASA. Se reconsultaron la galería Apollo 50th y los registros NASA API `S72-55070` y `7036668`, y se inspeccionaron visualmente los JPEG locales. El catálogo 7036668 contiene una descripción histórica con un recuento de misiones incorrecto; esa frase no se copia al contenido de la aplicación.

La actividad C reutiliza S71-43788, **fotograma real de TV**. La [fuente NASA del experimento](https://science.nasa.gov/resource/the-apollo-15-hammer-feather-drop/) permite examinar el vídeo; la UI no afirma que una imagen fija pruebe tiempos de caída exactos. [Galería Apollo NASA](https://www.nasa.gov/specials/apollo50th/photos.html).

Pendientes:

- Apollo 15: las 19 entradas de caption timing siguen `pending`; no se activaron los candidatos de A. Escuchar, corregir y aprobar las frases antes de llamarlas sincronizadas. Los tres audios de quiz requieren transcripción aprobada.
- Apollo 17: voz sintética del navegador, claramente identificada. Calidad/disponibilidad offline dependen del dispositivo. No existe aquí un paquete MP3 de Haroon ni timestamps que se puedan afirmar.
- Algunos pasos B no tienen fotografía directa seleccionada: muestran una tarjeta de fuente, sin sustituir una foto de otra misión. Curación adicional es mejora pendiente.
- E: permiso de los tres PDF y 56 MP3 pendiente; notas científicas de Sojourner y Viking requieren cierre editorial. Sus 37 MP3 de Sojourner/Viking incluyen metadatos ElevenLabs sin documentación del plan/licencia.
- F: permiso del PDF y 18 MP3 también pendiente; no publicar por estar ya implementados localmente. Su informe propio separa guion original de notas científicas.
- Se mantienen créditos y restricciones NASA/terceros, sin afirmar respaldo institucional. No se descargaron imágenes ajenas a la misión como sustitutos.

El contrato D sigue pendiente del propietario GIS: selección externa desde pins, nuevos IDs/ubicaciones para Apollo 15/16 y bindings explícitos. No se añaden coordenadas ni overlays de pins ficticios para la demo. Hardware Lab y las rutas actuales permiten entrar en las historias sin ese trabajo.

## Pruebas locales y revisión manual

Se inició el preview del build de producción en `http://127.0.0.1:5186/`.

```powershell
Set-Location -LiteralPath $env:AURORALYS_RELEASE_WORKTREE
npm.cmd run build
npm.cmd run preview -- --port 5186 --strictPort
```

- `http://127.0.0.1:5186/story/apollo-15-rover/1`
- `http://127.0.0.1:5186/story/apollo-15-rover/4` (requiere capítulos anteriores; actividad opcional).
- `http://127.0.0.1:5186/story/apollo-17-rover/1`
- `http://127.0.0.1:5186/story/follow-perseverance/1`
- `http://127.0.0.1:5186/hardware`, `/dashboard`, `/explore/moon`.

Smoke HTTP: quince rutas SPA, cuatro JPEG B y diecinueve MP3 Apollo 15 servidos con bytes correctos. Se comprobó que el bundle incluye C y que `dist` conserva sólo el inventario MP3 original, sin PDF ni carpetas de audio nuevas E/F. **HTTP 200 y SSR no equivalen a revisión de navegador.**

Computer Use devolvió `apps: [], browsers: []`; no se pudo completar revisión visual/táctil ni escucha real. Usar perfil de prueba o ventana privada, sin borrar progreso habitual. Revisar:

1. Desktop y 360×800, 390×844, 439×591; zoom de texto 200%, sticky y tarjetas activas visibles, ausencia de overflow que oculte controles.
2. Tab/Enter/Space, radios con flechas, foco tras enviar/reintentar, retorno al capítulo y lector de pantalla.
3. Audio Apollo 15 y voz Apollo 17: play/pause/resume/replay/mute, cambio de segmento/capítulo, Back, ocultar pestaña, errores e imagen no disponible. Confirmar que no haya solapamiento ni autoplay.
4. Movimiento reducido, scroll/touch nativo, opt-out del avance al cruzar el fin de capítulo y ausencia de avance involuntario desde el quiz o la actividad.
5. Quiz: respuestas correctas/incorrectas, última explicación, View Results, Complete Story, retry, badge único y dashboard tras recarga. Rechazo de storage y Retry saving sin confirmación falsa.
6. Perseverance: capítulos 1–5 y escena/landing existentes. El código y las pruebas están protegidos; falta la comprobación con GPU real.

## Secuencia mínima para una demo estable

1. Revisar este diff B+C y completar el smoke manual de las tres historias. Mantener el candidato libre de E/F y de APIs GIS propuestas mientras falten permisos/aprobación.
2. Aprobar el candidato antes de cualquier commit, push o despliegue. El build local ya es demostrable; no se necesita integrar siete historias para demostrar una ruta estable.
3. Revisar Apollo 16 aisladamente con Haroon: guion/voz, evidencia, quiz, finalización, móvil y permisos. Sólo después coordinar sus tres seams de catálogo/registro/página y tests de recuento con el candidato.
4. Cerrar las notas editoriales/licencias de E antes de considerar su registro de tres misiones y nuevos medios. No copiar los ZIP ni el duplicado Opportunity.
5. Revisar A por separado: sus correcciones de runtime pueden evaluarse sin activar ASR/cues no aprobados. GIS/2D de Erand permanece fuera del release frontend hasta acordar el contrato D.

## Inventario exacto del candidato

La lista de archivos se añade al final mediante cotejo de Git; incluye imports/renderer B, montaje C, tests, cuatro imágenes NASA y documentación. No incluye `dist`, logs, caches ni el junction `node_modules`.

Total actual: **34 archivos** (11 modificados y 23 nuevos), sin cambios staged.

- `activity-preview.html`
- `docs/rover-stories-release-candidate.md`
- `docs/workstream-b-apollo17.md`
- `docs/workstream-c-activity.md`
- `public/images/apollo17-story/launch.jpg`
- `public/images/apollo17-story/orange.jpg`
- `public/images/apollo17-story/rover.jpg`
- `public/images/apollo17-story/vehicle.jpg`
- `src/components/MachineStoryPage.tsx`
- `src/components/storytelling/Apollo15ScrollStory.tsx`
- `src/components/storytelling/Apollo17BrowserVoice.tsx`
- `src/components/storytelling/Apollo17ScrollStory.module.css`
- `src/components/storytelling/Apollo17ScrollStory.tsx`
- `src/components/storytelling/activities/ActivityPreview.module.css`
- `src/components/storytelling/activities/ActivityPreview.tsx`
- `src/components/storytelling/activities/EvidencePredictionActivity.module.css`
- `src/components/storytelling/activities/EvidencePredictionActivity.tsx`
- `src/features/storytelling/activities/apollo15Prediction.ts`
- `src/features/storytelling/activities/evidencePrediction.ts`
- `src/features/storytelling/apollo17StoryMedia.ts`
- `src/features/storytelling/apollo17StorySteps.ts`
- `tests/apollo-progress-persistence.test.mjs`
- `tests/apollo15-registration.test.mjs`
- `tests/helpers/apollo-quiz-contract.mjs`
- `tests/helpers/release-activity-contract.mjs`
- `tests/release-candidate.test.mjs`
- `tests/shared-navigation.test.mjs`
- `tests/storytelling-challenges.test.mjs`
- `tests/storytelling-landmarks.test.mjs`
- `tests/storytelling-legacy.test.mjs`
- `tests/storytelling-media.test.mjs`
- `tests/storytelling-quiz.test.mjs`
- `tests/workstream-b-apollo17.test.mjs`
- `tests/workstream-c-activity.test.mjs`

## Inventario exacto de F, separado del candidato

Estos 43 archivos pertenecen exclusivamente a `apollo16` (9 modificados, 34 nuevos); no son parte del diff B+C. El PDF original sigue fuera del worktree, en el ZIP de entrada.

- `docs/apollo16-input-manifest.json`
- `docs/workstream-f-apollo16.md`
- `public/audio/apollo-16/chapter-1/1.mp3`
- `public/audio/apollo-16/chapter-1/2.mp3`
- `public/audio/apollo-16/chapter-1/3.mp3`
- `public/audio/apollo-16/chapter-1/4.mp3`
- `public/audio/apollo-16/chapter-2/1.mp3`
- `public/audio/apollo-16/chapter-2/2.mp3`
- `public/audio/apollo-16/chapter-2/3.mp3`
- `public/audio/apollo-16/chapter-2/4.mp3`
- `public/audio/apollo-16/chapter-3/1.mp3`
- `public/audio/apollo-16/chapter-3/2.mp3`
- `public/audio/apollo-16/chapter-3/3.mp3`
- `public/audio/apollo-16/chapter-4/1.mp3`
- `public/audio/apollo-16/chapter-4/2.mp3`
- `public/audio/apollo-16/chapter-4/3.mp3`
- `public/audio/apollo-16/chapter-4/4.mp3`
- `public/audio/apollo-16/chapter-5/1.mp3`
- `public/audio/apollo-16/chapter-5/2.mp3`
- `public/audio/apollo-16/chapter-5/3.mp3`
- `public/images/apollo16-story/big-muley.jpg`
- `public/images/apollo16-story/field.jpg`
- `public/images/apollo16-story/grand-prix.jpg`
- `public/images/apollo16-story/liftoff.jpg`
- `public/images/apollo16-story/north-ray.jpg`
- `public/images/apollo16-story/rover.jpg`
- `src/components/MachineStoryPage.tsx`
- `src/components/storytelling/Apollo16Quiz.tsx`
- `src/components/storytelling/Apollo16ScrollStory.tsx`
- `src/data.ts`
- `src/features/storytelling/apollo16AudioManifest.json`
- `src/features/storytelling/apollo16ImageManifest.json`
- `src/features/storytelling/apollo16Recordings.ts`
- `src/features/storytelling/apollo16Story.ts`
- `src/features/storytelling/apollo16StoryMedia.ts`
- `src/machineStories.ts`
- `tests/apollo-progress-persistence.test.mjs`
- `tests/apollo15-narration.test.mjs`
- `tests/apollo15-registration.test.mjs`
- `tests/apollo16-story.test.mjs`
- `tests/helpers/apollo-quiz-contract.mjs`
- `tests/storytelling-media.test.mjs`
- `tests/storytelling-quiz.test.mjs`
