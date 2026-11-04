# Graduación 2026 · PCM — "Carta a la familia"

Invitación digital animada (HTML, CSS y JavaScript vanilla, sin build ni dependencias) para el
**Programa de Gratitud** de la Graduación 2026 del Ministerio del Campus Público (PCM),
sábado 21 de noviembre de 2026. Misma base que `sobre_vigilia`.

Cada graduado/a tiene **su propia carta**: se escribe sola letra por letra, al terminar cae un sello
tipo pasaporte y, al tocar "Abrir la invitación", la tarjeta gira en 3D y muestra la invitación
con fecha, hora, lugar y versículo. No hay botón "Saltar": la carta se escribe completa. Los botones
"Cómo llegar" y "Agendar" (.ics) se quitaron; el código del mapa y del calendario sigue en common.js por si se reactivan.

| Ruta | Qué es |
|---|---|
| `/` | Sin parámetros: la **carta conjunta** (la firman los cinco, sello PCM, invitación con todos y Salmo 126:3). Con `?g=amanda`, `ana`, `jose`, `caleb` o `susan`: la carta de esa persona con su tema. |
| `/amanda/`, `/ana/`, `/jose/`, `/caleb/`, `/susan/` | La misma carta, una carpeta por persona, con vista previa de WhatsApp propia (generadas). |
| `/tools/og.html` | Plantilla 1200×630 de la vista previa (`?g=amanda` para verla en el navegador). |

## Tema por carrera

| Graduado/a | Carrera | Tema | Acento | Versículo |
|---|---|---|---|---|
| Amanda Rivera de la O | Administración de Negocios Internacionales | `mundo`: globo con órbita, avión de papel que cruza la pantalla, marca de agua y sello con el globo | morado / rosa | Proverbios 16:3 |
| Ana Elizabeth Pérez Chanona | Odontología | `sonrisa`: diente con brillo, destellos que titilan, marca de agua y sello con el diente | rosa / menta | Salmo 126:2-3 |
| José Antonio Barrera Mendoza | *(sin confirmar: no se muestra)* | `logro`: birrete, destellos, marca de agua y sello con el birrete | dorado / morado | Jeremías 29:11 |
| Caleb Josué Barrios González | *(sin confirmar: no se muestra)* | `logro` | dorado / morado | Jeremías 29:11 |
| Raquel Susan López Magaña ("Susan") | Maestría en Administración Pública | `servicio`: edificio con columnas, silueta de ciudad al pie con ventanas que se encienden, marca de agua y sello con el edificio | verde / dorado | Miqueas 6:8 |

Los temas viven en `TEMAS` (common.js) y cada persona apunta a uno; varias pueden compartirlo. Cada tema
cambia también una frase de la carta (`tema.frase`) y el versículo de la invitación. Cada persona lleva
`genero` (`f`/`m`) para decir "graduada"/"graduado" donde haga falta, y `apellido` para la familia por defecto.
Si `carrera` está vacía no se muestra en ningún lado (carta, invitación, vista previa, enlaces).

## Personalización por URL

- `?g=amanda` / `ana` / `jose` / `caleb` / `susan`: de quién es la carta (en `/<slug>/` ya va fija).
- `?f=Familia%20Rivera`: a quién va dirigida. La carta dice "Querida Familia Rivera:" y la
  invitación "Familia Rivera, están invitados". Se combina: `/amanda/?f=Familia%20Rivera`.

## Dónde se edita

- `assets/js/common.js`: `EVENT` (fecha, lugar; **hora: pendiente**), `TEMAS` (icono, frase, versículo),
  `GRADUADAS` (nombre, corto, apellido, género, carrera, tema), `ICONS` (SVG), calendario, mapa y tarjeta final.
- `app.js`: la carta (texto individual o en plural, escritura, sello, giro). `TODOS` en common.js tiene la frase y el versículo de la conjunta.
- `style.css`: temas (`body[data-tema]`), decoración de fondo, carta y sello.
- `assets/css/base.css`: paleta sacada del logo, tipografías y tarjeta de invitación.
- `src/img/PCM.svg`: logo (se inserta inline para animarlo y aplicar el degradado).

## Vista previa en WhatsApp (páginas por graduada)

WhatsApp no ejecuta JavaScript: lee `og:title` / `og:image` del HTML tal cual. Por eso cada
persona tiene su carpeta con sus etiquetas y su imagen. Para regenerarlas tras cambiar datos:

```bash
node tools/build.js          # páginas /<slug>/, imágenes assets/og/*.jpg y enlaces.md
node tools/build.js --no-og  # solo páginas y enlaces.md (no toca las imágenes)
```

Las imágenes se capturan con Chrome/Chromium headless desde `tools/og.html` (y se pasan a .jpg con
ImageMagick si está instalado). La URL base del sitio está en `BASE_URL` dentro de `tools/build.js`.
Los enlaces para compartir quedan en `enlaces.md`.

## Estructura

```
index.html            → la carta (conjunta sin ?g=, individual con ?g=)
app.js / style.css    → lógica y estilos de la carta, temas por carrera
assets/js/common.js   → EVENT, TEMAS, GRADUADAS, ICONS, confeti, .ics, mapa, tarjeta final
assets/css/base.css   → paleta, tipografías, tarjeta de invitación
assets/og/<slug>.jpg  → vistas previas 1200×630 (generadas)
src/img/PCM.svg       → logo
amanda/ ana/ jose/ caleb/ susan/ → páginas por persona GENERADAS (no editar: node tools/build.js)
tools/build.js        → genera páginas, imágenes y enlaces.md (Node, sin dependencias)
tools/og.html         → plantilla de la vista previa
enlaces.md            → enlaces para compartir (generado)
```

## Pendientes
- Confirmar la carrera de José Antonio y Caleb: hoy va vacía (no se muestra) con el tema neutro `logro`.
  Al tenerla, poner `carrera` y, si se quiere, un tema propio en `TEMAS`.
- Confirmar la hora en `EVENT` (`horaInicio`, `horaFin`, `horaTexto`; hoy 17:00) y
  volver a correr `node tools/build.js`.
