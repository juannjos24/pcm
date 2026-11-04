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
   app.js — "Carta a la familia"
   Sin ?g=  → la carta conjunta: la firman los cinco, sello PCM, invitación con todos.
   Con ?g=  → la carta de esa persona, con el tema de su carrera, su sello y su versículo.
   En ambas la carta se escribe sola, cae el sello y al tocar "Abrir la invitación"
   la tarjeta gira en 3D.
   Los datos y el tema de cada graduado/a están en assets/js/common.js.
   ============================================================ */
mountLogos();

/** Contenido de un icono sin su <svg> envolvente, para anidarlo en otro SVG. */
const inner = (svg) => svg.replace(/<svg[^>]*>|<\/svg>/g, '');

/* ---------- Decoración de fondo según el tema ---------- */
function renderDeco(tema) {
  const deco = $('#deco');
  if (tema && tema.id === 'mundo') {
    // Ruta punteada que cruza la pantalla y un avión de papel que la recorre (SMIL, sin JS)
    const path = 'M-80 470 C 180 250, 420 560, 640 300 S 980 60, 1120 140';
    deco.innerHTML = `
      <svg class="route" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path class="trail" d="${path}"/>
        <g class="plane"><g transform="translate(-16 -16) scale(.32)">${inner(ICONS.avion)}</g>
          <animateMotion dur="16s" repeatCount="indefinite" rotate="auto" path="${path}"/></g>
      </svg>
      <span class="big globo" data-icon="globo"></span>`;
  } else if (tema && tema.id === 'servicio') {
    // Silueta de ciudad al pie con ventanas que se encienden (SMIL, sin JS)
    const sky = 'M0 300V210h36v-50h28v50h30V130h44v80h26v-40h38v40h34V80h18V56h18v24h18v130h36v-60h48v60h30v-90h40v90h30V140h26v70h40V96h50v114h36v-46h36v46h32V170h40v130Z';
    const win = Array.from({ length: 18 }, () => {
      const x = 20 + Math.random() * 960, y = 120 + Math.random() * 150, d = (2 + Math.random() * 4).toFixed(1), b = (-Math.random() * 6).toFixed(1);
      return `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="6" height="9" rx="1" opacity=".15"><animate attributeName="opacity" values=".1;.9;.1" dur="${d}s" begin="${b}s" repeatCount="indefinite"/></rect>`;
    }).join('');
    deco.innerHTML = `
      <svg class="skyline" viewBox="0 0 1000 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <path class="city" d="${sky}"/><g class="windows">${win}</g>
      </svg>
      <span class="big edificio" data-icon="edificio"></span>`;
  } else {
    // sonrisa: destellos y diente grande · carta conjunta (sin tema): solo destellos dorados
    const sparks = Array.from({ length: 9 }, (_, i) => {
      const s = 10 + Math.random() * 16, d = 2.6 + Math.random() * 2.4, delay = -Math.random() * 5;
      return `<span class="spark" data-icon="destello" style="left:${(5 + Math.random() * 90).toFixed(1)}%;top:${(6 + Math.random() * 84).toFixed(1)}%;--s:${s.toFixed(0)}px;--d:${d.toFixed(1)}s;--delay:${delay.toFixed(1)}s"></span>`;
    }).join('');
    deco.innerHTML = sparks + (tema ? `<span class="big ${tema.icono}" data-icon="${tema.icono}"></span>` : '');
  }
  mountIcons(deco);
}

/* ---------- Sello tipo pasaporte con el icono del tema ---------- */
function stampSVG(tema) {
  const centro = tema
    ? `<svg x="37" y="37" width="46" height="46" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${inner(ICONS[tema.icono])}</svg>`
    : `<text class="siglas" x="60" y="68" text-anchor="middle">${EVENT.siglas}</text>`;
  return `<svg viewBox="0 0 120 120" aria-hidden="true">
    <defs><path id="stamp-arc" d="M60 60m-43 0a43 43 0 1 1 86 0a43 43 0 1 1-86 0"/></defs>
    <circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" stroke-width="2.4" stroke-dasharray="2 3"/>
    <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" stroke-width="1.3"/>
    <circle cx="60" cy="60" r="33" fill="none" stroke="currentColor" stroke-width="1.3"/>
    <text><textPath href="#stamp-arc" textLength="268" lengthAdjust="spacing">${EVENT.titulo.toUpperCase()} · ${EVENT.siglas} · ${EVENT.diaNumero} ${EVENT.mesTexto.slice(0, 3).toUpperCase()} · </textPath></text>
    ${centro}
  </svg>`;
}

