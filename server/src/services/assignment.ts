import { config } from "dotenv";
config();
import { GeminiService } from "./gemini.service.ts";
import { PDFService } from "./pdf.service.js";
import { createCoverPage } from "../shared/utils/cover.js";
import {
  MAIN_PROMPT,
  OUTLINES_PROMPT,
  REFERENCES_PROMPT,
} from "../shared/utils/constants.js";
import type { CoverPageOptions } from "../shared/types/index.ts";
import { PDFDocument, PDFPage, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import {
  enhancedTableOfContentsFormatting,
  wrapText,
} from "../shared/utils/utils.js";
import { parseMarkdownLine } from "../shared/utils/parse.js";

/**
 * Generates an academic assignment using AI and creates a formatted PDF
 */
export class AssignmentService {
  private gemini: GeminiService;

  constructor() {
    this.gemini = new GeminiService(process.env.GEMINI_API_KEY!);
  }

  /**
   * Generates a complete assignment with optional cover page and outline
   */
  async generateAssignment({
    model,
    file,
    numberOfPages,
    includeCover = false,
    coverOptions,
    includeOutline = false,
    includeReferences = false,
  }: {
    model: string;
    file: any;
    numberOfPages: number;
    includeCover?: boolean;
    coverOptions?: CoverPageOptions;
    includeOutline?: boolean;
    includeReferences?: boolean;
  }) {
    // Upload input file
    const uploadedFile = await this.gemini.uploadFile(file);

    // Generate main content
    const contents = [
      MAIN_PROMPT(numberOfPages, { includeOutline, includeReferences }),
      {
        fileData: {
          mimeType: uploadedFile.mimeType,
          fileUri: uploadedFile.uri,
        },
      },
    ];

    const response = await this.gemini.generateContent(model, contents, {
      thinkingConfig: { thinkingBudget: -1 },
    });

    const mainContentBuffer = await this.generatePDF(response.text!, "", true);

    const buffers: Buffer[] = [];

    // Cover Page (optional)
    if (includeCover && coverOptions) {
      const coverBuffer = await createCoverPage(coverOptions);
      buffers.push(Buffer.from(coverBuffer));
    }

    // Outline (optional)
    if (includeOutline) {
      const pdfFile = new File(
        [new Uint8Array(mainContentBuffer)],
        "temp.pdf",
        {
          type: "application/pdf",
        }
      );

      const outline = await this.generateOutline(pdfFile, model);
      const outlineBuffer = await this.generatePDF(outline, "", true);
      buffers.push(Buffer.from(outlineBuffer));
    }

    // References (optional)
    if (includeReferences) {
      const pdfFile = new File(
        [new Uint8Array(mainContentBuffer)],
        "temp.pdf",
        {
          type: "application/pdf",
        }
      );

      const references = await this.generateReferences(pdfFile, model);
      const referencesBuffer = await this.generatePDF(references, "", true);
      buffers.push(Buffer.from(referencesBuffer));
    }

    // Always include main content
    buffers.push(Buffer.from(mainContentBuffer));

    // Merge all PDF components
    const mergedPdfBytes = await PDFService.mergePDFs(buffers);
    PDFService.saveToFile(mergedPdfBytes, "merged.pdf");

    return {
      mainContent: response.text,
      message: "✨ Successfully generated merged assignment!",
      files: { mergedDocument: "merged.pdf" },
    };
  }

  /**
   * Generates an outline/table of contents for a PDF file
   */
  private async generateOutline(file: any, model: string): Promise<string> {
    const uploadedFile = await this.gemini.uploadFile(file);

    const prompt = OUTLINES_PROMPT;

    const contents = [
      prompt,
      {
        fileData: {
          mimeType: uploadedFile.mimeType,
          fileUri: uploadedFile.uri,
        },
      },
    ];

    const response = await this.gemini.generateContent(model, contents, {
      thinkingConfig: { thinkingBudget: -1 },
    });

    return response.text!;
  }

  /**
   * Generates a references/works cited section for a PDF file
   */
  private async generateReferences(file: any, model: string): Promise<string> {
    const uploadedFile = await this.gemini.uploadFile(file);

    const prompt = REFERENCES_PROMPT;

    const contents = [
      prompt,
      {
        fileData: {
          mimeType: uploadedFile.mimeType,
          fileUri: uploadedFile.uri,
        },
      },
    ];

    const response = await this.gemini.generateContent(model, contents, {
      thinkingConfig: { thinkingBudget: -1 },
    });

    return response.text!;
  }

  /**
   * Converts AI-generated text to a formatted PDF
   */
  async generatePDF(
    aiText: string,
    outputFile: string,
    useCustomFont: boolean = true
  ): Promise<Buffer> {
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
      const fontBoldItalic = await pdfDoc.embedFont("Helvetica-BoldOblique");
      const titleFont = await pdfDoc.embedFont("Times-Bold");

      const margin = 72;
      const pageWidth = 612;
      const pageHeight = 792;
      const contentWidth = pageWidth - 2 * margin;
      const headerHeight = 30;
      const footerHeight = 30;

      const addHeaderFooter = async (
        page: PDFPage,
        pageNum: number,
        title: string = "Academic Assignment",
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

        const pageText = `${pageNum}`;
        const pageTextWidth = font.widthOfTextAtSize(pageText, 10);
        page.drawText(pageText, {
          x: pageWidth - margin - pageTextWidth,
          y: margin + 10,
          size: 10,
          font,
          color: rgb(0.5, 0.5, 0.5),
        });
      };

      let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin - headerHeight - 40;
      const baseLineHeight = 18;
      let pageNumber = 1;
      let documentTitle = "X University";

      const isOutlineOrReferencePage = (pageText: string): boolean => {
        const lowerText = pageText.toLowerCase();
        return (
          lowerText.includes("## outline") ||
          lowerText.includes("## references") ||
          lowerText.includes("# table of contents") ||
          lowerText.includes("## table of contents") ||
          lowerText.includes("# references") ||
          lowerText.includes("# works cited")
        );
      };

      const isTableOfContentsPage = (pageText: string): boolean => {
        const lowerText = pageText.toLowerCase();
        return (
          lowerText.includes("# table of contents") ||
          lowerText.includes("## table of contents")
        );
      };

      const isReferencesPage = (pageText: string): boolean => {
        const lowerText = pageText.toLowerCase();
        return (
          lowerText.includes("# references") ||
          lowerText.includes("# works cited")
        );
      };

      const currentPageIsSpecial = isOutlineOrReferencePage(pagesText[0]);
      await addHeaderFooter(
        currentPage,
        pageNumber,
        documentTitle,
        !currentPageIsSpecial
      );

      if (currentPageIsSpecial) {
        y = pageHeight - margin - 20;
      }

      for (let pageIndex = 0; pageIndex < pagesText.length; pageIndex++) {
        const pageText = pagesText[pageIndex];

        if (pageIndex > 0) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          pageNumber++;
          const isSpecialPage = isOutlineOrReferencePage(pageText);
          await addHeaderFooter(
            currentPage,
            pageNumber,
            documentTitle,
            !isSpecialPage
          );

          if (isSpecialPage) {
            y = pageHeight - margin - 20;
          } else {
            y = pageHeight - margin - headerHeight - 40;
          }
        }

        const paragraphs = pageText
          .split("\n")
          .filter((p) => p.trim().length > 0);

        if (isTableOfContentsPage(pageText)) {
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
          continue;
        }

        for (const para of paragraphs) {
          let fontSize = 11;
          let textContent = para;
          let isListItem = false;
          let indent = 0;
          let color = rgb(0, 0, 0);
          let selectedFont = font;
          let lineHeight = baseLineHeight;
          let spacingAfter = 8;

          if (para.startsWith("# ")) {
            fontSize = 24;
            textContent = para.slice(2);
            selectedFont = titleFont;
            lineHeight = 30;
            spacingAfter = 20;
            color = rgb(0.1, 0.1, 0.1);
          } else if (para.startsWith("## ")) {
            fontSize = 18;
            textContent = para.slice(3);
            selectedFont = fontBold;
            lineHeight = 24;
            spacingAfter = 15;
            color = rgb(0.2, 0.2, 0.2);
          } else if (para.startsWith("### ")) {
            fontSize = 14;
            textContent = para.slice(4);
            selectedFont = fontBold;
            lineHeight = 20;
            spacingAfter = 12;
            color = rgb(0.3, 0.3, 0.3);
          } else if (para.startsWith("  * ")) {
            isListItem = true;
            indent = 40;
            textContent = para.slice(4);
            fontSize = 11;
            selectedFont = font;
            spacingAfter = 4;
            color = rgb(0, 0, 0);
          } else if (para.startsWith("- ") || para.startsWith("* ")) {
            isListItem = true;
            indent = 20;
            textContent = para.slice(2);
            spacingAfter = 6;
          }

          const lines = wrapText(
            textContent,
            contentWidth - indent,
            selectedFont,
            fontSize
          );

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (y < margin + footerHeight + lineHeight + 20) {
              currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
              pageNumber++;
              await addHeaderFooter(
                currentPage,
                pageNumber,
                documentTitle,
                true
              );
              y = pageHeight - margin - headerHeight - 40;
            }

            const parts = parseMarkdownLine(line);
            let x = margin + indent;

            if (isListItem && i === 0) {
              let bulletSymbol = "-";
              let bulletX = margin + 5;
              let bulletFont = selectedFont;

              if (indent > 30) {
                bulletSymbol = "*";
                bulletX = margin + 25;
                bulletFont = font;
              }

              currentPage.drawText(bulletSymbol, {
                x: bulletX,
                y,
                size: fontSize,
                font: bulletFont,
                color,
              });
            }

            for (const part of parts) {
              let partFont = selectedFont;
              if (part.bold && part.italic) partFont = fontBoldItalic;
              else if (part.bold) partFont = fontBold;
              else if (part.italic) partFont = fontItalic;

              currentPage.drawText(part.text, {
                x,
                y,
                size: fontSize,
                font: partFont,
                color,
              });

              x += partFont.widthOfTextAtSize(part.text, fontSize);
            }

            y -= lineHeight;
          }

          y -= spacingAfter;

          if (para.startsWith("**>> ") && para.endsWith("**")) {
            y -= 8;
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  }
}

/**
 * Backward compatibility function - maintains the original API
 */
export async function Gemini({
  model,
  file,
  numberOfPages,
  includeCover = false,
  coverOptions,
  includeOutline = false,
}: {
  model: string;
  file: any;
  numberOfPages: number;
  includeCover?: boolean;
  coverOptions?: CoverPageOptions;
  includeOutline?: boolean;
}) {
  const assignmentService = new AssignmentService();
  return assignmentService.generateAssignment({
    model,
    file,
    numberOfPages,
    includeCover,
    coverOptions,
    includeOutline,
  });
}
