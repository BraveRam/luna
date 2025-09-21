import { config } from "dotenv";
config();
import { GoogleGenAI } from "@google/genai";
import { generatePDF } from "./assignment.js";
import fs from "fs";
import { PDFDocument } from "pdf-lib";
import { createCoverPage } from "../shared/utils/cover.js";
import { MAIN_PROMPT } from "../shared/utils/constants.js";

export async function Gemini({
  model,
  file,
  numberOfPages,
}: {
  model: string;
  file: any;
  numberOfPages: number;
}) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const config = {
    thinkingConfig: {
      thinkingBudget: -1,
    },
  };
  const uploadedFile = await ai.files.upload({
    file: file,
    config: {
      displayName: file.name,
    },
  });
  const prompt = MAIN_PROMPT(numberOfPages);

  const contents = [
    prompt,
    {
      fileData: {
        mimeType: uploadedFile.mimeType,
        fileUri: uploadedFile.uri,
      },
    },
  ];

  const response = await ai.models.generateContent({
    model,
    config,
    contents,
  });

  const mainContentBuffer = await generatePDF(response.text!, "", true);

  // Create File object for outline generation
  const pdfFile = new File([new Uint8Array(mainContentBuffer)], "temp.pdf", {
    type: "application/pdf",
  });

  const outlineResult = await generateOutline(pdfFile, model);
  const outlineBuffer = await generatePDF(outlineResult.content, "", true);
  const coverBuffer = await createCoverPage({
    logoUrl:
      "https://res.cloudinary.com/dk4jjixuh/image/upload/v1755106309/Addis_Ababa_University_Logo_itw0fq.png",
    universityName: "MIT",
    collegeName: "College of Engineering",
    assignmentTitle: "Emerging Technology",
    studentName: "Lencho Mengistu",
    studentId: "UGR/3635/17",
    section: "22",
    instructorName: "Mr. Haile Eyesus Kinde",
    submissionDate: "May 21, 2025",
    outputFile: "assignment_cover_page.pdf",
  });

  const pdf0 = await PDFDocument.load(coverBuffer);
  const pdf1 = await PDFDocument.load(outlineBuffer);
  const pdf2 = await PDFDocument.load(mainContentBuffer);

  const mergedPdf = await PDFDocument.create();

  const pdf0Pages = await mergedPdf.copyPages(pdf0, pdf0.getPageIndices());
  pdf0Pages.forEach((page) => mergedPdf.addPage(page));

  const pdf1Pages = await mergedPdf.copyPages(pdf1, pdf1.getPageIndices());
  pdf1Pages.forEach((page) => mergedPdf.addPage(page));

  const pdf2Pages = await mergedPdf.copyPages(pdf2, pdf2.getPageIndices());
  pdf2Pages.forEach((page) => mergedPdf.addPage(page));

  const mergedPdfBytes = await mergedPdf.save();
  fs.writeFileSync("merged.pdf", mergedPdfBytes);

  return {
    mainContent: response.text,
    message:
      "✨ Successfully generated merged assignment with table of contents in memory!",
    files: {
      mergedDocument: "merged.pdf",
    },
  };
}

async function generateOutline(file: any, model: string) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const config = {
    thinkingConfig: {
      thinkingBudget: -1,
    },
  };
  const uploadedFile = await ai.files.upload({
    file: file,
    config: {
      displayName: file.name,
    },
  });

  const prompt = `CRITICAL FORMATTING REQUIREMENTS FOR TABLE OF CONTENTS:

You MUST follow this EXACT format with NO deviations:

1. Start with: # TABLE OF CONTENTS
2. Use ONLY these two line formats:
   - Main sections: ">> **Section Title** ........................ 3"
   - Subsections: "    * [Subtopic Title] ........................ 5"

⚠️ ABSOLUTE REQUIREMENTS:
- Use EXACTLY 28 dots (............................) for ALL entries
- Main sections start with ">> **" and end with "** ........................ [number]"
- Subsections start with "    * [" and end with "] ........................ [number]"
- NO other heading formats (no ###, no ####, no >>>, no other symbols)
- Page numbers are single digits or double digits ONLY
- NO extra spaces, NO missing spaces, NO formatting variations
- Use only ASCII characters

EXACT FORMAT EXAMPLE:
# TABLE OF CONTENTS

>> **Introduction** ........................ 1
    * [Background and Context] ........................ 1
    * [Research Objectives] ........................ 2

>> **Literature Review** ........................ 3
    * [Theoretical Framework] ........................ 3
    * [Previous Studies] ........................ 4

>> **Methodology** ........................ 5
    * [Research Design] ........................ 5
    * [Data Collection] ........................ 6

>> **Results and Analysis** ........................ 7
    * [Key Findings] ........................ 7
    * [Statistical Analysis] ........................ 8

>> **Discussion** ........................ 9
    * [Implications] ........................ 9
    * [Limitations] ........................ 10

>> **Conclusion** ........................ 11

>> **References** ........................ 12

ANALYZE the uploaded document and create a table of contents using EXACTLY this format. Extract all major sections and subsections from the document content. Estimate appropriate page numbers based on content length.

DO NOT add any extra text, explanations, or commentary. OUTPUT ONLY the formatted table of contents.`;

  const contents = [
    prompt,
    {
      fileData: {
        mimeType: uploadedFile.mimeType,
        fileUri: uploadedFile.uri,
      },
    },
  ];

  const response = await ai.models.generateContent({
    model,
    config,
    contents,
  });

  console.log("it is all done, baby");

  return {
    success: true,
    content: response.text!,
    filename: "outline.pdf",
  };
}
