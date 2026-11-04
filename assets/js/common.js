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
   common.js — Datos del evento y utilidades compartidas
   - EVENT / GRADUADAS: edita SOLO aquí (fecha, hora, lugar, nombres, tema)
   - Graduado/a por URL: ?g=amanda | ana | jose | caleb | susan  (o window.GRAD_SLUG en /<slug>/)
   - Familia por URL:   ?f=Familia%20Rivera  (a quién va dirigida la carta)
   - Logo inline (fetch del SVG), confeti en canvas, tarjeta final, calendario y mapa
   ============================================================ */

/* ---------- Datos del evento (único lugar para editar) ---------- */
const EVENT = {
  ministerio: 'Ministerio del Campus Público',
  siglas: 'PCM',
  titulo: 'Graduación 2026',
  programa: 'Programa de Gratitud',
  lema: 'Discípulos con identidad, líderes con visión y compasión',
  fechaISO: '2026-11-21',
  horaInicio: '17:00',            // TODO: confirmar hora
  horaFin: '19:00',
  fechaTexto: 'Sábado 21 de noviembre de 2026',
  diaNumero: '21', mesTexto: 'Noviembre', diaSemana: 'Sábado',
  horaTexto: '17:00 hrs',         // TODO: confirmar hora
  lugar: 'IASD Portales',
  direccion: 'Av. Emperadores 95, Portales Nte, Benito Juárez, 03303 Ciudad de México, CDMX',
};

/* ---------- Iconos de cada tema (SVG inline, heredan `currentColor`) ---------- */
const ICONS = {
  globo: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true">
    <circle cx="50" cy="50" r="34"/><ellipse cx="50" cy="50" rx="14" ry="34"/>
    <path d="M16 50h68M21 34h58M21 66h58"/>
    <ellipse cx="50" cy="50" rx="46" ry="11" transform="rotate(-22 50 50)" stroke-dasharray="3 5" opacity=".85"/>
    <circle cx="86" cy="32" r="3.2" fill="currentColor" stroke="none"/></svg>`,
  avion: `<svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
    <path d="M2 48 98 6 64 94 48 60Z"/><path d="M28 54 98 6 48 60Z" opacity=".55"/></svg>`,
  diente: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
    <path d="M50 16C40 7 22 9 18 25c-4 14 4 26 8 42 3 12 4 26 10 26 8 0 8-22 14-22s6 22 14 22c6 0 7-14 10-26 4-16 12-28 8-42C78 9 60 7 50 16Z"/>
    <path d="M31 24c-5 2-8 6-9 11" opacity=".75"/>
    <path d="M78 6l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="currentColor" stroke="none" opacity=".9"/></svg>`,
  destello: `<svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
    <path d="M50 2c4 34 14 44 48 48-34 4-44 14-48 48-4-34-14-44-48-48 34-4 44-14 48-48Z"/></svg>`,
  edificio: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M50 8 8 30h84Z"/><path d="M14 30v8h72v-8"/>
    <path d="M22 44v28M37 44v28M63 44v28M78 44v28"/>
    <path d="M14 72h72M10 80h80M6 88h88"/>
    <circle cx="50" cy="22" r="3" fill="currentColor" stroke="none"/></svg>`,
  birrete: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M50 20 6 42l44 22 44-22Z"/>
    <path d="M26 52v18c0 6 11 12 24 12s24-6 24-12V52"/>
    <path d="M88 46v20M88 66c-3 5-3 9 0 13"/>
    <circle cx="88" cy="46" r="2.6" fill="currentColor" stroke="none"/></svg>`,
};

