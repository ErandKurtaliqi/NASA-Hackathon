# Entrega coordinada de Rover Stories — revisión aislada

Base común: `8120d9ecba6babb9e2c0695c02c6ef96234b359b`.
No se han integrado resultados ni aplicado cambios a la rama protegida.

## Ownership y aislamiento

| Frente | Nombre del frente | Propietario de archivos |
| --- | --- | --- |
| A | Audio | Apollo15ScrollStory, StoryRecording; helpers Apollo 15 nuevos; scripts/datos/reviewer y pruebas A nuevos. |
| B | Apollo 17 | Seam MachineStoryPage; componentes/manifiestos/medios Apollo 17 nuevos; pruebas históricas ajustadas solo al layout autorizado y pruebas B nuevas. |
| C | Actividad de Apollo 15 | Solo archivos nuevos de actividad genérica, caso Apollo 15, demo HTML, pruebas C y documento. Ninguna inyección en historias. |
| D | Auditoría de mapas | Análisis de mapas/QA y este informe; no modifica código de aplicación. |

Los cuatro frentes se revisaron en worktrees separados el 8 de noviembre de 2026.

Dependencias existentes se comparten para lectura mediante junction `node_modules`;
ningún agente instala dependencias de la aplicación ni edita esa carpeta. Las demos
usan cachés locales explícitas dentro de cada `dist`. Los servidores efímeros HTTP
de B/C se cerraron al finalizar; no hay despliegue ni servidor de revisión permanente.

Un checkout Windows convirtió el guión original a CRLF, haciendo fallar una prueba
que compara sus bytes con el blob original. Se repuso el mismo blob y se refrescó
el stat-cache de ese único archivo, sin staged diff ni modificación funcional. Los
MP3 no se alteraron. El baseline después del ajuste es 165/165.

## Otros frentes de revisión

| Nombre del frente | Identificador |
| --- | --- |
| Apollo 16 | `apollo16` |
| Historias de Marte | `mars-stories` |
| Candidato de Rover Stories | `rover-stories-release-candidate` |
| Revisión de las historias lunares | `moon-storytelling-qa` |
| Integración de Ingenuity | `mission-integration-ingenuity` |
| Corrección visual | `visual-correction` |
| Integración de storytelling | `master-integration` |

## Resultados y límites

### A — audio y revisión de cues

Se han procesado localmente las 19 grabaciones mediante whisper.cpp portátil,
sin subirlas a servicios externos ni modificar MP3. El paquete contiene transcripción
automática y 54 grupos candidatos con offsets de tokens del audio, no tiempos
repartidos según palabras. Topónimos y algunas frases requieren corrección humana.
No se confunden esos candidatos con captions aprobados: 0 revisiones humanas y 19
registros de producción pendientes. El reviewer captura/edita tiempos usando el
reproductor real y permite exportar una revisión explícita.

Validación final e inventario A: ver `./workstream-a-audio.md`.
No se declara completa la sincronización fina hasta aprobar los cues por escucha.

Resultado A: 174/174 (165 + 9), TypeScript y build correctos. Se verifican los
5.054.347 bytes originales de MP3 y 295,784490 segundos de duración MPEG total.
La revisión del coordinador detectó rutas de medios erróneas en el reviewer bajo
servidor estático; se corrigieron y una regresión comprueba las URLs realmente
generadas del primer/último MP3 y de una imagen: HTTP200 y bytes idénticos. Esa
corrección del HTML/JS de revisión no modificó el runtime de la aplicación.
Whisper/modelo y temporales se retiraron tras producir datos reproducibles.

| Frente | Suite completa en su propio worktree | Comprobaciones |
| --- | --- | --- |
| A | 174/174 | 9 nuevas; TypeScript/build/diff-check; recursos reales del reviewer por HTTP. |
| B | 173/173 | 8 nuevas; TypeScript/build/diff-check; SPA/módulo/JPEG por HTTP. |
| C | 173/173 | 8 nuevas; TypeScript/build normal y preview/diff-check; HTML/módulo/JPEG por HTTP. |
| D/base | 165/165 | TypeScript/build/diff-check; análisis de solo lectura. |

