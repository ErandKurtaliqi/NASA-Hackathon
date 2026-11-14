# Siete retenciones: evidencia y decisiones — 11 de noviembre de 2026

Este documento actualiza la clasificación anterior; **no** modifica guiones, grabaciones o permisos de reproducción. No se encontró una asociación técnica errónea en las siete pistas: archivo, capítulo/segmento y SHA256 coinciden con el inventario local. La identidad audible sigue pendiente de escucha. Los textos esperados completos, hashes, duración estructural y lectura actual están en [held-recordings.json](held-recordings.json), tomados de `4f6d380`, no de una nueva transcripción.

En el respaldo local los siete segmentos permanecen silenciosos al seleccionarlos, con lectura aclaratoria. En esta revisión GitHub se omiten **todas** las 38 grabaciones nuevas Apollo 11/17: disponibilidad y retención científica son estados distintos. No hay TTS de reemplazo. Apollo 15 y homepage conservan sus grabaciones ya publicadas.

## Fuentes primarias consultadas

- **A — [NASA/ALSJ, Apollo 11 Moonwalk Pictures](https://www.nasa.gov/wp-content/uploads/static/history/alsj/a11/a11_eva_thumbs.html)**: sección de despliegue junto a AS11-40-5942–5945; atribuye despliegue a Aldrin y sitúa el reflector aproximadamente a 14 m. La página tiene atribución de autor propia; aquí se cita y parafrasea, sin copiar sus thumbnails o texto completo.
- **B — [NASA History, One Small Step, One Giant Leap](https://www.nasa.gov/history/50-years-ago-one-small-step-one-giant-leap/)**: el relato de EASEP atribuye el transporte a Aldrin y el reflector a Armstrong. La atribución individual **no coincide** con A; no se elige una versión silenciosamente.
- **C — [NASA/NSSDCA, The Apollo Lunar Roving Vehicle](https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_lrv.html)**: Apollo 17, aproximadamente 35,9 km y 4 h 26 min de **conducción**; no duración total de las tres EVAs.
- **D — [NASA, Apollo 17 Mission Report, sección 9.1, página impresa 9-1](https://ntrs.nasa.gov/api/citations/19730015117/downloads/19730015117.pdf)**: indicación térmica de batería 2 fuera de escala al comienzo de EVA 3; termistor probablemente cortocircuitado. Describe seguimiento con batería 1 y tendencias previas de batería 2. Se verificó el pasaje indexado por búsqueda de NASA; la apertura completa del PDF fue bloqueada por tamaño de 14,8 MB. No se afirma inspección visual de esa página. El antiguo enlace ALSJ devolvió 404.
- **E — [NASA Science, History of Lunar Exploration](https://science.nasa.gov/solar-system/moon/history-of-lunar-exploration/)**: sección Apollo 17, material volcánico naranja de unos 3.600 millones de años. No se usa este resumen para declarar imposible cualquier otra edad publicada; se recomienda coherencia con la fuente elegida.
- **F — [NASA History, Apollo 17 Lands at Taurus-Littrow](https://www.nasa.gov/history/50-years-ago-apollo-17-lands-at-taurus-littrow/)**: párrafo del sitio VIP, estacionamiento final aproximadamente a 158 m del LM para televisar el ascenso.

## Revisión por archivo

Todos los paths son relativos al worktree **privado local** `20261110-moon-storytelling-qa`; no existen en esta rama de revisión.

| Misión / archivo | Afirmación del guion esperado | Clasificación actual y evidencia | Recomendación / decisión sobre audio |
|---|---|---|---|
| Apollo 11 `public/audio/apollo-11/chapter-2/3.mp3` | Buzz transportó el reflector; Neil lo desplegó; fecha 21 julio 1969 | Editorial/científica: A y B discrepan sobre quién lo colocó. La fecha 21 puede corresponder a UTC; no es por sí sola un error | Mantener atribución colectiva de la lectura hasta conciliar transcripción/cronología primaria. Si se cambia el nombre en el relato aprobado, la grabación requerirá decisión editorial; conservar original |
| Apollo 11 `public/audio/apollo-11/chapter-2/4.mp3` | Neil lo colocó aproximadamente a 14 m, niveló y orientó | Distancia aproximada respaldada por A; nombre sigue sujeto al conflicto A/B. La retención anterior no prueba que 14 m sea falso | No retirar la cifra por falta de evidencia: ya hay referencia. Resolver el nombre antes de aprobar audio; alternativa colectiva mantiene lectura actual |
| Apollo 11 `public/audio/apollo-11/chapter-4/4.mp3` | Permanece aproximadamente a 14 m de Eagle | La cifra sí tiene respaldo en A. Se retira la clasificación de «sin fuente encontrada»; quedan aprobación editorial y escucha | No se identifica una edición científica necesaria para esa aproximación. Haroon puede aprobar el original después de confirmar el audio completo |
| Apollo 17 `public/audio/apollo-17/chapter-2/4.mp3` | 35,9 km y unas 4 h 26 min de exploración | C respalda números, pero el tiempo es conducción. La diferencia 35,7/35,9 dentro del paquete exige reconciliar referencias/convenciones, no declarar 35,9 erróneo | Usar la fuente C y aclarar «tiempo de conducción» en contexto. Haroon decide si el wording audible requiere revisión; no modificar clip ni activar automáticamente |
| Apollo 17 `public/audio/apollo-17/chapter-3/2.mp3` | Falló indicador de temperatura de batería 2 en la tercera EVA; se estimó con batería 1 y lecturas previas | D respalda evento y método. La batería no dejó de suministrar energía por este fallo de indicación; causa es probable, no certeza | No se encontró un defecto de mapping ni necesidad demostrada de editar el relato simplificado. Escuchar que dice indicador, no batería fallida, y comprobar contexto con página 9-1 antes de aprobar |
| Apollo 17 `public/audio/apollo-17/chapter-3/3.mp3` | Vidrio volcánico naranja de unos 3.700 millones de años | Diferencia editorial/científica con E y la lectura actual (~3.600 millones); no resuelta por una prueba de integridad | Aprobar una formulación y fuente consistentes. Si se elige 3.600 millones, no presentar captions distintos como transcripción exacta del clip 3.700; mantener retención hasta decisión editorial. No generar/regrabar aquí |
| Apollo 17 `public/audio/apollo-17/chapter-4/1.mp3` | Cernan estacionó aproximadamente a 158 m de Challenger | F respalda esa aproximación y finalidad de TV. La nota interna que pedía omitir distancias no invalida esta fuente NASA | No se identifica edición científica necesaria para la distancia. Haroon puede aprobar el original tras escuchar ubicación, cámara y despedida completas |

**Conclusión técnica:** cero correcciones de mapping necesarias demostradas; cero MP3 cambiados; cero cues inventados; cero pistas activadas. Las siete retenciones continúan hasta aceptación humana. Varias afirmaciones quedaron corroboradas, por lo que no deben seguir describiéndose como siete errores científicos confirmados.

## Decisiones concretas para Haroon

1. Apollo 11 2/3 y 2/4: resolver atribución individual con cronología primaria o aprobar relato colectivo; conservar ambos originales y no sustituirlos en esta fase.
2. Apollo 11 4/4: aceptar aproximación respaldada de 14 m, sujeto a escucha y derechos.
3. Apollo 17 2/4: elegir referencia/convención de distancia y distinguir conducción de EVA; valorar el contexto del audio original.
4. Apollo 17 3/2: aceptar evento del indicador respaldado por 9-1, verificando que el clip no afirma pérdida de batería.
5. Apollo 17 3/3: elegir edad/fuente y tratamiento del clip; lectura y voz deben ser honestas respecto a discrepancias.
6. Apollo 17 4/1: aceptar aproximación de 158 m respaldada por NASA, sujeto a escucha completa.

## Escucha humana: checkpoints sin tiempos inventados

Abrir la pista original por su filename y SHA en el worktree local, escucharla completa y registrar reviewer/fecha/resultado. No usar esta rama sin archivos para dar aprobación auditiva.

- 11 2/3 (~17,40 s estructurales): nombres Buzz/Neil, verbo transportar/desplegar, fecha/timezone, ausencia de cortes o otra misión.
- 11 2/4 (~14,99 s): nombre de quien coloca, «about 14 meters», nivelación y orientación. Comparar con texto fuente y decidir atribución.
- 11 4/4 (~19,33 s): «about 14 meters», reflexión pasiva, no transmisor activo. Aprobar si guion/voz completos coinciden.
- 17 2/4 (~17,79 s): 35,9 km, cuatro horas veintiséis, conducción frente a todo el trabajo de superficie. Comprobar unidades y contexto.
- 17 3/2 (~11,47 s): segunda batería/indicador, EVA tercera, estimación con la primera. No equiparar sensor y suministro de energía.
- 17 3/3 (~14,68 s): Shorty, Schmitt, vidrio volcánico y cifra audible exacta; no ocultar discrepancia con captions.
- 17 4/1 (~18,05 s): Cernan, Challenger, «about 158 meters», cámara hacia el ascenso. Confirmar que el archivo pertenece al capítulo correcto.

Las duraciones son suma de frames MPEG del inventario, no límites de cues. Tras aprobar texto y escuchar, medir start/end reales de frases y asociarlos al mismo hash del archivo. Ningún tiempo de caption se deduce de estas duraciones.
