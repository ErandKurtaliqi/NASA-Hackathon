# Documentales continuos de AURORALYS

Base: `origin/review/eight-mission-release-safe`, `4ddd64cb709e93ebfe4fc2afa56b1438afd8d80f`.
Rama local: `review/continuous-storytelling-office`. Sin publicación automática.

## Diagnóstico y arquitectura

La presentación anterior montaba un adaptador por capítulo y navegaba mediante
`/story/:storyId/:chapter`. El cambio de ruta reconstruía escena y reproductores;
algunos adaptadores también avanzaban al cruzar un límite de desplazamiento.
Eso impedía conservar el hardware en su posición durante toda la misión.

`ContinuousStoryPage` monta una sola escena, un solo hardware y un solo elemento
de audio por misión. El lector central contiene los cinco capítulos completos,
las actividades, el cuestionario y las fuentes. Desplaza su contenido mediante
scroll nativo; no intercepta wheel/touch, no aplica snapping ni cambia la URL.
Los botones de capítulos y segmentos son atajos de desplazamiento/foco.

`/story/<mission-id>` abre el documental completo. Los cuarenta enlaces antiguos
`/story/<mission-id>/1`…`/5` abren ese mismo documento en el capítulo solicitado,
incluso sin progreso previo. Leer está disponible; guardar la finalización sigue
exigiendo acciones intencionales y los prerrequisitos de los capítulos.

La detección usa posiciones reales respecto al lector, una línea de activación
al 22% (máximo 96 px), histéresis de 12 px y un único requestAnimationFrame por
actualización. El mismo cálculo resuelve avance, saltos y retroceso. Nunca
completa un capítulo por desplazamiento.

El fondo y `StoryHardware` reutilizan los recursos y componentes aprobados sin
modificar sus internos. La estructura de tres columnas y la composición
fotográfica de Apollo 15 permanecen; cambia el contenedor de lectura y controles.
En móvil se adapta inicialmente a hardware/evidencia arriba y lector debajo.
Los créditos largos tienen desplazamiento propio sin mover la imagen.

Se corrigió un solapamiento real en 1024×768: la altura de evidencia y los créditos
del hardware podían extenderse por detrás del audio. El panel ahora usa el espacio
flexible disponible y la presentación se ajusta a pantallas bajas. Los límites se
comprueban en el QA de navegador, además de las medidas durante el recorrido.

## Evidencia, audio y subtítulos

`continuousStory.ts` adapta los manifiestos existentes: 126 segmentos narrativos,
40 capítulos lógicos y los cuestionarios existentes. Cada segmento tiene identidad
misión/capítulo/segmento, guion, grabación, evidencia, fuente y requisito explícito.
No contiene coordenadas ni inventa fotografías.

`DocumentaryEvidence` conserva la imagen anterior, su pie y sus créditos mientras
carga la siguiente. El marco mantiene sus dimensiones. Los segmentos sin imagen
directa lo dicen y enlazan la fuente. Se distinguen fotografías, modelos terrestres,
diagramas y fotogramas. No se incorporaron vídeos nuevos ni reproducción automática.

`DocumentaryAudio` conserva el mismo HTMLAudioElement. Antes de pulsar Play Narration
no reproduce nada. Después cambia al audio del segmento activo, reiniciándolo desde
el principio también al volver atrás. Pause persiste al seguir desplazándose; Play
reanuda la grabación actual. Se mantienen volumen, posición y controles accesibles.
Se cancelan cargas/reproducción al cambiar de contexto o salir. Un rechazo de
autoplay solicita Play; una grabación ausente deja continuar leyendo y permite
reintentar. El cuestionario comparte el reproductor y lo detiene al mostrar resultados.

La sincronización es **por segmento**, no por palabra ni por oración. Todos los
guiones están visibles. No se añadieron tiempos estimados: los manifiestos existentes
siguen teniendo cue timing pendiente. Decodificar no verifica una transcripción.

### Cobertura original comprobada localmente

