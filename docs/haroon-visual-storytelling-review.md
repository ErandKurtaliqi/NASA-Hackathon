# Revisión visual de storytelling — 11 noviembre 2026

## Recuperación y alcance

Se recuperó `origin/review/haroon-visual-storytelling` en `1056f91`, sin cambios locales previos en esta rama. El worktree esperado no estaba registrado en OFFICE; se creó desde ese commit remoto, sin cambiar el checkout de integración. Los cinco archivos guardados ya incluían terreno decorativo SVG, presentación de hardware, configuración visual, CSS y un capturador Chrome. Los componentes visuales todavía no estaban montados en las historias.

Se revisaron las dos referencias reales de `Downloads/Imagenes_Mues` (Apollo 15 y Viking 1). Se utilizan como guía de composición, nunca como fondo completo de la aplicación ni como evidencia científica.

La integración nueva conecta el trabajo existente con Apollo 15, Apollo 11 y Apollo 17. No modifica scripts, recordings, fuentes científicas, almacenamiento, GIS/3D, homepage, exploradores, IDs ni rutas. No integra la implementación Mars de Workstream E ni Apollo 16 de F. El catálogo seguro ya excluía Perseverance de las rutas publicadas antes de este trabajo; esa decisión heredada y su código/progreso histórico permanecen intactos.

## Cambios visuales entregados

- Superficie y horizonte lunar decorativos con textura SVG, cielo estrellado existente y sombreado. La textura está recortada a la superficie para evitar un borde rectangular visible. No es una reconstrucción geográfica ni una fotografía NASA.
- Tres zonas en escritorio: hardware destacado a la izquierda, título/subtítulo y relato en el centro, evidencia NASA con marco luminoso a la derecha. La introducción recupera la marca y navegación superior mediante `scroll-margin-top`.
- El primer párrafo tiene prioridad sobre la cubierta de controles. Los demás segmentos conservan flujo y scroll nativo; no se añaden capturadores de rueda/touch ni nuevas animaciones de hardware.
- Cinco capítulos con etiquetas visuales breves y nombres accesibles completos. Se conservan bloqueo/desbloqueo, destinos, capítulos previos/siguientes y navegación entre segmentos.
- Botones de sonido/reproducción legibles y redondeados; Play tiene mayor contraste. El reproductor, sus eventos, exclusividad, captions y reglas de activación permanecen sin cambios.
- Dos columnas en tablet; una columna en móvil, con hardware compacto, controles en flujo y evidencia dentro de cada segmento como antes. Se conservan captions, atribuciones y enlaces oficiales completos.
- Objetivos táctiles de al menos 44 px en controles y enlaces revisados, incluyendo menú, marca y footer compartidos **solo cuando estas páginas de storytelling están presentes**. Los estilos de homepage/explorer no cambian.
- Aviso de audios excluidos de Apollo 11/17 en disclosure nativo accesible; los avisos específicos de reproducción omitida y de revisión científica continúan separados.

## Fidelidad y estado por misión

**Apollo 15:** composición integrada y comprobada en navegador real. Se aproxima a la jerarquía y disposición de Haroon; no es una réplica exacta del arte. El hardware es la fotografía histórica NASA de LRV-1 con fundido de presentación, no el render aislado del rover de la referencia. La superficie es decorativa procedural, no terreno fotográfico. La evidencia mantiene las imágenes verificadas de cada segmento; no se convierte una foto de rollout en una foto de despegue para imitar la referencia. El párrafo de la apertura procede del guion existente, sin reescribirlo.

**Apollo 17:** mismo sistema visual con su fotografía de LRV-3/Harrison Schmitt y evidencia propia. Se preservan los cinco capítulos, actividades, quiz, progreso y decisiones editoriales. Las nuevas grabaciones privadas no están en esta rama; el soporte final para `StoryRecording` y sus mappings permanece preparado, sin importar el historial privado ni retirar la narración final.

