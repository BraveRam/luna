import { GeminiService } from "./gemini.service.ts";
import { MAIN_PROMPT } from "../shared/utils/constants.js";
import { PDFDocument, PDFPage, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import {
  enhancedTableOfContentsFormatting,
  wrapText,
} from "../shared/utils/utils.js";
import { parseMarkdownLine } from "../shared/utils/parse.js";

export class MainContentService {
  private gemini: GeminiService;

  constructor() {
    this.gemini = new GeminiService(process.env.GEMINI_API_KEY!);
  }

  /**
   * Generates main content for an assignment and returns it as a Buffer
   */
  async generateMainContent(
    file: any,
    model: string,
    numberOfPages: number,
    options?: { includeReferences?: boolean, includeOutline?: boolean, universityName?: string }
  ): Promise<Buffer> {
    console.log("Generating main content...", options);
    const uploadedFile = await this.gemini.uploadFile(file);

    const contents = [
      MAIN_PROMPT(numberOfPages, options),
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

    return this.generatePDF(response.text!, options?.universityName!);
  }

  /**
   * Converts AI-generated text to a formatted PDF
   */
  private async generatePDF(aiText: string, universityName: string): Promise<Buffer> {
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
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const contentWidth = pageWidth - 2 * margin;
      const headerHeight = 30;
      const footerHeight = 30;

      const addHeaderFooter = async (
        page: PDFPage,
        pageNum: number,
        title: string = "",
        showHeader: boolean = true
      ) => {
        if (showHeader) {
          if (title && title.trim().length > 0) {
            page.drawText(title, {
              x: margin,
              y: pageHeight - margin - 15,
              size: 12,
              font: fontBold,
              color: rgb(0.2, 0.2, 0.2),
            });
          }

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
      let documentTitle = ""; // Remove header text entirely

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
      console.error("Error generating main content PDF:", error);
      throw error;
    }
  }
}


