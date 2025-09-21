"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Controller, useFormContext } from "react-hook-form";

export default function SectionsStep() {
  const { control } = useFormContext();
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="font-bold">Include outlines?</label>
        <div className="flex items-center gap-2">
          <Controller
            control={control}
            name="includeOutlines"
            render={({ field }) => (
              <Checkbox
                checked={!!field.value}
                onCheckedChange={(v) => field.onChange(!!v)}
              />
            )}
          />
          <span className="text-sm text-muted-foreground">
            Tick to include an outlines section
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <label className="font-bold">Include references?</label>
        <div className="flex items-center gap-2">
          <Controller
            control={control}
            name="includeReferences"
            render={({ field }) => (
              <Checkbox
                checked={!!field.value}
                onCheckedChange={(v) => field.onChange(!!v)}
              />
            )}
          />
          <span className="text-sm text-muted-foreground">
            Tick to include a references section
          </span>
        </div>
      </div>
    </div>
  );
}