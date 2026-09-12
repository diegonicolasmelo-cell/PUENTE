import React from "react";
import { createRoot } from "react-dom/client";
import EquipoApp from "./EquipoApp.jsx";
import { isGasHost } from "../lib/api.js";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <EquipoApp />
  </React.StrictMode>
);

if (import.meta.env.PROD && "serviceWorker" in navigator && !isGasHost() && window.top === window.self) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(import.meta.env.BASE_URL + "sw.js").catch(() => {});
  });
}
