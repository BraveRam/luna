export interface CoverPageOptions {
  logoUrl: string;
  universityName: string;
  collegeName: string;
  assignmentTitle: string;
  instructorName: string;
  submissionDate: string;
  outputFile: string;

  type: "individual" | "group";

  studentName?: string;
  studentId?: string;
  section?: string;

  groupMembers?: { name: string; id: string }[];
}
