"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { formSchema } from "@/lib/schema/schema";
import { type FormData as AssignmentFormData } from "@/lib/types/types";
import { filterFormData } from "@/lib/utils/filterFormData";
import AssignmentUploadStep from "./components/AssignmentUploadStep";
import CoverPageStep from "./components/CoverPageStep";
import UniversityNameStep from "./components/UniversityNameStep";
import AssignmentTypeStep from "./components/AssignmentTypeStep";
import DetailsStep from "./components/DetailsStep";
import SectionsStep from "./components/SectionsStep";
import ReviewStep from "./components/ReviewStep";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTrigger,
} from "@/components/ui/stepper";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const steps = [1, 2, 3, 4, 5];

export default function FormSteps() {
  const [step, setStep] = useState<number>(0);
  const [isDraggingAssignment, setIsDraggingAssignment] =
    useState<boolean>(false);
  const [isDraggingCover, setIsDraggingCover] = useState<boolean>(false);
  const assignmentInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const [isComboboxOpen, setIsComboboxOpen] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  const router = useRouter()

  const { getToken } = useAuth()

  const methods = useForm<AssignmentFormData>({
    resolver: zodResolver(formSchema) as any,
    mode: "onTouched",
    defaultValues: {
      assignmentPdf: undefined as unknown as File,
      numPages: 1,
      universityName: "",
      coverPage: { type: "auto", customCoverPdf: undefined },
      assignmentType: "individual",
      studentName: "",
      teacherName: "",
      submissionDate: undefined,
      groupMembers: [],
      includeOutlines: false,
      includeReferences: false,
      collegeName: "",
      subject: "",
    },
  });

  const { handleSubmit, setValue, watch, trigger } = methods;

  const assignmentType = watch("assignmentType");
  const coverType = watch("coverPage.type");

  useEffect(() => {
    if (assignmentType === "individual") {
      setValue("groupMembers", [], { shouldValidate: false });
    }
  }, [assignmentType, setValue]);

  const stepFields: Array<keyof AssignmentFormData | string> = useMemo(() => {
    switch (step) {
      case 0:
        return ["assignmentPdf", "numPages"];
      case 1:
        return ["coverPage.type", "coverPage.customCoverPdf"];
      case 2:
        return coverType === "auto"
          ? ["universityName", "collegeName", "subject", "section"]
          : [];
      case 3:
        return coverType === "auto" ? ["assignmentType"] : [];
      case 4:
        if (coverType === "custom") return [];
        if (assignmentType === "individual") {
          return ["studentName", "teacherName", "submissionDate"];
        }
        return ["groupMembers", "teacherName", "submissionDate"];
      case 5:
        return ["includeOutlines", "includeReferences"];
      case 6:
        return [];
      default:
        return [];
    }
  }, [step, assignmentType, coverType]);

  const onNext = async () => {
    const isValid = await trigger(stepFields as any);
    if (!isValid) return;
    setStep((current) => {
      let target = current + 1;
      while (
        coverType === "custom" &&
        (target === 2 || target === 3 || target === 4)
      ) {
        target += 1;
      }
      return Math.min(target, 6);
    });
  };
  const onBack = () =>
    setStep((current) => {
      let target = Math.max(current - 1, 0);
      while (
        coverType === "custom" &&
        (target === 4 || target === 3 || target === 2)
      ) {
        target = Math.max(target - 1, 0);
      }
      return target;
    });

  const onSubmit = async (data: AssignmentFormData) => {
    const filteredData = filterFormData(data);
    const formData = new FormData();

    
    formData.append("assignmentPdf", filteredData.assignmentPdf as File);
    formData.append("assignmentType", filteredData.assignmentType as string);
    formData.append("outlines", String(filteredData.includeOutlines));
    formData.append("references", String(filteredData.includeReferences));
    formData.append("numPages", String(filteredData.numPages));
    formData.append("coverPageType", filteredData.coverPage?.type as string);
    if (filteredData?.coverPage?.type === "custom") {
      formData.append(
        "coverPageFile",
        filteredData.coverPage.customCoverPdf as File
      );
    }
    
    if (filteredData.coverPage?.type === "auto") {
      formData.append("universityName", filteredData.universityName as string);
      formData.append("collegeName", filteredData.collegeName as string);
      formData.append("subject", filteredData.subject as string);
      formData.append("section", filteredData.section as string);
      
      if (filteredData.assignmentType === "individual") {
        formData.append("studentName", filteredData.studentName as string);
        formData.append("teacherName", filteredData.teacherName as string);
        formData.append("submissionDate", String(filteredData.submissionDate));
      }
      
      if (filteredData.assignmentType === "group") {
        formData.append(
          "groupMembers",
          JSON.stringify(filteredData.groupMembers)
        );
        formData.append("teacherName", filteredData.teacherName as string);
        formData.append("submissionDate", String(filteredData.submissionDate));
      }
    }
    const token = await getToken();

    const response = await fetch("http://localhost:5000/test", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if(response.ok) {
      router.push("/dashboard")
      methods.reset();
      setStep(0)
    } else {
      alert(result.message || "Something went wrong. Please try again.");
    }
    console.log(result);

    console.log("Form data (filtered):", filteredData);
  };

  const onInvalid = (errs: unknown) => {
    console.error("Validation errors:", errs);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Assignment Form</h1>
      <Stepper value={step} onValueChange={setStep}>
        {steps.map((step) => (
          <StepperItem
            key={step}
            step={step}
            className="not-last:flex-1"
          >
            <StepperTrigger asChild>
              <StepperIndicator />
            </StepperTrigger>
            {step < steps.length && <StepperSeparator />}
          </StepperItem>
        ))}
      </Stepper>
      <FormProvider {...methods}>
        <form
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (step < 6) {
                void onNext();
              } else {
                void handleSubmit(
                  (data) => onSubmit(data as AssignmentFormData),
                  onInvalid
                )();
              }
            }
          }}
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="space-y-6"
        >
          {/* Assignment PDF */}
          {step === 0 && (
            <AssignmentUploadStep
              assignmentInputRef={assignmentInputRef}
              isDraggingAssignment={isDraggingAssignment}
              setIsDraggingAssignment={setIsDraggingAssignment}
            />
          )}

          {/* University Name */}
          {step === 2 && coverType === "auto" && (
            <UniversityNameStep
              isComboboxOpen={isComboboxOpen}
              setIsComboboxOpen={setIsComboboxOpen}
            />
          )}

          {/* Cover Page */}
          {step === 1 && (
            <CoverPageStep
              coverInputRef={coverInputRef}
              isDraggingCover={isDraggingCover}
              setIsDraggingCover={setIsDraggingCover}
            />
          )}

          {/* Assignment Type */}
          {step === 3 && <AssignmentTypeStep />}

          {/* Details (Individual or Group) */}
          {step === 4 && <DetailsStep />}

          {/* Outlines & References */}
          {step === 5 && <SectionsStep />}

          {/* Review & Submit */}
          {step === 6 && (
            <ReviewStep
            submitLoading={submitLoading}
            setSubmitLoading={setSubmitLoading}
              setStep={setStep}
              handleSubmit={handleSubmit}
              onSubmit={onSubmit}
              onInvalid={onInvalid}
            />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={step === 0}
              className={step === 0 ? "hidden" : ""}
            >
              Back
            </Button>
            {step < 5 ? (
              <Button type="button" onClick={onNext}>
                Next
              </Button>
            ) : step === 5 ? (
              <Button type="button" onClick={() => setStep(6)}>
                Review
              </Button>
            ) : null}
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
