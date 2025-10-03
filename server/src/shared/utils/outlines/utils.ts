import { OutlineService } from "../../../services/outline.service.ts";

export async function generateOutlines(mainContent: Uint8Array, enabled: boolean) {
  if (!enabled) return null;

  const mainContentBlob = new Blob([mainContent as any], { type: "application/pdf" });
  const mainContentFile = Object.assign(mainContentBlob, {
    name: "main-content.pdf",
    size_bytes: mainContent.length,
  });

  const outlines = await new OutlineService().generateOutline(
    mainContentFile,
    "gemini-2.5-flash"
  );
  return outlines;
}