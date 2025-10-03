import { Hono } from "hono";
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
import { utilsInit } from "../../storage/utils/utils.ts";
import { downloadFile, uploadToUtils } from "../../storage/utils/index.ts";
import crypto from "crypto";

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
      : [coverPage, mainContent]
    const mergedPdf = await PDFService.mergePDFs(pdfsToMerge);
    PDFService.saveToFile(mergedPdf, String(Math.random() * 10) +".pdf");
    console.log("it is all done baby.");
    return c.json({ message: "ok" });
  } catch (err) {
    return c.json(
      { message: "Internal Server Error", error: String(err) },
      500
    );
  }

  // try {
  //   await utilsInit();
  //   const assignmentBuffer = await downloadFile(assignmentPdfPath);
  //   console.log("Downloaded assignment PDF:", assignmentBuffer.byteLength);
  // } catch(err){
  //   console.error("Error downloading assignment PDF:", err);
  //   return c.json({ message: "Failed to download assignment PDF" }, 500);
  // }

  // console.log("Received job:", body);

  return c.json({ message: "ok" });
});

test.post("/", async (c) => {
  const body = await c.req.parseBody();

  if (!body["assignmentPdf"]) {
    return c.json({ message: "No assignment PDF uploaded" }, 400);
  }

  const numPages = toNumber(body["numPages"]);
  if (numPages === null) {
    return c.json({ message: "No number of pages specified" }, 400);
  }
  if (numPages < 1 || numPages > 10) {
    return c.json(
      { message: "Number of pages must be at least 1 and at most 10" },
      400
    );
  }

  const coverPageType = String(body["coverPageType"] ?? "");
  if (coverPageType !== "auto" && coverPageType !== "custom") {
    return c.json({ message: "Invalid cover page type" }, 400);
  }

  const assignmentPath = `assignment-${crypto.randomUUID()}.pdf`;
  let assignmentBuffer: Buffer;
  try {
    assignmentBuffer = await normalizeToBuffer(body["assignmentPdf"]);
    await utilsInit();
    await uploadToUtils(assignmentBuffer, assignmentPath);
  } catch (err) {
    console.error("Error uploading assignment PDF:", err);
    return c.json({ message: "Failed to upload assignment PDF" }, 500);
  }

  let coverPath: string | undefined;
  try {
    if (body["coverPageFile"]) {
      coverPath = `cover-${crypto.randomUUID()}.pdf`;
      const coverBuffer = await normalizeToBuffer(body["coverPageFile"]);
      await utilsInit();
      await uploadToUtils(coverBuffer, coverPath);
    }

    const payload = {
      ...body,
      assignmentPdf: assignmentPath,
      ...(coverPath ? { coverPageFile: coverPath } : {}),
    };

    console.log("Payload", payload);

    await client.publishJSON({
      url: "https://d645f4a1d6bb.ngrok-free.app/test/queue",
      body: payload,
      flowControl: { key: "queue", parallelism: 1 },
      retries: 2,
    });

    console.log("Job your love");

    return c.json({ message: "Job queued", payload });
  } catch (err) {
    console.error("Error uploading cover PDF:", err);
    return c.json({ message: "Failed to upload cover PDF" }, 500);
  }
});

export default test;