**Apollo 11:** presentación de experimento estacionario. El diagrama educativo existente de 100 corner cubes está claramente identificado y enlaza a la evidencia NASA; no se presenta un rover o vehículo lunar de otra misión. Las fotografías documentales remotas cargaron en Chrome. Las grabaciones excluidas y las retenciones científicas siguen indicadas.

**Viking 1:** contrato visual `world: mars`, `hardware: lander`, rótulo Viking 1 y terreno Mars reutilizable. No se crea ruta, historia, narración, retrato sustituto, pin o coordenada. Falta conectar la implementación existente de E mediante un retrato aprobado, cuando se autorice esa integración.

## Inventario exacto de archivos

Modificados:

1. `scripts/story-browser-qa.mjs` — contexto Chrome desechable y errores de espera más descriptivos.
2. `src/components/storytelling/Apollo15ScrollStory.tsx` — montaje visual, subtítulo, etiquetas accesibles y orden de controles.
3. `src/components/storytelling/Apollo15ScrollStory.module.css` — composición, texto, controles y accesibilidad scoped.
4. `src/components/storytelling/MoonPackageStory.tsx` — montaje de Apollo 11/17 y disclosure de revisión.
5. `src/components/storytelling/MoonPackageStory.module.css` — disclosure y enlaces de evidencia accesibles.
6. `src/components/storytelling/RoverStoryLayout.module.css` — proporciones, prioridad de lectura y breakpoints.
7. `src/components/storytelling/StoryEnvironment.tsx` — textura y horizonte decorativos con recursos SVG separados.
8. `src/components/storytelling/StoryHardware.tsx` — identidad accesible y créditos explícitos para fotografías/diagrama.
9. `src/components/storytelling/StoryPresentation.module.css` — tamaño/fundido del hardware y entorno responsive.
10. `src/features/storytelling/storyPresentation.ts` — contrato futuro Viking 1, sin registro de misión.
11. `tests/apollo-progress-persistence.test.mjs` — búsqueda por nombre accesible y separación de hardware/evidencia; se conserva el store y flujo real de prueba.
12. `tests/application-routes.test.mjs` — informa la ruta del timeout antes de abortar SSR; no se amplía el límite ni se omiten rutas.
13. `tests/helpers/story-visual-contract.mjs` — normalización de fragmentos exactos de presentación autorizados; la lógica de comportamiento sigue protegida por snapshots históricos.

Nuevos:

14. `scripts/story-visual-qa.mjs` — comprobación Chrome real en contexto aislado, capturas, audio, actividad, quiz/progreso y accesibilidad.
15. `tests/story-presentation.test.mjs` — hardware por misión, diagrama, IDs SVG, contrato Mars y navegación accesible.
16. `docs/haroon-visual-storytelling-review.md` — este informe.

No se añaden ni modifican MP3, PDF, ZIP, fotografías, modelos, dependencias o lockfiles. Las capturas y perfiles temporales quedan fuera del historial Git.

## Validación ejecutada

- `node --test --test-concurrency=1 tests/*.test.mjs`: **214 aprobados, 0 fallos, 0 omitidos**.
- `npx.cmd tsc -b --pretty false`: correcto. El build también ejecuta `tsc -b`.
- `npm.cmd run build`: correcto. Continúa la advertencia conocida de tamaño del bundle Three.js; no se altera GIS para silenciarla.
- `git diff --check`: correcto; se comprueba además el índice antes de guardar.
- Chrome headless real, build de producción en `http://127.0.0.1:5199`: 40 capturas de rutas/variantes y 2 capturas de actividad/finalización. Los 15 capítulos se revisan a 1366×768 y 390×844; las tres aperturas también a 360×800, 439×591 y 1024×768. Se incluye Apollo 15 con reduced motion.
- Todas las capturas de rutas: cero overflow horizontal, imágenes cargadas, un solo `main`, navegación de capítulos y árbol de accesibilidad disponibles. La inspección del árbol no equivale a certificación con lector de pantalla.
- MP3 Apollo 15: reproducción real después de activación explícita, avance de `currentTime`, pausa/reanudación y cambio de segmento sin autoplay. No se afirma escucha humana ni revisión de todas las grabaciones.
- Formulario de predicción real: selección, envío, evidencia y ausencia de escrituras en progreso.
- Quiz real: respuestas, resultados, Complete Story, persistencia tras recarga y repetición sin duplicar la insignia. Datos sintéticos únicamente en contexto incognito desechable; nunca se limpia ni se utiliza el progreso del perfil habitual.
- Escape real cierra el menú móvil y devuelve el foco; Tab llega a un control nativo. Swipe touch emulado desplaza el documento. Reduced motion conserva navegación.
- Cero excepciones de JavaScript, fallos de carga de red o errores HTTP de app/medios. Chrome pide `/favicon.ico`, que responde 404: incidencia heredada ajena a este rediseño, sin ocultarla en el registro.

