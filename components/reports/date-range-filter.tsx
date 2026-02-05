"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format, subDays, subMonths, subYears, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DateRange } from "react-day-picker";

interface DateRangeFilterProps {
  from?: Date;
  to?: Date;
  onChange: (range: { from?: Date; to?: Date }) => void;
  presets?: boolean;
  className?: string;
}

const datePresets = [
  { label: "Last 7 days", value: "7d", getRange: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: "Last 30 days", value: "30d", getRange: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: "Last 90 days", value: "90d", getRange: () => ({ from: subDays(new Date(), 90), to: new Date() }) },
  { label: "This month", value: "this-month", getRange: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  { label: "Last month", value: "last-month", getRange: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
  { label: "This year", value: "this-year", getRange: () => ({ from: startOfYear(new Date()), to: new Date() }) },
  { label: "Last year", value: "last-year", getRange: () => ({ from: startOfYear(subYears(new Date(), 1)), to: endOfYear(subYears(new Date(), 1)) }) },
];

export function DateRangeFilter({
  from,
  to,
  onChange,
  presets = true,
  className,
}: DateRangeFilterProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from,
    to,
  });

  const handlePresetChange = (value: string) => {
    const preset = datePresets.find((p) => p.value === value);
    if (preset) {
      const range = preset.getRange();
      setDate(range);
      onChange(range);
    }
  };

  const handleCalendarChange = (range: DateRange | undefined) => {
    setDate(range);
    if (range?.from && range?.to) {
      onChange({ from: range.from, to: range.to });
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {presets && (
        <Select onValueChange={handlePresetChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            {datePresets.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal min-w-[240px]",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleCalendarChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface IntervalSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function IntervalSelect({
  value,
  onChange,
  className,
}: IntervalSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-[130px]", className)}>
        <SelectValue placeholder="Interval" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="day">Daily</SelectItem>
        <SelectItem value="week">Weekly</SelectItem>
        <SelectItem value="month">Monthly</SelectItem>
        <SelectItem value="year">Yearly</SelectItem>
      </SelectContent>
    </Select>
  );
}
