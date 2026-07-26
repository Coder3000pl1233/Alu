import Link from "next/link";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return <main className="session-gate warning"><span className="session-gate-icon"><WifiOff size={30}/></span><h1>Estás sin conexión</h1><p>Por seguridad, los materiales de estudio no están disponibles offline. Cuando recuperes la conexión podrás volver a validar tu acceso.</p><Link className="btn btn-primary" href="/app">Reintentar conexión</Link></main>;
}
