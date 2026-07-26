export type WatermarkPresetId = "suave" | "equilibrado" | "intenso";

export const watermarkPresets = {
  suave: { label: "Suave", opacity: 0.07, spacing: 150, contrast: "Bajo" },
  equilibrado: { label: "Equilibrado", opacity: 0.12, spacing: 120, contrast: "Medio" },
  intenso: { label: "Intenso", opacity: 0.2, spacing: 90, contrast: "Alto" }
} satisfies Record<WatermarkPresetId, { label: string; opacity: number; spacing: number; contrast: string }>;

export function recommendedWatermarkPreset(minutes: number, reducedContrast: boolean): WatermarkPresetId {
  if (reducedContrast || minutes >= 30) return "equilibrado";
  return "intenso";
}
