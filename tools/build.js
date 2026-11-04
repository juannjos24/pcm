#!/usr/bin/env node
'use strict';
/*
                    /\
                   /  \
                   |  |
                   |JM|
                  /|  |\
                 / |  | \
                /  |  |  \
       ________/   |  |   \________
      /            |  |            \
      '────────────|  |────────────'
                   |  |
                   |  |
                  /    \
                 /______\

        Desarrollado por Juan José Moreno Miguel
                 Stones Solutions · 2026
*/
/* ============================================================
   build.js — Genera una página por graduado/a (/amanda/, /ana/, /jose/…) con sus
   propias etiquetas Open Graph y su imagen de vista previa, para que el
   enlace en WhatsApp muestre el nombre y el tema de esa carta.
   (WhatsApp no ejecuta JavaScript: lee las etiquetas del HTML tal cual,
   por eso ?g=amanda siempre mostraría la vista previa genérica.)

   Uso:   node tools/build.js            (páginas + imágenes + enlaces.md)
          node tools/build.js --no-og    (solo páginas y enlaces.md)
   Lee:   assets/js/common.js (GRADUADAS, EVENT), index.html (plantilla), tools/og.html
   Crea:  <slug>/index.html, assets/og/<slug>.jpg (con Chrome headless) y enlaces.md
   Sin dependencias de npm. Para las imágenes necesita google-chrome o chromium;
   si además hay ImageMagick (`convert`) las guarda en .jpg, si no en .png.
   ============================================================ */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BASE_URL = 'https://juannjos24.github.io/mcp/';   // ← cámbiala si cambias de repo
const NO_OG = process.argv.includes('--no-og');

// common.js es un archivo de navegador: se evalúa con un `window` mínimo y se sacan los datos.
const src = fs.readFileSync(path.join(ROOT, 'assets/js/common.js'), 'utf8');
const { GRADUADAS, EVENT } = new Function('window', 'location', 'navigator', 'document',
  src + ';return { GRADUADAS, EVENT };')({ matchMedia: () => ({ matches: false }) }, { search: '' }, {}, {});

const template = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/* ---------- Vistas previas (1200×630) con Chrome headless ---------- */
function findChrome() {
  for (const bin of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'chrome']) {
    if (spawnSync('which', [bin]).status === 0) return bin;
  }
  return null;
}
const CHROME = NO_OG ? null : findChrome();
// Se detecta ImageMagick aunque sea --no-og, para que la extensión (.jpg) coincida con las imágenes ya generadas
const HAS_CONVERT = spawnSync('which', ['convert']).status === 0;
const OG_EXT = HAS_CONVERT ? 'jpg' : 'png';
const profile = CHROME ? fs.mkdtempSync(path.join(os.tmpdir(), 'og-chrome-')) : null;

function renderOG(slug) {
  const out = path.join(ROOT, 'assets/og', `${slug}.${OG_EXT}`);
  if (!CHROME) return fs.existsSync(out) ? out : null;
  const png = HAS_CONVERT ? path.join(profile, `${slug}.png`) : out;
  const url = 'file://' + path.join(ROOT, 'tools/og.html') + (slug === 'mcp' ? '' : `?g=${slug}`);
  // Chrome headless descuenta ~80 px de "barra" a --window-size: se captura más alto y se recorta
  // a 1200×630 con ImageMagick (og.html ancla el lienzo arriba a la izquierda). Sin ImageMagick se
  // compensa pidiendo 1200×712, que suele dejar el viewport en 630.
  const r = spawnSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    `--user-data-dir=${profile}`, `--window-size=1200,${HAS_CONVERT ? 900 : 712}`, '--virtual-time-budget=12000',
    `--screenshot=${png}`, url], { stdio: 'ignore', timeout: 60000 });
  if (r.status !== 0 || !fs.existsSync(png)) { console.warn(`  ! no se pudo generar la vista previa de ${slug}`); return null; }
  if (HAS_CONVERT) spawnSync('convert', [png, '-crop', '1200x630+0+0', '+repage', '-quality', '88', out], { stdio: 'ignore' });
  return fs.existsSync(out) ? out : null;
}

