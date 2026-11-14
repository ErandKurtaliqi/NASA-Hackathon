# Integración de master y documentales continuos — 12 de noviembre de 2026

> Registro del checkpoint inicial, anterior al ajuste compacto y a la autorización de cierre. Sus menciones a commit/publicación pendientes y su procedimiento de la sección 18 son históricas. El estado de validación, la aprobación limitada a Apollo 15 y los gates vigentes antes de master están en [master-integration-finalization.md](master-integration-finalization.md). La instrucción posterior autoriza completar el merge local y publicar sólo la rama de integración, manteniendo pendiente el QA obligatorio antes del merge final a master.

**Estado: fusión resuelta y preparada localmente; validación automatizada aprobada; QA real de navegador pendiente. No se ha creado el commit de integración, publicado una rama, abierto un PR ni actualizado master/main.**

El encargo exige verificar la integración antes del commit. El acceso disponible no permite realizar el QA real de navegador. Por ello se conserva la fusión en curso, revisable y sin conflictos, en vez de presentar una integración como completamente validada.

1. **Master original y actualizado.** `origin/master`: `3b45e8f2324e8af85e55d81a1020306e95e1706e`. Un segundo `git fetch origin` confirmó el mismo SHA. Repositorio privado `ErandKurtaliqi/Auroralys`, con permiso de push en la conexión GitHub. La API de la rama devolvió `protected: false`; consultar rulesets devolvió HTTP 403 por las capacidades del plan. Se deben volver a comprobar las reglas antes de la publicación final.

2. **Continuous-storytelling original.** `origin/review/continuous-storytelling-office`: `ddb458657e1fa5fca0bd117f265e95b444090712`, también sin cambios en el segundo fetch. Base común: `a0048e918a7a6549600f5159ab6c8b584d0f59d2`. Divergencia: 5 commits exclusivos de master y 22 de storytelling.

3. **Rama y worktree nuevos.** `integration/haroon-master-continuous-storytelling`, en `C:\xampp\htdocs\Auroralys\workstreams\20261112-master-integration`. Ambos nombres estaban libres. El worktree comenzó limpio y exactamente en el SHA de master indicado arriba. No se cambió de rama, reseteó ni editó ningún worktree existente. Los diez worktrees anteriores conservan cero cambios rastreados; los directorios no rastreados del checkout original ya existían. La rama nueva no tiene upstream hasta su futura publicación explícita.

4. **Estrategia real.** Se ejecutó `git merge --no-ff --no-commit origin/review/continuous-storytelling-office` desde la rama nueva basada en master. Es una fusión Git real pendiente de commit, con master como primer padre y storytelling en `MERGE_HEAD`. No se usaron reset, force-push, selección global ours/theirs ni cherry-picks de ramas privadas. No se sustituyó el árbol de master por el de la otra rama.

5. **Conflictos y resoluciones.**

   | Archivo | Resolución |
   |---|---|
   | `src/App.tsx` | Rutas documentales continuas; dispatcher exclusivo para Perseverance; expediciones cinematográficas opcionales bajo `/inspection/:storyId/:chapter?`; hardware de ambas ramas; controles de movimiento y menú accesible. |
   | `src/components/MachineStoryPage.tsx` | Lectores, actividades y quizzes revisados; celebración de master; entrada explícita y validada al lector Perseverance; callback opcional de resultado de quiz. |
   | `src/components/MissionDashboard.tsx` | Ocho documentales y cuarenta capítulos; recorridos cinematográficos e insignias de master; tarjeta separada con progreso y reanudación de Perseverance. |
   | `src/components/home/PlanetGateway.tsx` | Movimiento y poster de master junto con intención explícita de audio, soporte táctil y callbacks de la otra rama. |
   | `src/pages/HomePage.tsx` | Narración y controles de pausa existentes, respetando también la preferencia calm-motion de master. |
   | `src/store.ts` | Acciones `roverJourneys` de master junto con almacenamiento fiable, errores/reintentos y progreso documental. |

   También se corrigieron conflictos semánticos sin marcadores Git: master reasignaba Apollo 15 usando Apollo 17 como base y duplicaba `lrv-1`. Los datos cinematográficos de master ahora tienen un catálogo independiente; los documentales conservan sus datos aprobados. La entrada de hardware LRV-1 se unifica sin perder la información de estacionamiento de master. Esri se incorpora al explorador actual, con contenedor adaptable y activación táctil.

6. **Cambios de master preservados.** Se mantienen los cinco commits: integración NASA/Esri (`4f0a44f`), fondos y límites de zoom (`4d31563`), documentales de rover (`b0f4089`), animación/cámaras planetarias (`095cd1b`) y acabado metálico (`3b45e8f`). Las regresiones comparan directamente con master los componentes de globo, mapa, efectos, rover, LRV, escena cinematográfica, desafíos, narración y animaciones. Se mantienen los modelos NASA, las fuentes añadidas y todos los marcadores de master. Su conservación de código está verificada; su render GPU real queda pendiente de navegador.

7. **Ocho misiones y cuarenta capítulos.** Las ocho rutas canónicas y los cuarenta enlaces `/1`…`/5` renderizan sus documentos completos en pruebas SSR con los componentes reales. Se conservan los cinco capítulos lógicos, 126 segmentos narrativos y quizzes/actividades originales.

   | Misión | ID de ruta | MP3 originales disponibles localmente |
   |---|---|---|
   | Apollo 11 | `apollo-11-reflector` | 0; interfaz de 18 pistas conservada |
   | Apollo 15 | `apollo-15-rover` | 19; ya presentes en el historial publicado |
   | Apollo 16 | `apollo-16-rover` | 18; externos a Git |
   | Apollo 17 | `apollo-17-rover` | 0; interfaz de 20 pistas conservada |
   | Sojourner | `sojourner` | 19; externos a Git |
   | Opportunity | `opportunity` | 19; externos a Git |
   | Viking 1 | `viking-1` | 18; externos a Git |
   | Ingenuity | `ingenuity` | 19; externos a Git |

8. **Contrato documental de Haroon.** Las rutas `/story/<id>` y sus enlaces antiguos usan una sola página por misión. No cambian de ruta al desplazarse, ni `?view=reader` puede sustituir un documental aprobado por la implementación cinematográfica. Se conserva hardware/fondo estáticos, lectura central, evidencia a la derecha, un solo narrador, activación explícita de sonido, pausa persistente y actividades/quiz dentro del documento. El layout y el controlador de audio permanecen idénticos al checkpoint publicado. El shell documental añade únicamente la captura/visualización del resultado guardado del quiz. La estabilidad visual real al hacer scroll sigue pendiente de navegador.

9. **Rover/3D y Perseverance.** Perseverance sigue accesible en `/story/follow-perseverance/1`…`/5`, en Hardware Lab, explorador Mars y dashboard. Las expediciones opcionales `/inspection/apollo-15-rover/1` y `/inspection/apollo-17-rover/1` conservan la experiencia de master y su inspector 3D. Los globos Moon/Mars, mapas científicos, zoom, modelos y Esri permanecen accesibles. Los IDs de prototipo y rutas desconocidas se rechazan. SSR verifica estas entradas; interacción de cámara, arrastre, GPU e iframe remoto requieren QA real.

10. **Progreso y compatibilidad.** La clave sigue siendo `beyond-earth-progress`, versión `0`. La hidratación no reescribe guardados anteriores. Se preservan `completedChapters`, `storyProgress`, `roverJourneys`, ubicaciones, instrumentos, insignias, finalización y campos adicionales existentes, incluidos metadatos de quiz. Se añade `storyProgress[id].quizResult` con respuestas, puntuación y total al pulsar explícitamente Complete Story. Ver resultados o comenzar un reintento no borra ni guarda logros. Hay regresiones de guardados antiguos, master, documentales y combinados, recarga, idempotencia y errores/reintentos de escritura. No se migró ni reinició el almacenamiento personal del usuario.

