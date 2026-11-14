# Ajuste de controles del documental — 12 de noviembre de 2026

Estado: implementado y aprobado visualmente por el usuario en Chrome para el diseño compacto de Apollo 15. El usuario autorizó finalizar el merge existente, publicar únicamente la rama de integración y preparar un PR contra master. Esa aprobación no establece QA completo de las otras misiones, todos los segmentos, audio, actividades o tamaños de viewport. No se han generado capturas ni imágenes de sustitución. El cierre y sus gates están registrados en [master-integration-finalization.md](master-integration-finalization.md).

## Cambios de producto

- `src/components/storytelling/ContinuousStoryPage.module.css`: el deck pasa de una altura fija de 154 px en escritorio y 152 px en móvil a una cuadrícula en flujo normal, con altura determinada por los controles y un área de estado de dos líneas. Se elimina también la altura fija de 138 px de pantallas móviles bajas.
- Se reúnen navegación, reproducción, posición y volumen en una fila. El área de estado conserva su espacio al cambiar de segmento o estado de audio; un mensaje largo se puede recorrer con teclado. Los botones y sliders mantienen áreas mínimas de 44 px. En móvil, los botones usan iconos con sus nombres accesibles completos. En pantallas excepcionalmente estrechas, la cuadrícula permite una segunda fila en vez de forzar los controles a caber.
- El lector gana el espacio liberado por el deck. Se ajustan márgenes, espaciado entre segmentos, interlineado a 1,7, peso de la narrativa y tamaño de encabezados/metadatos; el texto principal conserva 18–22 px en escritorio y 17 px en móvil. El canal de scrollbar se reserva para evitar variaciones de anchura del texto.
- `src/components/storytelling/ContinuousStoryPage.tsx`: añade iconos accesibles a Previous/Next y reúne el capítulo y segmento en el estado del reproductor, eliminando el contexto duplicado que ocupaba otra fila. No cambia handlers, detección del segmento, navegación, quizzes, actividades ni guardado.
- `src/components/storytelling/DocumentaryAudio.tsx`: añade los iconos de Play/Pause, nombres accesibles explícitos y acceso por teclado al mensaje de estado. Los efectos, callbacks, controles de posición/volumen y ciclo de vida de audio permanecen idénticos.

Las reglas de fondo, hardware, evidencia, posiciones de paneles y sus breakpoints no se modificaron. Se mantienen el scroll nativo del lector y el deck como elemento de flujo, sin posicionamiento absoluto/fijo encima de la narrativa. La estabilidad y ausencia de solapamiento en un navegador real todavía deben comprobarse manualmente.

## Tamaños solicitados

Estos valores son **estimaciones derivadas del CSS**, no mediciones de navegador ni resultados de QA visual. La altura real puede adaptarse a contenido, zoom y restricciones del viewport.

| Viewport | Altura anterior declarada | Objetivo aproximado | Reducción prevista | Estado visual |
|---|---:|---:|---:|---|
| 1440 × 900 | 154 px | 93 px | 40% | Pendiente en Chrome |
| 1366 × 768 | 154 px | 93 px | 40% | Pendiente en Chrome |
| 1024 × 768 | 154 px | 93 px | 40% | Pendiente en Chrome |
| 390 × 844 | 152 px | 96 px | 37% | Pendiente en Chrome |

## Validación ejecutada

- `node --test tests/*.test.mjs`: **286 aprobadas, 0 fallos, 0 omisiones**. Incluye rutas reales SSR de las ocho misiones/cuarenta capítulos, narración, quizzes y persistencia.
- `npm.cmd run test:rover`: aprobado.
- `npx.cmd tsc -b --pretty false`: aprobado.
- `npm.cmd run build`: aprobado; se conserva la advertencia de chunks mayores de 500 kB.
- `git diff --check`: aprobado.
- `tests/master-integration.test.mjs`: se adapta la comparación histórica que impedía cualquier cambio de CSS/audio. Ahora exige igualdad de todas las reglas de paneles y fondo, incluidos contextos responsive; mantiene igualdad exacta del audio salvo los iconos, nombres accesibles y foco autorizados. También verifica que el deck no vuelva a tener altura fija ni posición absoluta/fija. No se eliminan ni omiten pruebas.
- Los servidores locales responden por HTTP y sirven respectivamente el CSS anterior y el ajustado. Esta comprobación no equivale a inspección visual, medición geométrica, playback real o prueba de gestos.

## Comparación manual antes/después

- **Antes:** [Apollo 15 anterior](http://127.0.0.1:5214/story/apollo-15-rover).
- **Después:** [Apollo 15 ajustado](http://127.0.0.1:5226/story/apollo-15-rover).

La vista anterior procede de una copia de frontend del árbol inicial del índice, `b9e78d000a9f6c775ade4008bd72e08c6b8948c3`, en un directorio de QA externo. La vista ajustada usa este worktree. Ambas vistas son de desarrollo, escuchan sólo en loopback y mantienen almacenamiento independiente por puerto. No fue necesario restaurar archivos del worktree ni tocar el índice para preparar la comparación.

En Chrome, usar los cuatro tamaños de la tabla, con zoom al 100%, y capturar ambas versiones en el mismo capítulo y segmento. Comprobar legibilidad, botones, sliders, navegación con Tab y que los mensajes largos sean accesibles. Recorrer hacia delante/atrás: sólo deben cambiar texto, evidencia y audio correspondiente; hardware, fondo, paneles y controles deben permanecer estables durante el scroll. Revisar también el quiz, actividades y la recarga del progreso.

Repetir con `apollo-11-reflector`, `apollo-16-rover`, `apollo-17-rover`, `sojourner`, `opportunity`, `viking-1` e `ingenuity`, cambiando el ID en ambas URLs. Las capturas de las cuatro resoluciones siguen pendientes; no se reutilizan capturas de revisiones anteriores como evidencia de este cambio.

## Checkpoint del ajuste: merge e índice preservados antes del cierre

- Rama: `integration/haroon-master-continuous-storytelling`.
- `HEAD`: `3b45e8f2324e8af85e55d81a1020306e95e1706e`.
- `MERGE_HEAD`: `ddb458657e1fa5fca0bd117f265e95b444090712`.
- Árbol del índice antes/después: `b9e78d000a9f6c775ade4008bd72e08c6b8948c3`.
- En este checkpoint se comparó además el hash de todas las entradas preparadas: coincidió exactamente con el inicial. Los ajustes se dejaron sin preparar para revisión. La instrucción posterior del usuario autoriza prepararlos y completar/publicar el merge; este apartado conserva el registro anterior y no describe el estado final de publicación.
