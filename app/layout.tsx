import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegistration } from "@/components/pwa-registration";

export const metadata: Metadata = {
  title: "Aula Segura",
  description: "Plataforma educativa con visor protegido",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = { themeColor: "#17365d" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}<PwaRegistration/></body>
    </html>
  );
}
