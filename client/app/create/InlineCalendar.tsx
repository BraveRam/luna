"use client";

import { addMonths, getDaysInMonth, startOfMonth } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { InlineCalendarProps } from "@/lib/types/types";

export default function InlineCalendar({
  value,
  onChange,
}: InlineCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState<Date>(
    value
      ? new Date(value.getFullYear(), value.getMonth(), 1)
      : startOfMonth(new Date())
  );

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstWeekday = startOfMonth(visibleMonth).getDay();
  const days = getDaysInMonth(year, month);

  const weeks: Array<Array<number | null>> = [];
  let currentWeek: Array<number | null> = Array.from(
    { length: firstWeekday },
    () => null
  );
  for (let day = 1; day <= days; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  const isSameDate = (a?: Date, b?: Date) =>
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  return (
    <div className="border rounded-md p-3 inline-block">
      <div className="flex items-center justify-between mb-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setVisibleMonth((d) => addMonths(d, -1))}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="font-medium">
          {visibleMonth.toLocaleString(undefined, {
            month: "long",
            year: "numeric",
          })}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setVisibleMonth((d) => addMonths(d, 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground mb-1">
        {"SMTWTFS".split("").map((d, i) => (
          <div key={i} className="text-center">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weeks.map((week, wi) =>
          week.map((d, di) => {
            const dateObj = d ? new Date(year, month, d) : undefined;
            const selected = isSameDate(value, dateObj);
            return (
              <button
                key={`${wi}-${di}`}
                type="button"
                disabled={!d}
                onClick={() => dateObj && onChange(dateObj)}
                className={`h-8 w-8 rounded-md text-sm ${
                  d
                    ? selected
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                    : "opacity-0"
                }`}
              >
                {d ?? ""}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
