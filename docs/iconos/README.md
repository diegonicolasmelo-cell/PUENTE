# Variantes de icono

Candidatos para el icono de la PWA. El icono vigente está en `web/public/icons/icon.svg`.

| Archivo | Idea |
|---|---|
| `v1-arco.svg` | Un solo puente con tirantes; silueta mínima, la más legible a 48 px |
| `v2-dialogo.svg` | Dos arcos (familia y equipo) unidos por un globo de conversación, como el logo original |
| `v3-claro.svg` | Misma composición del icono actual con paleta invertida (fondo turquesa) |

`comparativa.png` muestra cada uno a 160 px, con recorte circular (Android), a 64 y 48 px y sobre fondo oscuro.

Para adoptar una variante: copiar el SVG elegido a `web/public/icons/icon.svg`, cambiar el `id` del
degradado a `bg` no es necesario, y regenerar `icon-192.png`, `icon-512.png` e
`icon-maskable-512.png` (512 px, arte al 80% sobre fondo sólido `#03045E` para la versión maskable).
