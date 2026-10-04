import type { Material } from "@/lib/mock-data";

const coverColors: Record<string, string> = {
  anatomia: "#b885d5",
  biologia: "#238f7e",
  histologia: "#8d65b0",
  matematica: "#1764c8",
  derecho: "#5c8fbd",
};

export type StudyCoverMaterial = Pick<Material, "subjectId" | "category" | "title" | "type">;

export function getStudyCoverColor(material: Pick<Material, "subjectId">) {
  return coverColors[material.subjectId] ?? "#1764c8";
}

export function StudyCover({
  material,
  university,
  className = "",
}: {
  material: StudyCoverMaterial;
  university: string;
  className?: string;
}) {
  return <div className={`study-cover ${className}`} style={{ backgroundColor: getStudyCoverColor(material) }}>
    <span className="study-cover-category">{material.category}</span>
    <strong>{material.title}</strong>
    <small>{material.type}</small>
    <b>{university}</b>
  </div>;
}
