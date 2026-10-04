import { spawn } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

export type RasterizedPage = { pageNumber: number; png: Uint8Array; width: number; height: number };
export interface PageRasterizer { rasterize(pdf: Uint8Array): Promise<RasterizedPage[]>; }

export type PopplerPolicy = { timeoutMs: number; maximumPages: number; dpi: number };
export const DEFAULT_POPPLER_POLICY: PopplerPolicy = { timeoutMs: 120_000, maximumPages: 500, dpi: 216 };

function run(command: string, args: string[], cwd: string, timeoutMs: number) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { cwd, shell: false, windowsHide: true, stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    const timer = setTimeout(() => { child.kill("SIGKILL"); reject(new Error("pdf_processing_timeout")); }, timeoutMs);
    child.stderr.on("data", (chunk) => { if (stderr.length < 4_096) stderr += String(chunk); });
    child.once("error", (error) => { clearTimeout(timer); reject(error); });
    child.once("exit", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`pdf_rasterizer_failed:${code}:${stderr.slice(0, 200)}`));
    });
  });
}

export class PopplerRasterizer implements PageRasterizer {
  constructor(private readonly policy = DEFAULT_POPPLER_POLICY) {}

  async rasterize(pdf: Uint8Array) {
    const directory = await mkdtemp(join(tmpdir(), "aula-pdf-"));
    try {
      const input = join(directory, "input.pdf");
      await writeFile(input, pdf, { flag: "wx" });
      await run("pdftoppm", ["-png", "-r", String(this.policy.dpi), "-f", "1", "-l", String(this.policy.maximumPages + 1), input, "page"], directory, this.policy.timeoutMs);
      const files = (await readdir(directory)).filter((name) => /^page-\d+\.png$/.test(name)).sort((a, b) => Number(a.match(/\d+/)?.[0]) - Number(b.match(/\d+/)?.[0]));
      if (files.length === 0) throw new Error("pdf_has_no_pages");
      if (files.length > this.policy.maximumPages) throw new Error("pdf_page_limit_exceeded");
      return Promise.all(files.map(async (file, index) => {
        const png = await readFile(join(directory, file));
        const metadata = await sharp(png).metadata();
        if (!metadata.width || !metadata.height) throw new Error("raster_dimensions_missing");
        return { pageNumber: index + 1, png, width: metadata.width, height: metadata.height };
      }));
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }
}
