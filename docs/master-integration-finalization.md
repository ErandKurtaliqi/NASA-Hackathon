# Cierre de la integración existente — 12 de noviembre de 2026

Esta entrega reúne las dos historias mediante el commit de merge que contiene este informe. La rama de revisión es `integration/haroon-master-continuous-storytelling` y su PR tiene como base **master**. No autoriza un merge inmediato a master: sigue pendiente el QA obligatorio descrito abajo. No se actualiza main ni se hace push directo a master.

## Historial preservado

- Primer padre/master verificado después de `git fetch origin`: `3b45e8f2324e8af85e55d81a1020306e95e1706e`.
- Segundo padre/storytelling: `ddb458657e1fa5fca0bd117f265e95b444090712`.
- Worktree original: `master-integration`.
- Se continuó el merge ya abierto. No se creó otro worktree, reinició, abortó, reseteó ni sustituyó el árbol de ningún desarrollador.
- Se revisaron y prepararon las tres modificaciones del layout, su regresión y documentación. Se comprobó que las demás entradas del índice original conservaran sus blobs.
- El SHA exacto de esta entrega se obtiene con `git log -1 --format=%H`; sus padres con `git show -s --format=%P HEAD`. Las verificaciones de ancestros deben aprobar para ambos SHA anteriores.

## Funcionalidad retenida

Los ocho documentales (Apollo 11, 15, 16, 17, Sojourner, Opportunity, Viking 1 e Ingenuity), sus cuarenta capítulos y 126 segmentos permanecen disponibles. Se mantienen el scroll continuo, el hardware y fondo estáticos, evidencia NASA, sincronización por segmento, controles compactos accesibles, quizzes, actividades, insignias y progreso persistente compatible. Las pruebas protegen las reglas de los paneles y el ciclo de vida del audio fuera del cambio visual autorizado.

También se retienen Perseverance, expediciones cinematográficas opcionales e inspección 3D, modelos/animaciones/cámaras de master, exploradores Moon/Mars, mapas científicos, Esri, homepage, contenido educativo en `/discover`, hardware y dashboard. Las rutas canónicas de los ocho documentales no son sustituidas por las expediciones opcionales.

## Validación automatizada

| Comprobación | Resultado |
|---|---|
| `node --test tests/*.test.mjs` | **286 aprobadas, 0 fallos, 0 omitidas, 0 canceladas** |
| `npm.cmd run test:rover` | Aprobado |
| `npx.cmd tsc -b --pretty false` | Aprobado |
| `npm.cmd run build` | Aprobado; advertencia de chunks mayores de 500 kB |
| `git diff --cached --check` y marcadores de conflicto | Sin errores ni marcadores |
| Etapas del índice | Sin conflictos sin resolver |
| Auditoría de historial y árbol | Aprobada dentro del alcance documentado |
| Integridad/rangos HTTP de originales locales | 112/112; 56 hashes contrastados además con inventarios previos |
| Aislamiento de audio externo en preview | Aprobado aun con la variable de desarrollo definida |

El render SSR de las rutas usa los componentes reales, aislando GPU/mapas cuando corresponde. No constituye prueba de render o interacción en un navegador.

## Cobertura real de navegador y aprobación del usuario

**Aprobado por el usuario:** revisión manual en Chrome del nuevo diseño compacto de Apollo 15. No se dispone de un registro de tamaños exactos, capturas, todos los capítulos, todas las interacciones o reproducción audible de esa revisión. No se amplía su alcance por inferencia.

**Ejecutado por el agente durante este cierre:** ninguna prueba de navegador real. La herramienta devolvió `apps: []` y `browsers: []`. Las pruebas automatizadas disponibles son las de Node/SSR/controladores/almacenamiento y transporte HTTP, con la cobertura descrita arriba. Las capturas de otras ramas no se presentan como evidencia de esta integración. Safari y dispositivos físicos no están disponibles.

**Gate obligatorio antes de master:** comprobar las ocho misiones y los cuarenta enlaces de capítulo en 1440×900, 1366×768, 1024×768 y 390×844. Incluir scroll adelante/atrás, inmovilidad de hardware/fondo/paneles/controles, ausencia de solapamientos, evidencia y narración sincronizadas, Play/Pause/cancelación al navegar u ocultar, foco/teclado/touch, quizzes y actividades, progreso tras recarga y dashboard. Revisar navegación home/hardware, Perseverance, inspector 3D, ambos globos, mapas científicos y Esri. Registrar resultados y corregir cualquier fallo antes de marcar el PR listo para merge.

## Seguridad, medios y ciencia

`master-integration-audit.json` audita los 27 commits divergentes y el árbol final. No detecta patrones conocidos de credenciales, rutas personales, medios no reconocidos ni ancestros privados prohibidos. Los 22 MP3 rastreados son los 19 Apollo 15 y tres de homepage ya publicados; no se añade ningún MP3 original privado, PDF o ZIP. Los demás recursos binarios se contrastan con los dos padres publicados. El alcance es patrones conocidos, hashes, rutas y ancestros; no es certificación exhaustiva de credenciales o licencias.

Los 93 MP3 externos siguen fuera de Git/dist. El middleware externo sólo se registra en desarrollo y restringe nombres/rutas reales, loopback, Host/Origin, métodos y rangos. No hay hook de audio externo en preview/producción. Ver `master-integration-media.json` para los resultados HTTP; no implican escucha humana ni reproducción en navegador.

Siguen faltando localmente las grabaciones originales de **Apollo 11 y Apollo 17**. No se sustituyen con voz sintética. Haroon debe resolver autorización de distribución y entrega de las pistas externas/faltantes, revisión auditiva, correcciones de guion y tiempos medidos de captions antes de una entrega narrada completa.

Se conservan las cuestiones científicas/editoriales existentes de Viking 1 (cronología y límites biológicos), Apollo 16 (descripciones técnicas/científicas), Sojourner (geología y operaciones) e Ingenuity (interpretaciones geológicas y contexto de sus afirmaciones). Se mantienen también las retenciones de Apollo 11/17. No se reescriben ni regraban guiones durante el cierre; las decisiones y regrabaciones correspondientes requieren aprobación de Haroon. Detalle en `mission-integration/README.md` y `review-safe/scientific-decisions.md`.

## Revisión y merge final

Publicar únicamente `integration/haroon-master-continuous-storytelling` y mantener el PR contra master en borrador mientras falte el QA obligatorio. La aprobación visual parcial no equivale a autorizar el merge final. No usar force-push ni actualizar main.

Después del QA completo, volver a ejecutar `git fetch origin` y verificar `git merge-base --is-ancestor origin/master HEAD`. Si master avanzó y no es ancestro, integrar sus cambios de forma revisable y repetir las comprobaciones antes del merge final; no sobrescribirlo. Mantener un método de merge que preserve ambas historias. Los resultados finales de publicación y la URL del PR se verifican en GitHub y se comunican por separado.
