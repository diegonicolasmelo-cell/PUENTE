/**
 * Aviso de instalación de la PWA.
 *  - iPhone/iPad: Safari no ofrece un botón; se explica Compartir → "Añadir a pantalla de inicio".
 *  - Android/Chrome: se captura beforeinstallprompt y se ofrece un botón "Instalar".
 * No se muestra si la app ya corre instalada, dentro del envoltorio de Apps Script, ni tras descartarlo.
 */
import { useEffect, useState } from "react";
import { KEYS, loadJSON, saveJSON } from "../lib/storage.js";
import { isGasHost } from "../lib/api.js";

export function isIos() {
  const ua = navigator.userAgent || "";
  return /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}
export function isStandalone() {
  return window.navigator.standalone === true || (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);
}

export default function InstallBanner() {
  const [dismissed, setDismissed] = useState(() => !!loadJSON(KEYS.installHint, false));
  const [promptEvent, setPromptEvent] = useState(null);
  const [installed, setInstalled] = useState(() => isStandalone());

  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setPromptEvent(e); };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  if (dismissed || installed || isGasHost() || window.top !== window.self) return null;
  const dismiss = () => { saveJSON(KEYS.installHint, true); setDismissed(true); };
  const ios = isIos();
  if (!ios && !promptEvent) return null;

  return (
    <div className="app-banner info install-banner" role="status">
      <span className="install-icon">📲</span>
      <span>
        {ios
          ? <>Para tener Puente UCI en tu iPhone: toca <strong>Compartir</strong> (el cuadrado con la flecha) y luego <strong>"Añadir a pantalla de inicio"</strong>.</>
          : <>Instala Puente UCI en tu teléfono para abrirla como una app, incluso sin señal.</>}
      </span>
      <span className="install-actions">
        {!ios && promptEvent && (
          <button className="primary" onClick={async () => { promptEvent.prompt(); const r = await promptEvent.userChoice.catch(() => null); if (r && r.outcome === "accepted") setInstalled(true); setPromptEvent(null); }}>Instalar</button>
        )}
        <button onClick={dismiss}>Ahora no</button>
      </span>
    </div>
  );
}