Incidencias durante la preparación: el SSR de rutas superó su límite de cinco segundos en ejecuciones iniciales con carga; también ocurrió antes de modificar código. Se mantuvo ese límite y la suite final pasa completa. El primer build encontró un perfil QA temporal abierto dentro de `dist`; se cerró únicamente ese Chrome QA y se inició con perfil externo al directorio de build. Los builds finales pasan. Ninguna de estas incidencias se presenta como defecto de la historia ni como prueba aprobada antes del reintento.

## Evidencia local y reproducción

Los registros y capturas reales permanecen en `$env:AURORALYS_QA_DIR (QA externo de esta revisión)`. `verification.json` incluye viewport, URL, imágenes, targets, árbol AX, capturas y diagnósticos. El directorio hermano de desarrollo conserva capturas anteriores para comparar; no se publican automáticamente.

Desde este worktree:

```powershell
npm.cmd run build
npm.cmd run preview -- --port 5199 --strictPort
```

En otra terminal, iniciar un Chrome QA independiente, **sin usar un perfil personal ni guardar su perfil dentro de dist**:

```powershell
$qaProfile = Join-Path $env:TEMP ('auroralys-story-qa-' + [guid]::NewGuid().ToString('N'))
Start-Process -FilePath $env:CHROME_EXE -WindowStyle Hidden -ArgumentList '--headless=new','--remote-debugging-port=9337',"--user-data-dir=$qaProfile",'--no-first-run','about:blank'
node scripts/story-visual-qa.mjs ../qa-artifacts/haroon-visual-production http://127.0.0.1:5199
```

Rutas: `/story/apollo-15-rover/1`, `/story/apollo-11-reflector/1`, `/story/apollo-17-rover/1`. Para una prueba manual con progreso vacío, avanzar con Next Chapter hasta el quiz; no borrar el almacenamiento existente para acceder directamente al capítulo 5.

## Pendientes reales

- Aprobación visual de Haroon: fotografía con fundido/terreno SVG no reproducen el rover aislado y suelo fotorealista de la referencia. Falta un recurso de presentación aprobado para cerrar esa diferencia; no se inventa ni descarga uno sin verificarlo.
- Dispositivos físicos, Safari/iOS, escucha humana, NVDA/VoiceOver y zoom de texto real. Chrome móvil emulado no sustituye esas comprobaciones.
- Timestamps/cues y aceptación editorial pendientes existentes; no se generan timings ni se anuncia sincronización precisa.
- Publicación/streaming autorizado de las grabaciones privadas Apollo 11/17 y permisos de los paquetes pendientes. No se copian al review aunque el repositorio sea privado.
- Integración futura de Viking 1 con E, independiente de GIS y sin replicar su implementación en este worktree.
- Favicon heredado y advertencia de bundle, fuera del alcance visual.

La revisión Git verifica visibilidad privada del repositorio, historia saliente y archivos de texto autorizados. El respaldo se destina exclusivamente a `review/haroon-visual-storytelling` mediante push normal. No se modifica main/integración ni se mezclan historias privadas; los stashes y demás worktrees se conservan.
