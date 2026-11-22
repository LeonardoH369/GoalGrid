# Sprint 2 · Fase 4

## Sprint Goal y comparación
Permitir dar seguimiento a las 25 metas anuales y personalizar el tablero con menos pasos, aplicando el feedback resumido en Evidencia 1, sin perder la información del Sprint 1.

Sprint 1 se enfocó en crear, editar, guardar y recuperar el tablero. Sprint 2 agrega seguimiento de cumplimiento, claridad del periodo y controles de personalización. Mantiene HTML/CSS/JS y localStorage: no hay necesidad funcional de cambiar de plataforma.

## Fuente y alcance
Fuente aportada: Software Ev1.pdf, página 2. Contiene un resumen de feedback, no registros individuales ni métricas. Prioriza completado, claridad anual, colores más simples, plantillas base y restablecer una celda. El usuario confirmó incluir imágenes (#18), que ya estaba en To Do del Project Board. No se inventan citas ni una nueva validación con testers.

## Historias y criterios de aceptación
| Issue | Entregable y criterio |
|---|---|
| [#9](https://github.com/LeonardoH369/GoalGrid/issues/9) | Completar y deshacer mediante doble clic o botón accesible; guardar y recuperar estado. |
| [#10](https://github.com/LeonardoH369/GoalGrid/issues/10) | Mostrar estrella y texto Completada solo en metas completadas. |
| [#11](https://github.com/LeonardoH369/GoalGrid/issues/11) | Contar completadas sobre las 25 posiciones; cada una equivale al 4%, de 0 a 100%. |
| [#12](https://github.com/LeonardoH369/GoalGrid/issues/12) | Mostrar periodo de enero a diciembre y días restantes; conservar el año del tablero al cambiar el calendario. |
| [#7](https://github.com/LeonardoH369/GoalGrid/issues/7) | Ofrecer colores de un clic y mantener selector y validación HEX. |
| [#18](https://github.com/LeonardoH369/GoalGrid/issues/18) | Añadir, cambiar y quitar JPG/PNG/WebP en metas completadas; reducir localmente y recuperar imagen al recargar. |
| [#19](https://github.com/LeonardoH369/GoalGrid/issues/19) | Aplicar 3 plantillas sin borrar contenido; restablecer una sola celda con confirmación y cancelación. |

## Trazabilidad del feedback
- Marcar cumplimiento → botón, doble clic y estrella (#9, #10); porcentaje complementario (#11).
- Claridad de metas anuales → periodo explícito y tiempo restante (#12).
- Simplificar colores → opciones predefinidas de un clic (#7).
- Evitar personalizar cada celda → plantillas Original, Bosque y Tierra (#19).
- Regresar una celda a su estado inicial → restablecimiento confirmado de texto, color, estado e imagen (#19).
- Imágenes → prioridad del Board confirmada por el usuario (#18), no atribuida al PDF.

## Pruebas ejecutadas
Ejecutadas en Chrome headless sobre servidor local. `tests/acceptance.cjs`: 10 comprobaciones de regresión; `tests/sprint2.cjs`: 10 comprobaciones del incremento, todas aprobadas. Los archivos JSON incluyen fecha real y URL del entorno. Evidencia local: `.local/evidence/test-results.json` y `.local/phase4/evidence/sprint2-results.json`.

Se probó: 25 celdas, edición segura, HEX válido e inválido, guardado/recuperación, datos dañados sin borrado, error de almacenamiento, teclado, móvil de 390px; completar/deshacer, estrella, progreso 0/4/100%, imagen inválida/válida y persistencia, plantillas conservando datos, cancelar/confirmar restablecimiento, aislamiento entre celdas, reutilización tras reset, migración v1→v2 y simulación 31/dic→1/ene.

Las metas e imágenes de las capturas son datos de demostración; la imagen de prueba es una captura de una celda. No constituyen feedback ni metas reales de los participantes. Aún no se realizó una nueva ronda con testers.

## Sprint Review técnica
El incremento permite crear y seguir las metas, personalizar en bloque y conservar los datos e imágenes en el mismo navegador. Los criterios anteriores cuentan con comprobaciones ejecutables. La aceptación de usuarios finales sigue pendiente: no se afirma una reunión o aprobación de testers que no ocurrió. El cierre de Issues y publicación se verifican en GitHub después de integrar el PR.

## Retrospectiva técnica
- Funcionó: convertir el resumen de feedback en criterios verificables y preservar el guardado anterior durante la migración.
- Dificultad observada: localStorage tiene cuota limitada; las fotos se reducen a 320px y se valida un máximo de 60.000 caracteres por imagen. El guardado informa errores sin declarar éxito.
- Mejora acordada para la implementación: restablecer con confirmación y usar botones accesibles además del doble clic.
- Acciones propuestas para el siguiente sprint: nueva prueba con usuarios sobre completado/colores; exportación o respaldo del tablero; retomar impresión (#15 y #16).

## Limitaciones
No hay sincronización entre dispositivos, cuentas ni respaldo remoto. Las fotos se convierten a JPEG y pierden transparencia. Borrar datos del navegador elimina el tablero. Los tableros v1 no almacenaban año: al migrarlos se les asigna el año actual, sin alterar el guardado hasta pulsar Guardar. No se crean tableros anuales adicionales en este sprint.
