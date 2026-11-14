# Frente D — contrato de mapas y auditoría de calidad

Revisión de solo lectura sobre `8120d9e`, 8 de noviembre de 2026.
No se modificó código de aplicación, GIS/3D, coordenadas, texturas o esquema de progreso.
Este documento es una propuesta para coordinación, no un contrato aprobado por Erand.

## Interfaces y responsabilidades actuales

| Archivo | Comportamiento comprobado |
| --- | --- |
| `src/types.ts:19` | `MissionMarker` tiene ID, planeta, coordenadas, precisión, fuente y `storyChapter?`; no tiene hardware/story ID. |
| `src/data.ts:45` | 11 ubicaciones registradas. Existen `perseverance-landing`, `jezero` y `apollo-17`. No existe pin Apollo 15. |
| `src/data.ts:58` | Hardware de Perseverance (`perseverance`), Apollo 17 (`lrv`) y Apollo 15 (`lrv-1`) registrado; otros equipos carecen de historia publicada. |
| `src/features/explorer/storyEntry.ts:6` | `getStoryEntry` resuelve por identidad explícita hardware + planeta; devuelve ruta existente y reanudación acotada a 1–5. No deduce identidad del nombre. |
| `src/pages/ExplorerPage.tsx:25` | `machineId` y `locationId` son estados distintos. Elegir ubicación no cambia automáticamente el equipo. |
| `src/pages/ExplorerPage.tsx:46` | `selectLocation` valida pertenencia al planeta y registra exploración. `viewMap` cambia vista y enfoca el visor. |
| `src/components/explorer/PlanetViewport.tsx:23` | Consume `focusId` y pasa ese dato a `PlanetMap`; no recibe eventos de selección del mapa ni del globo. |
| `src/components/PlanetMap.tsx:50` | API pública `{ planet, focusId? }`. El click de marcador registra `explore(marker.id)` y abre popup nativo. No comunica selección al atlas externo. |
| `src/components/explorer/MachineDetails.tsx:9` | Ya ofrece enlace de historia/reanudación mediante `getStoryEntry` y progreso de la misión correcta. |
| `src/App.tsx:60` | Una ruta dinámica `/story/:storyId/:chapter` cubre las tres misiones. No hace falta otra ruta para mapas. |
| `src/features/storytelling/pilot.ts:15` | Valida historia y capítulo antes de acceder a arrays. El padre de la historia conserva el bloqueo por prerrequisitos. |

`storyChapter` aislado no identifica una misión ni un segmento. No debe usarse como
URL, ni suponerse que sus números históricos reflejan la nueva narración. Tampoco
se deben derivar historias mediante coordenadas cercanas, nombres o categorías.

## Tabla de enlaces propuesta — requiere aprobación

| Ubicación existente | Hardware | Historia registrada | Entrada recomendada |
| --- | --- | --- | --- |
| `perseverance-landing` / Mars | `perseverance` | `follow-perseverance` | Inicio o reanudación validada. Contexto Journey solo si está desbloqueado y aprobado. |
| `jezero` / Mars | `perseverance` | `follow-perseverance` | Misma identidad, pero región científica; no presentarla como coordenada exacta del rover. |
| `apollo-17` / Moon | `lrv` | `apollo-17-rover` | Inicio o reanudación validada. |
| Apollo 15 | `lrv-1` | `apollo-15-rover` | No hay pin actual. Erand debe proporcionar/confirmar ID de ubicación, procedencia, coordenadas y precisión. |
| Curiosity, Ingenuity, otros sitios y geología | Sin historia registrada aplicable | Ninguna | Mantener perfil, evidencia y fuente; no fabricar enlaces. |

La relación propuesta de pines con historias es distinta de los identificadores de
hardware/historias ya confirmados. Falta aprobar la primera; los segundos no cambian.

## Contrato aditivo sugerido para Erand

```ts
type LocationSelection = {
  planet: 'mars' | 'moon'
  locationId: string // ID GIS ya registrado, no coordenadas proporcionadas por UI
  origin: 'pointer' | 'keyboard'
}

// Extensión opcional; llamadas actuales continúan funcionando sin callback.
type PlanetMapSelectionProps = {
  onLocationSelect?: (selection: LocationSelection) => void
}
```

Responsabilidad GIS: emitir eventos desde marcadores nativos para ratón, teclado y
touch; mantener sus popups, coordenadas, precisión y registro de exploración; omitir
eventos obsoletos tras cambio de planeta/desmontaje. La interfaz equivalente del
globo requiere revisión separada; no se deben simular pins desde el frontend.
No se expone una instancia Leaflet, Esri o Three ni se inspecciona su DOM privado.

