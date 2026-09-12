import { useState } from "react";
import FamilyTree from "../components/FamilyTree.jsx";

/** Edición del árbol familiar después del onboarding. Trabaja sobre un borrador; aplica al guardar. */
export default function Family({ treeNodes, patNick, showToast, saving, onSave, onBack }) {
  const [draft, setDraft] = useState(() => treeNodes.map((n) => ({ ...n })));
  return (
    <div className="screen" style={{ background: "var(--ocean)", minHeight: "100%" }}>
      <div className="screen-header" style={{ paddingBottom: 12 }}>
        <button className="back-btn" onClick={onBack}>← Perfil</button>
        <h1>Árbol familiar</h1>
        <p>Quiénes acompañan a {patNick}</p>
      </div>
      <div style={{ padding: "8px 16px 24px", maxWidth: 520, margin: "0 auto" }}>
        <FamilyTree treeNodes={draft} setTreeNodes={setDraft} patNick={patNick} showToast={showToast} />
        <button className="ob-btn" disabled={saving} onClick={() => onSave(draft)}>{saving ? "Guardando…" : "Guardar cambios ✓"}</button>
        <button className="ob-btn-ghost" onClick={onBack}>← Volver sin guardar</button>
      </div>
    </div>
  );
}
