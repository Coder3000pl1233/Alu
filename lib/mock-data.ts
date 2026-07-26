export type Material = {
  id: string;
  title: string;
  category: string;
  type: "Apunte" | "Guía" | "Libro" | "Simulacro";
  subjectId: string;
  pages: number;
  progress: number;
  updated: string;
  color: string;
};

export const materials: Material[] = [
  { id: "anatomia-general", title: "Anatomía general", category: "Anatomía", type: "Apunte", subjectId: "anatomia", pages: 84, progress: 46, updated: "Actualizado hoy", color: "linear-gradient(135deg,#315dba,#5d8bea)" },
  { id: "sistema-oseo", title: "Guía del sistema óseo", category: "Anatomía", type: "Guía", subjectId: "anatomia", pages: 62, progress: 18, updated: "Hace 2 días", color: "linear-gradient(135deg,#4568a9,#7b98d3)" },
  { id: "simulacro-anatomia", title: "Simulacro parcial de Anatomía", category: "Anatomía", type: "Simulacro", subjectId: "anatomia", pages: 38, progress: 0, updated: "Nuevo", color: "linear-gradient(135deg,#344054,#667085)" },
  { id: "miembro-superior", title: "Miembro superior", category: "Anatomía", type: "Apunte", subjectId: "anatomia", pages: 54, progress: 0, updated: "Nuevo", color: "linear-gradient(135deg,#315dba,#7198e8)" },
  { id: "miembro-inferior", title: "Guía de miembro inferior", category: "Anatomía", type: "Guía", subjectId: "anatomia", pages: 48, progress: 0, updated: "Hace 1 semana", color: "linear-gradient(135deg,#38598f,#7c9bd0)" },
  { id: "neuroanatomia", title: "Introducción a neuroanatomía", category: "Anatomía", type: "Libro", subjectId: "anatomia", pages: 126, progress: 0, updated: "Hace 2 semanas", color: "linear-gradient(135deg,#273f74,#6485c2)" },
  { id: "biologia-celular", title: "Biología celular", category: "Biología", type: "Libro", subjectId: "biologia", pages: 112, progress: 72, updated: "Hace 4 días", color: "linear-gradient(135deg,#0a806f,#42b89d)" },
  { id: "genetica-basica", title: "Genética: conceptos básicos", category: "Biología", type: "Apunte", subjectId: "biologia", pages: 73, progress: 34, updated: "Hace 8 días", color: "linear-gradient(135deg,#1d7568,#63b9a7)" },
  { id: "guia-celula", title: "Guía práctica: la célula", category: "Biología", type: "Guía", subjectId: "biologia", pages: 45, progress: 0, updated: "Hace 1 semana", color: "linear-gradient(135deg,#247d91,#6cc2d1)" },
  { id: "evolucion", title: "Evolución y selección natural", category: "Biología", type: "Apunte", subjectId: "biologia", pages: 59, progress: 0, updated: "Nuevo", color: "linear-gradient(135deg,#147665,#53b39c)" },
  { id: "metabolismo", title: "Guía de metabolismo celular", category: "Biología", type: "Guía", subjectId: "biologia", pages: 42, progress: 0, updated: "Hace 5 días", color: "linear-gradient(135deg,#277b70,#75bcae)" },
  { id: "simulacro-biologia", title: "Simulacro integrador de Biología", category: "Biología", type: "Simulacro", subjectId: "biologia", pages: 36, progress: 0, updated: "Nuevo", color: "linear-gradient(135deg,#285d65,#5a9aa5)" },
  { id: "histologia-general", title: "Histología general", category: "Histología", type: "Apunte", subjectId: "histologia", pages: 95, progress: 22, updated: "Actualizado ayer", color: "linear-gradient(135deg,#9b4e9c,#d278c9)" },
  { id: "tejidos-epiteliales", title: "Atlas de tejidos epiteliales", category: "Histología", type: "Libro", subjectId: "histologia", pages: 68, progress: 0, updated: "Hace 3 días", color: "linear-gradient(135deg,#8e568f,#c790c5)" },
  { id: "simulacro-histologia", title: "Preguntas de repaso", category: "Histología", type: "Simulacro", subjectId: "histologia", pages: 30, progress: 0, updated: "Nuevo", color: "linear-gradient(135deg,#714d7f,#a77db5)" },
  { id: "tejido-conectivo", title: "Tejido conectivo", category: "Histología", type: "Apunte", subjectId: "histologia", pages: 51, progress: 0, updated: "Hace 2 días", color: "linear-gradient(135deg,#934f91,#ce7bc3)" },
  { id: "tejido-muscular", title: "Atlas de tejido muscular", category: "Histología", type: "Libro", subjectId: "histologia", pages: 65, progress: 0, updated: "Hace 6 días", color: "linear-gradient(135deg,#794b83,#b980b8)" },
  { id: "guia-microscopia", title: "Guía práctica de microscopía", category: "Histología", type: "Guía", subjectId: "histologia", pages: 40, progress: 0, updated: "Nuevo", color: "linear-gradient(135deg,#805a8e,#c093ca)" }
];

export type Subject = {
  id: string;
  name: string;
  description: string;
  color: string;
};

export const subjects: Subject[] = [
  { id: "anatomia", name: "Anatomía", description: "Estructuras, sistemas y organización del cuerpo humano.", color: "linear-gradient(135deg,#315dba,#5d8bea)" },
  { id: "biologia", name: "Biología", description: "Célula, genética y fundamentos de los seres vivos.", color: "linear-gradient(135deg,#0a806f,#42b89d)" },
  { id: "histologia", name: "Histología", description: "Tejidos, microscopía y organización celular.", color: "linear-gradient(135deg,#9b4e9c,#d278c9)" }
];

export const users = [
  { name: "Lucía Fernández", email: "lucia.f@email.com", until: "25 ago 2026", status: "Activo", device: "Chrome · Windows" },
  { name: "Mateo Ruiz", email: "mateo.r@email.com", until: "02 ago 2026", status: "Por vencer", device: "Safari · iPhone" },
  { name: "Sofía Acosta", email: "sofia.a@email.com", until: "19 sep 2026", status: "Activo", device: "Chrome · Android" },
  { name: "Tomás Silva", email: "tomas.s@email.com", until: "18 jul 2026", status: "Vencido", device: "Edge · Windows" }
];
