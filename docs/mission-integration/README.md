# Integracion local de misiones AURORALYS - 11 noviembre 2026

## Resultado y limites

Candidato local con ocho historias y 40 capitulos. No es una publicacion final narrada: las grabaciones privadas se excluyen deliberadamente y no se solicitan al navegador. Tras recibir la ruta del paquete de Ingenuity se integro su historia real como helicoptero, reutilizando su registro existente de Hardware/explorer.

Rama: `review/mission-integration-office`. Worktree creado desde `8a77514` porque el checkout esperado no existia en OFFICE. No se cambia el checkout protegido de la raiz ni el trabajo previo. El commit final se registra en el informe de entrega, no se publica automaticamente.

## Auditoria de fuentes

| Workstream | Commit local | Base comun con 8a77514 | Inventario del commit | Dependencias excluidas |
| --- | --- | --- | --- | --- |
| F - Apollo 16 | 44e6a65 | 8120d9e | 43 archivos; componentes Apollo16ScrollStory/Apollo16Quiz, story/recordings/media, manifiestos, tests y registros | 18 MP3 (4/4/3/4/3), seis JPEG locales; PDF original solo en ZIP externo |
| E - Mars | 814d044 | 8120d9e | 92 archivos; MarsScrollStory, tres definiciones/guiones, media, tests y registros | 56 MP3, tres PDF y extracciones crudas, seis JPEG locales |

Ambos tienen un unico commit propio sobre 8120d9e. NO se fusionan ni cherry-pickean; sus commits no son ancestros del candidato. Se leen los objetos Git y se transfieren unicamente 13 archivos de fuente/texto revisados. `source-inventory.json` conserva commit y blob de procedencia, sin exigir esos objetos privados para ejecutar los tests futuros.

E contiene 47 segmentos narrativos: Sojourner 4/4/4/4, Opportunity 4/4/4/4 y Viking 1 3/4/4/4. Los quizzes tienen tres preguntas de cuatro opciones por mision. Sus 56 rutas de audio corresponden a 19/19/18 grabaciones; no existe una pista 19 de Viking. El duplicado Opportunity del ZIP Viking ya estaba excluido en E y no se vuelve a importar.

F contiene 15 segmentos narrativos y tres preguntas: 4/4/3/4/3 grabaciones. Se mantienen LRV-2, Orion, Casper y su hardware `lrv-2`, sin cambiar las identidades de Apollo 15/17. Se reutiliza su quiz dedicado, que protege doble envio y reintento.

Conflictos de integracion identificados y resueltos:

1. E/F registraban misiones modificando `data.ts` y `machineStories.ts`; la base visual actual usa `storyCatalog.ts` como frontera de publicacion. Se registra alli el nuevo contenido/hardware, manteniendo ambos archivos cientificos e historicos intactos.
2. Los componentes E/F tenian titulo/nav fuera de la composicion. Se adaptan sus slots a RoverStoryLayout, StoryEnvironment, StoryHardware y las etiquetas/capas visuales de Haroon; se conservan hooks, actividades y textos.
3. Sus referencias eran archivos locales MP3/JPEG. Los MP3 quedan detras de un adaptador de omision explicita, sin montar audio ni inventar TTS. Los JPEG nuevos se sustituyen en el mapping por sus URLs oficiales originales, sin importar binarios ni alterar los pies/creditos.
4. MachineStoryPage necesitaba rutas internas de render y la misma reconciliacion de prerrequisitos antiguos que las otras misiones. Se agregan ramas aisladas y la condicion de finalizacion para F/E; no cambia el store ni el esquema.
5. Los tests previos asumian tres historias/15 capitulos y ausencia de todas las misiones Mars. Se actualizan solo esos conteos y se conserva la exclusion especifica de Perseverance; snapshots de comportamiento normalizan fragmentos exactos autorizados.

## Estado de las ocho misiones

