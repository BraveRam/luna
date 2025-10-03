import { rgb, type PDFPage } from "pdf-lib";
import { wrapFormattedText } from "./utils.ts";

export function drawFormattedText(
  page: PDFPage,
  textParts: { text: string; bold: boolean; italic: boolean }[],
  x: number,
  y: number,
  regularFont: any,
  boldFont: any,
  fontSize: number,
  color: any
): void {
  let currentX = x;

  for (const part of textParts) {
    const font = part.bold ? boldFont : regularFont;

    page.drawText(part.text, {
      x: currentX,
      y: y,
      size: fontSize,
      font: font,
      color: color,
    });

    currentX += font.widthOfTextAtSize(part.text, fontSize);
  }
}

export function drawTableOfContentsLineWithFormatting(
  page: PDFPage,
  titleParts: { text: string; bold: boolean; italic: boolean }[],
  pageNum: string,
  x: number,
  y: number,
  maxWidth: number,
  regularFont: any,
  boldFont: any,
  fontSize: number,
  color: any = rgb(0, 0, 0)
): number {
  const pageNumberFontSize = 12;

  const FIXED_PAGE_NUMBER_POSITION = 512;

  const dotsStartMargin = 20;
  const availableWidth = FIXED_PAGE_NUMBER_POSITION - x - dotsStartMargin;

  const wrappedTitleLines = wrapFormattedText(
    titleParts,
    availableWidth,
    regularFont,
    boldFont,
    fontSize
  );

  let currentY = y;

  for (let i = 0; i < wrappedTitleLines.length; i++) {
    const line = wrappedTitleLines[i];

    drawFormattedText(
      page,
      line,
      x,
      currentY,
      regularFont,
      boldFont,
      fontSize,
      color
    );

    if (i === wrappedTitleLines.length - 1) {
      let lineWidth = 0;
      for (const part of line) {
        const font = part.bold ? boldFont : regularFont;
        lineWidth += font.widthOfTextAtSize(part.text, fontSize);
      }

      page.drawText(pageNum, {
        x: FIXED_PAGE_NUMBER_POSITION,
        y: currentY,
        size: pageNumberFontSize,
        font: regularFont,
        color: color,
      });

      const dotStartX = x + lineWidth + 8;
      const dotEndX = FIXED_PAGE_NUMBER_POSITION - 8;
      const dotWidth = dotEndX - dotStartX;

      if (dotWidth > 0) {
        const dotSpacing = 3;
        const numDots = Math.floor(dotWidth / dotSpacing);

        for (let j = 0; j < numDots; j++) {
          const dotX = dotStartX + j * dotSpacing;
          page.drawText(".", {
            x: dotX,
            y: currentY + 1,
            size: fontSize - 1,
            font: regularFont,
            color: rgb(0.6, 0.6, 0.6),
          });
        }
      }
    }

    if (i < wrappedTitleLines.length - 1) {
      currentY -= fontSize + 2;
    }
  }

  return currentY;
}
