"use client";

import { ChevronsUpDownIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { universities } from "@/lib/data/university-list";
import { useFormContext } from "react-hook-form";

interface UniversityNameStepProps {
  isComboboxOpen: boolean;
  setIsComboboxOpen: (isOpen: boolean) => void;
}

export default function UniversityNameStep({
  isComboboxOpen,
  setIsComboboxOpen,
}: UniversityNameStepProps) {
  const { control, setValue, watch, formState: { errors }, getValues } = useFormContext();
  
  return (
    <div className="space-y-2 flex flex-col">
      <label className="font-bold">University name</label>
      <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isComboboxOpen}
            className="justify-between"
          >
            {getValues("universityName")
              ? universities.find(
                  (framework) =>
                    framework.value === getValues("universityName")
                )?.value
              : "Select University..."}
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[625px] p-0">
          <Command>
            <CommandInput placeholder="Search framework..." />
            <CommandList>
              <CommandEmpty>No university found.</CommandEmpty>
              <CommandGroup>
                {universities.map((framework) => (
                  <CommandItem
                    key={framework.value}
                    value={framework.value}
                    onSelect={(currentValue) => {
                      setValue(
                        "universityName",
                        currentValue === getValues("universityName")
                          ? ""
                          : currentValue,
                        {
                          shouldValidate: true,
                        }
                      );
                      setIsComboboxOpen(false);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        getValues("universityName") === framework.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {`${framework.value} (${framework.label})`}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {errors.universityName && (
        <p className="text-red-600 text-sm">
          {String(errors.universityName?.message)}
        </p>
      )}
    </div>
  );
}