"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  FormProvider,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { formSchema } from "@/lib/schema/schema";
import { FormData } from "@/lib/types/types";
import { filterFormData } from "@/lib/utils/filterFormData";
import AssignmentUploadStep from "./components/AssignmentUploadStep";
import CoverPageStep from "./components/CoverPageStep";
import UniversityNameStep from "./components/UniversityNameStep";
import AssignmentTypeStep from "./components/AssignmentTypeStep";
import DetailsStep from "./components/DetailsStep";
import SectionsStep from "./components/SectionsStep";
import ReviewStep from "./components/ReviewStep";

export default function FormSteps() {
  const [step, setStep] = useState<number>(0);
  const [isDraggingAssignment, setIsDraggingAssignment] =
    useState<boolean>(false);
  const [isDraggingCover, setIsDraggingCover] = useState<boolean>(false);
  const assignmentInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const [isComboboxOpen, setIsComboboxOpen] = useState<boolean>(false);

  const methods = useForm<FormData>({
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
    },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    trigger,
    getValues,
    formState: { errors },
    reset,
  } = methods;

  const assignmentType = watch("assignmentType");
  const coverType = watch("coverPage.type");

  useEffect(() => {
    if (assignmentType === "individual") {
      setValue("groupMembers", [], { shouldValidate: false });
    }
  }, [assignmentType, setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "groupMembers",
  });

  const stepFields: Array<keyof FormData | string> = useMemo(() => {
    switch (step) {
      case 0:
        return ["assignmentPdf", "numPages"];
      case 1:
        return ["coverPage.type", "coverPage.customCoverPdf"];
      case 2:
        return coverType === "auto" ? ["universityName"] : [];
      case 3:
        return coverType === "auto" ? ["assignmentType"] : [];
      case 4:
        if (coverType === "custom") return [];
        if (assignmentType === "individual") {
          return ["studentName", "teacherName", "submissionDate"];
        }
        return ["groupMembers"];
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

  const onSubmit = (data: FormData) => {
    // Filter out empty values before logging
    const filteredData = filterFormData(data);
    console.log("Form data (filtered):", filteredData);
    alert("Data logged to console.");
    setStep(0);
    reset();
  };

  const onInvalid = (errs: unknown) => {
    console.error("Validation errors:", errs);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Assignment Form</h1>
      <FormProvider {...methods}>
        <form
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (step < 6) {
                void onNext();
              } else {
                void handleSubmit(
                  (data) => onSubmit(data as FormData),
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
          {step === 7 && (
            <ReviewStep
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
            {step < 6 ? (
              <Button type="button" onClick={onNext}>
                Next
              </Button>
            ) : null}
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
