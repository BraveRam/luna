import { Hono, type Context } from "hono";
import { PDFService } from "../../services/pdf.service.ts";
import { PDFDocument } from "pdf-lib";
import { clerkAuth } from "../../middleware/auth.ts";
import {
  buildCoverPage,
  normalizeBoolean,
  normalizeToBuffer,
  toNumber,
} from "../../shared/utils/cover/utils.ts";
import { generateMainContent } from "../../shared/utils/main/utils.ts";
import { generateOutlines } from "../../shared/utils/outlines/utils.ts";
import { env } from "../../config/env.ts";
import { Client } from "@upstash/qstash";
import {
  deleteFile,
  downloadFile,
  uploadToUtils,
} from "../../storage/utils/index.ts";
import crypto from "crypto";
import { uploadToMain } from "../../storage/main/index.ts";
import { db } from "../../config/db.ts";
import { assignments } from "../../db/schema.ts";
import { eq } from "drizzle-orm";

const test = new Hono();

const client = new Client({ token: env.QSTASH_TOKEN });

test.post("/queue", async (c) => {
  const body = await c.req.json();

  console.log("Received job:", body);
  const logoUrl =
    "https://res.cloudinary.com/dk4jjixuh/image/upload/v1755106309/Addis_Ababa_University_Logo_itw0fq.png";

  try {
    let coverPage: Buffer;
    if (body["coverPageType"] === "auto") {
      coverPage = await buildCoverPage(body, logoUrl);
    } else {
      const uploaded = (await downloadFile(body["coverPageFile"])) as any;
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
        return c.json(
          { message: "Custom cover PDF must have exactly one page" },
          400
        );
      }
      const normalized = await PDFDocument.create();
      const [page] = await normalized.copyPages(pdf, [0]);
      normalized.addPage(page);
      const normalizedBytes = await normalized.save();
      coverPage = Buffer.from(normalizedBytes);
    }

    let mainBuffer;

    try {
      mainBuffer = await downloadFile(body["assignmentPdf"]);
      console.log("Downloaded assignment PDF:", mainBuffer.byteLength);
    } catch (err) {
      console.error("Error downloading assignment PDF:", err);
      return c.json({ message: "Failed to download assignment PDF" }, 500);
    }
    const mainContent = await generateMainContent(
      mainBuffer,
      body,
      body["numPages"]
    );
    const outlinesEnabled = normalizeBoolean(body["outlines"]);
    const outlines = await generateOutlines(mainContent, outlinesEnabled);
    const pdfsToMerge = outlines
      ? [coverPage, outlines, mainContent]
      : [coverPage, mainContent];
    const mergedPdf = await PDFService.mergePDFs(pdfsToMerge);
    PDFService.saveToFile(mergedPdf, String(Math.random() * 10) + ".pdf");
    console.log("it is all done baby.");
    await uploadToMain(
      mergedPdf as Buffer<ArrayBufferLike>,
      `final-${crypto.randomUUID()}.pdf`
    );
    const deleted = await deleteFile(body["assignmentPdf"]);
    console.log(deleted);
    await db
      .update(assignments)
      .set({ filePath: body["assignmentPdf"], status: "done" })
      .where(eq(assignments.id, body["assignmentId"]));

    return c.json({ message: "ok" });
  } catch (err) {
    return c.json(
      { message: "Internal Server Error", error: String(err) },
      500
    );
  }
});

test.post("/", clerkAuth, async (c: Context) => {
  const body = await c.req.parseBody();

  // Validation
  if (!body["assignmentPdf"]) {
    return c.json({ message: "No assignment PDF uploaded" }, 400);
  }

  const numPages = Number(body["numPages"]);
  if (!numPages || numPages < 1 || numPages > 10) {
    return c.json({ message: "Invalid number of pages (1–10 required)" }, 400);
  }

  const coverPageType = String(body["coverPageType"] ?? "");
  if (coverPageType !== "auto" && coverPageType !== "custom") {
    return c.json({ message: "Invalid cover page type" }, 400);
  }

  // Insert assignment into DB first — synchronous
  const [inserted] = await db
    .insert(assignments)
    .values({
      userId: c.get("userId"),
      filePath: "",
      status: "pending",
    })
    .returning({ id: assignments.id });

  // Immediately respond to client

  const queues = client.queue({
    queueName: "users-queue",
  });
  const queueInfo = await queues.get();

  const numberOfJobs = queueInfo.lag;

  const response = c.json({ message: "Job queued successfully", queue: numberOfJobs }, 200);

  // 🔹 Fire-and-forget background task (Node.js compatible)
  (async () => {
    try {
      const assignmentPath = `assignment-${crypto.randomUUID()}.pdf`;
      const assignmentBuffer = await normalizeToBuffer(body["assignmentPdf"]);
      await uploadToUtils(assignmentBuffer, assignmentPath);

      let coverPath: string | undefined;
      if (body["coverPageFile"]) {
        coverPath = `cover-${crypto.randomUUID()}.pdf`;
        const coverBuffer = await normalizeToBuffer(body["coverPageFile"]);
        await uploadToUtils(coverBuffer, coverPath);
      }

      const payload = {
        ...body,
        assignmentId: inserted.id, // attach DB ID for tracking
        assignmentPdf: assignmentPath,
        ...(coverPath ? { coverPageFile: coverPath } : {}),
      };

      await client.publishJSON({
        url: "https://ed6c21e5d86f.ngrok-free.app/test/queue",
        body: payload,
        flowControl: { key: "queue", parallelism: 1 },
        retries: 2,
      });

      console.log("✅ Job published:", payload);
    } catch (err) {
      console.error("❌ Background task failed:", err);

      // Optional: mark assignment as failed in DB
      try {
        await db
          .update(assignments)
          .set({ status: "failed" })
          .where(eq(assignments.id, inserted.id));
      } catch (dbErr) {
        console.error("❌ Failed to update assignment status:", dbErr);
      }
    }
  })();

  return response;
});
export default test;
