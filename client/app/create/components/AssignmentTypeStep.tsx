"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Controller, useFormContext } from "react-hook-form";

export default function AssignmentTypeStep() {
  const { control, formState: { errors } } = useFormContext();
  
  return (
    <div className="space-y-2">
      <label className="font-bold">Assignment type</label>
      <Controller
        control={control}
        name="assignmentType"
        render={({ field }) => (
          <RadioGroup
            value={field.value}
            onValueChange={field.onChange}
            className="grid grid-cols-1 gap-2"
          >
            <label className="inline-flex items-center gap-2">
              <RadioGroupItem value="individual" />
              <span>Individual</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <RadioGroupItem value="group" />
              <span>Group</span>
            </label>
          </RadioGroup>
        )}
      />
      {errors.assignmentType && (
        <p className="text-red-600 text-sm">
          {String(errors.assignmentType?.message)}
        </p>
      )}
    </div>
  );
}