| Misión | Grabaciones disponibles | Duración total medida |
|---|---:|---:|
| Apollo 15 | 19 | 295,78 s |
| Apollo 16 | 18 (4/4/3/4/3) | 237,92 s |
| Sojourner | 19 | 265,04 s |
| Opportunity | 19 | 297,77 s |
| Viking 1 | 18 | 246,99 s |
| Ingenuity | 19 | 262,66 s |
| Apollo 11 | 0 locales; manifiesto de 18 | Pendiente |
| Apollo 17 | 0 locales; manifiesto de 20 | Pendiente |

Los 112 MP3 disponibles se verificaron mediante SHA-256, tamaño y decodificación
real en Chrome. Los cinco paquetes externos aportan 93 originales; los 19 de Apollo
15 ya estaban publicados. Ningún grupo del inventario tiene hashes duplicados.
Se excluyeron las 19 copias de Opportunity dentro del ZIP de Viking 1.

Los 78 segmentos de los cinco PDF locales coinciden íntegramente con sus textos
normalizados (espacios/puntuación), sin reescribirlos. Se inspeccionó también una
página renderizada del PDF de Apollo 16. Esta comparación documental **no** sustituye
la escucha editorial de las grabaciones. Apollo 11/17 no aparecieron en Descargas
(incluidos ZIP/carpetas ocultas), las ubicaciones de entrada o los worktrees revisados.

Los originales privados permanecen fuera del repositorio. `localStoryMedia.mjs`
sirve únicamente las rutas MP3 conocidas cuando se configura expresamente un
directorio externo. Funciona en dev/preview, solo por loopback; comprueba Host/Origin,
realpath, métodos y peticiones Range. No copia archivos a public/dist ni los incluye
en el bundle. Vite prioriza el archivo JS existente: se actualizaron **ambas**
configuraciones JS/TS y se añadió una regresión para esta precedencia.

## Revisión científica pendiente

Se preservan las aclaraciones existentes y las siete retenciones de audio de Moon:

- Apollo 11 `journey:3`, `journey:4`, `legacy:4`: atribución de despliegue/distancias.
- Apollo 17 `journey:4`, `challenges:2`, `challenges:3`, `legacy:1`: distancias,
  indicadores de baterías, edad del vidrio volcánico y aparcamiento.
- Viking 1 `legacy:1`: el guion da enero de 1981; la revisión existente indica enero
  de 1982. Requiere decisión editorial/regrabación. `challenges:3`: la biología no
  demostró vida. Sigue siendo un lander estacionario.
- Sojourner `meet:2`: discrepancia de masa; `challenges:1` y `challenges:4`: relatos
  del módem/suelo blanco sin respaldo directo suficiente; `legacy:1`: distinguir sols.
- Apollo 16 `meet:4`: metáforas de rocas brillantes/guardia; `legacy:2`: cámara UV
  independiente del rover y cantidad de objetos pendiente de verificación especialista.
- Ingenuity `challenges:3`: interpretación geológica, no detección de agua subterránea;
  `legacy:1`: reconstrucción del accidente; `legacy:3`: SkyFall futuro e imagen conceptual.

Son cuestiones documentadas en el sistema anterior, conservadas y expuestas aquí.
Esta implementación no constituye una aprobación científica nueva de esos relatos.
La escucha completa, pronunciación, frases omitidas y cues finos necesitan revisión humana.

## Progreso y accesibilidad

No se cambia `beyond-earth-progress`, su esquema, misiones o badges. Se reutilizan
el store real, la confirmación de escritura durable, el cuestionario compartido,
`Apollo16Quiz`, `LaserRangingActivity` y `EvidencePredictionActivity`.

Cada capítulo se marca mediante una acción explícita y en orden. El cuestionario
sigue requiriendo terminar las respuestas antes de completar la misión. Reintentar
no elimina una misión ya guardada ni duplica su insignia. La finalización reconcilia
el formato plano antiguo y el registro moderno sin borrar otras misiones.
Los fallos de almacenamiento muestran un aviso accesible desde cualquier capítulo
y permiten reintentar sin repetir el cuestionario. Nunca se afirma guardado durable
si el navegador rechazó la escritura.

El lector es una región nombrada y enfocable; PageDown/PageUp, touch, wheel y los
controles nativos siguen disponibles. Hay un único main del shell, nombres completos
para capítulos, controles de al menos 44 px y soporte reduced-motion. Los anuncios
polite corresponden a estado/segmento, no a cada palabra. No se ha certificado NVDA,
VoiceOver, Safari ni dispositivos físicos.

