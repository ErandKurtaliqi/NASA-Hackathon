# Frente C: actividad independiente de predicción y evidencia

Estado: implementada para revisión en el worktree aislado
`activity (relativo al repositorio)`, HEAD desacoplado en
`8120d9e`. No se ha insertado en ninguna historia ni modificado una ruta compartida.

## Resultado demostrable

La actividad invita a predecir qué sucede al soltar un martillo y una pluma desde
la misma altura en la Luna. Elegir una respuesta no revela su corrección. El envío
explícito muestra feedback educativo para la opción elegida, una observación
histórica precisa, el fotograma NASA y enlaces al vídeo y a las fuentes.

La opción de reintentar reinicia únicamente el estado local de la actividad. No hay
conexión con el store, navegación, audio, 3D, insignias ni completado de capítulos.
No existe un requisito obligatorio nuevo para continuar una misión.

`EvidencePredictionActivity` recibe un manifiesto tipado `EvidencePrediction`.
El caso de Apollo 15 vive en un módulo separado y reutiliza el recurso ya verificado
`apollo15StoryMedia.hammer` y el componente `StoryMedia`, sin editar ninguno.
`reviewPrediction` rechaza elecciones vacías o desconocidas.

## Demo y futura integración

Desde este worktree:

```powershell
node --input-type=module -e "import {createServer} from 'vite'; const s=await createServer({cacheDir:'dist/.vite-workstream-c',server:{host:'127.0.0.1',port:5183,strictPort:true}}); await s.listen(); s.printUrls();"
```

Abrir `http://127.0.0.1:5183/activity-preview.html`. Es una página independiente
para revisión; no una ruta nueva del producto ni una lectura del progreso existente.
El build normal de la aplicación no publica esta entrada adicional.
La caché de desarrollo queda en este worktree, dentro de `dist`; no se escribe en
el `node_modules` compartido mediante junction. No usar el comando dev por defecto
en este entorno aislado, porque Vite puede escribir allí su caché de dependencias.

Se verificó además el build independiente con Vite, sin editar su configuración:

```powershell
node --input-type=module -e "import {build} from 'vite'; import {resolve} from 'node:path'; await build({build:{outDir:'dist-activity-preview',rollupOptions:{input:resolve('activity-preview.html')}}});"
```

Su salida temporal `dist-activity-preview` se retiró después de verificar el build;
se puede recrear con el comando. El paquete de la demo tiene 151,55 kB de JavaScript
(49,36 kB gzip) y no carga Three.js. Reutiliza el CSS general existente; su tamaño
podría reducirse al integrar la actividad en la arquitectura final.

Tras aprobar el frente C, el propietario de la historia puede importar:

```tsx
import EvidencePredictionActivity from './activities/EvidencePredictionActivity'
import { apollo15HammerFeatherPrediction } from '../../features/storytelling/activities/apollo15Prediction'

<EvidencePredictionActivity activity={apollo15HammerFeatherPrediction} />
```

No hay callback que marque progreso. Cualquier futura telemetría o vínculo de
completado requiere una decisión explícita; no es necesario para usar la actividad.
El cambio de `activity.id` inicia un intento nuevo, por lo que varias actividades
pueden reutilizar el componente sin compartir elecciones. Los grupos radio tienen
identificadores React independientes incluso si dos instancias usan el mismo caso.

## Evidencia científica y límites

Verificación de fuentes: 8 de noviembre de 2026.

