import type { Material } from "@/lib/mock-data";

export type MaterialFilterType = "Todos" | Material["type"];

export function filterMaterials(materials: Material[], query: string, type: MaterialFilterType) {
  const normalizedQuery = query.trim().toLocaleLowerCase("es");

  return materials.filter(material => {
    const matchesType = type === "Todos" || material.type === type;
    const matchesQuery =
      normalizedQuery.length === 0 ||
      material.title.toLocaleLowerCase("es").includes(normalizedQuery) ||
      material.type.toLocaleLowerCase("es").includes(normalizedQuery);

    return matchesType && matchesQuery;
  });
}
