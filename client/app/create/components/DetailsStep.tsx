"use client";

import { Calendar, Plus, Trash2, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import InlineCalendar from "../InlineCalendar";

export default function DetailsStep() {
  const { control, register, watch, formState: { errors }, setValue, getValues } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "groupMembers",
  });
  
  const assignmentType = watch("assignmentType");
  const coverType = watch("coverPage.type");

  if (assignmentType === "individual" && coverType === "auto") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="font-bold">Student name</label>
          <Input
            placeholder="Student name"
            {...register("studentName")}
          />
          {errors.studentName && (
            <p className="text-red-600 text-sm">
              {String(errors.studentName?.message)}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="font-bold">Teacher name</label>
          <Input
            placeholder="Teacher name"
            {...register("teacherName")}
          />
          {errors.teacherName && (
            <p className="text-red-600 text-sm">
              {String(errors.teacherName?.message)}
            </p>
          )}
        </div>
        <div className="space-y-2 flex flex-col items-center gap-2">
          <label className="font-bold">Submission date</label>
          <Controller
            control={control}
            name="submissionDate"
            render={({ field }) => (
              <InlineCalendar
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {errors.submissionDate && (
            <p className="text-red-600 text-sm">
              {String(errors.submissionDate.message)}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (assignmentType === "group") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="font-bold">Group members (up to 10)</label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (fields.length < 10) append({ name: "" });
            }}
          >
            <Plus className="size-4" /> Add member
          </Button>
        </div>
        <div className="space-y-2">
          {fields.map((fieldItem, index) => (
            <div key={fieldItem.id} className="flex gap-2 items-center">
              <Input
                placeholder={`Member #${index + 1} name`}
                {...register(`groupMembers.${index}.name` as const)}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => remove(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        {errors.groupMembers && (
          <p className="text-red-600 text-sm">
            {(Array.isArray(errors.groupMembers)
              ? errors.groupMembers.find(Boolean)?.root?.message
              : (errors.groupMembers as any).message) || ""}
          </p>
        )}
        <div className="space-y-2">
          <label className="font-bold">Teacher name</label>
          <Input
            placeholder="Teacher name"
            {...register("teacherName")}
          />
          {errors.teacherName && (
            <p className="text-red-600 text-sm">
              {String(errors.teacherName?.message)}
            </p>
          )}
        </div>
        <div className="space-y-2 flex flex-col items-center gap-2">
          <label className="font-bold">Submission date</label>
          <Controller
            control={control}
            name="submissionDate"
            render={({ field }) => (
              <InlineCalendar
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {errors.submissionDate && (
            <p className="text-red-600 text-sm">
              {String(errors.submissionDate.message)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
}