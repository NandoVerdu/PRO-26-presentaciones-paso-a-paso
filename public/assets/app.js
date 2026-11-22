(function () {
  // Copiar al portapapeles
  function copiar(texto) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(texto);
    return new Promise(function (ok, ko) {
      var area = document.createElement('textarea');
      area.value = texto;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      var bien = document.execCommand('copy');
      area.remove();
      (bien ? ok : ko)();
    });
  }

  function botonCopiar(boton, texto) {
    var original = boton.textContent;
    boton.addEventListener('click', function () {
      copiar(texto()).then(function () {
        boton.textContent = '✔ Copiado';
        boton.classList.add('done');
      }, function () {
        boton.textContent = 'Selecciona y copia con Ctrl+C';
      });
      setTimeout(function () {
        boton.textContent = original;
        boton.classList.remove('done');
      }, 2000);
    });
  }

  // 1. Código: se lee de la carpeta descargas, así está escrito una sola vez
  document.querySelectorAll('figure[data-archivo]').forEach(function (fig) {
    var ruta = fig.getAttribute('data-archivo');
    var nombre = fig.getAttribute('data-nombre') || ruta.split('/').pop();
    fig.className = 'code';
    fig.innerHTML = '<figcaption><span class="file"></span><button class="copy" type="button">Copiar</button></figcaption><pre tabindex="0"><code>Cargando…</code></pre>';
    fig.querySelector('.file').textContent = nombre;
    var codigo = fig.querySelector('code');
    fetch(ruta).then(function (r) {
      if (!r.ok) throw new Error();
      return r.text();
    }).then(function (t) {
      codigo.textContent = t.trim();
      codigo.className = 'language-' + (/\.gs$/.test(ruta) ? 'javascript' : /\.html$/.test(ruta) ? 'xml' : 'plaintext');
      if (window.hljs) window.hljs.highlightElement(codigo);
      botonCopiar(fig.querySelector('button'), function () { return t.trim(); });
    }).catch(function () { codigo.textContent = 'No se ha podido leer el archivo. Recarga la página.'; });
  });

  // 2. Fila de la pestaña Slides, lista para pegar:  data-fila="archivo|tipo|orden|descripción"
  document.querySelectorAll('figure[data-fila]').forEach(function (fig) {
    var d = fig.getAttribute('data-fila').split('|');
    fig.className = 'code data';
    fig.innerHTML = '<figcaption><span class="file">Pestaña «Slides» · pegar en la primera fila vacía</span><button class="copy" type="button">Copiar fila</button></figcaption>' +
      '<div class="table-wrap"><table><thead><tr><th>archivo</th><th>tipo</th><th>activo</th><th>orden</th><th>descripción</th></tr></thead><tbody><tr></tr></tbody></table></div>';
    var fila = fig.querySelector('tbody tr');
    [d[0], d[1], '☑', d[2], d[3]].forEach(function (x) {
      var td = document.createElement('td');
      td.textContent = x;
      fila.appendChild(td);
    });
    botonCopiar(fig.querySelector('button'), function () { return [d[0], d[1], 'TRUE', d[2], d[3]].join('\t'); });
  });

  // 3. Casillas de progreso (se recuerdan en este navegador)
  var clave = 'pi-progreso:' + location.pathname.replace('index.html', '');
  var guardado = {};
  try { guardado = JSON.parse(localStorage.getItem(clave) || '{}'); } catch (e) { guardado = {}; }
  var casillas = document.querySelectorAll('input[data-step]');
  var barra = document.querySelector('.progress span');
  var texto = document.querySelector('.progress-text');

  function actualizar() {
    var hechas = 0;
    casillas.forEach(function (c) {
      if (c.checked) hechas++;
      var enlace = document.querySelector('.toc a[href="#' + c.getAttribute('data-step') + '"]');
      if (enlace) enlace.classList.toggle('done', c.checked);
    });
    if (barra) barra.style.width = (casillas.length ? hechas / casillas.length * 100 : 0) + '%';
    if (texto) texto.textContent = hechas + ' de ' + casillas.length + ' pasos';
  }
  casillas.forEach(function (c) {
    c.checked = !!guardado[c.getAttribute('data-step')];
    c.addEventListener('change', function () {
      guardado[c.getAttribute('data-step')] = c.checked;
      try { localStorage.setItem(clave, JSON.stringify(guardado)); } catch (e) { /* sin almacenamiento */ }
      actualizar();
    });
  });
  actualizar();

  // 4. Índice lateral: marca el paso visible
  var enlaces = document.querySelectorAll('.toc a');
  if ('IntersectionObserver' in window && enlaces.length) {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        enlaces.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    document.querySelectorAll('section.step[id]').forEach(function (s) { obs.observe(s); });
  }
})();