11. **Pruebas automatizadas y build.**

   | Comprobación ejecutada | Resultado |
   |---|---|
   | `node --test tests/*.test.mjs` | **286 aprobadas, 0 fallos, 0 omitidas, 0 canceladas** |
   | `npm.cmd run test:rover` | PASS: requisitos de finalización, duplicados, quiz, persistencia, guardados anteriores y reset |
   | TypeScript, `tsc -b` | Aprobado; también se ejecuta en el build |
   | `npm.cmd run build` | Aprobado; advertencia de chunks mayores de 500 kB |
   | Integridad/rangos HTTP de audio | 112/112 pistas, rangos y bytes correctos; 56 hashes contrastados además con inventarios previos |
   | Aislamiento de originales en preview | Aprobado incluso definiendo la variable de desarrollo |
   | Diff, marcadores y resolución del índice | Sin errores de whitespace ni marcadores; sin entradas de conflicto pendientes |

   Se conservaron las 269 pruebas heredadas y se añadieron 17 regresiones. Los fixtures se amplían para las APIs añadidas por master y el campo aditivo de almacenamiento. Las comparaciones históricas usan hashes exactos de las modificaciones de integración revisadas; una modificación no reconocida falla. Las pruebas funcionales de rutas, datos, quizzes y almacenamiento usan el código integrado sin esa normalización. No se eliminó ni omitió ninguna prueba.

12. **QA real de navegador: NO EJECUTADO en esta integración.** La revisión automática rechazó iniciar Chrome por terminal con depuración remota; el motivo devuelto fue “blocked by policy”. La herramienta de navegador devolvió un inventario vacío y el intento de navegador integrado devolvió “Browser is not available: iab”. No se intentó eludir el rechazo. No hay nuevas capturas ni mediciones de escritorio/tablet/móvil, reproducción audible, scroll, gestos, foco, quizzes interactivos, GPU o Esri de esta integración. Los reportes de navegador de ramas anteriores son antecedentes y no validan esta fusión. Safari y dispositivos físicos tampoco están disponibles.

   Antes de crear el commit, ejecutar el QA real en escritorio, tablet y móvil: ocho documentales, cuarenta enlaces antiguos, scroll adelante/atrás sin mover hardware/fondo/controles, sincronía de evidencia y narración, cancelación al navegar/ocultar, pausa, quizzes y actividades, guardado/recarga/dashboard, navegación desde home/hardware, Perseverance y expediciones opcionales, inspector 3D, globos Moon/Mars, mapa científico y Esri. `scripts/story-continuous-qa.mjs` conserva la automatización disponible para las historias cuando haya un Chrome de QA autorizado. No confundir SSR o transporte HTTP con esas comprobaciones.

13. **Auditoría privada y seguridad.** `master-integration-audit.json` registra la inspección de los 27 commits entrantes y del árbol preparado. Cero coincidencias de patrones conocidos de secretos, cero rutas personales detectadas, cero medios no reconocidos, cero PDF/ZIP rastreados y cero ancestros privados prohibidos importados. Los 22 MP3 rastreados son los 19 Apollo 15 y los 3 de homepage ya publicados. El poster/modelo Mars procede de master; las dem?s im?genes entrantes ya forman parte del storytelling publicado. Sus hashes se contrastan con ambos padres. No se copiaron los 93 MP3 externos ni paquetes PDF/ZIP. Es una auditoría de patrones, hashes y ancestros, no una certificación exhaustiva de credenciales o licencias.

   El middleware acepta sólo nombres de pista definidos, direcciones loopback, Host/Origin locales, GET/HEAD y rutas reales contenidas en el directorio configurado; mantiene rangos, no-store y nosniff. Se retiró su hook `configurePreviewServer`: los originales externos sólo se sirven en desarrollo. El build no incluye el directorio externo. Ver también `master-integration-media.json` y los scripts reproducibles de auditoría.

14. **Pendientes científicos/editoriales.** Se conservan guiones y notas; no se regrabó ni sintetizó voz. Continúan las decisiones descritas en `mission-integration/README.md` y `review-safe/scientific-decisions.md`: Viking 1 (1981/1982 y límites de las interpretaciones biológicas), Apollo 16 (descripciones técnicas, cámara UV separada, metáforas y cifras por revisar), Sojourner (geología, módem/suelo blanco, operaciones y sols frente a días terrestres), e Ingenuity (crestas/fluidos no equivalen a detección de agua subterránea; contexto del accidente y escalas temporales). Haroon debe aprobar cualquier corrección del guion y la regrabación correspondiente antes de habilitar una entrega narrada. Siguen las tres retenciones de Apollo 11 y cuatro de Apollo 17; no se presentan todas como errores científicos confirmados.

