import { PDFDocument } from "pdf-lib";
import fs from "fs";

export class PDFService {
  static async mergePDFs(buffers: Buffer[]): Promise<Uint8Array> {
    const mergedPdf = await PDFDocument.create();
    for (const buffer of buffers) {
      const pdf = await PDFDocument.load(buffer);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }
    return mergedPdf.save();
  }

  static saveToFile(bytes: Uint8Array, filename: string) {
    fs.writeFileSync(filename, bytes);
  }
}
