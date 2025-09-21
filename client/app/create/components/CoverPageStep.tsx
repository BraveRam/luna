"use client";

import { FileText, Lightbulb, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Controller, useFormContext } from "react-hook-form";
import { RefObject } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CoverPageStepProps {
  coverInputRef: RefObject<HTMLInputElement | null>;
  isDraggingCover: boolean;
  setIsDraggingCover: (isDragging: boolean) => void;
}

export default function CoverPageStep({
  coverInputRef,
  isDraggingCover,
  setIsDraggingCover,
}: CoverPageStepProps) {
  const { control, setValue, watch, formState: { errors }, getValues } = useFormContext();
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="font-bold">Cover page</label>
        <Controller
          control={control}
          name="coverPage.type"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="grid grid-cols-1 gap-2 mt-2"
            >
              <label className="inline-flex items-center gap-2">
                <RadioGroupItem value="auto" />
                <span>Use auto-generated cover page</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <RadioGroupItem value="custom" />
                <span>Upload custom cover page (PDF)</span>
              </label>
              <span className="flex items-center gap-1 justify-start font-light">
                <Lightbulb />
                It is recommended to use a custom cover page for better
                results.
              </span>
            </RadioGroup>
          )}
        />
      </div>

      {watch("coverPage.type") === "custom" && (
        <div className="space-y-2">
          <label className="font-bold">Custom cover page (PDF)</label>
          <input
            ref={coverInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setValue("coverPage.customCoverPdf" as any, file as any, {
                shouldValidate: true,
              });
            }}
          />
          <div
            className={
              "flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-sm cursor-pointer " +
              (isDraggingCover
                ? " bg-accent/50 "
                : " hover:bg-accent/30 ")
            }
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingCover(true);
            }}
            onDragLeave={() => setIsDraggingCover(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingCover(false);
              const file = e.dataTransfer.files?.[0];
              if (file) {
                setValue("coverPage.customCoverPdf" as any, file as any, {
                  shouldValidate: true,
                });
              }
            }}
            onClick={() => coverInputRef.current?.click()}
          >
            {!(getValues("coverPage") as any).customCoverPdf ? (
              <>
                <Upload className="size-5 opacity-70" />
                <div className="text-center">
                  <div className="font-bold">
                    Drag and drop your PDF here
                  </div>
                  <div className="text-muted-foreground">
                    or click to browse
                  </div>
                </div>
              </>
            ) : (
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="size-5 text-primary" />
                  <span>
                    {(getValues("coverPage") as any).customCoverPdf?.name}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setValue(
                      "coverPage.customCoverPdf" as any,
                      undefined as any,
                      {
                        shouldValidate: true,
                      }
                    );
                    coverInputRef.current &&
                      (coverInputRef.current.value = "");
                  }}
                >
                  <Trash2 className="size-4" /> Remove
                </Button>
              </div>
            )}
          </div>
          {errors.coverPage &&
            (errors.coverPage as any).customCoverPdf && (
              <p className="text-red-600 text-sm">
                {String(
                  (errors.coverPage as any).customCoverPdf?.message
                )}
              </p>
            )}
        </div>
      )}
    </div>
  );
}