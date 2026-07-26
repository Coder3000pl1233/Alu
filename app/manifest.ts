import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aula Segura",
    short_name: "Aula Segura",
    description: "Biblioteca educativa con visor protegido",
    start_url: "/app",
    display: "standalone",
    background_color: "#f5f7fb",
    theme_color: "#17365d",
    icons: [
      { src: "/pwa-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/pwa-icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" }
    ]
  };
}
