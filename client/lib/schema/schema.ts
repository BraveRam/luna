import { z } from "zod";
import { isPdfFile } from "../utils";

export const pdfFileSchema = z
  .custom<File>((val) => isPdfFile(val), {
    message:
      "Please upload a PDF file containing the content of the assignment",
  })
  .refine((f) => f && f.size <= 5 * 1024 * 1024, {
    message: "Max size is 5MB - don't burn my server, dear",
  });

export const formSchema = z
  .object({
    assignmentPdf: pdfFileSchema,
    numPages: z.coerce
      .number()
      .int()
      .min(1, "Number of pages must be at least 1")
      .max(30, "Number of pages must be at most 30"),

    coverPage: z
      .object({
        type: z.enum(["auto", "custom"]),
        customCoverPdf: z.any().optional(),
      })
      .refine((v) => v.type === "auto" || isPdfFile(v.customCoverPdf), {
        message: "Please upload a one page PDF for the custom cover page",
        path: ["customCoverPdf"],
      }),
    universityName: z.string().optional(),
    collegeName: z.string().optional(),
    subject: z.string().optional(),
    section: z.string().optional(),
    assignmentType: z.enum(["individual", "group"]),
    studentName: z.string().optional(),
    teacherName: z.string().optional(),
    submissionDate: z.instanceof(Date).optional(),
    groupMembers: z
      .array(
        z.object({
          name: z
            .string()
            .min(1, "Name is required")
            .max(50, "Name is too long"),
        })
      )
      .optional(),
    includeOutlines: z.boolean().default(false),
    includeReferences: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.coverPage.type !== "custom") {
      if (!data.universityName || !data.universityName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "University name is required",
          path: ["universityName"],
        });
      }
      if (!data.collegeName || !data.collegeName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "College name is required",
          path: ["collegeName"],
        });
      }
      if (!data.subject || !data.subject.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Subject is required",
          path: ["subject"],
        });
      }

      if (!data.section || !data.section.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Section is required",
          path: ["section"],
        });
      }
    }
    if (
      data.assignmentType === "individual" &&
      data.coverPage.type === "auto"
    ) {
      if (!data.studentName || !data.studentName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter student name",
          path: ["studentName"],
        });
      }
      if (!data.teacherName || !data.teacherName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter teacher name",
          path: ["teacherName"],
        });
      }
      if (!(data.submissionDate instanceof Date)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select your submission date",
          path: ["submissionDate"],
        });
      }
    } else if (
      data.assignmentType === "group" &&
      data.coverPage.type === "auto"
    ) {
      const members = data.groupMembers ?? [];
      if (members.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Add at least 1 member",
          path: ["groupMembers"],
        });
      }
      if (members.length > 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Up to 10 members",
          path: ["groupMembers"],
        });
      }

      if (!data.teacherName || !data.teacherName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter teacher name",
          path: ["teacherName"],
        });
      }

      if (!(data.submissionDate instanceof Date)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select your submission date",
          path: ["submissionDate"],
        });
      }
    }
  });
