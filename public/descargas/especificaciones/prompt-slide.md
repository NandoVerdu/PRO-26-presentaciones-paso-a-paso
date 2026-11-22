Genera UN slide para reveal.js 5.1.0.

REGLAS
- Devuelve solo un bloque <section class="sNN">...</section>. Su <style> y, si hace falta, su <script> van dentro. Sin <html>, <head> ni <body>, y sin cargar reveal.js.
- Todo el CSS empieza por la clase del slide (.sNN). Ninguna regla suelta para h1, p, body o :root.
- Sin frameworks. Si necesitas una librería, cárgala desde cdn.jsdelivr.net con la versión fijada y dime cuál es.
- Imágenes: solo con dirección https pública o como data URI.
- No uses localStorage, alert ni window.open. No escribas <? ni ?>.
- En el JavaScript no pongas direcciones https dentro de comillas invertidas.
- Tiene que verse bien en 1280 x 720 y leerse desde el fondo del aula.
- Usa class="fragment" cuando convenga enseñar el contenido por partes.
- Una sola idea y seis líneas de texto como máximo.
- No inventes datos. Si falta alguno, escribe «pendiente».
- Comentarios breves en español.

DATOS DEL SLIDE
- Clase: s[NN]
- Idea que quiero contar, en una frase:
- Texto y datos:
- Forma: texto / imagen / tabla / gráfico / vídeo
- Qué aparece por partes:
