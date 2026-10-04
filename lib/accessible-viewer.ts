export const accessibleSections = [
  { id: "introduccion", title: "Introducción", pageStart: 1 },
  { id: "posicion", title: "Posición anatómica", pageStart: 12 },
  { id: "planos", title: "Planos y ejes", pageStart: 24 },
  { id: "sistemas", title: "Sistemas del cuerpo", pageStart: 38 },
  { id: "repaso", title: "Actividades de repaso", pageStart: 52 }
];

export function sectionForPage(page: number) {
  return [...accessibleSections].reverse().find(section => page >= section.pageStart) ?? accessibleSections[0];
}
