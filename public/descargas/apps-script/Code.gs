/**
 * Portfolio del Proyecto Intermodular.
 * La hoja decide qué páginas se ven; este archivo las monta con reveal.js.
 * Dos tipos de página:
 *   slide  un <section> de reveal.js
 *   vista  un documento HTML entero, dentro de su propio marco
 */

const DEFECTOS = {
  titulo: 'Mi portfolio',
  autores: '',
  tema: 'white',
  transicion: 'slide',
  numero_slide: true,
  controles: true,
  progreso: true
};

const TEMAS = ['white', 'black', 'league', 'beige', 'sky', 'night', 'serif',
               'simple', 'solarized', 'moon', 'dracula', 'blood'];
const TRANSICIONES = ['none', 'fade', 'slide', 'convex', 'concave', 'zoom'];
const TIPOS = ['slide', 'vista'];

/* ---------- Página web ---------- */

function doGet() {
  const cfg = leerConfig_();
  const t = HtmlService.createTemplateFromFile('index');
  t.cfg = cfg;
  t.paginas = leerPaginas_().map(function (p) { return pintarPagina_(p, cfg); });
  if (t.paginas.length === 0) {
    t.paginas = [aviso_('No hay páginas activas', 'Marca alguna casilla en la columna «activo» de la pestaña Slides.')];
  }
  t.revealJson = JSON.stringify({
    width: 1280,
    height: 720,
    margin: 0.02,
    scrollActivationWidth: 0,   /* en el móvil, páginas en lugar de una tira */
    hash: false,       /* el hash no funciona dentro del marco de Apps Script */
    history: false,
    slideNumber: cfg.numero_slide,
    controls: cfg.controles,
    progress: cfg.progreso,
    transition: cfg.transicion
  });
  return t.evaluate()
    .setTitle(String(cfg.titulo))
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/* ---------- Lectura de la hoja ---------- */

function leerConfig_() {
  const cfg = Object.assign({}, DEFECTOS);
  const hoja = SpreadsheetApp.getActive().getSheetByName('Config');
  if (hoja) {
    hoja.getDataRange().getValues().forEach(function (fila) {
      const clave = String(fila[0]).trim();
      if (clave && fila[1] !== '') cfg[clave] = fila[1];
    });
  }
  if (TEMAS.indexOf(cfg.tema) < 0) cfg.tema = DEFECTOS.tema;
  if (TRANSICIONES.indexOf(cfg.transicion) < 0) cfg.transicion = DEFECTOS.transicion;
  cfg.numero_slide = esSi_(cfg.numero_slide);
  cfg.controles = esSi_(cfg.controles);
  cfg.progreso = esSi_(cfg.progreso);
  return cfg;
}

/* Columnas de Slides: archivo | tipo | activo | orden | descripción */
function leerFilas_() {
  const hoja = SpreadsheetApp.getActive().getSheetByName('Slides');
  if (!hoja) return [];
  return hoja.getDataRange().getValues().slice(1)
    .map(function (f) {
      return {
        archivo: String(f[0]).trim(),
        tipo: String(f[1]).trim().toLowerCase() || 'slide',
        activo: esSi_(f[2]),
        orden: Number(f[3]) || 0
      };
    })
    .filter(function (p) { return p.archivo !== ''; });
}

function leerPaginas_() {
  return leerFilas_()
    .filter(function (p) { return p.activo; })
    .sort(function (a, b) { return a.orden - b.orden; });
}

function esSi_(valor) {
  if (valor === true) return true;
  return ['true', 'verdadero', 'sí', 'si', 'x'].indexOf(String(valor).trim().toLowerCase()) >= 0;
}

/* ---------- Construcción de cada página ---------- */

function pintarPagina_(p, cfg) {
  const contenido = leerArchivo_(p.archivo);
  const problema = revisar_(p, contenido);
  if (problema) return aviso_(p.archivo, problema);
  const html = rellenar_(contenido, cfg);
  return p.tipo === 'vista' ? marcoVista_(p.archivo, html) : html;
}

function leerArchivo_(nombre) {
  try {
    return HtmlService.createTemplateFromFile(nombre).getRawContent();
  } catch (e) {
    return null;
  }
}

/* Devuelve un texto si hay algo que corregir, o '' si está bien */
function revisar_(p, contenido) {
  if (contenido === null) return 'No existe un archivo HTML con este nombre. Compara la columna «archivo» con los archivos de Apps Script.';
  if (TIPOS.indexOf(p.tipo) < 0) return 'En la columna «tipo» solo puede poner slide o vista.';
  const entero = /<!doctype html|<html[\s>]/i.test(contenido);
  if (p.tipo === 'slide' && entero) return 'Este archivo es un HTML entero. Cambia su tipo a vista.';
  if (p.tipo === 'vista' && !entero) return 'Este archivo no es un HTML entero. Cambia su tipo a slide o vuelve a generarlo.';
  if (p.tipo === 'slide' && !/<section[\s>]/i.test(contenido)) return 'Falta la etiqueta <section>.';
  return '';
}

/* Cambia {{titulo}}, {{autores}}… por los valores de la pestaña Config */
function rellenar_(html, cfg) {
  return html.replace(/\{\{\s*(\w+)\s*\}\}/g, function (todo, clave) {
    return Object.prototype.hasOwnProperty.call(cfg, clave) ? escapar_(cfg[clave]) : todo;
  });
}

/* Guarda la vista en un marco aislado: sus estilos no tocan los slides */
function marcoVista_(nombre, html) {
  const puente = '<script>document.addEventListener("keydown",function(e){' +
    'if(e.defaultPrevented||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;' +
    'if(["ArrowRight","ArrowLeft","PageDown","PageUp"].indexOf(e.key)>=0)' +
    'parent.postMessage({portfolio:e.key},"*");});</' + 'script>';
  const corte = html.toLowerCase().lastIndexOf('</body>');
  const completo = corte < 0 ? html + puente : html.slice(0, corte) + puente + html.slice(corte);
  return '<section class="vista"><iframe title="' + escapar_(nombre) + '"' +
    ' sandbox="allow-scripts allow-popups" data-html="' + escapar_(completo) + '"></iframe></section>';
}

function aviso_(titulo, texto) {
  return '<section class="aviso"><h3>' + escapar_(titulo) + '</h3><p>' + escapar_(texto) + '</p></section>';
}

function escapar_(texto) {
  return String(texto).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ---------- Menú de la hoja ---------- */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Portfolio')
    .addItem('Preparar las pestañas', 'prepararHoja')
    .addItem('Revisar las páginas', 'revisarPaginas')
    .addToUi();
}

/* Crea Config y Slides si no existen. No borra nada de lo que ya tengas. */
function prepararHoja() {
  const libro = SpreadsheetApp.getActive();

  if (!libro.getSheetByName('Config')) {
    const c = libro.insertSheet('Config');
    c.getRange('B5:B7').insertCheckboxes();
    c.getRange('A1:B7').setValues([
      ['titulo', 'Mi microempresa'],
      ['autores', 'Tu nombre · 2 GES'],
      ['tema', 'white'],
      ['transicion', 'slide'],
      ['numero_slide', true],
      ['controles', true],
      ['progreso', true]
    ]);
    c.getRange('B3').setDataValidation(lista_(TEMAS));
    c.getRange('B4').setDataValidation(lista_(TRANSICIONES));
    c.setColumnWidth(2, 260);
  }

  if (!libro.getSheetByName('Slides')) {
    const s = libro.insertSheet('Slides');
    s.getRange('C2:C40').insertCheckboxes();
    s.getRange('B2:B40').setDataValidation(lista_(TIPOS));
    s.getRange('A1:E2').setValues([
      ['archivo', 'tipo', 'activo', 'orden', 'descripción'],
      ['slide_01', 'slide', true, 1, 'Portada']
    ]);
    s.setFrozenRows(1);
    s.setColumnWidth(1, 180);
    s.setColumnWidth(5, 260);
  }
}

function lista_(valores) {
  return SpreadsheetApp.newDataValidation().requireValueInList(valores, true).build();
}

/* Comprueba cada fila de Slides y dice qué falta */
function revisarPaginas() {
  const vistos = {};
  const lineas = leerFilas_().map(function (p) {
    let problema = revisar_(p, leerArchivo_(p.archivo));
    if (!problema && vistos[p.archivo]) problema = 'Está dos veces en la hoja.';
    vistos[p.archivo] = true;
    return p.archivo + ': ' + (problema || (p.activo ? 'correcto' : 'correcto, pero no está activo'));
  });
  SpreadsheetApp.getUi().alert(lineas.join('\n') || 'La pestaña Slides está vacía.');
}