- [NASA Science: The Apollo 15 Hammer-Feather Drop](https://science.nasa.gov/resource/the-apollo-15-hammer-feather-drop/):
  explicación, vídeo original y observación de la caída durante la última EVA.
- [NASA: Apollo 15 on the Moon at Hadley-Apennine](https://www.nasa.gov/history/50-years-ago-apollo-15-on-the-moon-at-hadley-apennine/):
  fecha del 2 de agosto de 1971 e identificación del fotograma S71-43788.

Se conserva la precisión del informe: los objetos llegaron juntos dentro de la
exactitud de la liberación y observación, sin afirmar una medición de simultaneidad
perfecta. El feedback distingue gravedad y resistencia del aire. No se presenta la
actividad como una reparación, un logro nuevo del rover ni una simulación histórica.

Recurso reutilizado: `public/images/apollo15-story/hammer.jpg`, S71-43788,
**fotograma real de televisión**, crédito NASA. No es una fotografía independiente,
una captura del alunizaje ni una reconstrucción generada. El texto deja claro que
un fotograma aislado no establece tiempos de caída; el vídeo y la explicación NASA
permiten examinar ese resultado. Se conservan alt text, crédito, URL original y
proveniencia del manifiesto existente. No se descargaron ni modificaron imágenes.

Aplican las [NASA Images and Media Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/):
uso educativo/informativo factual, crédito NASA, sin sugerir respaldo institucional,
con las restricciones de derechos de terceros y personas identificables pertinentes.

## Accesibilidad y presentación

- Radios nativos con leyenda, etiquetas amplias, una selección por grupo y envío
  de formulario. Se preservan Tab, flechas y activación nativas del navegador.
- La explicación recibe foco al enviar. El reintento devuelve el foco a la pregunta.
  No hay región viva duplicada ni robo de foco inicial, también bajo StrictMode.
- Controles con mínimo 44 px, opciones de al menos 52 px, foco visible, ajuste de
  texto y disposición móvil. Créditos y descripciones permanecen visibles en móvil.
- Sin animación ni reproducción automática; `StoryMedia` se usa con movimiento
  desactivado. Error de imagen conserva la fuente y el botón de reintento.

## Archivos nuevos exactos

1. `activity-preview.html`
2. `src/components/storytelling/activities/ActivityPreview.tsx`
3. `src/components/storytelling/activities/ActivityPreview.module.css`
4. `src/components/storytelling/activities/EvidencePredictionActivity.tsx`
5. `src/components/storytelling/activities/EvidencePredictionActivity.module.css`
6. `src/features/storytelling/activities/evidencePrediction.ts`
7. `src/features/storytelling/activities/apollo15Prediction.ts`
8. `tests/workstream-c-activity.test.mjs`
9. `docs/workstream-c-activity.md`

No hay modificaciones de archivos existentes. La normalización de fin de línea del
guión original efectuada durante el aislamiento conserva el mismo hash Git del HEAD.

## Validación ejecutada

- `node --test tests/workstream-c-activity.test.mjs`: **8/8**.
- `node --test tests/*.test.mjs`: **173/173**, baseline 165 más 8 nuevas.
- TypeScript `tsc -p tsconfig.app.json --noEmit --pretty false`: correcto.
- `npm.cmd run build`: correcto; permanece la advertencia ya existente del chunk
  Three.js de 823,49 kB, ajeno a esta actividad.
- Build Vite independiente del HTML de preview: correcto, 34 módulos.
- `git diff --check`: correcto. Todos los cambios funcionales son archivos nuevos.
- Smoke HTTP con `createServer`, puerto 5183 y caché local del worktree:
  `/activity-preview.html` devolvió **200** (`text/html`, 685 bytes),
  `/src/components/storytelling/activities/ActivityPreview.tsx` devolvió **200**
  (`text/javascript`, 5.351 bytes) y `/images/apollo15-story/hammer.jpg` devolvió
  **200** (`image/jpeg`, 65.905 bytes). El servidor se cerró en `finally` y el
  proceso terminó con código 0 (`SERVER_CLOSED`).

El primer intento del smoke HTTP sirvió los tres recursos con 200, pero el cierre
inmediato canceló la preoptimización de Vite y terminó con código 1. La repetición
esperó el procesamiento de solicitudes y el escaneo de dependencias antes del
cierre, y terminó correctamente. No se alteró código fuente para esa comprobación.
Servir HTML/TSX/imagen por HTTP no demuestra ejecución del DOM ni revisión visual.

Las pruebas ejercitan selección, rechazo de elecciones inválidas, tres resultados,
feedback previo/posterior al envío, reintento, foco, StrictMode, dos grupos radio,
cambio de actividad, fallo/reintento de imagen y ausencia de escrituras de progreso.
Los fixtures no sustituyen pruebas reales de teclado, lector de pantalla o diseño.

Pendiente de navegador: revisar 360×800, 390×844, 439×591, tablet y escritorio;
Tab/flechas/Space/Enter; zoom 200 %; foco al enviar y reintentar; lector de pantalla;
imagen bloqueada y movimiento reducido. También queda la revisión pedagógica final
de Haroon y elegir en qué capítulo insertar la actividad, sin volverla obligatoria.
