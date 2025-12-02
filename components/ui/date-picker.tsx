"use client";

import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Loading skeleton that matches the DatePicker layout
function DatePickerSkeleton({ placeholder, className, disabled }: Omit<DatePickerProps, 'value' | 'onChange'>) {
  return (
    <div className="relative flex w-full">
      <Input
        type="text"
        placeholder={placeholder || "Изберете дата"}
        disabled={disabled}
        className={cn("h-12 text-lg bg-background pr-12", className)}
        readOnly
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-muted opacity-50",
          disabled && "cursor-not-allowed"
        )}
        disabled
      >
        <CalendarIcon className="h-4 w-4 animate-pulse" />
      </Button>
    </div>
  );
}

// Lazy load the full DatePicker with calendar (includes date-fns and react-day-picker)
const DatePickerInner = dynamic(
  () => import("./date-picker-inner").then((mod) => mod.DatePickerInner),
  {
    ssr: false,
    loading: () => <DatePickerSkeleton />,
  }
);

export function DatePicker(props: DatePickerProps) {
  return <DatePickerInner {...props} />;
}
