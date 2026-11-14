# Revisión privada de código Moon — 11 de noviembre de 2026

Rama: `review/moon-code-review-safe`. Base ya publicada: `e9573dad6fd9e61f221a0bb7e1d07775c2da8974`. Fuente de los cambios revisados: respaldo local completo `4f6d3806e962dfcb3eaed12634d0e9fee9ec974b`, que **no** se incorpora como padre ni se empuja. Esta es una revisión de código y una demo honesta del alcance sin nuevos medios; **no es una release completa ni un export público del hackathon**.

## Qué incluye y qué funciona

- Catálogo actual: Apollo 15 (`lrv-1`), Apollo 17 (`lrv`) y Apollo 11 (`apollo-11-lrrr`, experimento estacionario), cinco capítulos cada una. Mismos IDs de historias, schema de progreso, rewards existentes y recuperación de guardado. El reflector conserva su identidad pasiva.
- Arquitectura narrativa reutilizada, scroll y Previous/Next, layouts responsivos anteriores, fuentes NASA, actividades opcionales y quiz con explicación final/View Results/foco. Corrección del permiso temporal de Complete Story después de TRY AGAIN.
- Apollo 15 y homepage conservan sus **22 MP3 preexistentes** del commit publicado, sin tocar bytes. No se añadieron MP3 a esta rama. El repositorio privado y su historia todavía contienen esos medios heredados: no es una base apta para hacer pública sin otro proceso de exportación.
- Apollo 11/17: textos, evidencia, actividades, quiz y progreso revisables; sus 38 MP3 nuevos están **excluidos**. Hay aviso general y por segmento, sin controles que anuncien reproducción de archivos ausentes. No hay TTS sustituto. Siete retenciones científicas siguen aparte de esta omisión técnica.
- Tres imágenes nuevas Apollo 11 se referencian mediante URLs oficiales NASA, con alt, créditos y fuentes conservados. HEAD devolvió 200/image/jpeg; no se copiaron sus binarios. El fallback conserva lectura/source ante fallo de red. Las diez entradas de imágenes Apollo 15/17 heredadas no se modifican.
- Se preservan homepage aprobada, voz/captions del astronauta, exploradores, coordenadas, mapas, GIS/3D y datos científicos. Los cambios de enlaces/catalogación trasladados corresponden al alcance Moon anterior, no a un nuevo rediseño.

`reviewMediaPolicy.ts` describe omisiones deliberadas de esta rama; no es un detector general de disponibilidad ni una arquitectura de streaming de producción. No cambiarlo para declarar presentes los originales sin proveer una fuente autorizada y probarla. El desarrollo privado completo sigue usando sus archivos sin esta omisión. Esta adaptación de review no debe integrarse como política de la entrega final: usar el desarrollo completo/resolución autorizada y mantener todas las narraciones aprobadas.

## Inventario y seguridad

[transfer-inventory.json](transfer-inventory.json) enumera los 45 archivos de código/tests/metadatos trasladados y los 64 excluidos del diff completo `e9573da..4f6d380`. [changed-files.json](changed-files.json) contiene la lista final del commit de revisión, incluidas adaptaciones y documentación nuevas.

Excluidos: 38 MP3 nuevos, cuatro PDF fuente, tres nuevos JPEG, `.gitattributes` destinado a esos binarios, scripts de inventario que necesitan el paquete privado y reportes locales que podrían confundirse con resultados de esta demo. No se copian ZIP, node_modules, dist, caches, `.env`, credenciales o configuración privada. Se transfieren únicamente metadatos de inventario/provenance y los módulos de texto necesarios para revisar la UI; no originales PDF ni datos de acceso a almacenamiento.

El remoto `ErandKurtaliqi/Auroralys` se verificó **private** con API autenticada y permiso de escritura. Antes del push se audita todo el rango nuevo desde e9573da, sus padres, blobs nuevos, rutas prohibidas y patrones conocidos de secretos. El scan de patrones no equivale a una certificación exhaustiva de seguridad/derechos. Push normal solo a esta rama nueva, sin force, merge o PR automático. No se mueve `main`, integración o el respaldo Moon.

## Pruebas y reproducción

```powershell
npm.cmd ci
node --test tests/*.test.mjs
npx.cmd tsc -b --pretty false
npm.cmd run build
git diff --check
npm.cmd run preview -- --port 5197 --strictPort
```

En HOME se reutilizó la instalación existente mediante junction ignorado de node_modules; no se instalaron paquetes ni cambiaron lock/dependencias. Un clon nuevo necesita `npm ci`. Los tests de snapshot usan únicamente historia **publicada**; no necesitan el objeto privado 032ce7c ni MP3/PDF excluidos. No clonar con profundidad insuficiente para los checkpoints históricos de la suite. La comparación de scripts normaliza solo CRLF/LF; los 19 MP3 Apollo 15 siguen comparándose byte a byte.

