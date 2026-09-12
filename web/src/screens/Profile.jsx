import { readableHobbies } from "../lib/profile.js";

const MODE_TEXT = { gas: "Conectado (Google)", remote: "Conectado", local: "Solo en este dispositivo" };

export default function Profile({ form, treeNodes, session, mode, sync, config, onOpenSidebar, onOpenModal, onNavigate, onLogout, onSyncNow, showToast }) {
  const pat = treeNodes.find((n) => n.id === "pat");
  const hobbies = readableHobbies(form).slice(0, 3);
  const copyCode = () => {
    if (!session.code) return;
    if (navigator.clipboard) navigator.clipboard.writeText(session.code).then(() => showToast("📋 Código copiado")).catch(() => showToast(session.code));
    else showToast(session.code);
  };
  const Item = ({ icon, title, sub, onClick, danger, right = "›" }) => (
    <div className="profile-item" role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => { if (e.key === "Enter") onClick(); }}>
      <div className="profile-item-left">
        <div className="profile-item-icon">{icon}</div>
        <div><h4 style={danger ? { color: "#EF4444" } : undefined}>{title}</h4>{sub && <p>{sub}</p>}</div>
      </div>
      {right && <span className="profile-item-arrow">{right}</span>}
    </div>
  );
  return (
    <div className="screen">
      <div className="profile-header">
        <div className="profile-avatar">👤</div>
        <h2>{form.famName || "Mi perfil"}</h2>
        <p>Familiar directo</p>
      </div>
      <div className="profile-patient-card">
        <div className="patient-header">
          <div className="patient-avatar" style={pat && pat.photo ? { overflow: "hidden", padding: 0 } : undefined}>
            {pat && pat.photo ? <img src={pat.photo} alt={form.patName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} /> : (pat && pat.emoji) || "🙂"}
          </div>
          <div className="patient-info">
            <h3>{form.patName || "Paciente"}</h3>
            <p>{form.patJob || config.nombre_unidad}</p>
          </div>
        </div>
        <div className="patient-tags">
          {form.patNick && <span className="patient-tag tag-blue">"{form.patNick}"</span>}
          {form.education && <span className="patient-tag tag-green">{form.education}</span>}
          {hobbies.map((h) => <span key={h} className="patient-tag tag-purple">{h}</span>)}
        </div>
      </div>

      <div className="profile-section">
        <div className="profile-section-title">Acceso y sincronización</div>
        <Item icon="🔑" title="Código de acceso" right={session.code ? "Copiar" : null}
          sub={session.code ? <span className="profile-code-value">{session.code}</span> : (mode === "local" ? "Sin servidor configurado" : "Se generará al sincronizar")}
          onClick={copyCode} />
        <Item icon={sync.online ? (sync.pending ? "🔄" : "☁️") : "📴"} title="Estado"
          sub={!sync.online ? "Sin conexión: los cambios se guardan en el dispositivo" : sync.pending ? "Cambios pendientes de subir" : MODE_TEXT[mode]}
          right={sync.pending && mode !== "local" ? "Sincronizar" : null}
          onClick={() => { if (sync.pending && mode !== "local") onSyncNow(); }} />
      </div>

      <div className="profile-section">
        <div className="profile-section-title">Mi información</div>
        <Item icon="✏️" title="Editar perfil" sub="Datos del paciente, gustos, vivienda y mensaje" onClick={onOpenSidebar} />
        <Item icon="👨‍👩‍👧" title="Árbol familiar" sub="Fotos, nombres y vínculos" onClick={() => onNavigate("family")} />
        <Item icon="📱" title="Teléfono" sub={form.famPhone || "No registrado"} onClick={onOpenSidebar} />
        <Item icon="🌐" title="Idioma" sub="Español" onClick={() => showToast("📋 Más idiomas próximamente")} />
      </div>

      <div className="profile-section">
        <div className="profile-section-title">Ayuda y recursos</div>
        <Item icon="🧠" title="Apoyo psicológico" sub="Recursos para cuidadores" onClick={() => onOpenModal("psych")} />
        <Item icon="👨‍⚕️" title="El equipo UCI" sub="Roles y funciones del equipo" onClick={() => onOpenModal("team")} />
        <Item icon="📞" title="Contacto UCI" sub={config.telefono_uci ? `${config.telefono_uci} · Línea directa de enfermería` : "Línea directa de enfermería"}
          onClick={() => { if (config.telefono_uci) window.location.href = `tel:${config.telefono_uci.replace(/\s+/g, "")}`; }} />
      </div>

      <div className="profile-section">
        <div className="profile-section-title">Sesión</div>
        <Item icon="🚪" title="Cerrar sesión" sub="Borra los datos guardados en este dispositivo" danger right={null}
          onClick={() => { if (window.confirm(session.code ? `¿Seguro que quieres salir? Necesitarás el código ${session.code} para volver a entrar.` : "¿Seguro que quieres salir? Se borrarán los datos de este dispositivo.")) onLogout(); }} />
      </div>
    </div>
  );
}