/* ---------- La carta ---------- */
function renderCarta(g) {
  const tema = g ? g.tema : null;
  const firma = g ? g.corto : nombresCortos(GRADUADAS);
  if (tema) document.body.dataset.tema = tema.id;
  document.title = `Carta de ${firma} · ${EVENT.titulo} ${EVENT.siglas}`;
  renderDeco(tema);

  const who = $('#who');
  who.innerHTML = g
    ? `<span class="ico" data-icon="${tema.icono}"></span><span>De <b>${g.nombre}</b>${g.carrera ? ' · ' + g.carrera : ''}</span>`
    : `<span>De <b>${firma}</b></span>`;
  mountIcons(who);

  const saludo = FAMILIA ? `Querida ${FAMILIA}:` : 'Querida familia:';
  const TEXT = g ? `${saludo}

Hoy no celebro solo un título. Celebro cada oración que hicieron por mí, cada sacrificio silencioso y cada palabra de ánimo en los días difíciles.

${tema.frase}

Dios fue fiel, y ustedes fueron sus manos.

Por eso quiero darle gracias a Él, junto a ustedes, el ${EVENT.fechaTexto.toLowerCase()}.

Con amor,` : `${saludo}

Hoy no celebramos solo un título. Celebramos cada oración que hicieron por ${nosotrxs(GRADUADAS)}, cada sacrificio silencioso y cada palabra de ánimo en los días difíciles.

${TODOS.frase}

Dios fue fiel, y ustedes fueron sus manos.

Por eso queremos darle gracias a Él, junto a ustedes, el ${EVENT.fechaTexto.toLowerCase()}.

Con amor,`;

  // Se arma sin espacios entre nodos: la carta usa white-space: pre-wrap
  const letter = $('#letter');
  const wm = tema ? `<span class="wm" data-icon="${tema.icono}"></span>` : `<span class="wm wm-logo" data-logo></span>`;
  letter.innerHTML = `${wm}<span class="text"></span><span class="cursor" aria-hidden="true"></span><div class="stamp" id="stamp">${stampSVG(tema)}</div>`;
  mountIcons(letter);
  if (!tema) mountLogos(letter);
  const text = $('.text', letter), cursor = $('.cursor', letter), stamp = $('#stamp');
  const open = $('#open'), card = $('#card');
  $('#carta').hidden = false;

  let done = false;
  function finish() {
    if (done) return; done = true;
    cursor.remove();
    const sig = document.createElement('span'); sig.className = g ? 'sig' : 'sig sig-many'; sig.textContent = firma;
    text.after(sig);
    stamp.classList.add('on'); vibrate([20, 40, 30]);
    open.hidden = false;
    Confetti.rain(30);
  }
  async function type() {
    for (const ch of TEXT) {   // sin botón "Saltar": la carta se escribe completa
      text.textContent += ch;
      await wait(/[.,:]/.test(ch) ? 260 : ch === '\n' ? 180 : 26 + Math.random() * 30);
    }
    finish();
  }
  open.addEventListener('click', async () => {
    vibrate([15, 30, 40]);
    await renderInvite($('#back'), LISTA, { logo: false });
    open.hidden = true;
    card.classList.add('flip');   // el giro y el cambio de cara son keyframes CSS (ver style.css)
    const c = centerOf(card);
    setTimeout(() => Confetti.burst(c.x, c.y, 120, Math.PI * 2), 600);
  });
  type();
}

renderCarta(GRAD);   // null → carta conjunta