Responsabilidad frontend: validar el evento contra `markers` del mismo planeta,
actualizar atlas/selección y consultar un registro explícito de vínculos aprobado.
Resolver hardware/story mediante `getStoryEntry`; usar la ruta actual y sus guardas.
No completar capítulos, otorgar badges ni modificar progreso por abrir una historia.

UX recomendada: el primer click selecciona y muestra contexto; un enlace explícito
"Start/Continue story" abre la historia. Evita cambios de página inesperados al
explorar un mapa con teclado. Si se prefiere navegación inmediata, Haroon y Erand
deben acordarla antes de implementar. Una ubicación sin historia conserva su fuente.

Un contexto futuro de capítulo/segmento sería frontend y opcional:

```ts
type StoryLocationBinding = {
  planet: 'mars' | 'moon'
  locationId: string
  machineId: string
  chapterId?: 'meet' | 'journey' | 'challenges' | 'legacy' | 'quiz'
  segmentId?: string // pendiente de registro estable, no título/índice inferido
}
```

No abrir capítulos bloqueados ni marcar prerrequisitos como realizados. La entrada
por contexto debe degradar a inicio/reanudación permitidos. `lastChapter` es una
pista de reanudación; la guarda de la historia sigue siendo autoridad de desbloqueo.

La vuelta al mapa puede conservar planeta/ubicación y objetivo de foco mediante
estado transitorio de router, sin nuevos campos en `beyond-earth-progress`. Hoy el
explorador reinicia selección al entrar: la restauración requiere un cambio frontend
posterior y pruebas, no existe todavía. Validar el ID de retorno y disponer de un
fallback de foco si ya no existe; contemplar salida de fullscreen antes de navegar.

## Qué puede prepararse independientemente

- Pruebas de un resolver puro sobre vínculos aprobados, IDs desconocidos y planeta.
- Diseño de CTA/reanudación, mensajes sin historia y contrato de foco de retorno.
- Registro de segmentos estable y validación de destinos desbloqueados.
- QA de historias, evidencia, audio y progreso, sin tocar mapas.

No se implementó ninguno de esos adaptadores aquí: el frente D es de solo lectura.
Requieren coordinación GIS el callback nativo, nuevos pins, binding geográfico,
enfoque del globo, proyecciones, precisión y cualquier solución interna de carga.

## Defectos comprobados frente a riesgos por validar

| Prioridad / estado | Evidencia de código | Consecuencia / corrección mínima propuesta |
| --- | --- | --- |
| Alta, confirmado | `PlanetMap.tsx:50–107`: no callback de selección; `focusId` solo entra al mapa. | Un click no sincroniza el atlas ni resuelve historia. Extensión pública opcional, revisada por Erand; ningún parche aplicado. |
| Alta, confirmado | `data.ts:45–56`: no registro de ubicación Apollo 15. | No implementar pin/ruta inventados. Esperar registro científico del propietario GIS. |
| Media, confirmado | `PlanetMap.tsx`: fallback opaco en `overlayPane` por defecto, por encima de tiles; `tileerror` puede ser sobrescrito por `load`. Detalle previo en `docs/explorer-map-integration-review.md`. | Estado "LIVE" no prueba éxito y el fallback puede ocultar tiles. Incidencia GIS existente; conservar científica/CRS y corregir internamente con coordinación. No se atribuye una caída de NASA. |
| Media, confirmado | `MachineStoryPage.tsx:1–3` importa Fiber/Drei estáticamente aunque Apollo 15 no monte un canvas. Build base: chunk Fiber 823.49 kB y chunk de historia ~103.86 kB minificados. | La experiencia 2D evita WebGL activo, pero no elimina el coste de descargar JS Three compartido. Separar capítulos 3D por importación dinámica en una fase de rendimiento aprobada. |
| Media, confirmado | `Apollo15ScrollStory.tsx:26`, con padre keyed por capítulo, reinicia Sound on y autoAdvance al montar cada capítulo. | Preferencias temporales no sobreviven al capítulo; no hay autoplay. Acordar alcance de preferencias y, si se desea, conservarlas en shell de sesión sin cambiar esquema. |
| Media, confirmado | `StoryMedia.tsx` no usa `loading="lazy"`; en móvil se renderiza evidencia de los cuatro pasos. | No se cargan los 19 audios (preload none), pero sí pueden solicitarse imágenes de pasos posteriores. Carga diferida opcional; medir antes de afirmar una regresión de red. |
| Media, riesgo visual pendiente | `Apollo15ScrollStory.module.css`: controles sticky; márgenes de foco 300/240px. `findReadingStep` usa 45% del viewport y no mide la altura real de controles. | Con zoom, textos largos o 439×591, comprobar si la línea activa queda cubierta. Medición con ResizeObserver/offset dinámico solo si se reproduce. |
| Media, riesgo pendiente | Selección por scroll puede cambiar/recrear una pista justo al cruzar la línea entre tarjetas. | Confirmar que el usuario entiende por qué se pausa, que no hay oscilaciones de layout y que Replay/Resume siguen accesibles; no hay sincronización fina aprobada aún. |
| Media, confirmado en base | Apollo 17 Journey antiguo usa intervalo de 3.6s y FlightScene usaFrame; no depende de reduced motion. | B propone sustituir solo su presentación por 2D; comprobar su resultado sin cambiar Perseverance. |
| Media, revisión humana pendiente | Registro de 19 timings pendientes; fuentes originales del guión incluyen referencias de contexto ajeno. | No activar cues por estimación ni mostrar automáticamente cualquier URL del guión como evidencia. Usar manifiestos NASA verificados y revisión audible. |
| Baja, riesgo visual pendiente | Grid con minmax y reordenación a 1100/700px; algunas columnas sticky se desactivan bajo 800px de alto. | Comprobar 360×800, 390×844, 439×591, tablet, desktop y zoom200%; no declarar overflow sin medición de navegador. |

