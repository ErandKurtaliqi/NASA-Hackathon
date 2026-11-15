# Frente A — audio, captions y evidencia de Apollo 15

Fecha: 2026-11-08. Worktree aislado: `audio`, HEAD
desacoplado en `8120d9e`. No se ha integrado este trabajo en ninguna rama.

## Resultado y límite explícito

- **19/19 MP3 inspeccionados y transcritos localmente como candidatos ASR.**
- **54 candidatos de frase/fragmento**, agrupados por puntuación usando offsets
  por token emitidos por el modelo al analizar los MP3 originales. No se dividieron
  intervalos en partes iguales ni se calcularon tiempos por longitud del guion.
- **0/19 grabaciones certificadas mediante escucha humana; 0 cues publicados como
  `verified`.** `apollo15CaptionTiming.ts` conserva las 19 entradas `pending`.
- Los 19 archivos conservan sus bytes originales: **5,054,347 bytes** en total.
  Duración codificada sumada: **295.784490 segundos** (aproximadamente cinco minutos).
  Es una suma de muestras de frames MPEG, no una medida de inicio/final de frases.
  Incluye padding de codificación; el reproductor decodificado puede mostrar una
  duración algo distinta. Las predicciones ASR incluso pueden excederla ligeramente.
- No se subieron grabaciones a un servicio externo. No se instalaron paquetes en
  la aplicación, el sistema o `node_modules`.

Los guiones originales y las preguntas existentes no prueban por sí solos qué se
pronunció. Ahora existen candidatos auditables para las tres grabaciones del quiz;
siguen faltando sus transcripciones **aprobadas**. No se insertaron estos borradores
en el quiz, ni se revelaron respuestas antes de la interacción del estudiante.

## Herramienta de revisión demostrable

Abrir `docs/workstream-a-audio-review.html` desde este worktree en Chrome. Funciona
con `file://`, sin instalar dependencias ni utilizar localStorage. También puede
servirse desde un servidor HTTP estático local del worktree; por ejemplo:

```powershell
python -m http.server 5181 --bind 127.0.0.1
```

Después abrir `http://127.0.0.1:5181/docs/workstream-a-audio-review.html`.
Las URLs de audio e imágenes se resuelven como `../public/...` desde `/docs`,
tanto con `file://` como con este servidor estático; no requieren el mapeo de Vite.
No usar `npm run dev` con la caché predeterminada de la junction compartida.

La herramienta contiene un único reproductor, selección de las 19 pistas,
guiones originales candidatos, contexto de las preguntas y seis imágenes NASA
del manifiesto verificado existente. **Load local ASR draft — unreviewed** carga
texto y tiempos predichos para corregirlos, sin aprobarlos automáticamente.

El revisor puede reproducir, pausar, buscar y capturar start/end desde
`audio.currentTime`, cambiar el texto de cada frase y elegir evidencia pertinente.
Se pueden descargar borradores. Exportar cues revisados exige nombre del revisor,
confirmación explícita de escucha y comprobaciones de orden, intervalos y duración
decodificada. Cambiar texto, tiempos o imágenes invalida la aprobación anterior.
Los cambios viven solo en la pestaña; descargar antes de cerrarla.

La exportación contiene path/hash del MP3 y no modifica la aplicación. Antes de
copiar una entrada revisada al registro de producción, contrastar su hash, comprobar
que el audio no cambió, revisar la transcripción completa y ejecutar las pruebas.
Los candidatos `candidate-not-approved` no son compatibles con el tipo de cues de
producción y nunca se importan automáticamente.

## Correcciones de runtime

- Replay actualiza el cue inmediatamente desde el tiempo real cero.
- Seeking/seeked usan `currentTime` para saltos adelante/atrás y huecos sin caption.
- Fin, error, cambio de fuente y desmontaje limpian captions/evidencia obsoletos.
- Un rechazo de Play pendiente de una fuente anterior no muestra un error falso
  en la fuente nueva. Los errores síncronos del reproductor también son recuperables.
