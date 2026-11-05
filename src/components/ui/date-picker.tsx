import * as React from "react";
import { format, startOfToday } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps {
  id?: string;
  value?: Date | null;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  allowPastDates?: boolean;
  minDate?: Date;
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Seleccionar fecha...",
  disabled = false,
  error = false,
  className,
  allowPastDates = false,
  minDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const isDateDisabled = React.useCallback(
    (date: Date) => {
      const today = startOfToday();
      if (!allowPastDates && date < today) {
        return true;
      }
      if (minDate && date < minDate) {
        return true;
      }
      return false;
    },
    [allowPastDates, minDate]
  );

  const handleSelect = (selectedDate: Date | undefined) => {
    onChange(selectedDate);
    if (selectedDate) {
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal h-11 px-3.5 py-2.5 rounded-xl border border-line bg-background text-sm sm:text-base transition-colors",
              !value && "text-muted-foreground/70",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
          >
            <CalendarIcon className="mr-2.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {value ? (
                format(value, "d 'de' MMMM, yyyy", { locale: es })
              ) : (
                placeholder
              )}
            </span>
          </Button>

          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
              title="Limpiar fecha"
              aria-label="Limpiar fecha"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ?? undefined}
          onSelect={handleSelect}
          disabled={isDateDisabled}
          locale={es}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
