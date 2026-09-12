import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { isGasHost } from "./lib/api.js";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// El service worker solo tiene sentido fuera del iframe de Apps Script y en producción.
if (import.meta.env.PROD && "serviceWorker" in navigator && !isGasHost() && window.top === window.self) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(import.meta.env.BASE_URL + "sw.js").catch(() => { /* sin SW la app sigue funcionando */ });
  });
}
