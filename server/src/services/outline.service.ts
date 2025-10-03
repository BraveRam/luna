import { GeminiService } from "./gemini.service.ts";
import { PDFService } from "./pdf.service.js";
import { OUTLINES_PROMPT } from "../shared/utils/constants.js";
import { PDFDocument, PDFPage, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import {
  enhancedTableOfContentsFormatting,
  wrapText,
} from "../shared/utils/utils.js";
import { config } from "dotenv";

config();

export class OutlineService {
  private gemini: GeminiService;

  constructor() {
    this.gemini = new GeminiService(process.env.GEMINI_API_KEY!);
  }

  /**
   * Generates an outline/table of contents for a PDF file and returns it as a Buffer
   */
  async generateOutline(file: any, model: string): Promise<Buffer> {
    const uploadedFile = await this.gemini.uploadFile(file);

    const prompt = OUTLINES_PROMPT;

    const contents = [
      {
        fileData: {
          mimeType: uploadedFile.mimeType,
          fileUri: uploadedFile.uri,
        },
      },
      { text: prompt },
    ]

    const response = await this.gemini.generateContent(model, contents, {
      thinkingConfig: { thinkingBudget: -1 },
    });

    return this.generatePDF(response.text!);
  }

  /**
   * Converts AI-generated outline text to a formatted PDF
   */
  private async generatePDF(aiText: string): Promise<Buffer> {
    try {
      const pagesText = aiText
        .split("===PAGE BREAK===")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);

      const font = await pdfDoc.embedFont("Helvetica");
      const fontBold = await pdfDoc.embedFont("Helvetica-Bold");
      const fontItalic = await pdfDoc.embedFont("Helvetica-Oblique");

      const margin = 72;
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const contentWidth = pageWidth - 2 * margin;
      const footerHeight = 30;

      const addHeaderFooter = async (
        page: PDFPage,
        title: string = "Table of Contents",
        showHeader: boolean = true
      ) => {
        if (showHeader) {
          page.drawText(title, {
            x: margin,
            y: pageHeight - margin - 15,
            size: 12,
            font: fontBold,
            color: rgb(0.2, 0.2, 0.2),
          });

          page.drawLine({
            start: { x: margin, y: pageHeight - margin - 25 },
            end: { x: pageWidth - margin, y: pageHeight - margin - 25 },
            thickness: 1,
            color: rgb(0.7, 0.7, 0.7),
          });
        }

        page.drawLine({
          start: { x: margin, y: margin + footerHeight },
          end: { x: pageWidth - margin, y: margin + footerHeight },
          thickness: 1,
          color: rgb(0.7, 0.7, 0.7),
        });

      };

      let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin - 20; // Special page layout for table of contents
      const baseLineHeight = 18;
      let pageNumber = 1;
      let documentTitle = "Table of Contents";

      await addHeaderFooter(
        currentPage,
        documentTitle,
        false
      );

      for (let pageIndex = 0; pageIndex < pagesText.length; pageIndex++) {
        const pageText = pagesText[pageIndex];

        if (pageIndex > 0) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          pageNumber++;
          await addHeaderFooter(currentPage, documentTitle, false);
          y = pageHeight - margin - 20;
        }

        const paragraphs = pageText
          .split("\n")
          .filter((p) => p.trim().length > 0);

        y = enhancedTableOfContentsFormatting(
          pageText,
          currentPage,
          y,
          margin,
          contentWidth,
          font,
          fontBold,
          fontItalic
        );
      }

      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error("Error generating outline PDF:", error);
      throw error;
    }
  }
}




