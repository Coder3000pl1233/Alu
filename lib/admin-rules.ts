export type SecurityRule = { id: string; name: string; value: number; unit: string; severity: "Baja" | "Media" | "Alta"; enabled: boolean; version: number };
export type RuleAudit = { id: string; ruleId: string; version: number; before: number; after: number; reason: string; actor: string; createdAt: string };

export const initialSecurityRules: SecurityRule[] = [
  { id: "navigation-rate", name: "Velocidad de navegación", value: 18, unit: "páginas/min", severity: "Media", enabled: true, version: 3 },
  { id: "active-sessions", name: "Sesiones concurrentes", value: 1, unit: "sesión", severity: "Alta", enabled: true, version: 2 },
  { id: "registered-devices", name: "Dispositivos registrados", value: 2, unit: "dispositivos", severity: "Media", enabled: true, version: 4 }
];

export function publishRuleVersion(rule: SecurityRule, nextValue: number) {
  return { ...rule, value: nextValue, version: rule.version + 1 };
}

export function validateRuleChange(value: number, reason: string) {
  if (!Number.isFinite(value) || value < 1) return "El umbral debe ser mayor o igual a 1.";
  if (reason.trim().length < 5) return "Ingresá un motivo de al menos 5 caracteres.";
  return null;
}
