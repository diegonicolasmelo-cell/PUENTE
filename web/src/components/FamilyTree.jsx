/**
 * Árbol familiar editable (onboarding paso 3 y pantalla "Familia").
 * Diseñado para fondo oscuro (usa los estilos .tree-* y .field-* del onboarding).
 * Cambios respecto al prototipo: el paciente puede tener foto/avatar propio, el vínculo "Otro"
 * muestra el texto personalizado y las fotos se reducen antes de guardarse.
 */
import { useRef, useState } from "react";
import { CATALOG } from "../data/defaults.js";
import { fileToResizedDataUrl } from "../lib/image.js";
import { displayRole } from "../lib/profile.js";

const GEN_LABELS = { 0: "Generación anterior", 2: "Hijos / generación siguiente" };

function NodeBubble({ node, patNick, isEditing, onClick }) {
  const isPatient = node.id === "pat";
  const hasPhoto = !!node.photo;
  const isEmpty = !node.label && !node.role && !isPatient;
  return (
    <div
      role="button" tabIndex={0}
      aria-label={isPatient ? `Editar avatar de ${patNick}` : `Editar ${node.label || displayRole(node) || "familiar"}`}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", minWidth: 72, maxWidth: 84, WebkitTapHighlightColor: "transparent" }}
    >
      <div style={{
        width: isPatient ? 76 : 64, height: isPatient ? 76 : 64, borderRadius: "50%",
        background: hasPhoto ? "none" : isPatient ? "rgba(0,180,216,0.25)" : isEmpty ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.12)",
        border: isEditing ? "3px solid #00B4D8" : isPatient ? "3px solid #00B4D8" : isEmpty ? "2px dashed rgba(255,255,255,0.2)" : "2px solid rgba(255,255,255,0.25)",
        boxShadow: isPatient ? "0 0 0 6px rgba(0,180,216,0.15)" : isEditing ? "0 0 0 4px rgba(0,180,216,0.2)" : "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: isPatient ? "2rem" : "1.5rem", overflow: "hidden", transition: "all 0.2s", position: "relative",
      }}>
        {hasPhoto
          ? <img src={node.photo} alt={node.label || patNick} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
          : <span>{isEmpty ? "+" : node.emoji}</span>}
        <div style={{
          position: "absolute", bottom: 0, right: 0, width: 20, height: 20, borderRadius: "50%",
          background: isEmpty ? "rgba(255,255,255,0.15)" : "#0077B6",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", border: "1.5px solid rgba(255,255,255,0.4)",
        }}>✏️</div>
      </div>
      <div style={{ fontSize: "0.68rem", fontWeight: 600, color: isEmpty ? "rgba(255,255,255,0.35)" : "white", textAlign: "center", lineHeight: 1.2, maxWidth: 80, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {isPatient ? patNick : (node.label || (isEmpty ? "Agregar" : "—"))}
      </div>
      <div style={{ fontSize: "0.62rem", color: isPatient ? "#00B4D8" : "rgba(144,224,239,0.75)", textAlign: "center", marginTop: -2 }}>
        {isPatient ? "⭐ Paciente" : displayRole(node)}
      </div>
    </div>
  );
}

const LineV = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}>
    <div style={{ width: 2, height: 24, background: "rgba(255,255,255,0.2)", borderRadius: 1 }} />
  </div>
);

function PhotoPicker({ value, emoji, onPick, onClear }) {
  const inputRef = useRef(null);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { onPick(e.target.files && e.target.files[0]); e.target.value = ""; }} />
      <div role="button" tabIndex={0} aria-label="Subir foto" onClick={() => inputRef.current && inputRef.current.click()}
        onKeyDown={(e) => { if (e.key === "Enter") inputRef.current && inputRef.current.click(); }}
        style={{ width: 60, height: 60, borderRadius: "50%", overflow: "hidden", background: "rgba(255,255,255,0.08)", border: "2px dashed rgba(0,180,216,0.5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
        {value ? <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "1.4rem" }}>{emoji}</span>}
      </div>
      <div>
        <button type="button" onClick={() => inputRef.current && inputRef.current.click()} style={{ background: "rgba(0,180,216,0.15)", border: "1px solid rgba(0,180,216,0.35)", borderRadius: 10, padding: "7px 14px", color: "#00B4D8", fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", cursor: "pointer", display: "block", marginBottom: 6 }}>📷 Subir foto</button>
        {value && (
          <button type="button" onClick={onClear} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "5px 14px", color: "#FCA5A5", fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", cursor: "pointer" }}>✕ Quitar foto</button>
        )}
      </div>
    </div>
  );
}

