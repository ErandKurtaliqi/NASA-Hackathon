# Chrome: aceptación manual pendiente

11 de noviembre de 2026. El inventario de herramientas sigue sin browser/native host; no hay prueba visual, auditiva o E2E real nueva. Las pruebas automatizadas no equivalen a esta lista. Usar un perfil QA separado; no limpiar progreso personal.

## Preparación y alcance

**Revisión de código**, puerto 5197:

```powershell
Set-Location -LiteralPath $env:AURORALYS_REVIEW_WORKTREE
npm.cmd run build
npm.cmd run preview -- --port 5197 --strictPort
```

**Narración original local**, usar otro terminal y puerto 5196:

```powershell
Set-Location -LiteralPath $env:AURORALYS_NARRATED_WORKTREE
npm.cmd run preview -- --port 5196 --strictPort
```

No suponer que están iniciados; si un puerto está ocupado, comprobar qué servidor responde o elegir otro puerto libre. No detener servicios ajenos. Ambos son solo loopback, sin despliegue. El build original ya fue validado en `4f6d380`; no copiar sus MP3/PDF al review.

| Prioridad y pasos | Resultado esperado | Qué registrar si falla |
|---|---|---|
| 1. Abrir `/`, activar sonido por gesto y seleccionar Moon/Mars; pausar sonido y salir | Guía/captions disponibles, sin autoplay inicial ni solapamiento; navegación a ambos explorers; voz termina al salir | Ruta/origen, grabación, control pulsado, error Console/Network, si queda sonido tras salir |
| 2. Abrir `/story/apollo-15-rover/1` en 5197; avanzar por los cinco capítulos con Previous/Next y scroll | Voz existente de la misión, contenido/foto correspondiente, lectura sin sonido, navegación natural; actividades opcionales no bloquean | Capítulo/segmento activo y destino; foco, foto/leyenda, autoavance activado o desactivado |
| 3. Abrir Apollo 11 y Apollo 17 en 5197, cinco capítulos cada una | Aviso «Code review build»; ninguna promesa de reproducir audios excluidos; lectura, quiz/progreso y fuentes funcionan | Si hay `<audio>`/Play engañoso o requests a MP3 ausentes; distinguir de imágenes remotas bloqueadas |
| 4. En 5196 escuchar los 53 audios habilitados de historias/homepage; para las siete retenciones usar revisión editorial de originales, no habilitarlas | Misión, capítulo, script y voz correctos; retenciones visibles/silenciosas en la app, con lectura | Nombre de archivo/SHA, frase audible que difiere, fuente y decisión requerida; no aprobar por HTTP |
| 5. Durante audio: Play, Pause, Resume, Replay, mute/unmute; cambiar capítulo/pregunta/historia; atrás/adelante y ocultar pestaña | Pausa conserva posición; Replay vuelve al inicio; desmutear no auto-reproduce; una sola voz y cleanup; TTS histórico no compite | Pista previa/nueva, posiciones observadas, secuencia exacta y error de Play si existe |
| 6. Comparar texto y evidencia NASA con cada segmento | Captions legibles sin voz; créditos/fuentes accesibles; distinguir fotografía/ilustración y texto de frase temporizada | Discrepancia concreta y fuente; no inventar tiempos ni editar audio durante QA |
| 7. Apollo 15 capítulo 4, actividad martillo/pluma; Apollo 11 capítulo 1, actividad de reflexión | Predicción/feedback/retry opcionales; reflector estacionario, no medición real; ningún badge o bloqueo por actividad | Opción, feedback, foco y si cambió progreso inesperadamente |
| 8. Quiz de cada misión: aciertos/errores, tres explicaciones, View Results, TRY AGAIN y Complete Story | Última explicación visible; puntaje honesto; intento nuevo incompleto no permite finalizar; capítulo ya completado conserva estado/badge único | Respuestas, score, estado de botón, foco y snapshot antes/después sin compartir datos personales |
| 9. Recargar Dashboard y retomar historias; probar rechazo de storage en perfil QA y Retry saving | Progreso persistido se conserva; fallo distingue sesión/guardado; retry recupera snapshot sin repetir quiz ni duplicar badges | Error y pasos exactos; no usar clear/removeItem ni modificar schema |
| 10. Tab/Shift-Tab/Escape, zoom 200%, reduced motion; probar 360×800, 390×844, 430×932, 768×1024, 1366×768 y 1920×1080 | Foco visible, navegación/controles táctiles utilizables, sin overflow ni texto/fotos solapados; fuentes completas | Captura con ruta/viewport/estado; ancho del documento, elemento que desborda y controles inaccesibles |

Para Console/Network, filtrar errores y requests fallidos, anotar status/MIME y reproducir con caché/red normal y lenta. No compartir cookies, URLs firmadas o credenciales. La evidencia remota Apollo 11 tiene fallback si no carga; un bloqueo de red no es evidencia de mala atribución.

Comparar el primer viewport Apollo 15 con la referencia de Haroon de 1364×768: máquina izquierda, título/relato central, evidencia derecha, tipografía/espaciado, fondo/horizonte, sonido y línea de capítulos. La app conserva cinco capítulos; la referencia tiene cuatro. Siguen pendientes recortes 2D aprobados y superficie/horizonte; no se afirma equivalencia. No copiar las capturas como evidencia NASA. Registrar cambios GIS/3D para Erand, no alterar cámara, pines o coordenadas durante QA.

Los siete archivos y checkpoints de escucha están en [scientific-decisions.md](scientific-decisions.md) y [held-recordings.json](held-recordings.json). No hay aprobación humana registrada todavía.
