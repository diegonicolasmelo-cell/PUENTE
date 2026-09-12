/** Estructura de la app: navegación móvil/escritorio, pantallas, modales, panel lateral y avisos. */
import { useState, useEffect } from "react";
import PuenteLogo from "./components/Logo.jsx";
import Icon from "./components/Icons.jsx";
import Toast from "./components/Toast.jsx";
import Modal from "./components/Modal.jsx";
import ProfileSidebar from "./components/ProfileSidebar.jsx";
import InstallBanner from "./components/InstallBanner.jsx";
import Home from "./screens/Home.jsx";
import Info from "./screens/Info.jsx";
import Journey from "./screens/Journey.jsx";
import Videos from "./screens/Videos.jsx";
import Faq from "./screens/Faq.jsx";
import Profile from "./screens/Profile.jsx";
import Family from "./screens/Family.jsx";
import Eol from "./screens/Eol.jsx";
import Post from "./screens/Post.jsx";
import Ficha from "./screens/Ficha.jsx";
import Mensajes from "./screens/Mensajes.jsx";
import { TEAM_ROLES } from "./data/defaults.js";
import { stageName, ESTADO_LABEL } from "./lib/journey.js";
import { patientNick, missingProfileFields } from "./lib/profile.js";

const TAB_LABELS = {
  home: "Inicio", journey: "El viaje UCI", faq: "Preguntas frecuentes", videos: "Videos informativos",
  profile: "Mi perfil", family: "Árbol familiar", info: "Información útil", eol: "Fin de vida",
  post: "¿Qué viene después?", ficha: "Ficha del Paciente", mensajes: "Mensajes con el equipo",
};

function toEmbedUrl(url) {
  if (!url) return "";
  const m = String(url).match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : "";
}

function SyncPill({ sync, mode }) {
  let cls = "", text = "Sincronizado";
  if (mode === "local") { cls = "local"; text = "Solo en este dispositivo"; }
  else if (!sync.online) { cls = "offline"; text = "Sin conexión"; }
  else if (sync.busy) { cls = "pending"; text = "Guardando…"; }
  else if (sync.pending) { cls = "pending"; text = "Pendiente de subir"; }
  return <span className={`sync-pill ${cls}`} title={text}><span className="sync-dot" />{text}</span>;
}