/* ---------- Temas (uno por carrera; varias personas pueden compartirlo) ---------- */
const TEMAS = {
  mundo: {
    id: 'mundo', icono: 'globo', nombre: 'El mundo',
    frase: 'Aprendí que el mundo es grande, pero el amor de ustedes lo cruzó entero conmigo.',
    verso: { ref: 'Proverbios 16:3', txt: 'Encomienda a Jehová tus obras, y tus pensamientos serán afirmados.' },
  },
  sonrisa: {
    id: 'sonrisa', icono: 'diente', nombre: 'La sonrisa',
    frase: 'Aprendí a cuidar sonrisas, pero las primeras que me sostuvieron fueron las de ustedes.',
    verso: { ref: 'Salmo 126:2-3', txt: 'Entonces nuestra boca se llenará de risa, y nuestra lengua de alabanza. Grandes cosas ha hecho Jehová con nosotros; estaremos alegres.' },
  },
  logro: {   // sin carrera conocida: tema neutro de graduación
    id: 'logro', icono: 'birrete', nombre: 'La meta',
    frase: 'Aprendí mucho en las aulas, pero lo más importante lo aprendí en casa, de ustedes.',
    verso: { ref: 'Jeremías 29:11', txt: 'Porque yo sé los planes que tengo para vosotros, dice Jehová, planes de bienestar y no de calamidad, para daros un futuro y una esperanza.' },
  },
  servicio: {
    id: 'servicio', icono: 'edificio', nombre: 'El servicio',
    frase: 'Aprendí a servir a una comunidad, pero la primera que me enseñó a servir fue mi casa.',
    verso: { ref: 'Miqueas 6:8', txt: 'Él te ha declarado, oh hombre, lo que es bueno, y qué pide Jehová de ti: solamente hacer justicia, y amar misericordia, y humillarte ante tu Dios.' },
  },
};

/* ---------- Graduados: cada quien con su tema según la carrera ----------
   genero: 'f' | 'm'  → "graduada" / "graduado" en los textos
   apellido:          → familia por defecto en enlaces.md ("Familia Rivera")   */
const GRADUADAS = [
  { slug: 'amanda', nombre: 'Amanda Rivera de la O', corto: 'Amanda', apellido: 'Rivera', genero: 'f',
    carrera: 'Administración de Negocios Internacionales', tema: TEMAS.mundo },
  { slug: 'ana', nombre: 'Ana Elizabeth Pérez Chanona', corto: 'Ana Elizabeth', apellido: 'Pérez', genero: 'f',
    carrera: 'Odontología', tema: TEMAS.sonrisa },
  // carrera: '' → no se muestra (pendiente de confirmar); al tenerla, poner también su tema
  { slug: 'jose', nombre: 'José Antonio Barrera Mendoza', corto: 'José Antonio', apellido: 'Barrera', genero: 'm',
    carrera: '', tema: TEMAS.logro },
  { slug: 'caleb', nombre: 'Caleb Josué Barrios González', corto: 'Caleb', apellido: 'Barrios', genero: 'm',
    carrera: '', tema: TEMAS.logro },
  { slug: 'susan', nombre: 'Raquel Susan López Magaña', corto: 'Susan', apellido: 'López', genero: 'f',
    carrera: 'Maestría en Administración Pública', tema: TEMAS.servicio },
];
/* ---------- Carta conjunta (raíz sin ?g=): firman todos ---------- */
const TODOS = {
  verso: { ref: 'Salmo 126:3', txt: 'Grandes cosas ha hecho Jehová con nosotros; estaremos alegres.' },
  frase: 'Cada quien recorrió un camino distinto, pero en todos estuvieron ustedes.',
};
/** "graduada" / "graduado" según la persona (con mayúscula inicial si se pide). */
const graduadx = (g, cap = false) => { const w = g.genero === 'm' ? 'graduado' : 'graduada'; return cap ? w[0].toUpperCase() + w.slice(1) : w; };

/* ---------- Raíz del sitio (tools/ vive en una subcarpeta) ---------- */
const ROOT = typeof window.ROOT === 'string' ? window.ROOT : '';

/* ---------- Graduada y familia por URL ---------- */
const PARAMS = new URLSearchParams(location.search);
const FAMILIA = (PARAMS.get('f') || PARAMS.get('familia') || '').trim();
const GRAD_SLUG = String(window.GRAD_SLUG || PARAMS.get('g') || PARAMS.get('graduada') || '').trim().toLowerCase();
const GRAD = GRADUADAS.find((g) => g.slug === GRAD_SLUG) || null;
/** Graduados de esta invitación: quien venga en la URL, o todos si no hay nadie (carta conjunta y .ics). */
const LISTA = GRAD ? [GRAD] : GRADUADAS;
/** Nombres cortos unidos: "Amanda, Ana Elizabeth y Raquel". */
const nombresCortos = (lista = LISTA) => lista.length < 2 ? (lista[0] ? lista[0].corto : '')
  : lista.slice(0, -1).map((g) => g.corto).join(', ') + ' y ' + lista[lista.length - 1].corto;
