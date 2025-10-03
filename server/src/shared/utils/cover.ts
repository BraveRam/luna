import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fetch from "node-fetch"; // Use node-fetch for server-side image fetching
import type { CoverPageOptions } from "../types/index.ts";

export async function createCoverPage(
  options: CoverPageOptions
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();

  // Add a border to the whole page for a professional look
  const pageMargin = 25;
  page.drawRectangle({
    x: pageMargin,
    y: pageMargin,
    width: width - 2 * pageMargin,
    height: height - 2 * pageMargin,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1.5,
  });

  // Embed fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(
    StandardFonts.HelveticaBold
  );

  // 1. Add University Logo
  const logoImageBytes = await fetch(options.logoUrl).then((res) =>
    res.arrayBuffer()
  );
  const logoImage = await pdfDoc.embedPng(logoImageBytes);
  // --- MODIFIED: Increased logo size further ---
  const logoDims = logoImage.scale(0.58);
  page.drawImage(logoImage, {
    x: width / 2 - logoDims.width / 2,
    y: height - 225, // Adjusted y-position for the larger logo
    width: logoDims.width,
    height: logoDims.height,
  });

  let y = height - 220;

  // 2. Department and College Name
  const mitText = options.departmentName;
  const mitTextWidth = helveticaBoldFont.widthOfTextAtSize(mitText, 24);
  page.drawText(mitText, {
    x: width / 2 - mitTextWidth / 2,
    y: y - 50,
    size: 24,
    font: helveticaBoldFont,
  });

  const collegeText = options.collegeName;
  const collegeTextWidth = helveticaFont.widthOfTextAtSize(collegeText, 16);
  page.drawText(collegeText, {
    x: width / 2 - collegeTextWidth / 2,
    // --- MODIFIED: Pushed college name down ---
    y: y - 80,
    size: 16,
    font: helveticaFont,
  });

  // 3. Horizontal Line
  y -= 115;
  page.drawLine({
    start: { x: 150, y },
    end: { x: width - 150, y },
    thickness: 1,
  });

  // 4. Assignment Title Box
  y -= 30;
  const titleBoxHeight = 80;
  const titleBoxWidth = 350;
  page.drawRectangle({
    x: width / 2 - titleBoxWidth / 2,
    y: y - titleBoxHeight,
    width: titleBoxWidth,
    height: titleBoxHeight,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
    color: rgb(0.98, 0.98, 0.98),
  });

  const assignmentLabel = "ASSIGNMENT TITLE";
  const labelWidth = helveticaFont.widthOfTextAtSize(assignmentLabel, 10);
  page.drawText(assignmentLabel, {
    x: width / 2 - labelWidth / 2,
    y: y - 25,
    size: 10,
    font: helveticaFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  const titleText = options.assignmentTitle;
  const titleWidth = helveticaBoldFont.widthOfTextAtSize(titleText, 20);
  page.drawText(titleText, {
    x: width / 2 - titleWidth / 2,
    y: y - 55,
    size: 20,
    font: helveticaBoldFont,
  });

  // 5. Submission Details Box
  // --- MODIFICATION START ---
  let detailsBoxHeight = 150; // Default height for individual
  if (options.type === "group" && options.groupMembers) {
    // Calculate dynamic height for the group box
    const baseHeight = 80; // Base height for headers, padding, and "Group Members" title
    const heightPerMember = 20;
    detailsBoxHeight = baseHeight + options.groupMembers.length * heightPerMember;
  }
  
  y -= (150 + detailsBoxHeight); // Adjust y based on the new box height
  const detailsBoxWidth = 500;
  const detailsBoxX = width / 2 - detailsBoxWidth / 2;
  
  page.drawRectangle({
    x: detailsBoxX,
    y: y, // Use the adjusted y
    width: detailsBoxWidth,
    height: detailsBoxHeight,
    borderColor: rgb(0.85, 0.85, 0.85),
    borderWidth: 1,
  });

  // Submitted By Section
  const submittedByX = detailsBoxX + 30;
  let submittedByY = y + detailsBoxHeight - 30; // Start drawing from the top of the new box

  page.drawText("SUBMITTED BY", {
    x: submittedByX,
    y: submittedByY,
    font: helveticaBoldFont,
    size: 12,
    color: rgb(0.3, 0.5, 0.8), // Blue color
  });

  submittedByY -= 25;

  if (options.type === "individual") {
    page.drawText(`Student Name:`, { x: submittedByX, y: submittedByY, size: 12, font: helveticaFont });
    page.drawText(options.studentName!, { x: submittedByX + 100, y: submittedByY, size: 12, font: helveticaFont });
    submittedByY -= 20;
    page.drawText(`Section:`, { x: submittedByX, y: submittedByY, size: 12, font: helveticaFont });
    page.drawText(options.section!, { x: submittedByX + 100, y: submittedByY, size: 12, font: helveticaFont });
  } else if (options.type === 'group' && options.groupMembers) {
    page.drawText('Group Members:', { x: submittedByX, y: submittedByY, size: 12, font: helveticaBoldFont });
    submittedByY -= 25;
    options.groupMembers.forEach(member => {
        page.drawText(`- ${member.name}`, { x: submittedByX + 10, y: submittedByY, size: 12, font: helveticaFont });
        submittedByY -= 20;
    });
  }

  // Submitted To Section
  const submittedToX = detailsBoxX + 280;
  let submittedToY = y + detailsBoxHeight - 30; // Start drawing from the top of the new box

  page.drawText("SUBMITTED TO", {
    x: submittedToX,
    y: submittedToY,
    font: helveticaBoldFont,
    size: 12,
    color: rgb(0.8, 0.2, 0.2), // Red color
  });
  
  submittedToY -= 25;

  page.drawText(`Instructor:`, { x: submittedToX, y: submittedToY, size: 12, font: helveticaFont });
  page.drawText(options.instructorName, { x: submittedToX + 60, y: submittedToY, size: 12, font: helveticaFont });
  submittedToY -= 20;
  page.drawText(`Submission Date:`, { x: submittedToX, y: submittedToY, size: 12, font: helveticaFont });
  page.drawText(options.submissionDate, { x: submittedToX + 100, y: submittedToY, size: 12, font: helveticaFont });
  // --- MODIFICATION END ---

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
