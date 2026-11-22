# GoalGrid

**Aplicación pública:** https://leonardoh369.github.io/GoalGrid/

Tablero de 25 metas con año actual, frase y textos editables, colores y HEX, guardado manual y recuperación automática en el mismo navegador. Pulsa **Guardar tablero** para conservar cambios. En móvil se muestran dos columnas para facilitar la edición.

Para desarrollo, sirve esta carpeta con un servidor estático (por ejemplo `python -m http.server 4174 --bind 127.0.0.1`) y abre `http://127.0.0.1:4174`. La aplicación no tiene dependencias de ejecución ni requiere compilación.

Para pruebas: instala Playwright, ejecuta `npx playwright install chromium` y luego `node tests/acceptance.cjs` y `node tests/sprint2.cjs`. `BASE_URL` permite probar otra dirección. Las capturas y resultados se escriben en `.local/evidence/` y no se incluyen automáticamente en Git.

Alcance, criterios, Review y retrospectiva: [Sprint 1](docs/SPRINT-1.md). Incremento y criterios: [Sprint 2 / Fase 4](docs/SPRINT-2.md). Sprint 2 añade completado, estrella, progreso, periodo anual, colores rápidos, plantillas, restablecimiento por celda e imágenes locales. Pendiente: impresión. El almacenamiento es local a este navegador y dispositivo.

> Aplicación web para crear, visualizar y gamificar metas anuales mediante un tablero visual personalizable.

## Descripción del proyecto

**GoalGrid** es una aplicación web gratuita que permite a las personas escribir, visualizar y gamificar sus metas anuales de una forma sencilla y atractiva.

El objetivo principal es simplificar la creación de un tablero de metas, proporcionando una plantilla visual lista para utilizar en lugar de obligar al usuario a diseñar el tablero desde cero.

### Flujo principal

```text
Entrar
  ↓
Escribir metas
  ↓
Personalizar visualmente
  ↓
Guardar
  ↓
Imprimir
