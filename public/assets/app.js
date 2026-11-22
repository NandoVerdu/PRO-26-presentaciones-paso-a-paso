/* Motor de la guía: lee contenido/indice.json y enseña la página que pide la dirección (#/separador/pagina) */
(function () {
  'use strict';

  var REVEAL = 'https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/';
  var CLAVE = 'pi-guia-comprobado';
  var hoja = document.getElementById('hoja');
  var barra = document.getElementById('separadores');
  var indice = null, turno = 0, primera = true;

  /* ---------- Utilidades ---------- */
  function el(etiqueta, atributos, hijos) {
    var n = document.createElement(etiqueta);
    Object.keys(atributos || {}).forEach(function (k) { n.setAttribute(k, atributos[k]); });
    [].concat(hijos || []).forEach(function (h) { n.append(h); });
    return n;
  }
  function escapar(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function leer(ruta) {
    return fetch(ruta, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(ruta);
      return r.text();
    });
  }
  function guardado() { try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { return {}; } }
  function guardar(d) { try { localStorage.setItem(CLAVE, JSON.stringify(d)); } catch (e) { /* sin memoria: la guía funciona igual */ } }
  function hecha(id) { var d = guardado()[id]; return Boolean(d && d.fecha); }
  function ruta(s, p) { return '#/' + s.id + '/' + p.id; }
  function todas() {
    var lista = [];
    indice.separadores.forEach(function (s) { s.paginas.forEach(function (p) { lista.push({ s: s, p: p }); }); });
    return lista;
  }

  /* ---------- Navegación ---------- */
  function pintarSeparadores(actual) {
    barra.replaceChildren.apply(barra, indice.separadores.map(function (s) {
      var conPasos = s.paginas.filter(function (p) { return p.secuencia || (p.formato && p.archivo); });
      var hechas = conPasos.filter(function (p) { return hecha(s.id + '/' + p.id); }).length;
      var a = el('a', { href: ruta(s, s.paginas[0]), 'class': 'c-' + s.color }, [s.titulo]);
      if (conPasos.length) a.append(el('small', { 'aria-label': hechas + ' de ' + conPasos.length + ' comprobadas' }, hechas + '/' + conPasos.length));
      if (s === actual) a.setAttribute('aria-current', 'true');
      return a;
    }));
  }

  function pintarIndice(s, p) {
    var ol = el('ol');
    s.paginas.forEach(function (q) {
      var a = el('a', { href: ruta(s, q) }, q.titulo);
      if (q === p) a.setAttribute('aria-current', 'page');
      if (hecha(s.id + '/' + q.id)) a.className = 'hecho';
      ol.append(el('li', {}, a));
    });
    return el('nav', { 'class': 'indice c-' + s.color, 'aria-label': 'Páginas de ' + s.titulo }, ol);
  }

  function pintarPie(pos) {
    var lista = todas(), pie = el('nav', { 'class': 'paso-pie', 'aria-label': 'Anterior y siguiente' });
    if (lista[pos - 1]) pie.append(el('a', { href: ruta(lista[pos - 1].s, lista[pos - 1].p) }, 'Anterior: ' + lista[pos - 1].p.titulo));
    if (lista[pos + 1]) pie.append(el('a', { href: ruta(lista[pos + 1].s, lista[pos + 1].p) }, 'Siguiente: ' + lista[pos + 1].p.titulo));
    return pie;
  }

  function abrir() {
    if (location.hash === '#hoja') { hoja.focus(); return; }
    var trozos = location.hash.replace(/^#\//, '').split('/');
    var lista = todas();
    var pos = lista.findIndex(function (x) { return x.s.id === trozos[0] && x.p.id === trozos[1]; });
    if (pos < 0) pos = 0;
    var s = lista[pos].s, p = lista[pos].p, mio = ++turno;

    var carga = p.archivo ? leer('contenido/' + p.archivo) : Promise.resolve(paginaPendiente(p));
    carga.then(function (html) {
      if (mio !== turno) return;
      document.title = p.titulo + ' · Proyecto Intermodular';
      hoja.innerHTML = '';
      var cuerpo = el('article');
      cuerpo.innerHTML = html;
      hoja.append(pintarIndice(s, p), cuerpo, pintarPie(pos));
      pintarSeparadores(s);
      mejorar(cuerpo, s.id + '/' + p.id, s);
      window.scrollTo(0, 0);
      if (!primera) hoja.focus({ preventScroll: true });
      primera = false;
    }).catch(function (e) {
      if (mio !== turno) return;
      hoja.replaceChildren(pintarIndice(s, p), el('h1', {}, 'No se ha podido abrir esta página'),
        el('p', {}, 'Falta el archivo ' + (e.message || p.archivo) + '. Recarga la página y, si sigue igual, avisa al profesorado.'), pintarPie(pos));
      pintarSeparadores(s);
    });
  }

  function paginaPendiente(p) {
    return '<h1>' + escapar(p.titulo) + '</h1><p class="entrada">' + escapar(p.resumen || '') + '</p>' +
      '<p class="ojo">Todavía no está abierta. Las instrucciones aparecerán aquí cuando empiece.</p>' +
      '<table><tbody><tr><th scope="row">Fechas previstas</th><td>' + escapar(p.fechas || 'por fijar') + '. La fecha que vale es la del portal.</td></tr>' +
      '<tr><th scope="row">En tu portfolio será</th><td>' + (p.pagina === 'todas' ? 'todas las páginas que ya tienes' : p.formato === 'vista' ? 'una vista, <code>' + escapar(p.pagina) + '</code>' : 'uno o más slides') + '</td></tr></tbody></table>';
  }

  /* ---------- Mejoras de cada página ---------- */
  function mejorar(raiz, id, s) {
    raiz.querySelectorAll('[data-codigo]').forEach(ponerCodigo);
    raiz.querySelectorAll('script[data-nombre]').forEach(function (pre) {
      var t = pre.textContent.replace(/^\n/, '').replace(/\s+$/, '\n');
      pre.replaceWith(papel(pre.dataset.nombre, t, null));
    });
    raiz.querySelectorAll('.comprobar').forEach(function (c) { ponerComprobar(c, id, s); });
    raiz.querySelectorAll('[data-demo]').forEach(ponerDemo);
    raiz.querySelectorAll('[data-probador]').forEach(ponerProbador);
    raiz.querySelectorAll('[data-simulador]').forEach(ponerSimulador);
    raiz.querySelectorAll('[data-ruta]').forEach(ponerRuta);
    raiz.querySelectorAll('[data-fila]').forEach(ponerFila);
  }

  /* Código sobre papel continuo */
  function colorear(t) {
    return escapar(t).replace(/(&lt;!--[\s\S]*?--&gt;|\/\*[\s\S]*?\*\/|^[ \t]*\/\/.*$)/gm, '<span class="com">$1</span>');
  }
  function botonCopiar(texto) {
    var b = el('button', { type: 'button' }, 'Copiar');
    b.addEventListener('click', function () {
      copiar(texto).then(function () { b.textContent = 'Copiado'; }, function () { b.textContent = 'Selecciona y copia a mano'; });
      setTimeout(function () { b.textContent = 'Copiar'; }, 2200);
    });
    return b;
  }
  function copiar(texto) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(texto);
    return new Promise(function (bien, mal) {
      var t = el('textarea', { style: 'position:fixed;top:0;left:-999px' });
      t.value = texto; document.body.append(t); t.select();
      var ok = document.execCommand('copy'); t.remove();
      (ok ? bien : mal)();
    });
  }
  function papel(nombre, texto, archivo) {
    var cab = el('header', {}, [el('b', {}, nombre), botonCopiar(texto)]);
    if (archivo) cab.append(el('a', { 'class': 'boton', href: archivo, download: nombre }, 'Descargar'));
    var pre = el('pre');
    pre.innerHTML = colorear(texto);
    var caja = el('figure', { 'class': 'papel' }, [cab, el('div', { 'class': 'tira', tabindex: '0', role: 'region', 'aria-label': 'Código de ' + nombre }, pre)]);
    if (texto.split('\n').length > 19) {
      var v = el('button', { type: 'button', 'aria-pressed': 'false' }, 'Ver entero');
      v.addEventListener('click', function () {
        var e = caja.classList.toggle('entero');
        v.textContent = e ? 'Plegar' : 'Ver entero';
      });
      v.removeAttribute('aria-pressed');
      cab.append(v);
    }
    return caja;
  }
  function ponerCodigo(n) {
    var archivo = n.dataset.codigo, nombre = n.dataset.nombre || archivo.split('/').pop();
    leer(archivo).then(function (t) { n.replaceWith(papel(nombre, t, archivo)); }, function () { n.textContent = 'No se ha podido leer ' + archivo; });
  }

  /* Fila lista para pegar en la pestaña Slides */
  function ponerFila(tabla) {
    var celdas = Array.from(tabla.querySelectorAll('tbody tr')).map(function (f) {
      return Array.from(f.cells).map(function (c) { return c.dataset.valor || c.textContent.trim(); }).join('\t');
    }).join('\n');
    var b = botonCopiar(celdas);
    tabla.closest('.tabla') ? tabla.closest('.tabla').after(b) : tabla.after(b);
  }

  /* Lista de comprobación con sello */
  function ponerComprobar(caja, id, s) {
    var lis = Array.from(caja.querySelectorAll('li'));
    var estado = guardado()[id] || { marcas: [] };
    lis.forEach(function (li, i) {
      var c = el('input', { type: 'checkbox' }), t = el('span');
      t.append.apply(t, Array.from(li.childNodes));
      c.checked = Boolean(estado.marcas[i]);
      li.append(el('label', {}, [c, t]));
      c.addEventListener('change', function () { revisar(true); });
    });
    function revisar(nuevo) {
      var marcas = lis.map(function (li) { return li.querySelector('input').checked; });
      var completo = marcas.every(Boolean), d = guardado();
      var fecha = completo ? (d[id] && d[id].fecha) || new Date().toISOString().slice(0, 10) : '';
      if (nuevo) { d[id] = { marcas: marcas, fecha: fecha }; guardar(d); }
      var sello = caja.querySelector('.sello');
      if (completo && !sello) {
        var f = new Date((fecha || new Date().toISOString().slice(0, 10)) + 'T12:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
        caja.append(el('div', { 'class': 'sello' + (nuevo ? ' nuevo' : ''), role: 'status' }, ['Comprobado', el('small', {}, f)]));
      }
      if (!completo && sello) sello.remove();
      if (nuevo) pintarSeparadores(s);
    }
    revisar(false);
  }

  /* Vista incrustada */
  function ponerDemo(n) {
    var src = n.dataset.demo;
    leer(src).then(function (html) {
      var f = el('iframe', { sandbox: 'allow-scripts', title: n.dataset.titulo || 'Vista de ejemplo' });
      f.srcdoc = html;
      var otra = el('button', { type: 'button' }, 'Empezar de cero');
      otra.addEventListener('click', function () { f.srcdoc = ''; f.srcdoc = html; });
      n.classList.add('demo');
      n.replaceChildren(f, el('footer', {}, [otra, el('a', { 'class': 'boton', href: src, target: '_blank', rel: 'noopener' }, 'Abrir a toda la ventana')]));
    });
  }

  /* ---------- Probador ---------- */
  function paginaReveal(seccion) {
    return '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><link rel="stylesheet" href="' + REVEAL + 'reveal.css"><link rel="stylesheet" href="' + REVEAL + 'theme/white.css">' +
      '<style>.reveal h1,.reveal h2,.reveal h3{text-transform:none}.reveal section img{max-height:60vh}</style></head><body><div class="reveal"><div class="slides">' + seccion +
      '</div></div><script src="' + REVEAL + 'reveal.js"><\/script><script>Reveal.initialize({width:1280,height:720,margin:.02,scrollActivationWidth:0,hash:false,history:false,controls:true,progress:false});<\/script></body></html>';
  }

  function sinEnvoltorio(css) {
    return css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@(-webkit-)?keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '').replace(/@(media|supports)[^{]*\{/g, '').replace(/@import[^;]*;/g, '');
  }
  function reglasSueltas(html, clase) {
    var css = (html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || []).map(function (b) { return b.replace(/<\/?style[^>]*>/gi, ''); }).join('\n');
    var malas = [];
    (sinEnvoltorio(css).match(/[^{}]+(?=\{)/g) || []).forEach(function (sel) {
      sel.split(',').forEach(function (x) {
        x = x.trim();
        if (x && x.indexOf('@') !== 0 && !new RegExp('\\.' + clase + '(?![\\w-])').test(x)) malas.push(x);
      });
    });
    return malas;
  }

  /* Devuelve la lista de fallos, o una lista vacía si se puede pegar en Apps Script */
  function examinar(tipo, html) {
    var f = [], t = html.trim(), entero = /<!doctype html|<html[\s>]/i.test(t);
    if (!t) return ['No hay código.'];
    if (tipo === 'slide') {
      if (entero) f.push('Es un HTML entero. Un slide es solo un <section>. Cambia a «vista» o vuelve a generarlo.');
      var doc = new DOMParser().parseFromString(t, 'text/html');
      var secciones = Array.from(doc.body.children).filter(function (x) { return x.tagName === 'SECTION'; });
      if (secciones.length !== 1) f.push('Tiene que haber un solo <section> principal. Hay ' + secciones.length + '.');
      var fuera = entero ? [] : Array.from(doc.head.children).concat(Array.from(doc.body.children)).filter(function (x) { return x.tagName !== 'SECTION'; });
      if (fuera.length) f.push('Hay código fuera del <section>: <' + fuera[0].tagName.toLowerCase() + '>. Mételo dentro.');
      var clase = secciones[0] && secciones[0].classList[0];
      if (secciones[0] && !clase) f.push('Al <section> le falta la clase, por ejemplo class="s04".');
      if (clase) reglasSueltas(t, clase).slice(0, 4).forEach(function (x) { f.push('Esta regla afecta a otros slides: «' + x + '». Escríbela así: «.' + clase + ' ' + x + '».'); });
      if (/`[^`]*https?:\/\//.test(t)) f.push('Hay una dirección https entre comillas invertidas. Usa comillas simples.');
    } else {
      if (!entero) f.push('Una vista empieza por <!DOCTYPE html>. Si solo tienes un <section>, es un slide.');
      if (entero && !/<\/html>\s*$/i.test(t)) f.push('Falta </html> al final. Quizá la IA cortó la respuesta: pídele que siga.');
      if (/(@keyframes|transition\s*:)/.test(t) && !/prefers-reduced-motion/.test(t)) f.push('Tiene animaciones y no respeta prefers-reduced-motion. Pídelo a la IA.');
    }
    if (/```/.test(t)) f.push('Sobran las tres comillas invertidas del principio o del final.');
    if (/<\?|\?>/.test(t)) f.push('Aparece <? o ?>. Apps Script lo interpretaría como código suyo.');
    if (/localStorage|sessionStorage|document\.cookie/.test(t)) f.push('Usa memoria del navegador (localStorage, sessionStorage o cookies). Dentro del marco no funciona.');
    if (/\b(alert|prompt|confirm)\s*\(|window\.open/.test(t)) f.push('Abre ventanas emergentes (alert, prompt, confirm o window.open). Muestra el mensaje dentro de la página.');
    var local = t.match(/\b(?:src|href)\s*=\s*["'](?!https?:|data:|#|mailto:|\/\/|\{\{)([^"']+)["']/i);
    if (local) f.push('Enlaza a un archivo del ordenador: «' + local[1] + '». Usa una dirección https.');
    if (/\[\s*(rellena|pendiente)\b[^\]]{0,60}\]|#_{3,}|lorem ipsum/i.test(t)) f.push('Queda texto sin rellenar.');
    return f;
  }

  function ponerProbador(n) {
    var tipo = n.dataset.probador, fijo = n.hasAttribute('data-fijo');
    var area = el('textarea', { spellcheck: 'false', 'aria-label': 'Código que quieres probar' });
    var marco = el('iframe', { sandbox: 'allow-scripts', title: 'Resultado' });
    var informe = el('ul', { 'class': 'informe', 'aria-live': 'polite' });
    var mandos = el('div', { 'class': 'mandos' }), botones = {}, espera = 0;

    function ver() {
      var t = area.value.trim();
      marco.srcdoc = !t ? '' : tipo === 'slide' ? paginaReveal(t) : t;
      var f = examinar(tipo, t);
      informe.replaceChildren.apply(informe, f.length ? f.map(function (x) { return el('li', { 'class': 'falla' }, x); }) : [el('li', {}, 'Sin fallos. Puedes pegarlo en Apps Script.')]);
    }
    if (!fijo) ['slide', 'vista'].forEach(function (x) {
      var b = botones[x] = el('button', { type: 'button', 'aria-pressed': String(x === tipo) }, x);
      b.addEventListener('click', function () {
        tipo = x;
        Object.keys(botones).forEach(function (k) { botones[k].setAttribute('aria-pressed', String(k === x)); });
        ver();
      });
      mandos.append(b);
    });
    var inicial = '';
    var volver = el('button', { type: 'button' }, fijo ? 'Volver al original' : 'Vaciar');
    volver.addEventListener('click', function () { area.value = fijo ? inicial : ''; ver(); });
    var copia = el('button', { type: 'button' }, 'Copiar');
    copia.addEventListener('click', function () {
      copiar(area.value).then(function () { copia.textContent = 'Copiado'; });
      setTimeout(function () { copia.textContent = 'Copiar'; }, 2200);
    });
    mandos.append(volver, copia);
    area.addEventListener('input', function () { clearTimeout(espera); espera = setTimeout(ver, 600); });
    n.classList.add('probador');
    n.replaceChildren(mandos, area, marco, informe);
    if (n.dataset.archivo) leer(n.dataset.archivo).then(function (t) { inicial = area.value = t; ver(); });
    else ver();
  }

  /* ---------- Simulador de la portada ---------- */
  function ponerSimulador(n) {
    var filas = [
      { archivo: 'slide_01', tipo: 'slide', activo: true, orden: 1, texto: 'Portada' },
      { archivo: 'slide_02', tipo: 'slide', activo: true, orden: 2, texto: 'El problema' },
      { archivo: 'viz_ficha_empresa', tipo: 'vista', activo: true, orden: 3, texto: 'Ficha de empresa' },
      { archivo: 'slide_03', tipo: 'slide', activo: false, orden: 4, texto: 'Qué cobramos' }
    ];
    var tb = el('tbody'), tirillas = el('div', { 'class': 'tirillas', 'aria-live': 'polite' });
    filas.forEach(function (f) {
      var c = el('input', { type: 'checkbox', 'aria-label': 'Activar ' + f.archivo });
      var o = el('input', { type: 'number', min: '1', max: '99', value: f.orden, 'aria-label': 'Orden de ' + f.archivo });
      c.checked = f.activo;
      c.addEventListener('change', function () { f.activo = c.checked; pintar(); });
      o.addEventListener('input', function () { f.orden = Number(o.value) || 0; pintar(); });
      tb.append(el('tr', {}, [el('td', {}, f.archivo), el('td', {}, f.tipo), el('td', {}, c), el('td', {}, o), el('td', {}, f.texto)]));
    });
    var cab = el('tr', {}, ['archivo', 'tipo', 'activo', 'orden', 'descripción'].map(function (x) { return el('th', { scope: 'col' }, x); }));
    function pintar() {
      var v = filas.filter(function (f) { return f.activo; }).sort(function (a, b) { return a.orden - b.orden; });
      tirillas.replaceChildren.apply(tirillas, v.length ? v.map(function (f) {
        return el('div', { 'class': 'tirilla ' + f.tipo }, [el('b', {}, f.texto), el('span', {}, f.archivo)]);
      }) : [el('p', {}, 'No hay páginas activas. Marca alguna casilla.')]);
    }
    n.classList.add('simulador');
    n.replaceChildren(el('table', {}, [el('thead', {}, cab), tb]), el('div', { 'class': 'pestanas', 'aria-hidden': 'true' }, [el('span', {}, 'Config'), el('span', {}, 'Slides')]),
      el('div', { 'class': 'salida' }, [el('p', { 'class': 'url' }, 'script.google.com/…/exec'), tirillas]));
    pintar();
  }

  /* ---------- Ruta de actividades ---------- */
  function ponerRuta(n) {
    var s = indice.separadores.find(function (x) { return x.id === 'actividades'; });
    var ol = el('ol', { 'class': 'ruta' });
    s.paginas.forEach(function (p) {
      var abierta = Boolean(p.archivo);
      ol.append(el('li', {}, [
        el('a', { href: ruta(s, p) }, p.titulo),
        el('span', { 'class': 'formato' }, p.pagina === 'todas' ? 'todo el portfolio' : p.pagina || 'slides'),
        el('span', { 'class': 'fechas' }, p.fechas + (abierta ? '. Abierta.' : '. Todavía cerrada.'))
      ]));
    });
    n.replaceChildren(ol);
  }

  /* ---------- Arranque ---------- */
  leer('contenido/indice.json').then(function (t) {
    indice = JSON.parse(t);
    window.addEventListener('hashchange', abrir);
    abrir();
  }).catch(function () {
    hoja.innerHTML = '<h1>La guía no se puede abrir así</h1><p>Si has hecho doble clic en index.html, usa <code>ver-en-local.bat</code>. Si estás en la web, recarga la página.</p>';
  });
})();