export default function Shell({ form, treeNodes, checklist, setChecklist, prefs, session, content, sync, mode, toast, showToast, onSaveProfile, onSyncNow, onLogout, onRespondRequest, onSendMessage, onReadMessages, onRefresh }) {
  const [activeTab, setActiveTab] = useState("home");
  const [modal, setModal] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => { const main = document.querySelector(".main-content"); if (main) main.scrollTo({ top: 0 }); }, [activeTab]);

  const firstName = form.famName.split(" ")[0] || "Familiar";
  const patFirst = form.patName.split(" ")[0] || "Paciente";
  const nick = patientNick(form);
  const missing = missingProfileFields(form);
  const config = session.servicio && session.servicio.nombre ? { ...content.config, nombre_unidad: session.servicio.nombre } : content.config;
  const activo = !session.estado || session.estado === "activo";
  const patientStatus = activo ? `● En UCI · ${stageName(session.etapa, content.etapas)}` : `○ ${ESTADO_LABEL[session.estado] || session.estado}`;
  const go = (tab) => setActiveTab(tab);
  const closeModal = () => setModal(null);

  const NavItem = ({ id, label, icon }) => (
    <button className={`dsk-nav-item ${activeTab === id ? "active" : ""}`} onClick={() => go(id)}>{icon} {label}</button>
  );

  return (
    <div className="app-root">
      <div className={`app-shell${prefs.darkMode ? " dark-mode" : ""}`}>
        <nav className="desktop-sidenav" aria-label="Navegación principal">
          <div className="dsk-brand">
            <PuenteLogo size={34} showText={true} />
            <div className="dsk-brand-sub" style={{ marginTop: 8 }}>Cuidado humanizado · Familia</div>
          </div>
          <div className="dsk-patient-pill">
            <div className="dsk-patient-avatar">{(treeNodes.find((n) => n.id === "pat") || {}).photo ? <img src={treeNodes.find((n) => n.id === "pat").photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} /> : (treeNodes.find((n) => n.id === "pat") || {}).emoji || "🙂"}</div>
            <div>
              <div className="dsk-patient-name">{form.patName || "Paciente"}</div>
              <div className={`dsk-patient-status${activo ? "" : " inactive"}`}>{patientStatus}</div>
            </div>
          </div>
          <div className="dsk-nav-list">
            <div className="dsk-nav-section-label">Principal</div>
            <NavItem id="home" label="Inicio" icon={<Icon.Home />} />
            <NavItem id="journey" label="El viaje UCI" icon={<Icon.Journey />} />
            <NavItem id="faq" label="Preguntas frecuentes" icon={<Icon.FAQ />} />
            <NavItem id="videos" label="Videos" icon={<Icon.Video />} />
            <button className={`dsk-nav-item ${activeTab === "mensajes" ? "active" : ""}`} onClick={() => go("mensajes")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              Mensajes {session.noLeidos > 0 && <span className="badge-count">{session.noLeidos}</span>}
            </button>
            <div className="dsk-nav-sep" />
            <div className="dsk-nav-section-label">Recursos</div>
            <NavItem id="info" label="Información útil" icon={<span style={{ fontSize: "1rem", width: 18, textAlign: "center" }}>ℹ️</span>} />
            <NavItem id="eol" label="Fin de vida" icon={<span style={{ fontSize: "1rem", width: 18, textAlign: "center" }}>🕊️</span>} />
            <NavItem id="post" label="¿Qué viene después?" icon={<span style={{ fontSize: "1rem", width: 18, textAlign: "center" }}>🏠</span>} />
            <div className="dsk-nav-sep" />
            <NavItem id="profile" label="Mi perfil" icon={<Icon.Profile />} />
            <div className="dsk-nav-sep" />
            <button className={`dsk-nav-item ${activeTab === "ficha" ? "active" : ""}`} onClick={() => go("ficha")}
              style={{ background: activeTab === "ficha" ? "rgba(0,119,182,0.2)" : "rgba(0,180,216,0.06)", border: activeTab === "ficha" ? "1px solid rgba(0,180,216,0.4)" : "1px solid rgba(0,180,216,0.15)" }}>
              <Icon.Print /> <span style={{ color: activeTab === "ficha" ? "#00B4D8" : "rgba(0,180,216,0.8)" }}>Ficha imprimible</span>
            </button>
          </div>
          <div className="dsk-nav-footer">
            <div className="dsk-user-row" role="button" tabIndex={0} onClick={() => setSidebarOpen(true)} onKeyDown={(e) => { if (e.key === "Enter") setSidebarOpen(true); }}>
              <div className="dsk-user-avatar">{firstName[0]}</div>
              <div>
                <div className="dsk-user-name">{form.famName || "Familiar"}</div>
                <div className="dsk-user-role">Familiar directo</div>
              </div>
              <button className="dsk-edit-btn">Editar</button>
            </div>
          </div>
        </nav>

        <div className="desktop-content">
          <nav className="topnav">
            <div className="nav-brand"><PuenteLogo size={30} showText={true} /></div>
            <SyncPill sync={sync} mode={mode} />
            <div className="nav-patient-tag">👤 {patFirst}</div>
            <div className="nav-avatar" role="button" tabIndex={0} onClick={() => setSidebarOpen(true)} onKeyDown={(e) => { if (e.key === "Enter") setSidebarOpen(true); }} title="Editar perfil" aria-label="Editar perfil">{firstName[0]}</div>
          </nav>

          <div className="dsk-topbar">
            <div className="dsk-topbar-title">{TAB_LABELS[activeTab] || "Puente UCI"}</div>
            <div className="dsk-topbar-right">
              <SyncPill sync={sync} mode={mode} />
              <span className="dsk-topbar-patient">👤 {patFirst} · {activo ? "En UCI" : ESTADO_LABEL[session.estado] || ""}</span>
              <div className="nav-avatar" role="button" tabIndex={0} onClick={() => setSidebarOpen(true)} style={{ cursor: "pointer" }} aria-label="Editar perfil">{firstName[0]}</div>
            </div>
          </div>

          <main className="main-content">
            {!sync.online && (
              <div className="app-banner" role="status">📴 Sin conexión. Puedes seguir usando la app; los cambios se subirán al reconectar.</div>
            )}
            {sync.online && mode === "local" && !bannerDismissed && (
              <div className="app-banner info" role="status">
                📱 Modo local: la información se guarda solo en este dispositivo. Cuando el equipo active el servidor, se subirá sola.
                <button onClick={() => setBannerDismissed(true)}>Entendido</button>
              </div>
            )}
            <InstallBanner />
            {sync.online && mode !== "local" && sync.pending && !sync.busy && (
              <div className="app-banner" role="status">
                🔄 Hay cambios sin subir{sync.lastError ? ` (${sync.lastError})` : ""}.
                <button onClick={onSyncNow}>Reintentar</button>
              </div>
            )}

            {activeTab === "home" && <Home form={form} etapa={session.etapa} estado={session.estado} cama={session.cama} config={config} firstName={firstName} missing={missing} solicitudes={session.solicitudes} mensajes={session.mensajes} noLeidos={session.noLeidos} mode={mode} onRespondRequest={onRespondRequest} onNavigate={go} onOpenSidebar={() => setSidebarOpen(true)} />}
            {activeTab === "info" && <Info patFirst={patFirst} config={config} checklist={checklist} setChecklist={setChecklist} solicitudes={session.solicitudes} onNavigate={go} onBack={() => go("home")} />}
            {activeTab === "mensajes" && <Mensajes mensajes={session.mensajes} famName={form.famName} config={config} mode={mode} onSend={onSendMessage} onRead={onReadMessages} onRefresh={onRefresh} onBack={() => go("home")} />}
            {activeTab === "journey" && <Journey etapa={session.etapa} steps={content.etapas} onOpenStep={(step) => setModal({ type: "journey-step", step })} onBack={() => go("home")} />}
            {activeTab === "videos" && <Videos videos={content.videos} onOpenVideo={(v) => setModal({ type: "video", v })} onBack={() => go("home")} />}
            {activeTab === "faq" && <Faq faq={content.faq} onBack={() => go("home")} />}
            {activeTab === "profile" && <Profile form={form} treeNodes={treeNodes} session={session} mode={mode} sync={sync} config={config} onOpenSidebar={() => setSidebarOpen(true)} onOpenModal={(k) => setModal({ type: k })} onNavigate={go} onLogout={onLogout} onSyncNow={onSyncNow} showToast={showToast} />}
            {activeTab === "family" && <Family key={session.updatedAt || "family"} treeNodes={treeNodes} patNick={nick} showToast={showToast} saving={sync.busy} onSave={async (draft) => { await onSaveProfile(null, null, draft); go("profile"); }} onBack={() => go("profile")} />}
            {activeTab === "eol" && <Eol onBack={() => go("home")} />}
            {activeTab === "post" && <Post onBack={() => go("home")} />}
            {activeTab === "ficha" && <Ficha form={form} treeNodes={treeNodes} patFirst={patFirst} config={config} onBack={() => go("home")} />}
          </main>

          <nav className="bottom-nav" aria-label="Navegación">
            <div className="nav-tabs">
              {[
                { id: "home", label: "Inicio", I: Icon.Home },
                { id: "journey", label: "Mi camino", I: Icon.Journey },
                { id: "faq", label: "Preguntas", I: Icon.FAQ },
                { id: "videos", label: "Videos", I: Icon.Video },
                { id: "profile", label: "Perfil", I: Icon.Profile },
              ].map((t) => (
                <button key={t.id} className={`nav-tab ${activeTab === t.id ? "active" : ""}`} aria-current={activeTab === t.id ? "page" : undefined} onClick={() => go(t.id)}>
                  <t.I />{t.label}
                </button>
              ))}
            </div>
          </nav>
        </div>

        {modal && (
          <Modal onClose={closeModal}>
            {modal.type === "journey-step" && (
              <>
                <div className="modal-title">{modal.step.label}</div>
                <p style={{ fontSize: "0.8rem", color: "var(--teal)", marginBottom: 12, fontWeight: 600 }}>{modal.step.state === "current" ? "Aquí estamos hoy" : modal.step.sub}</p>
                <div className="modal-body">{modal.step.desc}</div>
                <div style={{ marginTop: 20, padding: 14, background: "var(--light)", borderRadius: 14, fontSize: "0.8rem", color: "var(--slate)", lineHeight: 1.6 }}>
                  💙 Cada etapa es diferente. Tu familiar puede estar en cualquiera de estos momentos, y el equipo adapta el cuidado a su necesidad específica del día.
                </div>
              </>
            )}
            {modal.type === "video" && (
              <>
                <div style={{ fontSize: "3rem", textAlign: "center", marginBottom: 12 }}>{modal.v.emoji}</div>
                <div className="modal-title">{modal.v.title}</div>
                <p style={{ fontSize: "0.8rem", color: "var(--slate)", marginBottom: 16 }}>{modal.v.desc} · {modal.v.dur} min</p>
                {toEmbedUrl(modal.v.url) ? (
                  <div className="video-embed"><iframe src={toEmbedUrl(modal.v.url)} title={modal.v.title} allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen loading="lazy" /></div>
                ) : modal.v.url ? (
                  <a className="ob-btn" style={{ display: "block", textAlign: "center", textDecoration: "none", marginBottom: 12 }} href={modal.v.url} target="_blank" rel="noopener noreferrer">▶️ Ver video</a>
                ) : (
                  <div style={{ background: "#F0F9FF", borderRadius: 16, padding: 24, textAlign: "center", marginBottom: 16 }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>▶️</div>
                    <p style={{ fontSize: "0.85rem", color: "var(--slate)" }}>Esta cápsula estará disponible próximamente.</p>
                  </div>
                )}
                <div className="modal-body">Mientras tanto, puedes preguntar directamente al equipo de enfermería o al médico tratante sobre este tema.</div>
              </>
            )}
            {modal.type === "psych" && (
              <>
                <div className="modal-title">🧠 Apoyo para cuidadores</div>
                <div className="modal-body">
                  <p style={{ marginBottom: 16 }}>Cuidar a un familiar en UCI es emocionalmente agotador. Es normal sentir miedo, tristeza, frustración o culpa. Aquí hay recursos para ti:</p>
                  {["Psicólogo/a del equipo UCI · Solicitar a enfermería", config.grupo_apoyo, config.linea_escucha].filter(Boolean).map((r) => (
                    <div key={r} style={{ padding: "12px 14px", background: "var(--light)", borderRadius: 12, marginBottom: 8, fontSize: "0.85rem", color: "var(--text)", lineHeight: 1.5 }}>💙 {r}</div>
                  ))}
                </div>
              </>
            )}
            {modal.type === "team" && (
              <>
                <div className="modal-title">👨‍⚕️ El equipo UCI</div>
                <div className="modal-body">
                  {TEAM_ROLES.map(({ r, d }) => (
                    <div key={r} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                      <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>🏥</span>
                      <div><strong style={{ fontSize: "0.875rem", color: "var(--text)" }}>{r}</strong><p style={{ fontSize: "0.78rem", color: "var(--slate)", marginTop: 2, lineHeight: 1.5 }}>{d}</p></div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Modal>
        )}

        <Toast message={toast} />

        {sidebarOpen && (
          <ProfileSidebar form={form} prefs={prefs} patNick={nick} saving={sync.busy}
            onSave={async (draftForm, draftPrefs) => { setSidebarOpen(false); await onSaveProfile(draftForm, draftPrefs, null); }}
            onClose={() => setSidebarOpen(false)} />
        )}
      </div>
    </div>
  );
}
