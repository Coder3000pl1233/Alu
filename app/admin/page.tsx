import { AppShell } from "@/components/app-shell";
import { AdminDashboard } from "@/components/admin-dashboard";

export default function AdminPage() {
  return (
    <AppShell admin>
      <AdminDashboard />
    </AppShell>
  );
}
