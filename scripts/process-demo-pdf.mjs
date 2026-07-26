import fs from "node:fs";
import path from "node:path";
import { createCanvas } from "@napi-rs/canvas";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const input = process.argv[2];
if (!input) {
  throw new Error("Uso: node scripts/process-demo-pdf.mjs <archivo.pdf>");
}

const outputDir = path.join(process.cwd(), "public", "demo-content", "anatomia-general");
fs.mkdirSync(outputDir, { recursive: true });

const data = new Uint8Array(fs.readFileSync(input));
const pdf = await pdfjs.getDocument({ data, disableWorker: true }).promise;
const pages = [];

console.log(`Procesando ${pdf.numPages} páginas...`);

for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1.45 });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const context = canvas.getContext("2d");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: context, viewport }).promise;

  context.save();
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate(-Math.PI / 6);
  context.font = "bold 15px Arial";
  context.fillStyle = "rgba(35, 75, 145, 0.12)";
  context.textAlign = "center";

  const watermark = "LUCÍA F. · CTA 7K4M2 · SES DEMO-A82F";
  for (let y = -canvas.height; y <= canvas.height; y += 145) {
    for (let x = -canvas.width; x <= canvas.width; x += 360) {
      context.fillText(watermark, x + ((y / 145) % 2) * 90, y);
    }
  }
  context.restore();

  const filename = `page-${String(pageNumber).padStart(3, "0")}.jpg`;
  const destination = path.join(outputDir, filename);
  fs.writeFileSync(destination, await canvas.encode("jpeg", 82));

  pages.push({
    page: pageNumber,
    src: `/demo-content/anatomia-general/${filename}`,
    width: canvas.width,
    height: canvas.height
  });

  console.log(`Página ${pageNumber}/${pdf.numPages}`);
}

const manifest = {
  documentId: "anatomia-general",
  title: "Bloque 1 · Anatomía",
  generatedFor: "DEMO-A82F",
  pageCount: pdf.numPages,
  pages
};

fs.writeFileSync(
  path.join(outputDir, "manifest.json"),
  JSON.stringify(manifest, null, 2),
  "utf8"
);

console.log(`Listo: ${outputDir}`);
