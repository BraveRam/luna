import { PDFDocument, StandardFonts } from "pdf-lib";
import fs from "fs";
import type { CoverPageOptions } from "../types/index.ts";

export async function createCoverPage(
  options: CoverPageOptions
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = height - 100;

  // University + College
  page.drawText(options.universityName, { x: 180, y, size: 20, font });
  y -= 30;
  page.drawText(options.collegeName, { x: 180, y, size: 16, font });
  y -= 50;

  // Assignment Title
  page.drawText(options.assignmentTitle, { x: 180, y, size: 22, font });
  y -= 60;

  if (options.type === "individual") {
    page.drawText(`Name: ${options.studentName}`, { x: 50, y, size: 14, font });
    y -= 20;
    page.drawText(`ID: ${options.studentId}`, { x: 50, y, size: 14, font });
    y -= 20;
    page.drawText(`Section: ${options.section}`, { x: 50, y, size: 14, font });
    y -= 40;
  } else if (options.type === "group" && options.groupMembers) {
    page.drawText("Group Members:", { x: 50, y, size: 14, font });
    y -= 20;
    options.groupMembers.forEach((member) => {
      page.drawText(`- ${member.name} (${member.id})`, {
        x: 70,
        y,
        size: 12,
        font,
      });
      y -= 20;
    });
    y -= 20;
  }

  page.drawText(`Instructor: ${options.instructorName}`, {
    x: 50,
    y,
    size: 14,
    font,
  });
  y -= 20;
  page.drawText(`Submission Date: ${options.submissionDate}`, {
    x: 50,
    y,
    size: 14,
    font,
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(options.outputFile, pdfBytes);
  return pdfBytes;
}
