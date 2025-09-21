export function parseMarkdownLine(
  line: string
): { text: string; bold: boolean; italic: boolean }[] {
  return parseRegularMarkdown(line);
}

function parseRegularMarkdown(
  line: string
): { text: string; bold: boolean; italic: boolean }[] {
  const parts: { text: string; bold: boolean; italic: boolean }[] = [];
  let remaining = line;

  while (remaining.length > 0) {
    // Look for ** (bold) first, then * (italic), then _ (italic)
    const boldDoubleIndex = remaining.indexOf("**");
    const italicStarIndex = remaining.indexOf("*");
    const italicUnderIndex = remaining.indexOf("_");

    // Filter out the * that's part of **
    const filteredItalicStarIndex =
      italicStarIndex !== -1 &&
      (boldDoubleIndex === -1 || italicStarIndex !== boldDoubleIndex)
        ? italicStarIndex
        : -1;

    const markers = [
      {
        index: boldDoubleIndex,
        type: "bold" as const,
        marker: "**",
        length: 2,
      },
      {
        index: filteredItalicStarIndex,
        type: "italic" as const,
        marker: "*",
        length: 1,
      },
      {
        index: italicUnderIndex,
        type: "italic" as const,
        marker: "_",
        length: 1,
      },
    ]
      .filter((m) => m.index !== -1)
      .sort((a, b) => a.index - b.index);

    if (markers.length === 0) {
      // No formatting markers found, add remaining text as normal
      if (remaining.trim()) {
        parts.push({ text: remaining, bold: false, italic: false });
      }
      break;
    }

    const nextMarker = markers[0];

    // Add text before the marker as normal text
    if (nextMarker.index > 0) {
      const beforeText = remaining.slice(0, nextMarker.index);
      if (beforeText.trim()) {
        parts.push({ text: beforeText, bold: false, italic: false });
      }
    }

    // Find the closing marker
    const afterMarker = remaining.slice(nextMarker.index + nextMarker.length);
    const closingIndex = afterMarker.indexOf(nextMarker.marker);

    if (closingIndex === -1) {
      // No closing marker found, treat as normal text
      const remainingText = remaining.slice(nextMarker.index);
      if (remainingText.trim()) {
        parts.push({ text: remainingText, bold: false, italic: false });
      }
      break;
    }

    // Extract the formatted text
    const formattedText = afterMarker.slice(0, closingIndex);
    if (formattedText.trim()) {
      parts.push({
        text: formattedText,
        bold: nextMarker.type === "bold",
        italic: nextMarker.type === "italic",
      });
    }

    // Continue with remaining text after closing marker
    remaining = afterMarker.slice(closingIndex + nextMarker.length);
  }

  return parts.filter((part) => part.text.length > 0);
}
