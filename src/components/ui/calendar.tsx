import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2 font-sans select-none", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-3",
        month_caption: "flex justify-center pt-1 relative items-center mb-2",
        caption_label: "text-sm font-semibold text-foreground capitalize",
        nav: "flex items-center gap-1",
        button_previous:
          "absolute left-1 h-7 w-7 bg-transparent p-0 hover:bg-line/40 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
        button_next:
          "absolute right-1 h-7 w-7 bg-transparent p-0 hover:bg-line/40 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
        week: "flex w-full mt-1.5",
        day: "h-9 w-9 text-center text-sm p-0 relative flex items-center justify-center",
        day_button: cn(
          "h-8 w-8 p-0 font-normal rounded-lg transition-colors cursor-pointer flex items-center justify-center text-foreground",
          "hover:bg-line/40 focus:outline-none focus:ring-1 focus:ring-primary"
        ),
        selected:
          "[&_.rdp-day_button]:!bg-primary [&_.rdp-day_button]:!text-primary-foreground [&_.rdp-day_button]:!font-semibold",
        today:
          "[&_.rdp-day_button]:font-bold [&_.rdp-day_button]:border [&_.rdp-day_button]:border-line",
        outside:
          "text-muted-foreground/40 opacity-50",
        disabled:
          "text-muted-foreground/30 opacity-40 cursor-not-allowed hover:bg-transparent pointer-events-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === "left") {
            return <ChevronLeft className="h-4 w-4" />;
          }
          return <ChevronRight className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";
