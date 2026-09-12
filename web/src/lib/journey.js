import { JOURNEY_STEPS, STAGE_SHORT } from "../data/defaults.js";

/** Normaliza la etapa (1–4) que envía el backend. */
export function normalizeStage(value, fallback = 1) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n >= 1 && n <= 4 ? n : fallback;
}

/** Devuelve las etapas con estado done/current/future según la etapa actual. */
export function stagesWithState(etapa, steps = JOURNEY_STEPS) {
  const cur = normalizeStage(etapa);
  return steps.map((s, i) => ({ ...s, state: i + 1 < cur ? "done" : i + 1 === cur ? "current" : "future" }));
}

export function stageName(etapa, steps = JOURNEY_STEPS) {
  const cur = normalizeStage(etapa);
  return (steps[cur - 1] && steps[cur - 1].label) || STAGE_SHORT[cur - 1] || "";
}

export function stageShort(etapa) {
  return STAGE_SHORT[normalizeStage(etapa) - 1];
}

export const ESTADO_LABEL = { activo: "En UCI", alta: "Alta de UCI", fallecido: "Fallecido/a", archivado: "Archivado" };
