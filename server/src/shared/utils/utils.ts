import { PDFPage, rgb } from "pdf-lib";
import { parseMarkdownLine } from "./parse.js";
import {
  drawFormattedText,
  drawTableOfContentsLineWithFormatting,
} from "./draw.js";

export function wrapText(
  text: string,
  maxWidth: number,
  font: any,
  fontSize: number
): string[] {
  const words: string[] = text.split(" ");
  const lines: string[] = [];
  let line: string = "";

  for (const word of words) {
    const testLine: string = line ? line + " " + word : word;
    const lineWidth: number = font.widthOfTextAtSize(testLine, fontSize);

    if (lineWidth > maxWidth && line.length > 0) {
      if (line.length > 20 || word.length > 15) {
        lines.push(line.trim());
        line = word;
      } else {
        line = testLine;
      }
    } else {
      line = testLine;
    }
  }

  if (line.trim().length > 0) {
    lines.push(line.trim());
  }

  return lines.filter((l) => l.length > 0);
}

export function wrapFormattedText(
  textParts: { text: string; bold: boolean; italic: boolean }[],
  maxWidth: number,
  regularFont: any,
  boldFont: any,
  fontSize: number
): { text: string; bold: boolean; italic: boolean }[][] {
  const lines: { text: string; bold: boolean; italic: boolean }[][] = [];
  let currentLine: { text: string; bold: boolean; italic: boolean }[] = [];
  let currentLineWidth = 0;

  for (const part of textParts) {
    const font = part.bold ? boldFont : regularFont;
    const words = part.text.split(" ");

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const wordWidth = font.widthOfTextAtSize(word, fontSize);
      const spaceWidth = font.widthOfTextAtSize(" ", fontSize);
      const testWidth =
        currentLineWidth +
        (currentLine.length > 0 ? spaceWidth : 0) +
        wordWidth;

      if (testWidth > maxWidth && currentLine.length > 0) {
        lines.push([...currentLine]);
        currentLine = [{ text: word, bold: part.bold, italic: part.italic }];
        currentLineWidth = wordWidth;
      } else {
        if (currentLine.length > 0) {
          const lastPart = currentLine[currentLine.length - 1];
          if (lastPart.bold === part.bold && lastPart.italic === part.italic) {
            lastPart.text += " " + word;
          } else {
            currentLine.push({
              text: " " + word,
              bold: part.bold,
              italic: part.italic,
            });
          }
        } else {
          currentLine.push({
            text: word,
            bold: part.bold,
            italic: part.italic,
          });
        }
        currentLineWidth = testWidth;
      }
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines.filter((line) => line.length > 0);
}

export function drawTableOfContentsLine(
  page: PDFPage,
  title: string,
  pageNum: string,
  x: number,
  y: number,
  maxWidth: number,
  font: any,
  fontSize: number,
  color: any = rgb(0, 0, 0)
): void {
  page.drawText(title, {
    x,
    y,
    size: fontSize,
    font,
    color,
  });

  const pageNumberFontSize = 12;

  const FIXED_PAGE_NUMBER_POSITION = 512;

  page.drawText(pageNum, {
    x: FIXED_PAGE_NUMBER_POSITION,
    y,
    size: pageNumberFontSize,
    font,
    color,
  });

  const titleWidth = font.widthOfTextAtSize(title, fontSize);
  const dotStartX = x + titleWidth + 8;
  const dotEndX = FIXED_PAGE_NUMBER_POSITION - 8;
  const dotWidth = dotEndX - dotStartX;

  if (dotWidth > 0) {
    const dotSpacing = 3;
    const numDots = Math.floor(dotWidth / dotSpacing);

    for (let i = 0; i < numDots; i++) {
      const dotX = dotStartX + i * dotSpacing;
      page.drawText(".", {
        x: dotX,
        y: y + 1,
        size: fontSize - 1,
        font,
        color: rgb(0.6, 0.6, 0.6),
      });
    }
  }
}

export function enhancedTableOfContentsFormatting(
  pageText: string,
  page: PDFPage,
  y: number,
  margin: number,
  contentWidth: number,
  font: any,
  fontBold: any,
  fontItalic: any
): number {
  const lines = pageText.split("\n").filter((line) => line.trim().length > 0);
  let currentY = y;
  const baseLineHeight = 20;

  for (const line of lines) {
    let fontSize = 11;
    let selectedFont = font;
    let indent = 0;
    let lineHeight = baseLineHeight;
    let textColor = rgb(0, 0, 0);

    if (line.startsWith("# ")) {
      fontSize = 20;
      selectedFont = fontBold;
      lineHeight = 28;
      textColor = rgb(0.1, 0.1, 0.1);

      const titleText = line.slice(2).trim();
      const titleParts = parseMarkdownLine(titleText);

      let totalTitleWidth = 0;
      for (const part of titleParts) {
        const partFont = part.bold ? selectedFont : font;
        totalTitleWidth += partFont.widthOfTextAtSize(part.text, fontSize);
      }

      const centerX = margin + (contentWidth - totalTitleWidth) / 2;
      drawFormattedText(
        page,
        titleParts,
        centerX,
        currentY,
        font,
        selectedFont,
        fontSize,
        textColor
      );
    } else if (line.startsWith(">> ")) {
      // Main topics with >> prefix and **bold** formatting
      fontSize = 14;
      selectedFont = fontBold;
      lineHeight = 22;
      indent = 0; // Main topics at 0px indentation
      textColor = rgb(0, 0, 0); // Black text as specified

      const content = line.slice(3).trim();
      const pageMatch = content.match(/^(.+?)\s*\.+\s*(\d+)$/);

      if (pageMatch) {
        const [, title, pageNum] = pageMatch;
        const titleParts = parseMarkdownLine(title.trim());
        currentY = drawTableOfContentsLineWithFormatting(
          page,
          titleParts,
          pageNum.trim(),
          margin + indent,
          currentY,
          contentWidth - indent,
          font,
          selectedFont,
          fontSize,
          textColor
        );
      } else {
        const contentParts = parseMarkdownLine(content);
        drawFormattedText(
          page,
          contentParts,
          margin + indent,
          currentY,
          font,
          selectedFont,
          fontSize,
          textColor
        );
      }
    } else if (line.startsWith("* [") || line.startsWith("    * [")) {
      fontSize = 12;
      selectedFont = font;
      lineHeight = 18;
      indent = 40;
      textColor = rgb(0, 0, 0);

      const content = line.startsWith("    * [")
        ? line.slice(6).trim()
        : line.slice(2).trim();

      const bracketMatch = content.match(/^\[(.+?)\](.*)$/);
      if (bracketMatch) {
        const [, title, rest] = bracketMatch;
        const pageMatch = rest.match(/\s*\.+\s*(\d+)$/);

        if (pageMatch) {
          const pageNum = pageMatch[1];
          const titleParts = parseMarkdownLine(title.trim());
          currentY = drawTableOfContentsLineWithFormatting(
            page,
            titleParts,
            pageNum.trim(),
            margin + indent,
            currentY,
            contentWidth - indent,
            font,
            selectedFont,
            fontSize,
            textColor
          );
        } else {
          const titleParts = parseMarkdownLine(title.trim());
          drawFormattedText(
            page,
            titleParts,
            margin + indent,
            currentY,
            font,
            selectedFont,
            fontSize,
            textColor
          );
        }
      }
    } else {
      const contentParts = parseMarkdownLine(line);
      const wrappedLines = wrapFormattedText(
        contentParts,
        contentWidth,
        font,
        fontBold,
        fontSize
      );

      for (const wrappedLine of wrappedLines) {
        drawFormattedText(
          page,
          wrappedLine,
          margin,
          currentY,
          font,
          fontBold,
          fontSize,
          textColor
        );
        currentY -= lineHeight;
      }
      continue;
    }

    currentY -= lineHeight;

    if (line.startsWith("# ") || line.startsWith(">>")) {
      currentY -= 8;
    }
  }

  `
  I break up with my ex girl 
  here is the number
  sike that's the wrong number
  `

  return currentY;
}
