# Puente UCI

App para familiares de pacientes en Unidad de Cuidados Intensivos: acompaña, explica y humaniza.
La familia completa un perfil de quién es el paciente más allá de su diagnóstico; el equipo lo ve
en una planilla y lo imprime como ficha para la cabecera de la cama.

- **Frontend**: PWA (React + Vite), instalable, con contenido disponible sin conexión.
- **Backend**: Google Apps Script (API JSON) que también sirve la app como envoltorio.
- **Datos**: Google Sheets, editable por el equipo clínico.

Lee primero [`docs/DISENO.md`](docs/DISENO.md) (intención, arquitectura, modelo de datos, feedback)
y luego [`docs/DESPLIEGUE.md`](docs/DESPLIEGUE.md) para ponerlo en producción.

## Estructura

```
web/          PWA (Vite + React)            → npm run dev | build | build:gas
apps-script/  Proyecto de Google Apps Script → clasp push o copiar al editor
scripts/      build-gas.mjs: inyecta el build en apps-script/Index.html
docs/         Diseño, despliegue y el prototipo original (PuenteUCI_v10.jsx)
```

## Desarrollo local

```bash
cd web
npm install
cp .env.example .env        # opcional: VITE_API_URL=https://script.google.com/macros/s/.../exec
npm run dev                 # http://localhost:5173
npm run build               # genera web/dist
npm run build:gas           # además genera apps-script/Index.html (envoltorio)
```

Sin `VITE_API_URL` la app corre en **modo local** (todo se guarda solo en el dispositivo). Para
probar contra un backend sin reconstruir, en la consola del navegador:
`localStorage.setItem('puente.apiUrl', 'https://script.google.com/macros/s/.../exec')` y recargar.

## Despliegue en una frase

Planilla → Apps Script (`setupSpreadsheet()`) → Web App "Cualquier persona" → URL `exec` en la
variable `VITE_API_URL` de GitHub → Pages publica `https://<usuario>.github.io/PUENTE/`.