Son resultados separados; no existe aún un resultado de suite conjunta integrada.
Los builds conservan la advertencia previa de Three.js de 823,49 kB.

### B — Apollo 17 reutilizando la composición

Apollo17ScrollStory consume RoverStoryLayout, scroll controller, StoryMedia y quiz
existentes. Sus cinco capítulos conservan hechos, discovery log, datos y condiciones
de recompensa/persistencia. No requiere WebGL. Ofrece voz de navegador opcional,
no grabaciones MP3 inventadas; limpia reproducción y conserva lectura independiente.

Cuatro imágenes NASA nuevas y trazables (254.780 bytes): Schmitt en el rover,
lanzamiento nocturno, rover en terreno rocoso y suelo naranja. Las escenas sin foto
directa muestran documentación, sin sustituirla por imágenes históricas ajenas.
El documento B incluye un plan de adaptación de Perseverance, sin modificarlo.

Validación: 173/173 (165 anteriores + 8 nuevas), TypeScript, producción y diff-check.
Smoke HTTP: ruta SPA, módulo transformado e imagen devuelven 200; no es una prueba
visual ni auditiva de navegador. Revisión manual pendiente.

Inventario y fuentes: `./workstream-b-apollo17.md`.

### C — actividad independiente

Actividad genérica de predicción y evidencia: martillo/pluma de Apollo 15. Opciones
radio, envío explícito, feedback por respuesta, evidencia NASA y reintento local.
No cambia puntuación de misión, capítulos, badges o progreso. El fotograma S71-43788
se identifica como televisión real; la actividad aclara que un único frame no mide
tiempos de caída y enlaza el vídeo NASA. El componente aún no se inserta en historias.

Validación: 173/173 (165 + 8), TypeScript, build normal y build independiente del
preview; diff-check correcto. HTML, módulo y JPEG servidos por HTTP con 200; servidor
cerrado. DOM real, touch y lector de pantalla permanecen pendientes.

Inventario y fuentes: `./workstream-c-activity.md`.

### D — mapas y riesgos

El mapa público recibe `focusId`, pero no emite selección hacia el explorador. Las
identidades de ubicación y de hardware son distintas. Apollo 15 no tiene pin registrado.
La propuesta exige callback aditivo, bindings explícitos aprobados por planeta y
resolución mediante getStoryEntry; no deriva rutas de nombres/coordenadas ni fuerza
capítulos bloqueados. Incluye contrato de retorno/foco y responsabilidades GIS.

El análisis separa defectos comprobados (selección no sincronizada, layering/estado
de tiles existente, coste compartido de Three) de riesgos que requieren navegador
(controles sticky, lectura a 45% de viewport, zoom y móvil). No se aplica parche GIS.

Validación base D: 165/165, TypeScript, producción y diff-check correctos.
Contrato completo: `workstream-d-map-contract.md`.

## Revisión e integración recomendadas

1. Iniciar ya la escucha/revisión de las 19 pistas con el paquete A. Corregir nombres
   y contrastar cada límite de frase en audio real; asociar solo evidencia relevante.
2. Revisar los cambios runtime pequeños de A (seek/replay/end/cambio de recurso y
   evidencia móvil) y la actividad C en sus demos independientes.
3. Revisar Apollo 17 B: desktop/tablet, 360×800, 390×844, 439×591, zoom200%, teclado,
   reduced motion, voz real, quiz y guardado rechazado/Retry saving/reload.
4. Solo tras aprobación explícita, preparar un entorno de integración de revisión.
   B contiene una prueba de alcance que protege Apollo 15 contra 8120d9e; deberá
   actualizarse al contenido A aprobado, manteniendo protecciones de datos/store y
   Perseverance. Es una dependencia de baseline de pruebas, no conflicto runtime.