/* ---------- Página por graduado/a ---------- */
function pageFor(g, ogFile) {
  const title = `${g.nombre} te invita a su graduación`;
  const desc = `${EVENT.titulo} · ${EVENT.programa} · ${EVENT.fechaTexto}. ${g.corto} escribió una carta para ustedes: toca para leerla.`;
  const ogImg = ogFile ? `assets/og/${path.basename(ogFile)}` : `assets/og/mcp.${OG_EXT}`;
  let html = template;
  const replaceOnce = (re, value) => {
    if (!re.test(html)) throw new Error(`No se encontró en index.html: ${re}`);
    html = html.replace(re, value);
  };
  replaceOnce(/<head>\n/, `<head>\n  <!-- GENERADO por tools/build.js a partir de index.html: no editar a mano -->\n  <base href="../">\n`);
  replaceOnce(/<title>[^<]*<\/title>/, `<title>${esc(title)} · ${EVENT.siglas}</title>`);
  replaceOnce(/(<meta name="description" content=")[^"]*(")/, `$1${esc(desc)}$2`);
  replaceOnce(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`);
  replaceOnce(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(desc)}$2`);
  replaceOnce(/(<meta property="og:image" content=")[^"]*(")/, `$1${BASE_URL}${ogImg}$2`);
  replaceOnce(/(<meta property="og:url" content=")[^"]*(")/, `$1${BASE_URL}${g.slug}/$2`);
  replaceOnce(/(\n\s*)<script src="assets\/js\/common\.js"><\/script>/,
    `$1<script>window.GRAD_SLUG = ${JSON.stringify(g.slug)};</script>$1<script src="assets/js/common.js"></script>`);
  return html;
}

fs.mkdirSync(path.join(ROOT, 'assets/og'), { recursive: true });
if (CHROME) console.log(`Vistas previas con ${CHROME} → assets/og/*.${OG_EXT}`);
else if (!NO_OG) console.warn('No se encontró Chrome/Chromium: se usan las imágenes que ya existan en assets/og/.');

// Genérica (raíz, sin ?g=) y una por graduado/a
const generic = renderOG('mcp');
if (generic) {
  let root = template.replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${BASE_URL}assets/og/${path.basename(generic)}$2`);
  if (root !== template) fs.writeFileSync(path.join(ROOT, 'index.html'), root);
}

const rows = [];
for (const g of GRADUADAS) {
  const og = renderOG(g.slug);
  const dir = path.join(ROOT, g.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), pageFor(g, og));
  rows.push({ g, url: `${BASE_URL}${g.slug}/`, og: og ? path.relative(ROOT, og) : '(genérica)' });
}
if (profile) fs.rmSync(profile, { recursive: true, force: true });

const md = ['# Enlaces para compartir', '', 'Generado por `node tools/build.js`. Cada enlace tiene su propia vista previa en WhatsApp.', '',
  '| Graduado/a | Carrera | Enlace | Vista previa |', '|---|---|---|---|',
  ...rows.map((r) => `| ${r.g.nombre} | ${r.g.carrera || '—'} | ${r.url} | ${r.og} |`), '',
  '## Dirigir la carta a una familia', '',
  'Agrega `?f=` con el nombre de la familia (la carta dice "Querida Familia Rivera:" y la invitación "Familia Rivera, están invitados"):', '',
  ...rows.map((r) => `- ${r.url}?f=${encodeURIComponent('Familia ' + (r.g.apellido || r.g.nombre.split(' ')[1]))}`), '',
  `Raíz (carta conjunta, la firman todos): ${BASE_URL}`, ''].join('\n');
fs.writeFileSync(path.join(ROOT, 'enlaces.md'), md);

for (const r of rows) console.log(`${r.g.corto.padEnd(14)} ${r.url}   ${r.og}`);
console.log(`\n${rows.length} páginas generadas. Lista en enlaces.md`);