Resultado de esta rama: **211 pruebas aprobadas, cero fallos y cero omitidas**, TypeScript y build correctos. El test privado de integridad de los 38 MP3/cuatro PDF se reemplaza en esta rama por una comprobación de exclusión explícita y de los 19 MP3 heredados; no se anuncia validación de medios que no están presentes. Los tests funcionales, audio mocks, store/persistencia y render de 15 capítulos se ejecutan. Se añade cobertura del aviso de review/ausencia de players en los diez capítulos Apollo 11/17 y del límite de historia/medios heredados. El respaldo local completo pasa **209 pruebas** de forma independiente, sin modificar su commit; no sumar ambos conteos.

Advertencias conocidas: chunk Three.js grande; diagnóstico opcional de símbolo `Group` sin usar en `RoverScene.tsx`, protegido. No se modifican internals para limpiar esas advertencias. No hay backend de streaming ni despliegue en esta fase.

## Audio/ciencia: progreso real y pendientes

[held-recordings.json](held-recordings.json) registra los siete archivos, guion esperado, hashes, duración, motivo original y estados de mapping/escucha. Se verificaron los originales en el worktree local sin copiarlos o alterarlos. No se encontró mapping técnico incorrecto demostrado.

[scientific-decisions.md](scientific-decisions.md) aporta fuentes y decisiones: NASA respalda aproximaciones de 14 m, 35,9 km/4 h 26 min de conducción, evento del indicador térmico y 158 m. La atribución individual Apollo 11 tiene fuentes NASA contradictorias; la edad 3,7/3,6 requiere tratamiento editorial coherente. No son siete errores científicos confirmados. No se activó ninguna pista por encontrar una referencia: falta escucha/aceptación de Haroon y cues medidos.

La web final deberá reproducir todas las narraciones aprobadas con objetos privados/API controlada o URLs autorizadas, Range, retry y credenciales de servidor. Audio entregado al navegador puede capturarse; no se promete imposibilidad de descarga. Faltan hosting real, backend/streaming, almacenamiento, derechos y operación. No se despliega un backend ni se deshabilita la narración del desarrollo completo para resolver esta revisión.

## Browser, diseño e integración pendientes

La herramienta CUA informa ausencia de hosts nativo y browser. No se declara escucha humana, screenshots de la app, contraste/overflow, touch, consola o E2E real. HTTP y SSR no prueban esos aspectos. [Checklist corto Chrome](chrome-checklist.md): rutas, expectativas y datos que registrar en cada fallo; seis tamaños, actividades, quiz/badges/recarga y comparación con las referencias de Haroon. Las referencias Apollo 15/Viking 1 son objetivos de composición, no assets NASA. Siguen faltando máquina aislada/superficie aprobadas y validación de proporciones/posiciones reales.

[Plan privado OFFICE](private-office-transfer.md): bundles verificados por SHA256/hashes completos, cuarentena fuera del webroot y refs entrantes nuevas, sin sobrescribir worktrees o integrar antes de tener E/F. Los commits 814d044 y 44e6a65 siguen ausentes. No recrearlos.

Alcance objetivo restante: Apollo 16, Sojourner, Opportunity y Viking 1 desde sus implementaciones existentes; Ingenuity solo cuando llegue el paquete aprobado. Perseverance queda fuera del catálogo de historias, pero aún tiene referencias en atlas/pins/Sources: acordar filtro de publicación y atribución con Erand, sin borrar Jezero ni alterar coordenadas. Su progreso histórico se conserva.

## Prioridades

1. Revisar este código y ejecutar aceptación Chrome/escucha local; registrar decisiones de las siete pistas y captions.
2. Transferir E/F en privado y recibir el paquete Ingenuity. Revisar registros, dependencias, medios y persistencia antes de integrar.
3. Coordinar con Erand filtro Perseverance y contrato GIS/3D. Master remoto avanzó a 095cd1b (cámara/animación); se inspeccionó el objeto sin mover refs locales y no se integra aquí.
4. Confirmar hosting/derechos y preparar streaming aislado; mantener el final narrado como requisito. Resolver licencias/reglas del evento con responsables, preservando fechas/autoría.
5. Aprobar recursos visuales y comparar en navegador antes de más ajustes. No iniciar un nuevo rediseño o convertir esta revisión incompleta de medios en una release final.

P0: ninguno confirmado dentro del ámbito automatizado. P1/bloqueos: aceptación audiovisual, E/F/Ingenuity, filtro GIS, infraestructura/permiso de audio y cumplimiento de entrega. P2: diferencias visuales sin medir, captions pendientes, advertencias de bundle/unused. Una verificación pendiente no se declara defecto funcional demostrado ni prueba aprobada.