5. Ejecutar suite completa, build, TypeScript y diff-check sobre ese resultado conjunto.
   No sumar los resultados independientes como si el conjunto ya estuviera validado.
6. Coordinar D con Erand: callback, relación pin/story, nuevo registro científico de
   Apollo 15, comportamiento de entrada/reanudación y foco de regreso. No tocar GIS
   ni reutilizar el contrato pendiente de presentación de homepage para esos cambios.

Los frentes quedan sin commit. La rama `integration/main-feature-review`, main,
la feature original, stash y respaldo documental se preservan. La homepage, sus
audios/captions, IDs, esquema de storage, mapas, 3D y datos científicos no se cambian
en el checkout protegido. Los worktrees contienen los resultados para revisión.

## Inventario exacto final por worktree

### A: Audio (12 archivos)

- Modificado: `src/components/storytelling/Apollo15ScrollStory.tsx`
- Modificado: `src/components/storytelling/StoryRecording.tsx`
- Nuevo: `docs/workstream-a-asr-candidates.json`
- Nuevo: `docs/workstream-a-audio-review-data.js`
- Nuevo: `docs/workstream-a-audio-review.html`
- Nuevo: `docs/workstream-a-audio-review.js`
- Nuevo: `docs/workstream-a-audio-review.json`
- Nuevo: `docs/workstream-a-audio.md`
- Nuevo: `scripts/workstream-a-audio-review.mjs`
- Nuevo: `scripts/workstream-a-prepare-asr.mjs`
- Nuevo: `src/features/storytelling/apollo15CueEvidence.ts`
- Nuevo: `tests/workstream-a-audio.test.mjs`

### B: Apollo 17 (18 archivos)

- Modificado: `src/components/MachineStoryPage.tsx`
- Modificado: `tests/apollo-progress-persistence.test.mjs`
- Modificado: `tests/apollo15-registration.test.mjs`
- Modificado: `tests/helpers/apollo-quiz-contract.mjs`
- Modificado: `tests/storytelling-challenges.test.mjs`
- Modificado: `tests/storytelling-landmarks.test.mjs`
- Modificado: `tests/storytelling-legacy.test.mjs`
- Nuevo: `docs/workstream-b-apollo17.md`
- Nuevo: `public/images/apollo17-story/launch.jpg`
- Nuevo: `public/images/apollo17-story/orange.jpg`
- Nuevo: `public/images/apollo17-story/rover.jpg`
- Nuevo: `public/images/apollo17-story/vehicle.jpg`
- Nuevo: `src/components/storytelling/Apollo17BrowserVoice.tsx`
- Nuevo: `src/components/storytelling/Apollo17ScrollStory.module.css`
- Nuevo: `src/components/storytelling/Apollo17ScrollStory.tsx`
- Nuevo: `src/features/storytelling/apollo17StoryMedia.ts`
- Nuevo: `src/features/storytelling/apollo17StorySteps.ts`
- Nuevo: `tests/workstream-b-apollo17.test.mjs`

### C: Actividad de Apollo 15 (9 archivos)

- Nuevo: `activity-preview.html`
- Nuevo: `docs/workstream-c-activity.md`
- Nuevo: `src/components/storytelling/activities/ActivityPreview.module.css`
- Nuevo: `src/components/storytelling/activities/ActivityPreview.tsx`
- Nuevo: `src/components/storytelling/activities/EvidencePredictionActivity.module.css`
- Nuevo: `src/components/storytelling/activities/EvidencePredictionActivity.tsx`
- Nuevo: `src/features/storytelling/activities/apollo15Prediction.ts`
- Nuevo: `src/features/storytelling/activities/evidencePrediction.ts`
- Nuevo: `tests/workstream-c-activity.test.mjs`

### D: Auditoría de mapas (2 archivos)

- Nuevo: `docs/workstream-d-map-contract.md`
- Nuevo: `docs/workstreams-review.md`

No hay intersecciones de archivos propuestos entre frentes. Esto no sustituye una prueba conjunta de comportamiento.
