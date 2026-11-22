Genera UNA vista para mi portfolio: un documento HTML entero con su CSS y su JavaScript dentro.

Te adjunto dos archivos:
- estilo.md: cómo tiene que verse. Síguelo al pie de la letra.
- contenido-[nombre].md: qué tiene que decir. No añadas datos, cifras, nombres ni frases que no estén ahí. Si falta algo, escribe «pendiente» en su sitio y avísame al final.

REGLAS TÉCNICAS
- Devuelve un solo bloque de código que empiece por <!DOCTYPE html> y termine en </html>.
- HTML, CSS y JavaScript sin frameworks. Sin React, Vue, Tailwind ni Bootstrap.
- Se verá dentro de un marco de 1280 x 720. Nada de barras de desplazamiento: usa html { font-size: min(1.25vw, 2.2222vh) } y medidas en rem.
- Deja libre la esquina inferior derecha, 130 x 90 px: ahí van las flechas de la presentación.
- El marco está aislado: no uses localStorage, sessionStorage, cookies, alert, prompt, confirm ni window.open.
- No escribas <? ni ?> en ningún sitio: Apps Script los interpretaría.
- Imágenes: solo con dirección https pública o dibujadas en SVG. Nada de archivos del ordenador.
- Si hace falta una librería, cárgala desde cdn.jsdelivr.net con la versión fijada y dime cuál es.
- No uses las teclas de flecha izquierda y derecha.
- Los datos que cambian de una empresa a otra, juntos al principio del <script>, en variables con nombre claro.
- Respeta prefers-reduced-motion.
- Comentarios breves en español.

ANTES DE RESPONDER, COMPRUEBA
1. Se lee desde el fondo del aula: ningún texto por debajo de 16 px en 1280 x 720, y el texto normal a 20 px o más.
2. Todos los botones funcionan también con el teclado.
3. Cada dato de la vista está en el archivo de contenido.
