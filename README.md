# Proyecto Intermodular · Portfolio paso a paso

Guía para que el alumnado de 2 GES monte su portfolio con Google Sheets, Apps Script y reveal.js. Web estática, sin compilación: lo que hay en `public/` es lo que se publica en Vercel.

| Carpeta | Contenido |
|---|---|
| `public/index.html` | Portada con las tarjetas |
| `public/montar`, `ficha`, `organigrama`, `slide` | Una página por tarea |
| `public/descargas` | El código y las plantillas. Las páginas los leen de ahí |
| `public/assets` | Aspecto y funcionamiento (mismo estilo que la guía de GPD) |
| `reserva` | Ficha completa para actividades posteriores. No se publica |

## Añadir una actividad

1. Copia la carpeta `public/organigrama` con otro nombre y cambia los textos.
2. Guarda su plantilla de contenido y su vista de ejemplo en `public/descargas`.
3. Añade su tarjeta en `public/index.html`.
4. Compruébalo con `ver-en-local.bat` y súbelo con `publicar.bat`.

Dentro de una página:

- `<figure data-archivo="../descargas/…"></figure>` enseña un archivo con botón de copiar.
- `<figure data-fila="archivo|vista|orden|descripción"></figure>` enseña una fila de la pestaña Slides.
- `<iframe class="demo" …>` enseña una vista de ejemplo.
