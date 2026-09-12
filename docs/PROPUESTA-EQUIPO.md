# Propuesta: perfil del profesional e interacción familia ↔ equipo

> Complementa `DISENO.md`. Mockup navegable en el lienzo de diseño (enlace en la conversación) y
> fuentes del mockup en `docs/propuesta-equipo/`.
>
> **Estado: implementada en modo de prueba** (12 sep 2026). Decisiones tomadas: sin Google Workspace,
> acceso del equipo por clave de servicio (demo); la familia se registra con el QR del servicio; lista de
> insumos propuesta; mensajes abiertos para evaluar en las pruebas. Lo que sigue vigente de este
> documento es el diseño; la operación está en `DESPLIEGUE.md` (secciones A.5b y B2).

## 1. Qué se agrega y por qué

Hoy la app cubre solo un sentido: la familia entrega información y el equipo la lee en la planilla.
Esta propuesta cierra el ciclo con tres piezas:

1. **Perfil del profesional**: quién es, qué rol tiene y a qué servicio pertenece.
2. **Panel del servicio**: todos los pacientes activos de *ese* servicio (no de todo el hospital),
   con lo que el equipo necesita para el día: etapa, familiar de contacto, pedidos pendientes,
   útiles traídos, última actividad de la familia.
3. **Interacción familia ↔ equipo**: el equipo pide insumos (pañales, pantuflas, pijama...) y la
   familia responde con un toque; la familia hace consultas no urgentes y el equipo responde.
   Además, el equipo cambia la etapa desde el panel, sin tocar la planilla.

## 2. Acceso del profesional (sin contraseñas propias)

| Situación del hospital | Cómo entra el profesional | Qué hay que hacer |
|---|---|---|
| Tiene Google Workspace (correo institucional en Google) | Abre la URL del panel y Google lo reconoce | Segunda implementación del mismo Apps Script, acceso "Cualquier usuario de <dominio>", ejecutar como el dueño. `Session.getActiveUser()` entrega el correo. |
| No tiene Workspace | Abre la URL y entra con cualquier cuenta Google | Implementación "Cualquier usuario con cuenta Google", ejecutar como **el usuario que accede**. La planilla se comparte con cada profesional como editor. |

En ambos casos el correo se busca en la hoja **Profesionales**. Si no está, el panel muestra
"Tu cuenta no está registrada en ningún servicio; pide al administrador que te agregue". La app de la
familia sigue con su implementación actual ("Cualquier persona" + código de acceso); son dos URL
del mismo proyecto.

## 3. Modelo de datos (hojas nuevas y cambios)

| Hoja | Columnas | Notas |
|---|---|---|
| **Servicios** (nueva) | id, nombre, piso, telefono, horario_visitas, hora_informe, activo | La hoja `Config` pasa a ser el valor por defecto; cada servicio puede sobrescribir horario, sala y teléfono. |
| **Profesionales** (nueva) | email, nombre, rol, servicio_id, turno, es_admin, activo, creado | Rol: Enfermero/a, TENS, Médico/a, Kinesiólogo/a, Psicólogo/a, Trabajador/a social. |
| **Pacientes** (cambia) | + servicio_id, cama, ingreso, registrado_por | Se asigna al registrar o al leer el código QR del servicio. |
| **Solicitudes** (nueva) | id, paciente_id, servicio_id, tipo, texto, nota, prioridad, estado, creado_por, creado_en, respondido_en, recibido_por, recibido_en | tipo: insumo \| recordatorio. estado: pendiente → en_camino \| no_puede → recibido. |
| **Mensajes** (nueva) | id, paciente_id, origen (familia \| equipo), autor, texto, creado_en, leido_en | Canal no urgente; el aviso se muestra en pantalla. |
| **Log** (existe) | + actor (correo o "familia") | Auditoría de quién pidió, cambió etapa o respondió. |

## 4. Cómo llega un paciente a un servicio

- **Registro por el equipo (recomendado)**: desde el panel, "Registrar paciente": nombre, cama,
  servicio (el del profesional). Se genera el código de acceso y se entrega a la familia (impreso,
  o por WhatsApp desde el mismo panel). La familia entra con "Ya tengo un código" y completa el
  perfil. El equipo controla quién existe; no hay perfiles fantasma.
- **Autorregistro con QR del servicio**: cada unidad imprime su QR con `?s=UCIA`. El perfil nace
  con ese servicio. Si alguien entra sin QR, queda en "Sin servicio" y un profesional lo adopta desde
  el panel.

