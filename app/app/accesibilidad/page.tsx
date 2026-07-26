import { AppShell } from "@/components/app-shell";
import { AccessibilityLab } from "@/components/accessibility-lab";

export default function AccessibilityPage() {
  return <AppShell><div className="page"><div className="eyebrow">Investigación P3</div><h1>Legibilidad y acceso equivalente</h1><p className="muted">Laboratorio frontend para definir la próxima evolución del visor.</p><AccessibilityLab/></div></AppShell>;
}