function EmojiRow({ list, value, onChange }) {
  return (
    <div className="tree-emoji-row">
      {list.map((e) => (
        <button type="button" key={e} className={`tree-emoji-btn ${value === e ? "sel" : ""}`} aria-label={`Avatar ${e}`} onClick={() => onChange(e)}>{e}</button>
      ))}
    </div>
  );
}

export default function FamilyTree({ treeNodes, setTreeNodes, patNick, showToast }) {
  const [editingNode, setEditingNode] = useState(null);
  const [editBuf, setEditBuf] = useState({ label: "", role: "", roleCustom: "", emoji: "", photo: null });
  const [addingNode, setAddingNode] = useState(false);
  const [newNodeBuf, setNewNodeBuf] = useState({ label: "", role: "", roleCustom: "", gen: 1, emoji: "🧑", photo: null });

  const gens = [0, 1, 2].map((g) => treeNodes.filter((n) => n.gen === g));
  const editing = treeNodes.find((n) => n.id === editingNode);
  const isPatientEdit = editingNode === "pat";

  const openEditNode = (node) => {
    setAddingNode(false);
    setEditingNode(node.id);
    setEditBuf({ label: node.label, role: node.role, roleCustom: node.roleCustom || "", emoji: node.emoji, photo: node.photo });
  };
  const saveEditNode = () => {
    setTreeNodes((ns) => ns.map((n) => (n.id === editingNode ? { ...n, ...editBuf } : n)));
    setEditingNode(null);
  };
  const removeNode = (id) => {
    setTreeNodes((ns) => ns.filter((n) => n.id !== id));
    setEditingNode(null);
  };
  const addNode = () => {
    if (!newNodeBuf.label && !newNodeBuf.role) { showToast && showToast("⚠️ Escribe un nombre o elige un vínculo"); return; }
    const id = "custom_" + Date.now();
    setTreeNodes((ns) => [...ns, { id, fixed: false, col: 0, ...newNodeBuf }]);
    setNewNodeBuf({ label: "", role: "", roleCustom: "", gen: 1, emoji: "🧑", photo: null });
    setAddingNode(false);
  };
  const pickPhoto = async (file, setter) => {
    if (!file) return;
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      setter((b) => ({ ...b, photo: dataUrl }));
    } catch (e) {
      showToast && showToast("⚠️ No se pudo cargar la foto");
    }
  };

  const Row = ({ nodes, title }) => (
    <div style={{ marginBottom: 4 }}>
      {title && <div style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", textAlign: "center", marginBottom: 8 }}>{title}</div>}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
        {nodes.map((node) => (
          <NodeBubble key={node.id} node={node} patNick={patNick} isEditing={editingNode === node.id}
            onClick={() => (editingNode === node.id ? setEditingNode(null) : openEditNode(node))} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="ob-card" style={{ padding: "20px 12px" }}>
      <h2 style={{ marginBottom: 4, fontSize: "1.2rem" }}>Árbol familiar</h2>
      <p style={{ marginBottom: 20, fontSize: "0.8rem" }}>Toca cada persona para agregar foto, nombre y vínculo. Toca a {patNick} para ponerle su foto.</p>

      {gens[0].length > 0 && (<><Row nodes={gens[0]} title={GEN_LABELS[0]} /><LineV /></>)}
      <Row nodes={gens[1]} title={`${patNick} y su generación`} />
      {gens[2].length > 0 && (<><LineV /><Row nodes={gens[2]} title={GEN_LABELS[2]} /></>)}

      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        <button type="button" onClick={() => { setEditingNode(null); setAddingNode((v) => !v); }} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,180,216,0.12)", border: "1.5px dashed rgba(0,180,216,0.4)", borderRadius: 12, padding: "8px 20px", cursor: "pointer", color: "#00B4D8", fontSize: "0.82rem", fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
          ＋ Agregar familiar
        </button>
      </div>

      {editing && (
        <div className="tree-edit-panel" style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: "1rem", marginBottom: 14 }}>✏️ {isPatientEdit ? `Avatar de ${patNick}` : `Editar: ${displayRole(editing) || "Familiar"}`}</h3>
          <PhotoPicker value={editBuf.photo} emoji={editBuf.emoji} onPick={(f) => pickPhoto(f, setEditBuf)} onClear={() => setEditBuf((b) => ({ ...b, photo: null }))} />
          {!editBuf.photo && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: "0.68rem", color: "rgba(144,224,239,0.6)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>O elige un avatar</div>
              <EmojiRow list={isPatientEdit ? CATALOG.patientEmojis : CATALOG.emojis} value={editBuf.emoji} onChange={(e) => setEditBuf((b) => ({ ...b, emoji: e }))} />
            </div>
          )}
          {!isPatientEdit && (
            <>
              <div className="field-group">
                <label className="field-label" htmlFor="tree-edit-name">Nombre</label>
                <input id="tree-edit-name" className="field-input" placeholder="Ej: Carlos, María..." value={editBuf.label}
                  onChange={(e) => setEditBuf((b) => ({ ...b, label: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter") saveEditNode(); }} />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="tree-edit-role">Vínculo con {patNick}</label>
                <select id="tree-edit-role" className="field-select" value={editBuf.role} onChange={(e) => setEditBuf((b) => ({ ...b, role: e.target.value }))}>
                  <option value="">Selecciona el vínculo...</option>
                  {CATALOG.vinculos.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
                {editBuf.role === "Otro" && (
                  <input className="field-input" style={{ marginTop: 8 }} placeholder="Especifica el vínculo..." value={editBuf.roleCustom || ""}
                    onChange={(e) => setEditBuf((b) => ({ ...b, roleCustom: e.target.value }))} />
                )}
              </div>
            </>
          )}
          <div className="tree-btn-row">
            <button type="button" className="tree-save-btn" onClick={saveEditNode}>Guardar ✓</button>
            <button type="button" className="tree-cancel-btn" onClick={() => setEditingNode(null)}>Cancelar</button>
            {!editing.fixed && <button type="button" className="tree-del-btn" aria-label="Eliminar familiar" onClick={() => removeNode(editingNode)}>🗑</button>}
          </div>
        </div>
      )}

      {addingNode && (
        <div className="tree-edit-panel" style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: "1rem", marginBottom: 14 }}>➕ Agregar familiar</h3>
          <PhotoPicker value={newNodeBuf.photo} emoji={newNodeBuf.emoji} onPick={(f) => pickPhoto(f, setNewNodeBuf)} onClear={() => setNewNodeBuf((b) => ({ ...b, photo: null }))} />
          {!newNodeBuf.photo && <div style={{ marginBottom: 12 }}><EmojiRow list={CATALOG.emojis} value={newNodeBuf.emoji} onChange={(e) => setNewNodeBuf((b) => ({ ...b, emoji: e }))} /></div>}
          <div className="field-group">
            <label className="field-label" htmlFor="tree-new-name">Nombre</label>
            <input id="tree-new-name" className="field-input" placeholder="Ej: Ana, José..." value={newNodeBuf.label} onChange={(e) => setNewNodeBuf((b) => ({ ...b, label: e.target.value }))} />
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="tree-new-role">Vínculo con {patNick}</label>
            <select id="tree-new-role" className="field-select" value={newNodeBuf.role} onChange={(e) => setNewNodeBuf((b) => ({ ...b, role: e.target.value }))}>
              <option value="">Selecciona el vínculo...</option>
              {CATALOG.vinculos.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            {newNodeBuf.role === "Otro" && (
              <input className="field-input" style={{ marginTop: 8 }} placeholder="Especifica el vínculo..." value={newNodeBuf.roleCustom || ""}
                onChange={(e) => setNewNodeBuf((b) => ({ ...b, roleCustom: e.target.value }))} />
            )}
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="tree-new-gen">Generación</label>
            <select id="tree-new-gen" className="field-select" value={newNodeBuf.gen} onChange={(e) => setNewNodeBuf((b) => ({ ...b, gen: Number(e.target.value) }))}>
              <option value={0}>Generación anterior (padres, abuelos...)</option>
              <option value={1}>Su generación (hermanos, pareja...)</option>
              <option value={2}>Hijos / generación siguiente</option>
            </select>
          </div>
          <div className="tree-btn-row">
            <button type="button" className="tree-save-btn" onClick={addNode}>Agregar ✓</button>
            <button type="button" className="tree-cancel-btn" onClick={() => setAddingNode(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
