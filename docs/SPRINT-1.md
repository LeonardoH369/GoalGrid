# Sprint 1 · Fase 3

Fecha de ejecución: 25 de octubre de 2026 (America/Mexico_City). No se atribuye duración histórica a este trabajo ni se reconstruyen ceremonias no realizadas.

## Sprint Goal

Permitir que una persona cree un tablero anual de 25 metas, personalice su frase, textos y colores, lo guarde y lo recupere en el mismo navegador.

## Historias y criterios de aceptación verificados

| Issue | Criterio | Resultado |
|---|---|---|
| #2 | HTML, CSS y JS separados; carga sin compilación | Implementado |
| #3 | 25 celdas; cinco columnas en escritorio | Aprobado |
| #4 | Año del dispositivo visible en encabezado | Aprobado |
| #5 | Frase editable de hasta 140 caracteres | Aprobado |
| #6 | Edición independiente de metas de hasta 180 caracteres; contenido tratado como texto | Aprobado |
| #7 | Selector de color por celda, sin afectar otras metas | Aprobado |
| #8 | Código HEX de seis dígitos; rechazo de valores inválidos | Aprobado |
| #13 | Guardar frase, textos y colores mediante localStorage; avisar si falla | Aprobado |
| #14 | Recuperar automáticamente al recargar; detectar JSON dañado sin borrarlo | Aprobado |

Las 10 comprobaciones de `tests/acceptance.cjs` pasaron en Chromium local y contra la URL pública. Incluyen vista móvil a 390 px sin desbordamiento horizontal y uso de teclado del diálogo. Esto no constituye una auditoría completa de accesibilidad ni pruebas en todos los navegadores.

## Trazabilidad y publicación

- Rama: `sprint-1`.
- Implementación: `b104684`; pruebas: `b3b8a78`.
- PR: https://github.com/LeonardoH369/GoalGrid/pull/17
- Project existente: https://github.com/users/LeonardoH369/projects/5 (privado; requiere acceso).
- Aplicación: https://leonardoh369.github.io/GoalGrid/
- GitHub Pages publica la raíz de `sprint-1` con HTTPS.

## Sprint Review técnica

Se comprobó el recorrido abrir, escribir metas 1 y 25, editar frase, aplicar HEX, guardar y recargar. Los textos y colores se recuperaron. Un HEX inválido mantuvo abierto el diálogo; un fallo de almacenamiento mostró error. Los datos de las capturas son de demostración y no representan metas del usuario.

El incremento cumple los criterios técnicos anteriores. La validación con usuarios, aceptación del responsable y retroalimentación del docente quedan pendientes; no se reportan reuniones ni comentarios que no ocurrieron. El estado de GitHub indica integración técnica, no aceptación académica.

## Retrospectiva técnica

Funcionó: delimitar nueve historias y verificar la persistencia con recarga real. Separar HTML/CSS/JS permitió publicar sin servidor de aplicación.

Dificultades observadas: la conexión GitHub permitió leer pero rechazó crear el PR (403); se completó mediante la sesión del navegador. La vista local necesitó permisos de ejecución ampliados. Los PDF originales no se recuperaron de la conversación enlazada.

Acciones para el siguiente sprint: cotejar los dos PDF antes de entregar; solicitar una prueba de uso real y registrar sus observaciones; desarrollar #9–#12 (completado, sello, progreso y tiempo restante); después #15–#16 (impresión y formato carta). No asignar estimaciones retrospectivas ni inventar velocidad del equipo.

## Límites

Los datos permanecen en este navegador y origen. No hay sincronización, cuentas, respaldo remoto ni guardado automático. El año sigue el reloj del dispositivo; cambiar de año no borra las metas. Borrar los datos del navegador elimina lo guardado. El cierre con cambios pendientes muestra la advertencia que permita el navegador.
