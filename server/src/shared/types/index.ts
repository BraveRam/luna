export interface CoverPageOptions {
  logoUrl: string;
  collegeName: string;
  assignmentTitle: string;
  instructorName: string;
  submissionDate: string;
  departmentName: string; // "MIT"
  type: "individual" | "group";
  studentName?: string;
  section?: string;
  groupMembers?: { name: string; }[];
}