"use client";

import {
  BookOpen,
  Bot,
  Calendar,
  CheckCircle2,
  FileText,
  GraduationCap,
  ListOrdered,
  PencilLine,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import { SetStateAction } from "react";

interface ReviewStepProps {
  setStep: (value: SetStateAction<number>) => void;
  handleSubmit: any;
  onSubmit: any;
  onInvalid: any;
}

export default function ReviewStep({
  setStep,
  handleSubmit,
  onSubmit,
  onInvalid,
}: ReviewStepProps) {
  const { setValue, getValues } = useFormContext();
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Review your submission</h2>
      <div className="grid grid-cols-1 gap-4 mb-2">
        <div className="rounded-lg border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 font-bold">
              <FileText className="size-4 text-primary" />
              Assignment
            </div>
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => setStep(0)}
            >
              Edit
            </Button>
          </div>
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="size-4 opacity-70" />
              <span>
                {getValues("assignmentPdf")?.name || "(not set)"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ListOrdered className="size-4 opacity-70" />
              <span>
                <span className="font-bold">Pages:</span>{" "}
                {getValues("numPages")}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 font-bold">
              <GraduationCap className="size-4 text-primary" />
              University & Cover
            </div>
            <div className="flex items-center gap-2">
              {getValues("coverPage").type === "auto" && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setStep(2)}
                >
                  Edit university
                </Button>
              )}
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => setStep(1)}
              >
                Edit cover
              </Button>
            </div>
          </div>
          <div className="text-sm space-y-1">
            {getValues("coverPage").type === "auto" && (
              <div className="flex items-center gap-2">
                <GraduationCap className="size-4 opacity-70" />
                <span>{getValues("universityName")}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <FileText className="size-4 opacity-70" />
              <span>
                <span className="font-bold">Cover:</span>{" "}
                {getValues("coverPage").type === "auto"
                  ? "Auto-generated"
                  : `Custom (${
                      (getValues("coverPage") as any).customCoverPdf
                        ?.name || "file not set"
                    })`}
              </span>
            </div>
            {getValues("coverPage").type === "auto" && (
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 opacity-70" />
                <span>
                  <span className="font-bold">Assignment type:</span>{" "}
                  {getValues("assignmentType")}
                </span>
              </div>
            )}
          </div>
        </div>

        {getValues("coverPage").type === "auto" && (
          <div className="rounded-lg border p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold">
                <User className="size-4 text-primary" />
                Details
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setStep(3)}
                >
                  Edit type
                </Button>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setStep(4)}
                >
                  {getValues("assignmentType") === "group"
                    ? "Edit members"
                    : "Edit details"}
                </Button>
              </div>
            </div>
            {getValues("assignmentType") === "individual" ? (
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <User className="size-4 opacity-70" />
                  <span>
                    <span className="font-bold">Student:</span>{" "}
                    {getValues("studentName")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="size-4 opacity-70" />
                  <span>
                    <span className="font-bold">Teacher:</span>{" "}
                    {getValues("teacherName")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 opacity-70" />
                  <span>
                    <span className="font-bold">Submission date:</span>{" "}
                    {getValues("submissionDate")
                      ? getValues("submissionDate")!.toLocaleDateString()
                      : "(not set)"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <Users className="size-4 opacity-70" />
                  <span className="font-bold">Group members</span>
                </div>
                <ul className="ml-6 list-disc">
                  {(getValues("groupMembers") || []).map((m: any, i: number) => (
                    <li key={i}>{m.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="rounded-lg border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 font-bold">
              <BookOpen className="size-4 text-primary" />
              Sections
            </div>
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => setStep(5)}
            >
              Edit
            </Button>
          </div>
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              {getValues("includeOutlines") ? (
                <CheckCircle2 className="size-4 text-green-600" />
              ) : (
                <XCircle className="size-4 text-muted-foreground" />
              )}
              <span>Outlines</span>
            </div>
            <div className="flex items-center gap-2">
              {getValues("includeReferences") ? (
                <CheckCircle2 className="size-4 text-green-600" />
              ) : (
                <XCircle className="size-4 text-muted-foreground" />
              )}
              <span>References</span>
            </div>
          </div>
        </div>

      </div>

      <Button
        type="button"
        className="h-12 w-full text-base mt-2"
        onClick={() =>
          handleSubmit((data: FormData) => onSubmit(data), onInvalid)()
        }
      >
        Submit now
      </Button>
    </div>
  );
}