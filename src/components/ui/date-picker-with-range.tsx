import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerWithRangeProps {
  value?: {
    from: Date
    to: Date
  }
  onChange?: (range: { from: Date; to: Date } | undefined) => void
  className?: string
  placeholder?: string
}

export function DatePickerWithRange({
  value,
  onChange,
  className,
  placeholder = "Pick a date range"
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: value?.from,
    to: value?.to
  })

  React.useEffect(() => {
    if (value) {
      setDate({
        from: value.from,
        to: value.to
      })
    }
  }, [value])

  const handleSelect = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    setDate(range || { from: undefined, to: undefined })
    if (range?.from && range?.to && onChange) {
      onChange({
        from: range.from,
        to: range.to
      })
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}