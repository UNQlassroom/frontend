import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function CalendarChevron({ orientation }: { orientation?: string }) {
  if (orientation === "left") {
    return <ChevronLeft className="h-4 w-4" />;
  }
  return <ChevronRight className="h-4 w-4" />;
}

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  fixedWeeks = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      navLayout="around"
      showOutsideDays={showOutsideDays}
      fixedWeeks={fixedWeeks}
      className={cn("p-3 font-sans select-none w-[276px]", className)}
      classNames={{
        root: "relative w-full",
        months: "flex flex-col sm:flex-row gap-4 w-full",
        month: "relative space-y-3 w-full",
        month_caption: "flex justify-center items-center h-8 relative mb-1 w-full",
        caption_label: "text-sm font-semibold text-foreground capitalize",
        button_previous:
          "absolute left-0 top-0 h-8 w-8 bg-transparent p-0 hover:bg-line/50 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer z-10",
        button_next:
          "absolute right-0 top-0 h-8 w-8 bg-transparent p-0 hover:bg-line/50 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer z-10",
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex justify-between w-full",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
        week: "flex justify-between w-full mt-1.5",
        day: "h-9 w-9 text-center text-sm p-0 relative flex items-center justify-center",
        day_button: cn(
          "h-8 w-8 p-0 font-normal rounded-lg transition-colors cursor-pointer flex items-center justify-center text-foreground",
          "hover:bg-line/40 focus:outline-none focus:ring-1 focus:ring-primary"
        ),
        selected:
          "[&>button]:!bg-primary [&>button]:!text-primary-foreground [&>button]:!font-semibold",
        today:
          "[&>button]:font-bold [&>button]:border [&>button]:border-line",
        outside:
          "text-muted-foreground/40 opacity-50",
        disabled:
          "text-muted-foreground/30 opacity-40 cursor-not-allowed hover:bg-transparent pointer-events-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: CalendarChevron,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";
