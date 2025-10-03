import { MainContentService } from "../../../services/main-content.service.ts";
import { normalizeBoolean } from "../cover/utils.ts";

export async function generateMainContent(file: Buffer, body: Record<string, unknown>, numPages: number) {
  const mainContentBlob = new Blob([file as any], { type: "application/pdf" });
  const mainContentFileRaw = Object.assign(mainContentBlob, {
    name: "main-content-raw.pdf",
    size_bytes: file.length,
  });
  return new MainContentService().generateMainContent(
    mainContentFileRaw,
    "gemini-2.5-flash",
    numPages,
    {
      includeReferences: normalizeBoolean(body["references"]),
      universityName: String(body["universityName"] ?? ""),
    }
  );
}