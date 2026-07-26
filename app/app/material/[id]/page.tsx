import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { materials, subjects } from "@/lib/mock-data";
import { securityCopy } from "@/lib/product-policy";
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, FileText, ShieldCheck } from "lucide-react";

export default async function MaterialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const material = materials.find(item => item.id === id);

  if (!material) {
    return (
      <AppShell>
        <div className="page">
          <h1>Material no encontrado</h1>
          <Link className="btn btn-primary" href="/app">Volver a materias</Link>
        </div>
      </AppShell>
    );
  }

  const subject = subjects.find(item => item.id === material.subjectId);
  const hasProgress = material.progress > 0;

  return (
    <AppShell>
      <div className="page">
        <Link className="back-link" href={`/app/materia/${material.subjectId}`}>
          <ArrowLeft size={16} />Volver a {subject?.name ?? material.category}
        </Link>

        <section className="material-detail">
          <div className="detail-cover" style={{ background: material.color }}>
            <span className="detail-document"><FileText size={42} /></span>
            <span className="tag detail-tag">{material.type}</span>
          </div>

          <div className="detail-content">
            <div className="eyebrow">{subject?.name ?? material.category}</div>
            <h1>{material.title}</h1>
            <p className="detail-description">
              Material de estudio organizado para acompañar el contenido de {subject?.name ?? material.category}.
              Incluye conceptos centrales, explicaciones y actividades de repaso.
            </p>

            <div className="detail-meta">
              <span><FileText size={17} /><strong>{material.pages}</strong> páginas</span>
              <span><BookOpen size={17} />{material.type}</span>
              <span><CalendarDays size={17} />{material.updated}</span>
            </div>

            {hasProgress && (
              <div className="detail-progress">
                <div><strong>Tu progreso</strong><span>{material.progress}% completado</span></div>
                <div className="progress"><span style={{ width: `${material.progress}%` }} /></div>
              </div>
            )}

            <div className="detail-actions">
              <Link className="btn btn-primary detail-primary" href={`/app/material/${material.id}/visor`}>
                {hasProgress ? "Continuar estudiando" : "Comenzar a estudiar"} <ArrowRight size={17} />
              </Link>
              <span className="protected-note" title={securityCopy.watermark}><ShieldCheck size={16} />Acceso personal y contenido marcado</span>
            </div>
            <p className="detail-security-copy">{securityCopy.watermark}</p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
