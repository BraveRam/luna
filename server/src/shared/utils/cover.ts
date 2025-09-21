import fetch from "node-fetch";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { createCoverPageProps } from "../types/index.js";

export async function createCoverPage({
  logoUrl,
  universityName,
  collegeName,
  assignmentTitle,
  studentName,
  studentId,
  section,
  instructorName,
  submissionDate,
}: createCoverPageProps): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 842]);

  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();
  const margin = 72;
  const centerX = pageWidth / 2;

  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
    color: rgb(1, 1, 1),
  });

  page.drawRectangle({
    x: margin / 2,
    y: margin / 2,
    width: pageWidth - margin,
    height: pageHeight - margin,
    borderColor: rgb(0.2, 0.2, 0.2),
    borderWidth: 2,
  });

  let yPos = pageHeight - 100;

  try {
    const logoBytes = await fetch(logoUrl).then((res) => res.arrayBuffer());
    const logo = await pdfDoc.embedPng(logoBytes);
    const logoWidth = 120;
    const logoHeight = (logo.height / logo.width) * logoWidth;

    page.drawImage(logo, {
      x: centerX - logoWidth / 2,
      y: yPos - logoHeight,
      width: logoWidth,
      height: logoHeight,
    });
    yPos -= logoHeight + 30;
  } catch (error) {
    console.warn("Could not load logo, skipping...");
    yPos -= 30;
  }

  const universityFontSize = 22;
  page.drawText(universityName.toUpperCase(), {
    x:
      centerX -
      helveticaBold.widthOfTextAtSize(
        universityName.toUpperCase(),
        universityFontSize
      ) /
        2,
    y: yPos,
    size: universityFontSize,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  yPos -= 40;

  const collegeFontSize = 16;
  page.drawText(collegeName, {
    x: centerX - helvetica.widthOfTextAtSize(collegeName, collegeFontSize) / 2,
    y: yPos,
    size: collegeFontSize,
    font: helvetica,
    color: rgb(0.2, 0.2, 0.2),
  });
  yPos -= 60;

  page.drawLine({
    start: { x: centerX - 150, y: yPos },
    end: { x: centerX + 150, y: yPos },
    thickness: 2,
    color: rgb(0.3, 0.3, 0.3),
  });
  yPos -= 40;

  const titleBoxHeight = 80;
  const titleBoxWidth = 400;
  const titleBoxX = centerX - titleBoxWidth / 2;

  page.drawRectangle({
    x: titleBoxX,
    y: yPos - titleBoxHeight,
    width: titleBoxWidth,
    height: titleBoxHeight,
    color: rgb(0.97, 0.97, 0.97),
    borderColor: rgb(0.7, 0.7, 0.7),
    borderWidth: 1,
  });

  const titleLabelFontSize = 14;
  const titleLabel = "ASSIGNMENT TITLE";
  page.drawText(titleLabel, {
    x:
      centerX -
      helveticaBold.widthOfTextAtSize(titleLabel, titleLabelFontSize) / 2,
    y: yPos - 25,
    size: titleLabelFontSize,
    font: helveticaBold,
    color: rgb(0.4, 0.4, 0.4),
  });

  const titleFontSize = 18;
  const maxTitleWidth = titleBoxWidth - 40;

  if (
    timesRomanBold.widthOfTextAtSize(assignmentTitle, titleFontSize) >
    maxTitleWidth
  ) {
    const words = assignmentTitle.split(" ");
    let line1 = "";
    let line2 = "";

    for (const word of words) {
      const testLine = line1 + (line1 ? " " : "") + word;
      if (
        timesRomanBold.widthOfTextAtSize(testLine, titleFontSize) <=
        maxTitleWidth
      ) {
        line1 = testLine;
      } else {
        line2 = (line2 ? line2 + " " : "") + word;
      }
    }

    page.drawText(line1, {
      x: centerX - timesRomanBold.widthOfTextAtSize(line1, titleFontSize) / 2,
      y: yPos - 45,
      size: titleFontSize,
      font: timesRomanBold,
      color: rgb(0, 0, 0),
    });

    if (line2) {
      page.drawText(line2, {
        x: centerX - timesRomanBold.widthOfTextAtSize(line2, titleFontSize) / 2,
        y: yPos - 65,
        size: titleFontSize,
        font: timesRomanBold,
        color: rgb(0, 0, 0),
      });
    }
  } else {
    page.drawText(assignmentTitle, {
      x:
        centerX -
        timesRomanBold.widthOfTextAtSize(assignmentTitle, titleFontSize) / 2,
      y: yPos - 50,
      size: titleFontSize,
      font: timesRomanBold,
      color: rgb(0, 0, 0),
    });
  }

  yPos -= titleBoxHeight + 60;

  const infoBoxWidth = 450;
  const infoBoxHeight = 160;
  const infoBoxX = centerX - infoBoxWidth / 2;

  page.drawRectangle({
    x: infoBoxX,
    y: yPos - infoBoxHeight,
    width: infoBoxWidth,
    height: infoBoxHeight,
    color: rgb(0.98, 0.98, 1),
    borderColor: rgb(0.6, 0.6, 0.8),
    borderWidth: 1,
  });

  const leftColumn = infoBoxX + 30;
  const rightColumn = centerX + 20;
  const infoFontSize = 12;
  const labelFontSize = 11;

  let infoYPos = yPos - 30;

  page.drawText("SUBMITTED BY", {
    x: leftColumn,
    y: infoYPos,
    size: labelFontSize,
    font: helveticaBold,
    color: rgb(0.3, 0.3, 0.6),
  });
  infoYPos -= 25;

  page.drawText("Student Name:", {
    x: leftColumn,
    y: infoYPos,
    size: labelFontSize,
    font: helveticaBold,
    color: rgb(0.4, 0.4, 0.4),
  });
  page.drawText(studentName, {
    x: leftColumn + 90,
    y: infoYPos,
    size: infoFontSize,
    font: timesRoman,
    color: rgb(0, 0, 0),
  });
  infoYPos -= 20;

  page.drawText("Student ID:", {
    x: leftColumn,
    y: infoYPos,
    size: labelFontSize,
    font: helveticaBold,
    color: rgb(0.4, 0.4, 0.4),
  });
  page.drawText(studentId, {
    x: leftColumn + 90,
    y: infoYPos,
    size: infoFontSize,
    font: timesRoman,
    color: rgb(0, 0, 0),
  });
  infoYPos -= 20;

  page.drawText("Section:", {
    x: leftColumn,
    y: infoYPos,
    size: labelFontSize,
    font: helveticaBold,
    color: rgb(0.4, 0.4, 0.4),
  });
  page.drawText(section, {
    x: leftColumn + 90,
    y: infoYPos,
    size: infoFontSize,
    font: timesRoman,
    color: rgb(0, 0, 0),
  });

  infoYPos = yPos - 30;
  page.drawText("SUBMITTED TO", {
    x: rightColumn,
    y: infoYPos,
    size: labelFontSize,
    font: helveticaBold,
    color: rgb(0.6, 0.3, 0.3),
  });
  infoYPos -= 25;

  page.drawText("Instructor:", {
    x: rightColumn,
    y: infoYPos,
    size: labelFontSize,
    font: helveticaBold,
    color: rgb(0.4, 0.4, 0.4),
  });
  page.drawText(instructorName, {
    x: rightColumn + 70,
    y: infoYPos,
    size: infoFontSize,
    font: timesRoman,
    color: rgb(0, 0, 0),
  });
  infoYPos -= 40;

  page.drawText("Submission Date:", {
    x: rightColumn,
    y: infoYPos,
    size: labelFontSize,
    font: helveticaBold,
    color: rgb(0.4, 0.4, 0.4),
  });
  page.drawText(submissionDate, {
    x: rightColumn + 100,
    y: infoYPos,
    size: infoFontSize,
    font: timesRoman,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();

  const coverBuffer = Buffer.from(pdfBytes);
  return coverBuffer;
}