Las mediciones de tamaño provienen del build, no de un perfil de CPU/red móvil.
Ninguna captura/renderizado de Chrome se realizó en esta auditoría.

## Criterios de aceptación antes de integrar mapas

1. Pin conocido: selección y CTA correctos; desconocido/cruzado de planeta: ningún
   enlace falso. `lrv` y `lrv-1` permanecen aislados. El pin Apollo 15 requiere fuente.
2. Mouse/Enter/touch conservan popups y registran exploración sin completar capítulos.
3. Historia nueva, parcialmente guardada, legacy y completada: ruta y guardas válidas.
   Volver al explorador conserva contexto/foco mediante contrato aprobado.
4. Guardado rechazado y Retry saving siguen funcionando; la navegación no implica
   una confirmación de persistencia. No se alteran keys/schema/version/badges.
5. Audio se detiene al abrir/cambiar/salir; no se reproduce automáticamente desde pins.
6. Reduced motion no activa vuelos/animaciones no solicitados. Bloqueo touch del mapa
   permite leer/scroll fuera de la interacción explícita.
7. Pruebas de mapas/callback: cambio de planeta, callbacks tardíos, fullscreen,
   imágenes/tiles fallidos, offline y fuentes siempre accesibles.
8. Regresión de 15 capítulos, quiz/reintento/recompensas y homepage/narración/captions.

## Baseline y aislamiento

- Cuatro worktrees desacoplados en `C:/xampp/htdocs/Auroralys/workstreams/20261108-*`.
- Dependencias existentes vía junction `node_modules`, solo lectura; cada worktree
  tiene archivos fuente, `dist` y cachés de compilación propios. Sin npm install.
- Las demos deben usar Vite `createServer` con `cacheDir` local explícito (por ejemplo
  `dist/.vite-workstream-c`), o un servidor estático para el reviewer HTML. El comando
  Vite dev por defecto usa `node_modules/.vite`: no ejecutarlo simultáneamente sobre
  la junction compartida. Los builds y pruebas no usan esa preoptimización de dev.
- El primer checkout de Windows convirtió el guión original a CRLF y activó un fallo
  de comparación binaria de texto. Se repusieron bytes exactos del blob HEAD en ese
  archivo de cada worktree, sin diferencia funcional ni de Git; no se tocaron MP3.
- Suite base comprobada después de ello: **165/165**, código salida 0.
- Build de producción y TypeScript correctos; permanece la advertencia de Fiber
  de 823,49 kB. `git diff --check` correcto. No hay archivos staged ni código aplicado.
- Este frente añade únicamente este documento; no se integra código entre frentes.
- Antes de integrar A/B/C se requieren revisión de diferencias por ownership, pruebas
  completas en un entorno de revisión autorizado y aprobación explícita. No sumar
  resultados de worktrees independientes como si fueran una suite integrada.