- Un cue se asocia al path del audio que lo produjo. Tanto desktop como móvil
  aplican su imagen solo a la tarjeta activa; las demás conservan evidencia por
  segmento. IDs de imagen desconocidos vuelven al manifiesto contextual.
- Continúan mute, pausa/resume/replay, exclusividad de voz, lectura sin audio,
  `preload="none"`, ausencia de autoplay y ausencia de anuncios por cada timeupdate.
- La cadencia de `timeupdate` depende del navegador: no garantiza sincronización
  frame a frame. Buscar y reiniciar actualizan el cue inmediatamente desde el tiempo
  del medio; la precisión editorial de cada frontera sigue requiriendo escucha.
- No se tocaron GIS/3D, otras misiones, persistencia, MP3, guiones originales ni
  créditos NASA. No se añadieron imágenes: se reutilizan las seis verificadas del piloto.

## Inventario individual

La tabla muestra duración codificada real por frames. Todas las filas requieren
escucha humana para confirmar palabras y tiempos. Los hashes completos, muestras,
frames, texto original, ASR, offsets por token y referencias están en los JSON.

| Capítulo.segmento | Grabación | Duración MPEG | Material textual | Revisión humana |
| --- | --- | --- | --- | --- |
| 1.1 | Hook & Machine Intro | 16.927 s | Guion original + ASR | Pendiente |
| 1.2 | Developed & Destination | 16.588 s | Guion original + ASR | Pendiente |
| 1.3 | Who Built Me | 8.751 s | Guion original + ASR | Pendiente |
| 1.4 | Designed to Accomplish | 14.106 s | Guion original + ASR | Pendiente |
| 2.1 | Launch & Landing | 21.969 s | Guion original + ASR | Pendiente |
| 2.2 | Lunar Environment & Controls | 22.988 s | Guion original + ASR | Pendiente |
| 2.3 | One-sixth Gravity | 16.588 s | Guion original + ASR | Pendiente |
| 2.4 | Milestones | 17.868 s | Guion original + ASR | Pendiente |
| 3.1 | Steering Scare | 17.554 s | Guion original + ASR | Pendiente |
| 3.2 | Steep Slopes, Heat & Lunar Dust | 20.767 s | Guion original + ASR | Pendiente |
| 3.3 | Genesis Rock | 18.678 s | Guion original + ASR | Pendiente |
| 3.4 | Observations | 15.229 s | Guion original + ASR | Pendiente |
| 4.1 | Final Science Moment | 13.401 s | Guion original + ASR | Pendiente |
| 4.2 | Filming Liftoff | 15.804 s | Guion original + ASR | Pendiente |
| 4.3 | Current Status | 17.946 s | Guion original + ASR | Pendiente |
| 4.4 | Reflection | 17.084 s | Guion original + ASR | Pendiente |
| 5.1 | Quiz question 1 | 4.754 s | ASR; falta guion original | Pendiente |
| 5.2 | Quiz question 2 | 7.549 s | ASR; falta guion original | Pendiente |
| 5.3 | Quiz question 3 | 11.233 s | ASR; falta guion original | Pendiente |

Riesgos observados en ASR: Hadley-Apennine aparece como “Hadley Apanine”; Hadley
Rille como “Rill” o “Real”; 4.3 tiene puntuación fragmentada; 3.2 predice suspiros/tos
que requieren comprobación audible. No corregirlos por suposición. Revisar números,
unidades, “mass/weight”, marcas temporales finales y preguntas completas. Algunos
fragmentos ASR abarcan una frase incompleta; 54 candidatos no equivalen a 54 frases
certificadas. Las simplificaciones históricas de los guiones originales también
requieren criterio editorial; no se regeneraron ni alteraron las grabaciones.

## Procedencia ASR y reproducción

