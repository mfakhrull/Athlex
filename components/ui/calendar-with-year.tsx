"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type CalendarWithYearProps = React.ComponentProps<typeof DayPicker>

function CalendarWithYear({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarWithYearProps) {
  // Generate years from 1900 to current year
  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);
  }, []);

  const [month, setMonth] = React.useState<Date>(props.defaultMonth || new Date());

  // Handle year change
  const handleYearChange = (year: string) => {
    const newDate = new Date(month);
    newDate.setFullYear(parseInt(year));
    setMonth(newDate);
  };

  // Handle month navigation
  const handlePreviousMonth = () => {
    const previousMonth = new Date(month);
    previousMonth.setMonth(month.getMonth() - 1);
    setMonth(previousMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(month);
    nextMonth.setMonth(month.getMonth() + 1);
    setMonth(nextMonth);
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      month={month}
      onMonthChange={setMonth}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium hidden", // Hide the default caption label
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Caption: () => {
          return (
            <div className="flex w-full justify-center items-center space-x-1 pt-1 relative">
              <button
                onClick={handlePreviousMonth}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
                )}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex justify-center items-center gap-2">
                <div className="text-sm font-medium">
                  {format(month, 'MMMM')}
                </div>
                <Select
                  value={month.getFullYear().toString()}
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger className="h-7 w-[80px] text-xs">
                    <SelectValue>{month.getFullYear()}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[240px] overflow-y-auto">
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <button
                onClick={handleNextMonth}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
                )}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          );
        }
      }}
      {...props}
    />
  )
}
CalendarWithYear.displayName = "CalendarWithYear"

export { CalendarWithYear }