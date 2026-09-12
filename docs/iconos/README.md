# Variantes de icono

Candidatos para el icono de la PWA. El icono vigente está en `web/public/icons/icon.svg`.

| Archivo | Idea |
|---|---|
| `v1-arco.svg` | Un solo puente con tirantes; silueta mínima, la más legible a 48 px |
| `v2-dialogo.svg` | Dos arcos (familia y equipo) unidos por un globo de conversación, como el logo original |
| `v3-claro.svg` | Misma composición del icono actual con paleta invertida (fondo turquesa) |

`comparativa.png` muestra cada uno a 160 px, con recorte circular (Android), a 64 y 48 px y sobre fondo oscuro.

Para adoptar una variante: copiar el SVG elegido a `web/public/icons/icon.svg` y ejecutar
`node scripts/build-icons.mjs` (requiere Playwright: `cd web && npm i -D playwright && npx playwright install chromium`).
Genera `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (Android) y `apple-touch-icon.png` (iPhone, 180 px opaco).