15. **Audio y entrega restante.** Hay 112 originales locales en seis misiones; Apollo 11 y Apollo 17 siguen sin originales locales disponibles. Las rutas, mappings y controles se conservan, sin reemplazos TTS. Para producción faltan autorización verificable de distribución, entrega autorizada de las 93 pistas externas, obtención autorizada de Apollo 11/17, revisión editorial/auditiva y tiempos reales de captions. El hosting debe servir las rutas `/audio/<mission>/chapter-N/N.mp3` con MIME y rangos correctos, o un CDN autorizado con configuración adecuada. Un fallback SPA que responde HTML para un MP3 faltante no es entrega de audio. Los errores de reproducción mantienen disponible la lectura.

16. **Nuevo commit SHA.** **Pendiente; no existe todavía.** `HEAD` sigue siendo el master original y `MERGE_HEAD` el storytelling original. Aún no puede afirmarse que ambos sean ancestros de HEAD: esa propiedad se obtiene al crear el commit de fusión después del QA real. No se etiqueta esta rama como aprobada para publicación.

17. **Estado Git.** Fusión local en curso, seis conflictos resueltos y cambios preparados en el índice. El worktree de integración conserva cambios intencionalmente porque el commit está condicionado al QA pendiente; no está limpio. Los otros worktrees no fueron modificados. No hay push, PR, merge remoto, force-push ni actualización de main/master.

18. **Procedimiento final seguro, condicionado al QA.** Ejecutar desde este worktree nuevo. Primero completar y registrar el QA real. Si master o storytelling han cambiado, integrarlos mediante merge y repetir pruebas/QA antes de continuar. No ejecutar la publicación mientras siga pendiente ese gate.

```powershell
Set-Location 'C:\xampp\htdocs\Auroralys\workstreams\20261112-master-integration'
git fetch origin
git rev-parse origin/master origin/review/continuous-storytelling-office
# Deben seguir coincidiendo con los dos SHA documentados arriba.
# Si cambiaron, detener este procedimiento y actualizar/revalidar la fusión.
node --test tests/*.test.mjs
npm.cmd run test:rover
npx.cmd tsc -b --pretty false
npm.cmd run build
git diff --cached --check
git diff --cached --stat
# Sólo DESPUÉS del QA real aprobado y de revisar el índice:
git commit -m "Merge continuous mission documentaries with latest master"
git merge-base --is-ancestor origin/master HEAD
if ($LASTEXITCODE -ne 0) { throw 'Falta el master actualizado en la integración' }
git merge-base --is-ancestor origin/review/continuous-storytelling-office HEAD
if ($LASTEXITCODE -ne 0) { throw 'Falta el storytelling actualizado en la integración' }
git status --short
git rev-parse HEAD
# El worktree debe quedar limpio y ambos ancestry checks deben aprobar.
git push -u origin integration/haroon-master-continuous-storytelling
```

La revisión recomendada tiene **base `master`** y head `integration/haroon-master-continuous-storytelling`. Abrirla manualmente después de publicar; no se abrió automáticamente. Usar un merge que preserve ambas historias, evitando squash/rebase si se exige la propiedad de ancestros. El master original podrá avanzar por fast-forward al commit de integración si no cambia entretanto; actualmente no hay todavía ese commit.

Como alternativa final a la revisión por PR, únicamente si las reglas vigentes permiten push directo y la integración ya está aprobada:

```powershell
git fetch origin
git merge-base --is-ancestor origin/master HEAD
if ($LASTEXITCODE -ne 0) { throw 'Master cambió: integrar y repetir validación antes de publicar' }
git push origin HEAD:refs/heads/master
```

Ese push es normal, sin force; un avance divergente concurrente de master debe ser rechazado. No hacer checkout ni reset de un worktree protegido existente, ni actualizar main. No ejecutar automáticamente ninguno de estos pasos finales.
