"use client";

import { CheckCircle2, FileText, UploadCloud } from "lucide-react";
import { useState } from "react";

export function PublishListingForm() {
  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [fileError, setFileError] = useState("");
  const [checking, setChecking] = useState(false);

  const inspectPdf = async (file?: File) => {
    setFileName("");
    setPageCount(null);
    setFileError("");
    if (!file) return;
    if (file.type !== "application/pdf") {
      setFileError("La muestra debe ser un archivo PDF.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setFileError("El archivo supera el límite de 25 MB.");
      return;
    }

    setChecking(true);
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjs.getDocument({ data: bytes }).promise;
      if (pdf.numPages < 5) {
        setFileError(`El PDF tiene ${pdf.numPages} ${pdf.numPages === 1 ? "página" : "páginas"}. La muestra debe tener al menos 5.`);
        return;
      }
      setFileName(file.name);
      setPageCount(pdf.numPages);
    } catch {
      setFileError("No pudimos leer el PDF. Probá con otro archivo.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <form className="publish-form" onSubmit={event => event.preventDefault()}>
      <section className="card publish-section">
        <div className="publish-section-heading"><span>1</span><div><h2>Información del apunte</h2><p>Contanos qué estás ofreciendo.</p></div></div>
        <div className="field-grid">
          <div className="field"><label htmlFor="listing-title">Título</label><input className="input" id="listing-title" placeholder="Ej. Resumen completo de Anatomía" required/></div>
          <div className="field"><label htmlFor="listing-type">Tipo</label><select className="input" id="listing-type"><option>Apunte</option><option>Guía</option><option>Simulacro</option><option>Resumen</option></select></div>
          <div className="field"><label htmlFor="listing-university">Universidad</label><input className="input" id="listing-university" placeholder="Ej. UBA" required/></div>
          <div className="field"><label htmlFor="listing-subject">Materia</label><input className="input" id="listing-subject" placeholder="Ej. Anatomía" required/></div>
          <div className="field"><label htmlFor="listing-price">Precio orientativo</label><input className="input" id="listing-price" inputMode="numeric" placeholder="$ 0" required/></div>
          <div className="field"><label htmlFor="listing-contact">WhatsApp de contacto</label><input className="input" id="listing-contact" type="tel" placeholder="+54 9 11..." required/></div>
        </div>
        <div className="field"><label htmlFor="listing-description">Descripción</label><textarea className="input" id="listing-description" rows={4} placeholder="Explicá qué temas incluye, para qué cátedra sirve y cómo se entrega." required/></div>
      </section>

      <section className="card publish-section">
        <div className="publish-section-heading"><span>2</span><div><h2>Vista previa obligatoria</h2><p>Subí una muestra en PDF de al menos 5 páginas. Solo esta muestra se visualizará en EntreApuntes.</p></div></div>
        <label className={`pdf-dropzone ${fileError ? "error" : ""} ${fileName ? "success" : ""}`}>
          <input type="file" accept="application/pdf,.pdf" onChange={event => inspectPdf(event.target.files?.[0])}/>
          {fileName ? <CheckCircle2 size={28}/> : <UploadCloud size={30}/>} 
          <strong>{checking ? "Revisando el documento…" : fileName || "Seleccionar PDF de muestra"}</strong>
          <span>{pageCount ? `${pageCount} páginas detectadas · listo para publicar` : "Mínimo 5 páginas · máximo 25 MB"}</span>
        </label>
        {fileError && <p className="form-error">{fileError}</p>}
        <div className="preview-requirements">
          <span><FileText size={16}/><strong>Se mostrarán 5 páginas</strong> en el visor público.</span>
          <span><CheckCircle2 size={16}/><strong>El material completo no se sube</strong> y se entrega por fuera.</span>
        </div>
      </section>

      <div className="publish-actions"><a className="btn btn-secondary" href="/app">Cancelar</a><button className="btn btn-primary" disabled={!fileName || checking}>Continuar con la publicación</button></div>
    </form>
  );
}
