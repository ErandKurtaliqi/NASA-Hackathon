# Correcciones finales del documental — 15 de noviembre de 2026

## Base y alcance

Repositorio: `ErandKurtaliqi/NASA-Hackathon`. Base verificada mediante fetch,
worktree list, status, switch main y pull --ff-only:
`24dcbecb00ae0cd565612d34cec4cfe0b7a9b248`.

El checkout que existía en `Auroralys/Auroralys` apunta a otro repositorio,
`ErandKurtaliqi/Auroralys`, con varios worktrees. Se preservó íntegramente y se
clonó el repositorio solicitado en `Auroralys/NASA-Hackathon`, sobre `main`.
No se crearon ramas ni se modificaron los tres PR anteriores.

## Cambios

- Se quitaron los recuadros Scientific clarification de los artículos. Cada nota
  original, identificada por capítulo y segmento, y su enlace científico siguen
  disponibles en el desplegable Scientific review notes and sources de Mission
  sources. No cambiaron los guiones, los datos científicos ni las retenciones de
  audio por revisión. El aviso de audio ahora señala esa ubicación.
- Apollo 16 tenía dos hijos en un grid pensado para tres: icono, párrafo y botón.
  El párrafo caía en la columna de 22 px destinada al icono. Una clase propia
  corrige ese grid incluso fuera del documental continuo. El quiz general conserva
  su estructura original.
- Dentro del lector, quiz y resultados crecen con su contenido, sin el mínimo
  global de 580 px ni su padding excesivo. El feedback usa flex con ajuste de
  líneas; el botón siguiente puede pasar debajo del párrafo. Las respuestas y
  explicaciones usan 16 px. El lector mantiene el scroll nativo y el foco.
- El título comparte el encabezado en escritorio y ocupa su siguiente fila en
  móvil. Se redujeron padding y márgenes con tamaños responsive; Sources y Sound
  siguen accesibles. En móvil Mission Control sigue disponible mediante el enlace
  al dashboard al final del documental; se evita duplicarlo en el encabezado.
- No cambiaron puntuación, respuestas, persistencia, actividades, botones de
  completar capítulos, timeline ni destinos de retorno al planeta.

Mediciones reales de Apollo 16 en 1600×667:

| Medida | Antes | Después |
| --- | ---: | ---: |
| Altura del lector | 347,94 px | 470,89 px |
| Altura del escenario y panel de evidencia | 373,53 px | 496,48 px |
| Ancho del párrafo de feedback incorrecto | 22 px | 591,13 px |

## Validación automatizada

- `npm ci`: correcto, sin cambios en dependencias.
- `node --test tests/documentary-layout.test.mjs tests/documentary-quiz-results.test.mjs tests/documentary-ux.test.mjs tests/progress-persistence.test.mjs`:
  **39 aprobadas, 0 fallidas**. Las nueve pruebas nuevas verifican la conservación
  de notas y fuentes en todo el catálogo, incluyendo Eagle como cobertura extra.
- `npx tsc --project tsconfig.app.json --noEmit --incremental false`: correcto.
- `npm run build`: correcto. Permanece el aviso de chunks mayores de 500 kB.
- `node --test tests/*.test.mjs`: base **269/342 aprobadas, 73 fallidas**;
  resultado **278/351 aprobadas, las mismas 73 fallidas**. Se compararon los
  nombres de todos los fallos: **0 regresiones nuevas**. Los 58 fallos mencionados
  en la solicitud no coinciden con el baseline de este repositorio y entorno.
  Hay referencias históricas ausentes, contratos de versiones anteriores y
  fixtures heredados incompatibles; se mantuvieron fuera de este alcance.

## QA real en navegador

Chrome headless real contra `vite preview`, compilación de producción, sin mocks
de aplicación, audio, almacenamiento ni red. **40 recorridos aprobados, 0 fallidos**:

| Historias | Resoluciones |
| --- | --- |
| Apollo 11 LRRR, Apollo 15, Apollo 16, Apollo 17 | 1600×667, 1366×768, 1440×900, 1024×768, 390×844 |
| Ingenuity, Sojourner, Opportunity, Viking 1 | Las mismas cinco resoluciones |

Cada recorrido comprueba: ausencia de recuadros en el relato, notas y fuentes
conservadas, cinco botones del timeline, scroll con PageDown y rueda, reproducción
y mute reales, selección de la grabación del quiz, respuestas correctas e
incorrectas, foco y avance con Tab/Enter, Next Question y View Results, resultado
2/3, Complete Story, insignia, persistencia, retry sin borrar el resultado, recarga
y ausencia de overflow horizontal en feedback y resultados. Se comprueban los
destinos `/explore/moon` y `/explore/mars`. No hubo errores JavaScript ni errores de
transporte inesperados; los abortos por cambiar de segmento son normales.

Capturas reales de Apollo 16: feedback correcto e incorrecto en las cinco
resoluciones y narrativa limpia; también se capturó la narrativa de Viking 1.
Artefactos locales en `../qa-artifacts/urgent-final-qa/production-browser/`, con
mediciones y resultado de los 40 casos en `results.json`.

Reproducir el QA: iniciar `npm run preview -- --port 5179 --strictPort` después del
build, disponer de Playwright en el entorno de QA y ejecutar:

```powershell
$env:AURORALYS_PLAYWRIGHT_MODULE = 'C:\ruta\node_modules\playwright\index.mjs'
$env:AURORALYS_CHROME_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$env:AURORALYS_QA_URL = 'http://127.0.0.1:5179'
$env:AURORALYS_QA_OUTPUT = 'C:\ruta\artefactos-qa'
node scripts/verify-documentary-layout.mjs
```

Archivos de implementación: `ContinuousStoryPage.tsx`,
`ContinuousStoryPage.module.css`, `Apollo16Quiz.tsx`, `ApolloQuiz.module.css` y
`DocumentaryAudio.tsx`, todos en `src/components/storytelling/`.
Cobertura y documentación: `tests/documentary-layout.test.mjs`,
`scripts/verify-documentary-layout.mjs` y este informe.

Pendiente heredado: los 73 fallos del baseline y el aviso de tamaño del bundle.
Sin problemas nuevos detectados en las ocho historias solicitadas.