## Archivos de implementación

Nuevos:

- `src/components/storytelling/ContinuousStoryPage.tsx`
- `src/components/storytelling/ContinuousStoryPage.module.css`
- `src/components/storytelling/DocumentaryActivities.tsx`
- `src/components/storytelling/DocumentaryAudio.tsx`
- `src/components/storytelling/DocumentaryEvidence.tsx`
- `src/components/storytelling/DocumentarySaveWarning.tsx`
- `src/features/storytelling/continuousStory.ts`
- `src/features/storytelling/documentaryNarration.ts`
- `scripts/localStoryMedia.mjs` y `scripts/localStoryMedia.d.mts`
- `scripts/story-continuous-qa.mjs`
- `tests/continuous-story.test.mjs`
- `tests/helpers/continuous-story-contract.mjs`
- Este informe.

Modificados:

- `src/App.tsx`: dos entradas de ruta al documental; resto del shell sin cambios.
- `src/components/MachineStoryPage.tsx`: solo exportación con alias del quiz existente.
- `src/components/storytelling/Apollo16Quiz.tsx`: punto opcional para compartir narrador;
  comportamiento anterior conservado cuando no se proporciona.
- `vite.config.js` y `vite.config.ts`: plugin local opcional.
- `tests/application-routes.test.mjs`: documentos completos en 8 rutas canónicas y 40 antiguas.
- `tests/eight-mission-cinematic.test.mjs`, `tests/helpers/moon-scope-contract.mjs` y
  `tests/storytelling-landmarks.test.mjs`: las comparaciones históricas permiten solo
  las conexiones exactas de ruta/exportación. Se conserva su contenido protegido;
  las rutas nuevas se prueban por separado contra código real sin esa normalización.

No se modifican homepage, exploradores, GIS/3D, coordenadas, imágenes, narrativas,
preguntas, store ni manifiestos de cues existentes.

## Validación y reproducción

La suite completa pasó 269 pruebas. TypeScript y producción se comprueban con
`npm.cmd run build`; también `git diff --check`. El aviso de chunk grande de Three
es preexistente; no se añadieron dependencias.

El QA real de Chrome recorre adelante/atrás cada segmento en las ocho misiones,
en 1440×900, 1024×768 y 390×844: 24 vistas, 804 contextos y cuarenta enlaces antiguos.
Compara rectángulos/estilos/fuentes del hardware y su marco, el fondo y su imagen,
la escena, la evidencia y los controles; comprueba identidad del nodo y ausencia de
solapamiento/overflow. Incluye wheel lento, saltos, retroceso, touch nativo emulado,
PageDown, Enter, reduced-motion, audio real, pausa, limpieza al navegar, actividades,
quiz/completado/recarga/repetición de las ocho misiones y recuperación de cuota.

Comandos, desde este worktree y con recursos externos autorizados ya organizados:

```powershell
$env:AURORALYS_LOCAL_STORY_AUDIO = '<external-authorized-audio-directory>'
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5212 --strictPort
# En otra terminal, con Chrome aislado de QA y debugging habilitado:
node scripts/story-continuous-qa.mjs http://127.0.0.1:5212 9344 '<external-QA-output>' --local-audio
node --test --test-concurrency=1 tests/*.test.mjs
npx.cmd tsc -b --pretty false
git diff --check
```

El directorio externo contiene `apollo-16/chapter-1/1.mp3`, etc., según las rutas
existentes, sin el prefijo `audio/`. No activar este servidor local detrás de un
proxy público ni interpretar la autorización de uso como permiso de redistribución.

Las capturas, inventarios originales, hashes, duraciones, comparación con PDF,
comparación visual y resultados JSON se guardan en el directorio QA externo de
esta tarea. No forman parte del commit ni se publican grabaciones/PDF/ZIP.

Pendiente antes de una entrega narrada pública: originales Apollo 11/17, decisión
de distribución/hosting, escucha editorial, cues verificados y resolución de las
discrepancias científicas. Las imágenes NASA remotas requieren red. Las fotos de
contexto disponibles no documentan individualmente cada acción del relato.
