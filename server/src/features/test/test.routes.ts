import { Hono } from "hono";
import { createCoverPage } from "../../shared/utils/cover.ts";
import fs from "fs/promises";
import { MainContentService } from "../../services/main-content.service.ts";
import { OutlineService } from "../../services/outline.service.ts";
import { PDFService } from "../../services/pdf.service.ts";
import { PDFDocument } from "pdf-lib";

const test = new Hono();

function normalizeBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return false;
}

function formatSubmissionDate(dateInput: unknown): string {
  const date = new Date(String(dateInput));
  return date.toDateString().split(" ").slice(1).join(" ");
}

function toNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function buildCoverPage(body: Record<string, unknown>, logoUrl: string) {
  const common = {
    logoUrl,
    collegeName: String(body["collegeName"] ?? ""),
    assignmentTitle: String(body["subject"] ?? ""),
    instructorName: String(body["teacherName"] ?? ""),
    submissionDate: formatSubmissionDate(body["submissionDate"]),
    section: String(body["section"] ?? ""),
    departmentName: String(body["universityName"] ?? ""),
  };

  const assignmentType = String(body["assignmentType"] ?? "");

  if (assignmentType === "individual") {
    return createCoverPage({
      ...common,
      type: "individual",
      studentName: String(body["studentName"] ?? ""),
    });
  }

  if (assignmentType === "group") {
    let groupMembers: { name: string }[] = [];
    const groupMembersRaw = body["groupMembers"];
    if (typeof groupMembersRaw === "string" && groupMembersRaw.trim().length) {
      try {
        const parsed = JSON.parse(groupMembersRaw);
        groupMembers = Object.values(parsed) as { name: string }[];
      } catch {
        // ignore parse stuff error
      }
    }

    return createCoverPage({
      ...common,
      type: "group",
      groupMembers,
    });
  }

  throw new Error("Unsupported assignment type");
}

async function generateMainContent(body: Record<string, unknown>, numPages: number) {
  return new MainContentService().generateMainContent(
    body["assignmentPdf"],
    "gemini-2.5-flash",
    numPages,
    {
      includeReferences: normalizeBoolean(body["references"]),
      universityName: String(body["universityName"] ?? ""),
    }
  );
}

async function generateOutlines(mainContent: Uint8Array, enabled: boolean) {
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

test.post("/", async (c) => {
  try {
    const body = await c.req.parseBody();

    const logoUrl =
      "https://res.cloudinary.com/dk4jjixuh/image/upload/v1755106309/Addis_Ababa_University_Logo_itw0fq.png";

    if (!body["assignmentPdf"]) {
      return c.json({ message: "No assignment PDF uploaded" }, 400);
    }

    const numPages = toNumber(body["numPages"]);
    if (numPages === null) {
      return c.json({ message: "No number of pages specified" }, 400);
    }
    if (numPages < 1 || numPages > 10) {
      return c.json({ message: "Number of pages must be at least 1 and at most 10" }, 400);
    }

    const coverPageType = String(body["coverPageType"] ?? "");
    if (coverPageType !== "auto" && coverPageType !== "custom") {
      return c.json({ message: "Invalid cover page type" }, 400);
    }

    let coverPage: Buffer;
    if (coverPageType === "auto") {
      coverPage = await buildCoverPage(body, logoUrl);
    } else {
      const uploaded = body["coverPageFile"] as any;
      if (!uploaded) {
        return c.json({ message: "No custom cover PDF uploaded" }, 400);
      }

      let coverBuffer: Buffer;
      if (typeof uploaded.arrayBuffer === "function") {
        const ab = await uploaded.arrayBuffer();
        coverBuffer = Buffer.from(new Uint8Array(ab));
      } else if (uploaded instanceof Uint8Array || Buffer.isBuffer(uploaded)) {
        coverBuffer = Buffer.from(uploaded);
      } else {
        return c.json({ message: "Invalid custom cover PDF file" }, 400);
      }

      const pdf = await PDFDocument.load(coverBuffer);
      const pageCount = pdf.getPageCount();
      if (pageCount !== 1) {
        return c.json({ message: "Custom cover PDF must have exactly one page" }, 400);
      }

      const normalized = await PDFDocument.create();
      const [page] = await normalized.copyPages(pdf, [0]);
      normalized.addPage(page);
      const normalizedBytes = await normalized.save();
      coverPage = Buffer.from(normalizedBytes);
    }

    const mainContent = await generateMainContent(body, numPages);

    const outlinesEnabled = normalizeBoolean(body["outlines"]);
    const outlines = await generateOutlines(mainContent, outlinesEnabled);

    const pdfsToMerge = outlines ? [coverPage, outlines, mainContent] : [coverPage, mainContent];
    const mergedPdf = await PDFService.mergePDFs(pdfsToMerge);
    PDFService.saveToFile(mergedPdf, "merged.pdf");

    console.log("it is all done baby.")

    return c.json({ message: "ok" });
  } catch (err) {
    return c.json({ message: "Internal Server Error", error: String(err) }, 500);
  }
});

export default test;