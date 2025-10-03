import { config } from "dotenv";
config();
import { PDFService } from "./pdf.service.js";
import { createCoverPage } from "../shared/utils/cover.js";
import { OutlineService } from "./outline.service.ts";
import { MainContentService } from "./main-content.service.ts";
import type { CoverPageOptions } from "../shared/types/index.ts";

/**
 * Generates an academic assignment using AI and creates a formatted PDF
 */
export class AssignmentService {
  private outlineService: OutlineService;
  private mainContentService: MainContentService;

  constructor() {
    this.outlineService = new OutlineService();
    this.mainContentService = new MainContentService();
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
    const buffers: Buffer[] = [];

    // Generate main content first
    const mainContentBuffer = await this.mainContentService.generateMainContent(
      file,
      model,
      numberOfPages,
      { includeOutline, includeReferences }
    );

    // Cover Page (optional)
    if (includeCover && coverOptions) {
      const coverBuffer = await createCoverPage(coverOptions);
      buffers.push(coverBuffer);
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

      const outlineBuffer = await this.outlineService.generateOutline(pdfFile, model);
      buffers.push(outlineBuffer);
    }

    // Always include main content
    buffers.push(mainContentBuffer);

    // Merge all PDF components
    const mergedPdfBytes = await PDFService.mergePDFs(buffers);
    PDFService.saveToFile(mergedPdfBytes, "merged.pdf");

    return {
      mainContent: "Generated successfully",
      message: "✨ Successfully generated merged assignment!",
      files: { mergedDocument: "merged.pdf" },
    };
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
