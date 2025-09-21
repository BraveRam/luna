"use client";

import { FileText, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { RefObject, useRef } from "react";

interface AssignmentUploadStepProps {
  assignmentInputRef: RefObject<HTMLInputElement | null>;
  isDraggingAssignment: boolean;
  setIsDraggingAssignment: (isDragging: boolean) => void;
}

export default function AssignmentUploadStep({
  assignmentInputRef,
  isDraggingAssignment,
  setIsDraggingAssignment,
}: AssignmentUploadStepProps) {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  
  return (
    <div className="space-y-2">
      <label className="font-bold">Upload assignment (PDF)</label>
      <input
        ref={assignmentInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          setValue("assignmentPdf", file as any, {
            shouldValidate: true,
          });
        }}
      />
      <div
        className={
          "flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-sm cursor-pointer " +
          (isDraggingAssignment
            ? " bg-accent/50 "
            : " hover:bg-accent/30 ")
        }
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingAssignment(true);
        }}
        onDragLeave={() => setIsDraggingAssignment(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingAssignment(false);
          const file = e.dataTransfer.files?.[0];
          if (file) {
            setValue("assignmentPdf", file as any, {
              shouldValidate: true,
            });
          }
        }}
        onClick={() => assignmentInputRef.current?.click()}
      >
        {!watch("assignmentPdf") ? (
          <>
            <Upload className="size-5 opacity-70" />
            <div className="text-center">
              <div className="font-bold">Drag and drop your PDF here</div>
              <div className="text-muted-foreground">
                or click to browse
              </div>
            </div>
          </>
        ) : (
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              <span>{watch("assignmentPdf")?.name}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setValue("assignmentPdf", undefined as any, {
                  shouldValidate: true,
                });
                assignmentInputRef.current &&
                  (assignmentInputRef.current.value = "");
              }}
            >
              <Trash2 className="size-4" /> Remove
            </Button>
          </div>
        )}
      </div>
      {errors.assignmentPdf && (
        <p className="text-red-600 text-sm">
          {String(errors.assignmentPdf.message)}
        </p>
      )}

      <div className="space-y-1 pt-2">
        <label className="font-bold">Number of pages</label>
        <Input
          type="number"
          min={1}
          placeholder="e.g., 12"
          {...register("numPages")}
          className="mt-2"
        />
        {errors.numPages && (
          <p className="text-red-600 text-sm">
            {String(errors.numPages.message)}
          </p>
        )}
      </div>
    </div>
  );
}
