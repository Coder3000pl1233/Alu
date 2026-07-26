import { AppShell } from "@/components/app-shell";
import { SecurityPolicy } from "@/components/security-policy";

export default function SecurityPage() {
  return (
    <AppShell>
      <div className="page">
        <div className="eyebrow">Información del producto</div>
        <h1>Seguridad y privacidad</h1>
        <p className="muted">Conocé cómo protegemos los materiales y qué reglas se aplican al acceso.</p>
        <SecurityPolicy/>
      </div>
    </AppShell>
  );
}
