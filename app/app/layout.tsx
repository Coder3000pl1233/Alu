import { MockSessionGuard } from "@/components/mock-session-guard";
import { Suspense } from "react";

export default function ProtectedDemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<main className="session-gate"><div className="page-loader"><span/>Comprobando sesión…</div></main>}>
      <MockSessionGuard>{children}</MockSessionGuard>
    </Suspense>
  );
}
