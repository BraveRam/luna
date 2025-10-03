import { createCoverPage } from "./cover.ts";

export function formatSubmissionDate(dateInput: unknown): string {
  const date = new Date(String(dateInput));
  return date.toDateString().split(" ").slice(1).join(" ");
}

export function toNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function normalizeBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return false;
}

export async function normalizeToBuffer(file: any): Promise<Buffer> {
  if (!file) throw new Error("File missing");

  if (typeof file.arrayBuffer === "function") {
    // Handle File/Blob
    const ab = await file.arrayBuffer();
    return Buffer.from(new Uint8Array(ab));
  }

  if (file instanceof Uint8Array || Buffer.isBuffer(file)) {
    return Buffer.from(file);
  }

  if (typeof file === "string") {
    // In case it comes base64 encoded
    return Buffer.from(file, "base64");
  }

  throw new Error("Unsupported file type for upload");
}


export async function buildCoverPage(body: Record<string, unknown>, logoUrl: string) {
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