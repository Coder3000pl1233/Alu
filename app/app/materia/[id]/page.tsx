import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { SubjectMaterials } from "@/components/subject-materials";
import { materials, subjects } from "@/lib/mock-data";
import { ArrowLeft, BookOpen } from "lucide-react";

export default async function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const subject = subjects.find(item => item.id === id);

  if (!subject) {
    return (
      <AppShell>
        <div className="page">
          <h1>Materia no encontrada</h1>
          <Link className="btn btn-primary" href="/app">Volver a materias</Link>
        </div>
      </AppShell>
    );
  }

  const subjectMaterials = materials.filter(material => material.subjectId === subject.id);

  return (
    <AppShell>
      <div className="page">
        <Link className="back-link" href="/app#materias"><ArrowLeft size={16} />Todas las materias</Link>
        <section className="subject-hero" style={{ background: subject.color }}>
          <div className="subject-hero-icon"><BookOpen size={28} /></div>
          <div>
            <div className="eyebrow" style={{ color: "#dbe8ff" }}>Materia</div>
            <h1 style={{ color: "white", marginBottom: 9 }}>{subject.name}</h1>
            <p>{subject.description}</p>
          </div>
        </section>
        <div className="section-head">
          <div>
            <h2>Apuntes publicados</h2>
            <div className="muted" style={{ fontSize: 13, marginTop: 5 }}>{subjectMaterials.length} publicaciones disponibles</div>
          </div>
        </div>
        <SubjectMaterials materials={subjectMaterials} />
      </div>
    </AppShell>
  );
}
