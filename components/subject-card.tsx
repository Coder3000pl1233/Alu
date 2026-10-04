import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import type { Subject } from "@/lib/mock-data";
import { materials } from "@/lib/mock-data";

export function SubjectCard({ subject }: { subject: Subject }) {
  const count = materials.filter(material => material.subjectId === subject.id).length;

  return (
    <Link href={`/app/materia/${subject.id}`} className="card subject-card">
      <div className="material-cover subject-cover" style={{ background: subject.color }}>
        <span className="doc-icon"><BookOpen color="#315dba" /></span>
        <span className="subject-count">{count} publicaciones</span>
      </div>
      <div className="material-body">
        <div className="material-title" style={{ fontSize: 19 }}>{subject.name}</div>
        <p className="muted subject-description">{subject.description}</p>
        <div className="subject-action">Explorar apuntes <ArrowRight size={16} /></div>
      </div>
    </Link>
  );
}
