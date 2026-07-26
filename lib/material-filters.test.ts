import { describe, expect, it } from "vitest";
import { filterMaterials } from "@/lib/material-filters";
import { materials } from "@/lib/mock-data";

describe("filterMaterials", () => {
  const anatomy = materials.filter(material => material.subjectId === "anatomia");

  it("filtra por tipo", () => {
    expect(filterMaterials(anatomy, "", "Guía").map(item => item.id)).toEqual(["sistema-oseo", "miembro-inferior"]);
  });

  it("busca sin distinguir mayúsculas o tildes conservadas", () => {
    expect(filterMaterials(anatomy, "ANATOMÍA", "Todos").map(item => item.id)).toContain("anatomia-general");
  });

  it("devuelve vacío cuando no hay coincidencias", () => {
    expect(filterMaterials(anatomy, "histología", "Todos")).toHaveLength(0);
  });
});
