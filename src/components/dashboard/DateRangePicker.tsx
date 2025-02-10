
import * as React from "react";
import { addDays, format, startOfToday, subDays, subMonths } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
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

interface DateRangePickerProps {
  onRangeChange: (range: DateRange | undefined) => void;
  onViewChange: (view: string) => void;
}

export function DateRangePicker({ onRangeChange, onViewChange }: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(startOfToday(), 7),
    to: startOfToday(),
  });

  const handleRangeSelect = (range: DateRange | undefined) => {
    setDate(range);
    onRangeChange(range);
  };

  const handlePresetClick = (days: number) => {
    const range = {
      from: subDays(startOfToday(), days),
      to: startOfToday(),
    };
    setDate(range);
    onRangeChange(range);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal w-[260px]",
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
        <PopoverContent 
          className="w-auto p-0 bg-white border shadow-lg !z-50" 
          align="start"
          sideOffset={5}
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleRangeSelect}
            numberOfMonths={2}
            className="bg-white"
          />
          <div className="flex gap-2 p-3 border-t bg-white">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetClick(0)}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetClick(7)}
            >
              Last 7 Days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetClick(30)}
            >
              Last Month
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Select onValueChange={onViewChange} defaultValue="weekly">
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Select view" />
        </SelectTrigger>
        <SelectContent 
          className="bg-white border shadow-lg !z-50"
          position="popper"
          align="end"
          sideOffset={5}
        >
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="yearly">Yearly</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