/** "nosotras" si todas son mujeres, "nosotros" si hay algún hombre. */
const nosotrxs = (lista = LISTA) => lista.every((g) => g.genero === 'f') ? 'nosotras' : 'nosotros';
const saludoFamilia = () => FAMILIA ? `${FAMILIA}, están invitados` : 'Familia y amigos, están invitados';

/* ---------- Helpers ---------- */
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const wait = (ms) => new Promise((r) => setTimeout(r, reducedMotion ? Math.min(ms, 120) : ms));
function vibrate(pattern = 15) {
  const active = navigator.userActivation ? navigator.userActivation.hasBeenActive : true;
  if (navigator.vibrate && active) { try { navigator.vibrate(pattern); } catch (e) { /* ignorar */ } }
}
function centerOf(el) { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }

/* ---------- Logo PCM inline (para que herede el degradado y se pueda animar) ---------- */
let LOGO_SVG = null;
async function loadLogo() {
  if (LOGO_SVG) return LOGO_SVG;
  try {
    const r = await fetch(ROOT + 'src/img/PCM.svg');
    if (!r.ok) throw new Error(r.status);
    LOGO_SVG = (await r.text()).replace(/<\?xml[^>]*>/, '');
  } catch (e) { LOGO_SVG = `<img src="${ROOT}src/img/PCM.svg" alt="Logo PCM">`; }
  return LOGO_SVG;
}
/** Inserta el logo en todos los [data-logo] del documento. */
async function mountLogos(root = document) {
  const svg = await loadLogo();
  $$('[data-logo]', root).forEach((el) => { el.innerHTML = svg; el.setAttribute('role', 'img'); el.setAttribute('aria-label', 'Logo PCM'); });
}
/** Inserta el icono indicado en todos los [data-icon="nombre"]. */
function mountIcons(root = document) {
  $$('[data-icon]', root).forEach((el) => { el.innerHTML = ICONS[el.dataset.icon] || ''; });
}

/* ---------- Confeti (canvas) con los colores del logo ---------- */
const Confetti = (() => {
  const COLORS = ['#47c0f0', '#5ca3e6', '#925ccc', '#bc5099', '#e0486d', '#cc1433', '#e3b84f', '#ffffff'];
  let cv, ctx, w = 0, h = 0, pieces = [], raf = 0;
  function init() {
    if (cv) return;
    cv = document.createElement('canvas'); cv.className = 'confetti'; cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv); ctx = cv.getContext('2d'); resize(); addEventListener('resize', resize);
  }
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2); w = innerWidth; h = innerHeight;
    cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const pick = () => COLORS[(Math.random() * COLORS.length) | 0];
  function add(p) { pieces.push(p); if (!raf) raf = requestAnimationFrame(frame); }
  /** Explosión desde un punto (x, y). */
  function burst(x, y, n = 140, spread = Math.PI * .9) {
    init(); if (reducedMotion) n = Math.min(n, 30);
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - .5) * spread, s = 5 + Math.random() * 11;
      add({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: .16, w: 5 + Math.random() * 6, h: 3 + Math.random() * 6,
        c: pick(), r: Math.random() * 6.28, vr: (Math.random() - .5) * .3, life: 1, decay: .004 + Math.random() * .005,
        round: Math.random() < .3 });
    }
  }
  /** Lluvia suave desde arriba. */
  function rain(n = 70) {
    init(); if (reducedMotion) n = Math.min(n, 20);
    for (let i = 0; i < n; i++) add({ x: Math.random() * w, y: -20 - Math.random() * h * .6, vx: (Math.random() - .5) * 1.4, vy: 1.5 + Math.random() * 2.5,
      g: .015, w: 5 + Math.random() * 6, h: 3 + Math.random() * 6, c: pick(), r: Math.random() * 6.28, vr: (Math.random() - .5) * .2,
      life: 1, decay: .0015 + Math.random() * .002, round: Math.random() < .3 });
  }
  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const p of pieces) {
      p.vx *= .985; p.vy += p.g; p.x += p.vx + Math.sin(p.r * 2) * .4; p.y += p.vy; p.r += p.vr; p.life -= p.decay;
      ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.4)); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2.6, 0, 6.28); ctx.fill(); }
      else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r)) + 1);
      ctx.restore();
    }
    pieces = pieces.filter((p) => p.life > 0 && p.y < h + 40);
    raf = pieces.length ? requestAnimationFrame(frame) : (ctx.clearRect(0, 0, w, h), 0);
  }
  return { burst, rain };
})();