## 5. API (acciones nuevas en `Code.gs`)

Todas exigen un profesional válido; el servidor toma el `servicio_id` de la hoja Profesionales y
rechaza cualquier paciente de otro servicio.

| action | Quién | Qué hace |
|---|---|---|
| `staffMe` | equipo | Devuelve perfil del profesional y servicio, o `not_registered`. |
| `staffUpdateMe` | equipo | Nombre, rol, turno, preferencia de resumen por correo. |
| `staffBoard` | equipo | Pacientes activos del servicio con resumen (etapa, pendientes, útiles, última actividad). |
| `staffPatient` | equipo | Perfil completo + familia + solicitudes + mensajes de un paciente. |
| `staffRegisterPatient` | equipo | Crea paciente con cama y servicio; devuelve código. |
| `staffSetStage` | equipo | Cambia etapa y estado; registra en Log. |
| `createRequest` / `updateRequest` | equipo | Nueva solicitud; marcar recibido. |
| `respondRequest` | familia | "Ya lo llevo" / "No puedo hoy" (con el código de acceso). |
| `sendMessage` / `listMessages` | ambos | Hilo por paciente. |
| `getProfile` (existe) | familia | Ahora incluye solicitudes y mensajes no leídos. |

## 6. Avisos sin infraestructura de push

- La familia ve los avisos al abrir la app (y la app se refresca sola al volver al primer plano).
- Botón **Enviar y avisar por WhatsApp** en el panel: abre `wa.me/<número>?text=...` con el texto
  del pedido; el profesional confirma el envío desde su propio WhatsApp. Cero configuración.
- **Resumen por correo al inicio del turno** para el profesional (disparador diario de Apps Script,
  `MailApp`): solicitudes pendientes y mensajes sin responder del servicio.
- Push real (iOS/Android) queda como fase posterior; requiere un servicio intermedio.

## 7. Reglas de negocio y privacidad

- El panel muestra información de humanización y logística, **nunca datos clínicos**. Los mensajes
  llevan el aviso "No es un canal de urgencias" en ambos lados.
- Toda acción del equipo queda en `Log` con el correo del profesional.
- Al pasar un paciente a `alta`, `fallecido` o `archivado`, desaparece del tablero y las solicitudes
  abiertas se cierran; la familia conserva acceso de lectura por 30 días (propuesta).
- Un familiar solo ve y responde lo de su paciente (código de acceso, como hoy).

## 8. Fases sugeridas

1. **Base** (1 sprint): hojas Servicios/Profesionales, acceso del profesional, `staffBoard`,
   tablero con tarjetas y filtros, registro de paciente y cambio de etapa.
2. **Solicitudes** (1 sprint): composer con chips, estados, vista de la familia con respuesta,
   cruce con la lista de útiles, botón WhatsApp.
3. **Mensajes y resumen por correo** (1 sprint): hilo por paciente, badges, disparador diario.
4. **Después**: QR por servicio, push, métricas del servicio (tiempo de respuesta, pedidos por semana).

## 9. Decisiones tomadas (12 sep 2026)

1. **Sin Workspace → modo demo**: clave de acceso por servicio (`Servicios.clave_acceso`) + nombre y rol.
   El backend emite un token por profesional (`Profesionales.token`) que firma cada acción y queda en Log.
   Cuando exista cuenta institucional, solo cambia `requireStaff_` en `Staff.gs`.
2. **Registro por la familia con QR del servicio** (`?s=<id>`); el registro por el equipo queda disponible como
   respaldo. Los perfiles sin servicio aparecen en el tablero para asignarlos con un clic.
3. **Insumos**: la lista propuesta, editable en `web/src/equipo/api.js` (`INSUMOS`).
4. **Mensajes libres** activos en ambos sentidos, con aviso de "no es un canal de urgencias"; se evalúan en las pruebas.

## 9 bis. Decisiones originales planteadas

1. ¿El hospital usa Google Workspace (correo institucional en Google)? Define la vía de acceso.
2. ¿Quién registra al paciente: el equipo (recomendado) o la familia con QR?
3. Lista definitiva de insumos rápidos para los chips (propuestos: pañales, pantuflas, pijama de
   2 piezas, útiles de aseo, crema corporal, ropa limpia, documentos).
4. ¿Los mensajes libres van en la fase 1 o solo las solicitudes con opciones cerradas? Los mensajes
   libres exigen alguien que los responda dentro de un plazo; conviene acordarlo con la jefatura.