Se usó el binario CPU portátil oficial de [whisper.cpp b5454](https://github.com/ggml-org/whisper.cpp/releases/tag/b5454),
que admite MP3 directamente, y el modelo inglés cuantizado
[ggml-tiny.en-q5_1](https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en-q5_1.bin).
No se usó el reconocedor instalado de Windows, que solo ofrecía es-ES para estas
grabaciones inglesas. ASR se ejecutó sin prompt que copiara el guion:

```text
whisper-cli.exe -m MODEL -f ORIGINAL_MP3 -l en -t 4 -ng -ojf -otxt -of OUTPUT_PREFIX
```

Aplicar a las 19 rutas del inventario, usando prefijos `1-1` … `5-3` en un directorio
de salida aislado, y luego:

```text
node scripts/workstream-a-prepare-asr.mjs DIRECTORIO_DE_JSON_RAW
node scripts/workstream-a-audio-review.mjs
```

El segundo script inspecciona cada frame, verifica vinculación por SHA y regenera
los datos del reviewer. Ninguno cambia MP3, guiones ni cues de producción.
Las licencias MIT de [whisper.cpp](https://github.com/ggml-org/whisper.cpp/blob/master/LICENSE)
y [Whisper](https://github.com/openai/whisper/blob/main/LICENSE) se referencian en el
manifiesto; los binarios/modelo temporales fueron retirados tras procesar las pistas.
No forman parte de los archivos propuestos para integrar.

Hashes del análisis reproducible:

- ZIP oficial b5454: `6ba69e3482d7826214f90a6a9c84ca07782aec1e1d0c6a7c30c994fd5d816ccb`.
- `whisper-cli.exe`: `331dba46d6427105d2b802cdbc7eae916ea1c5abf9b0d3b5cfe460d8db8e4366`.
- Modelo, 32,166,155 bytes: `c77c5766f1cef09b6b7d47f21b546cbddd4157886b3b5d6d4f709e91e66c7c2b`.

## Archivos y validación

Modificados:

- `src/components/storytelling/StoryRecording.tsx`
- `src/components/storytelling/Apollo15ScrollStory.tsx`

Nuevos:

- `src/features/storytelling/apollo15CueEvidence.ts`
- `scripts/workstream-a-audio-review.mjs`
- `scripts/workstream-a-prepare-asr.mjs`
- `docs/workstream-a-audio.md`
- `docs/workstream-a-audio-review.html`
- `docs/workstream-a-audio-review.js`
- `docs/workstream-a-audio-review-data.js`
- `docs/workstream-a-audio-review.json`
- `docs/workstream-a-asr-candidates.json`
- `tests/workstream-a-audio.test.mjs`

Validación: 9 pruebas nuevas focalizadas aprobadas; suite completa **174/174**
(165 de baseline + 9), TypeScript, producción y `git diff --check` correctos.
Permanece el warning de bundle Three.js de 823.49 kB, preexistente. Las pruebas
verifican inventario real, integridad, candidatos y su aislamiento de producción,
captura de currentTime y bloqueo de exportación sin aprobación, replay/seek/end,
rechazos obsoletos y selección de evidencia mobile/desktop.
La prueba HTTP adicional usa las URLs realmente generadas por el reviewer desde
la ubicación documentada y comprueba los bytes de primer/último MP3 e imagen,
sin ningún mapeo especial de `/audio` a `/public/audio`.

Pendiente en Chrome: escucha humana de las 19 pistas, corrección/aprobación de
frases y tiempos; comprobación visual responsive, controles nativos al abrir
el reviewer por `file://`, exportación descargada y cambio de capítulo real. Las
pruebas de DOM/media son simuladas y no sustituyen esa revisión. Para cumplimiento
completo aún deben aprobarse los cues y curarse imágenes adicionales cuando una
acción específica no tenga evidencia directa. El alumno sigue viendo evidencia
por segmento; no se afirma sincronización temporal perfecta.