/* ---------- Calendario y mapa (sin botones en la invitación por ahora; quedan por si se reactivan) ---------- */
function buildICS() {
  const dt = (d, hm) => d.replace(/-/g, '') + 'T' + hm.replace(':', '') + '00';
  const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\;');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PCM//Graduacion 2026//ES', 'BEGIN:VEVENT',
    `UID:graduacion-${EVENT.fechaISO}-${LISTA.map((g) => g.slug).join('-')}@pcm`, `DTSTAMP:${stamp}`,
    `DTSTART:${dt(EVENT.fechaISO, EVENT.horaInicio)}`, `DTEND:${dt(EVENT.fechaISO, EVENT.horaFin)}`,
    `SUMMARY:${esc(EVENT.titulo + ' · ' + EVENT.programa + ' (' + EVENT.siglas + ')')}`,
    `DESCRIPTION:${esc(LISTA.map((g) => graduadx(g, true) + ': ' + g.nombre + (g.carrera ? ' — ' + g.carrera : '')).join('; '))}`,
    `LOCATION:${esc(EVENT.lugar + ', ' + EVENT.direccion)}`,
    'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
}
function downloadICS() {
  const url = URL.createObjectURL(new Blob([buildICS()], { type: 'text/calendar;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: 'graduacion-mcp-2026.ics' });
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
}
const mapsURL = () => 'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent(/PENDIENTE/i.test(EVENT.direccion) ? EVENT.lugar : `${EVENT.lugar}, ${EVENT.direccion}`);

/* ---------- Tarjeta final de invitación (la vuelta de la carta) ----------
   lista: una persona (?g=) o todas (raíz). El versículo es el del tema, o el conjunto. */
function inviteCardHTML(lista, { logo = true } = {}) {
  const verso = lista.length === 1 ? lista[0].tema.verso : TODOS.verso;
  const grads = lista.map((g) => `<li>
      <span class="g-icon" data-icon="${g.tema.icono}"></span>
      <span class="g-name">${g.nombre}</span>
      ${g.carrera ? `<span class="g-career">${g.carrera}</span>` : ''}
    </li>`).join('');
  return `<article class="invite">
    ${logo ? '<div class="invite-logo" data-logo></div>' : ''}
    <p class="kicker">${EVENT.ministerio}</p>
    <h2 class="invite-title">${EVENT.titulo}</h2>
    <p class="invite-sub">${EVENT.programa}</p>
    <ul class="grads${lista.length > 1 ? ' many' : ''}">${grads}</ul>
    <p class="family">${saludoFamilia()}</p>
    <blockquote class="verse"><p>«${verso.txt}»</p><cite>${verso.ref}</cite></blockquote>
    <dl class="when">
      <div><dt>Fecha</dt><dd><strong>${EVENT.diaNumero}</strong>${EVENT.mesTexto}<br>${EVENT.diaSemana}</dd></div>
      <div><dt>Hora</dt><dd>${EVENT.horaTexto}</dd></div>
      <div><dt>Lugar</dt><dd>${EVENT.lugar}</dd></div>
    </dl>
    <p class="credit">${EVENT.siglas} · ${EVENT.lema}</p>
  </article>`;
}
/** Pinta la tarjeta en un contenedor y activa sus botones. */
async function renderInvite(container, lista, opts) {
  container.innerHTML = inviteCardHTML(lista, opts);
  container.hidden = false;
  mountIcons(container);
  await mountLogos(container);
  return container;
}
