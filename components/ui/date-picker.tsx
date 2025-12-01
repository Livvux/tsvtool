"use client";

import * as React from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: string; // Format: TT.MM.JJJJ
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Изберете дата",
  className,
  disabled,
}: DatePickerProps) {
  // Parse TT.MM.JJJJ to Date
  const parseDate = (dateString: string | undefined): Date | undefined => {
    if (!dateString) return undefined;
    const parts = dateString.split(".");
    if (parts.length !== 3) return undefined;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return undefined;
    return new Date(year, month, day);
  };

  // Format Date to TT.MM.JJJJ
  const formatDate = (date: Date | undefined): string => {
    if (!date) return "";
    return format(date, "dd.MM.yyyy", { locale: de });
  };

  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value || "");
  const selectedDate = parseDate(value);

  // Update input when value prop changes
  React.useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const formatted = formatDate(date);
      onChange(formatted);
      setInputValue(formatted);
      setOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    // Only update if format is valid (TT.MM.JJJJ)
    if (newValue === "" || /^\d{2}\.\d{2}\.\d{4}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleInputBlur = () => {
    // Validate on blur and format if possible
    if (inputValue && /^\d{2}\.\d{2}\.\d{4}$/.test(inputValue)) {
      onChange(inputValue);
    } else if (inputValue && !/^\d{2}\.\d{2}\.\d{4}$/.test(inputValue)) {
      // If invalid format, try to keep what user typed but don't update
      // User can continue editing
    }
  };

  return (
    <div className="relative flex w-full">
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "h-12 text-lg bg-background pr-12",
          className
        )}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-muted",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
            onClick={(e) => {
              e.preventDefault();
              setOpen(!open);
            }}
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            initialFocus
            disabled={(date) => date > new Date() || date < new Date(1900, 0, 1)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