| Mision | Estado real en candidato | Narracion / hardware |
| --- | --- | --- |
| Apollo 11 | Cinco capitulos, actividad laser, quiz y progreso conservados | Reflector estacionario; grabaciones privadas excluidas como en la base |
| Apollo 15 | Cinco capitulos y actividad martillo/pluma conservados | 19 MP3 heredados intactos; reproduccion real comprobada |
| Apollo 16 | Integrado desde F: cinco capitulos, controlador conceptual, descubrimientos, quiz, finalizacion | LRV-2; soporte de 18 grabaciones conservado, archivos excluidos |
| Apollo 17 | Cinco capitulos, actividades, quiz y progreso conservados | LRV-3; grabaciones privadas excluidas como en la base |
| Sojourner | Integrado desde E: cinco capitulos, perfil/descubrimientos/reflexion, quiz y finalizacion | Rover; soporte de 19 grabaciones, archivos excluidos |
| Opportunity | Integrado desde E con las mismas funciones | Rover; soporte de 19 grabaciones, archivos excluidos; foto de ensamblaje identificada como terrestre |
| Viking 1 | Integrado desde E con las mismas funciones | Lander estacionario sin ruedas; soporte de 18 grabaciones; modelo fotografiado en Tierra etiquetado |
| Ingenuity | Integrado desde el paquete encontrado: cinco capitulos, perfil, descubrimientos, reflexion, quiz y finalizacion | Helicoptero; 19 originales verificados fuera de Git, soporte conservado, archivos excluidos |

El dashboard descubre ocho historias y usa 40 capitulos como denominador. Un porcentaje menor de un registro antiguo representa mas misiones disponibles, no borrado de logros. `beyond-earth-progress`, IDs, badges y formatos existentes permanecen compatibles. Perseverance sigue fuera del catalogo; no se borra su progreso historico ni sus ubicaciones cientificas protegidas.

## Funciones conservadas y limites audiovisuales

Scroll nativo, Previous/Next, capitulos bloqueados por progreso, fuentes, captions/textos completos, actividades opcionales, quizzes, reintento, elegibilidad de finalizacion, insignias idempotentes, confirmacion real de guardado y recuperacion de errores. F conserva el avance de capitulo por scroll opt-in; E conserva su avance por boton. No se agrega scroll hijacking, timers de viaje ni cambios a escenas 3D.

`ReviewStoryRecording` mantiene el contrato del reproductor compartido y delega en el cuando el recurso no esta excluido. En esta revision informa la omision y deja continuar leyendo. No se interpreta ausencia deliberada como archivo corrupto, ni se promete voz real en siete misiones sin sus recursos autorizados. Los mappings y los 18 estados pending de Apollo 16 se preservan. No hay timestamps nuevos, sincronizacion por palabra ni escucha humana declarada.

La superficie lunar/Mars es SVG decorativo, no cartografia. Las fotografias/contextos corresponden a la mision, con descripciones y enlaces oficiales. Viking utiliza una foto de modelo terrestre y Opportunity una foto de ensamblaje terrestre; no se anuncian como selfies desde Marte. Continuan faltando recortes/modelos de presentacion aprobados para igualar exactamente las referencias de Haroon.

## Revision cientifica y editorial

Se mantienen las notas originales y los textos recibidos, sin reescribir el guion para ocultar desacuerdos. Se reabrieron fuentes primarias NASA el 11 de noviembre:

- Sojourner: [NASA Pathfinder](https://science.nasa.gov/mission/mars-pathfinder/) indica 10.6 kg, frente a 10.5 en el guion. La nota conserva el caracter aproximado. Siguen pendientes las afirmaciones concretas del modem/suelo blanco y la distincion sols/dias terrestres; las fotos no se presentan como prueba de esas acciones.
- Viking: [NASA Viking 1](https://science.nasa.gov/mission/viking-1/) fecha el cambio de nombre en enero de 1982. Se conserva la correccion visible al texto original de 1981 y la incertidumbre biologica; no se afirma vida confirmada. Haroon debe revisar/regrabar el guion antes de activarlo en una entrega narrada.
- Opportunity: [NASA Opportunity](https://science.nasa.gov/mission/mer-opportunity/) respalda la referencia de su legado al record superado en octubre de 2026. Se conserva el contexto historico, sin reintroducir una historia de Perseverance al catalogo.
- Apollo 16: [NASA Descartes](https://www.nasa.gov/history/apollo-16-on-the-moon-at-descartes/) respalda el contexto de Big Muley, Grand Prix y las fotografias. Se preservan notas sobre las metaforas de rocas brillantes/guardia, fechas UTC, camara ultravioleta separada y cifras pendientes de revision especializada.

No se afirma verificacion exhaustiva de cada frase, licencia universal de terceros o autorizacion para redistribuir las voces/PDF. Faltan derechos, revision editorial y tiempos medidos antes de una release completa con narracion.

## Validacion ejecutada

- `npx.cmd tsc -b --pretty false`: correcto. `npm.cmd run build` tambien ejecuta TypeScript y pasa; continua el warning conocido de chunk Three.js >500 kB.
- `node --test --test-concurrency=1 tests/*.test.mjs`: **239 aprobados, cero fallos/omitidos**. Incluye 22 pruebas de integracion (320 combinaciones de quiz para F/E/Ingenuity) y tres pruebas del nuevo paquete.
- Store real: guardado normal, rechazo de escrituras, recuperacion, recarga, repeticion, logros previos, prerrequisitos flat antiguos y fallo parcial al guardar la insignia. No se sustituye la persistencia por un mock de componente.
- Render de las 40 rutas en el shell real, landmarks, destinos y anchors; archivos GIS/homepage/explorer/store protegidos contra la base. Las historias anteriores siguen bajo sus pruebas de regresion.
- Chrome real headless sobre el build de produccion: 106 capturas de rutas/variantes, siete de actividad/finalizacion, dos de evidencia cientifica de Ingenuity y dos de catalogos: **117 capturas verificadas** en total. Los 40 capitulos se prueban a 1366x768 y 390x844; las ocho aperturas tambien a 360x800, 439x591 y 1024x768; se incluye reduced motion en Apollo 15 e Ingenuity.
- Cero overflow horizontal, imagenes rotas, errores JavaScript o fallos de carga de red en las rutas de historia. Sin targets pequenos en las vistas moviles medidas. Las seis imagenes F, seis E y tres Ingenuity cargan desde sus URLs originales, sin copias Git.
- Reproduccion MP3 real de Apollo 15, Pause/Resume, cambio de segmento sin autoplay y actividad de evidencia. No se declara reproduccion de grabaciones excluidas. Los siete grupos privados no montan audio ni provocan solicitudes a MP3 ausentes.
- Quiz y finalizacion reales de Apollo 15 y las cinco historias nuevas, persistencia tras recarga y ausencia de badges duplicados. Escape/Tab reales y swipe touch emulado.
- Hardware Lab: ocho enlaces de historia activados realmente. Exploradores: diez selecciones de maquina, rutas de las cuatro historias Moon/cuatro Mars, incluida la nueva ruta real de Ingenuity. No se reclama QA de tiles, proyecciones o render GPU por validar esos enlaces.
- Contextos Chrome incognito desechables; datos sinteticos solo alli. No se borra ni utiliza progreso del perfil habitual.
- El primer cierre de siete historias fue 232/232; la ampliacion Ingenuity cierra con 239/239. Se corrigio el loader TS de una nueva prueba y el envio CDP de Enter (requiere el caracter de retorno), sin alterar controles ni reducir las protecciones.
- Unico HTTP 404 observado en el audit de historias: `/favicon.ico`, incidencia heredada fuera de alcance.

Artefactos locales: `$env:AURORALYS_QA_DIR (QA externo de la integración)`, con `verification.json`, `catalog-verification.json` y capturas `verified-*.jpg`. No se agregan a Git. Los logs de tests/build estan en el directorio qa-artifacts padre.

## Reproduccion y revision final recomendada

Desde este worktree:

```powershell
node --test --test-concurrency=1 tests/*.test.mjs
npx.cmd tsc -b --pretty false
npm.cmd run build
npm.cmd run preview -- --port 5200 --strictPort
```

En un Chrome QA dedicado con puerto de debugging 9338 y perfil temporal fuera de dist:

```powershell
$env:CHROME_QA_PORT = '9338'
node scripts/story-visual-qa.mjs ../qa-artifacts/20261111-mission-integration-ingenuity http://127.0.0.1:5200 --all-missions
node scripts/story-catalog-qa.mjs ../qa-artifacts/20261111-mission-integration-ingenuity http://127.0.0.1:5200
```

Rutas de inicio: `/story/apollo-11-reflector/1`, `/story/apollo-15-rover/1`, `/story/apollo-16-rover/1`, `/story/apollo-17-rover/1`, `/story/sojourner/1`, `/story/opportunity/1`, `/story/viking-1/1`, `/story/ingenuity/1`; tambien `/hardware`, `/explore/moon`, `/explore/mars`, `/dashboard`. Avanzar capitulos con Next Chapter en la prueba manual; no borrar progreso para abrir el quiz. localStorage depende del origen/puerto.

Antes de publicar: revisar este diff local y los ocho recorridos con Haroon; resolver notas editoriales y derechos; autorizar hosting/audio y tiempos verificados; completar escucha, Safari/iOS, dispositivos fisicos, lectores de pantalla y zoom real. Coordinar con Erand futuros vinculos geograficos de las maquinas: no se inventan coordenadas o pins para las nuevas historias. Solo despues de esa revision considerar un push autorizado de codigo seguro y una integracion separada de medios aprobados.

## Seguridad Git

Historia basada unicamente en 8a77514 y su cadena segura. No merge, cherry-pick, rebase, push o PR. Originales E/F, rama visual, ramas protegidas y stashes conservados. No se instalan dependencias de la aplicacion ni se editan lockfiles. Para revisar el PDF se reutilizo pypdf temporal y se instalo el renderizador PyMuPDF solo en TEMP, fuera del proyecto. Se utiliza junction ignorado a node_modules existente. No se copian MP3/PDF/ZIP, extracciones crudas, JPEG nuevos, modelos o caches. La revision final del indice debe enumerar solo los archivos de texto siguientes; el commit es local y no autoriza su publicacion.

## Inventario exacto de archivos de este trabajo

- `docs/mission-integration/README.md`
- `docs/mission-integration/ingenuity-source-inventory.json`
- `docs/mission-integration/source-inventory.json`
- `scripts/story-catalog-qa.mjs`
- `scripts/story-visual-qa.mjs`
- `src/components/MachineStoryPage.tsx`
- `src/components/storytelling/Apollo15ScrollStory.module.css`
- `src/components/storytelling/Apollo16Quiz.tsx`
- `src/components/storytelling/Apollo16ScrollStory.tsx`
- `src/components/storytelling/MarsScrollStory.module.css`
- `src/components/storytelling/MarsScrollStory.tsx`
- `src/components/storytelling/ReviewStoryRecording.tsx`
- `src/components/storytelling/StoryHardware.tsx`
- `src/features/storytelling/apollo16AudioManifest.json`
- `src/features/storytelling/apollo16ImageManifest.json`
- `src/features/storytelling/apollo16Recordings.ts`
- `src/features/storytelling/apollo16Story.ts`
- `src/features/storytelling/apollo16StoryMedia.ts`
- `src/features/storytelling/ingenuityStory.ts`
- `src/features/storytelling/ingenuityStoryMedia.ts`
- `src/features/storytelling/marsMediaFiles.json`
- `src/features/storytelling/marsStories.ts`
- `src/features/storytelling/marsStoryContent.json`
- `src/features/storytelling/marsStoryMedia.ts`
- `src/features/storytelling/reviewMediaPolicy.ts`
- `src/features/storytelling/storyCatalog.ts`
- `src/features/storytelling/storyPresentation.ts`
- `tests/apollo-progress-persistence.test.mjs`
- `tests/apollo15-registration.test.mjs`
- `tests/application-routes.test.mjs`
- `tests/helpers/mission-integration-contract.mjs`
- `tests/helpers/mission-story-host.mjs`
- `tests/helpers/moon-scope-contract.mjs`
- `tests/ingenuity-package.test.mjs`
- `tests/mission-integration.test.mjs`
- `tests/moon-scope.test.mjs`
- `tests/storytelling-quiz.test.mjs`

## Ampliacion Ingenuity tras localizar el paquete

El paquete original se encontro en `$env:AURORALYS_INGENUITY_PACKAGE` (5,169,369 bytes; SHA-256 `a2b61dd8fb35681250f0a35adf2fb2d171ae259c8deebdf4fb56a9eb8289f54f`). Contiene un PDF de siete paginas y exactamente 19 MP3 (4/4/4/4/3), sin otro paquete duplicado. Se leyeron y renderizaron las siete paginas; la pagina 7 marca en naranja las respuestas B/C/C. Los 16 parrafos narrativos se transcriben como base editorial, sin agregar historia inventada; las tres preguntas conservan opciones y respuestas. NASA confirma las respuestas. La puntuacion/ortografia tipografica del PDF se normaliza para lectura web.

Todos los originales se conservan byte por byte y se cotejan por hash. Chrome AudioContext.decodeAudioData decodifico los 19 archivos: 262.661 segundos (aproximadamente 4m23s). Eso verifica decodificacion, no escucha humana, correspondencia verbal completa o sincronizacion. No se crean cues a partir de la duracion. El manifiesto registra nombres originales, mappings, bytes, hashes, duraciones medidas y estados pending de escucha/timing.

La copia de inspeccion, el PDF, MP3, renders y diagnostico de decodificacion estan exclusivamente en `$env:AURORALYS_PRIVATE_INPUTS_DIR (inspección local externa)`, fuera de todos los worktrees. No se sirven desde Vite ni se agregan a Git. El ZIP original sigue en Descargas y permanece intacto. No se publica ninguna grabacion; ReviewStoryRecording muestra la omision explicita y permite leer. La narracion final necesita autorizacion y restauracion separada de originales.

Se reutilizan MarsScrollStory, StoryEnvironment, StoryHardware, los controles de scroll nativo, quiz compartido y store existentes. Hay un solo hardware `ingenuity` (el registro preexistente), clasificado como helicoptero; no se duplica ni se modifica data.ts. La nueva insignia es `ingenuity-storyteller` / Jezero Flight Explorer. Ninguna identidad anterior, coordenada o schema cambia. Una prueba compara los tres objetos completos de historias Mars y su hardware con b146db0.

NASA evidence: PIA24581 (fotografia de las palas desbloqueadas; fuente Photojournal), PIA24727 (crestas vistas en vuelo 9; fotografia contextual) y PIA26760 (concepto artistico de los futuros SkyFall, claramente identificado). Solo URLs remotas con creditos; no archivos nuevos de imagen. Los videos oficiales son enlaces opt-in. Se excluyen miniaturas de Google y el PNG de un tercero sin procedencia suficiente. No se afirma que la foto del helicoptero documente el accidente o cada accion del guion.

Notas cientificas visibles: las crestas pueden registrar antiguos procesos de fluidos, no constituyen una deteccion de agua subterranea; 30 sols no equivale a 30 dias terrestres; el accidente es una reconstruccion probable, no una filmacion del impacto; SkyFall es una mision futura. Fuentes verificadas el 11-11-2026: [NASA Ingenuity](https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/), [geologia del vuelo 9](https://www.jpl.nasa.gov/news/nasas-mars-helicopter-reveals-intriguing-terrain-for-rover-team/), [investigacion del accidente](https://www.nasa.gov/missions/mars-2020-perseverance/ingenuity-helicopter/nasa-performs-first-aircraft-accident-investigation-on-another-world/) y [NASA SkyFall](https://science.nasa.gov/mission/skyfall/). Haroon debe resolver la frase de agua subterranea antes de habilitar esa grabacion en una release narrada.

Cambios de esta ampliacion: 17 archivos de texto; cuatro nuevos (inventario, historia, evidencia y prueba), trece adaptados (README, dos scripts QA, MarsScrollStory, marsStories, marsStoryMedia, reviewMediaPolicy, storyPresentation y cinco tests de catalogo/integracion). El trabajo completo desde 8a77514 abarca 37 archivos de texto. No se agregan binarios ni ancestry E/F. Los commits de integracion son solo locales; no hay push ni PR.
