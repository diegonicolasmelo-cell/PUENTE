# Despliegue paso a paso

## A. Planilla y Apps Script (backend)

1. Crea una planilla nueva en Google Sheets (por ejemplo `Puente UCI — Datos`).
2. Menú **Extensiones → Apps Script**. Se abre un proyecto vinculado a la planilla.
3. Copia los archivos de `apps-script/` al proyecto: `Code.gs`, `Sheets.gs`, `Content.gs`,
   `appsscript.json` (activa "Mostrar el archivo de manifiesto appsscript.json" en Configuración
   del proyecto) e `Index.html` (si ya ejecutaste `npm run build:gas`).
   Alternativa con [clasp](https://github.com/google/clasp): `cp apps-script/.clasp.json.example
   apps-script/.clasp.json`, pon tu `scriptId`, y `cd apps-script && clasp push`.
4. En el editor, selecciona la función `setupSpreadsheet` y ejecútala una vez. Autoriza los
   permisos. Crea las hojas `Pacientes`, `Familia`, `Etapas`, `FAQ`, `Videos`, `Config`, `Log` con
   contenido semilla. Es idempotente: no borra datos si ya existen.
5. Edita la hoja **Config** con los datos reales de tu unidad (horario de visitas, sala, hora del
   informe, teléfono, consejo del día).
6. **Implementar → Nueva implementación → Aplicación web**:
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier persona** (los familiares no tienen cuenta Google).
   - Copia la URL que termina en `/exec`.
7. Prueba en el navegador: `<URL exec>?action=ping` debe responder `{"ok":true,...}`.

Cada vez que cambies código en Apps Script debes crear una **nueva versión** de la implementación
(Implementar → Administrar implementaciones → editar → Versión: Nueva) o la URL seguirá sirviendo
la versión anterior.

## B. PWA en GitHub Pages (frontend)

1. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. **Settings → Secrets and variables → Actions → Variables** → nueva variable `VITE_API_URL` con
   la URL `exec` del paso A.6.
3. El workflow `.github/workflows/deploy-pages.yml` se ejecuta al hacer push a `main` o manualmente
   desde la pestaña Actions (*Run workflow*, eligiendo la rama). Publica en
   `https://<usuario>.github.io/PUENTE/`.
4. Si el repositorio se llama distinto de `PUENTE`, define también la variable `VITE_BASE` con
   `/<nombre-del-repo>/`.
5. Abre la URL en el teléfono y agrégala a la pantalla de inicio:
   - **Android (Chrome)**: la app muestra un botón "Instalar"; también sirve el menú ⋮ → *Instalar app*.
   - **iPhone / iPad (Safari)**: no existe botón de instalación. Toca **Compartir** (cuadrado con flecha) →
     **Añadir a pantalla de inicio**. La app lo recuerda con un aviso la primera vez. Desde la pantalla de
     inicio abre a pantalla completa, guarda los datos sin conexión y respeta la muesca y la barra inferior.

## C. Envoltorio en Apps Script (opcional)

```bash
cd web && npm run build:gas
```

Genera `apps-script/Index.html` con el build inline. Súbelo al proyecto de Apps Script y crea una
nueva versión de la implementación. La URL `exec` ahora también abre la app (sin instalación ni
modo sin conexión, pero funcional). Este modo usa `google.script.run`, no necesita `VITE_API_URL`.

## D. Operación diaria del equipo

- **Etapa del paciente**: columna `etapa` en `Pacientes` (1 Aguda · 2 Estabilización · 3 Destete ·
  4 Pre-alta). La familia lo ve al abrir la app.
- **Estado**: `activo`, `alta`, `fallecido`, `archivado`. Un perfil no activo sigue accesible por su
  código pero se puede filtrar en la planilla.
- **Contenido**: hojas `FAQ`, `Videos`, `Etapas`, `Config`. Se refresca en la app en ~5 minutos
  (caché de Apps Script) y en la siguiente apertura de la app.
- **Recuperar un código**: búscalo en la columna `codigo` por el nombre del paciente.
- **Imprimir la ficha** sin el teléfono de la familia: abre la app, entra con el código del paciente
  y usa "Ficha del Paciente".

## E. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| La app dice "modo local" | `VITE_API_URL` vacío en el build | Define la variable y vuelve a ejecutar el workflow |
| `ping` responde HTML de inicio de sesión | La implementación no es "Cualquier persona" | Corrige el acceso y crea nueva versión |
| Cambios en el script no se ven | La implementación apunta a una versión antigua | Nueva versión de la implementación |
| Guardar falla con "código no encontrado" | Se borró la fila o se editó la columna `codigo` | Restaura desde el historial de versiones de la planilla |
| Fotos no aparecen en la ficha | Celda `foto` vacía o truncada | Volver a subir la foto desde la app (se reduce automáticamente) |
| En iPhone el icono sale con esquinas negras | Falta `apple-touch-icon.png` opaco | `node scripts/build-icons.mjs` regenera los cuatro PNG |
| En iPhone se perdió el perfil tras días sin usar Safari | Safari borra el almacenamiento de sitios no visitados en 7 días (no aplica a la app instalada en inicio) | Entrar con el código de acceso; recomendar instalar en pantalla de inicio |
