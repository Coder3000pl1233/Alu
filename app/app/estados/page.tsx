import { AppShell } from "@/components/app-shell";
import { InterfaceStates } from "@/components/interface-states";

export default function InterfaceStatesPage() {
  return (
    <AppShell>
      <div className="page">
        <div className="eyebrow">Sistema de diseño</div>
        <h1>Estados de interfaz</h1>
        <p className="muted">Galería de estados reutilizables para estudiante, visor y administración.</p>
        <InterfaceStates/>
      </div>
    </AppShell>
  );
}
