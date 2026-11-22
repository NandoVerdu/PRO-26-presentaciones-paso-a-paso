# Proyecto Intermodular, paso a paso

Guía web para que el alumnado de 2 GES monte su portfolio con Google Sheets, Apps Script y reveal.js, y lo vaya llenando con cada actividad.

Es una web estática: no tiene base de datos, inicio de sesión ni paso de compilación. Lo que hay en `public/` es lo que se publica.

## Qué hay en cada carpeta

| Carpeta o archivo | Contenido |
|---|---|
| `public/contenido/indice.json` | Los separadores y las páginas, en orden |
| `public/contenido/…` | El texto de cada página |
| `public/descargas/apps-script` | `Code.gs` y la plantilla `index` que copia el alumnado |
| `public/descargas/slides` | Slides de ejemplo |
| `public/descargas/vistas` | Vistas de ejemplo |
| `public/descargas/especificaciones` | Archivos de estilo, de contenido y textos para la IA |
| `public/assets` | Aspecto y funcionamiento de la guía |
| `reserva/` | Ficha completa (cliente, oferta, proceso, números y ODS) para actividades posteriores. No se publica en la web |
| `plantilla-actividad.html` | Página en blanco para una actividad nueva |
| `ver-en-local.bat` | Abre la guía en este ordenador |
| `publicar.bat` | Sube los cambios a GitHub |

El código se escribe una sola vez, en `descargas/`. Las páginas lo leen de ahí.

## Abrir una actividad nueva

1. Copia `plantilla-actividad.html` en `public/contenido/actividades/` con otro nombre, por ejemplo `canvas.html`, y escribe el texto.
2. Si lleva archivo de contenido o vista de ejemplo, guárdalos en `public/descargas/`.
3. En `public/contenido/indice.json`, busca la actividad y cambia `"estado": "pendiente"` por `"archivo": "actividades/canvas.html"`.
4. Compruébalo con `ver-en-local.bat` y publica con `publicar.bat`.

Las actividades con `"estado": "pendiente"` ya salen en la guía, con sus fechas y el aviso de que están cerradas. Las fechas se cambian en `indice.json`.

## Columnas de la pestaña Slides

`archivo | tipo | activo | orden | descripción`, con `tipo` igual a `slide` o `vista`.
