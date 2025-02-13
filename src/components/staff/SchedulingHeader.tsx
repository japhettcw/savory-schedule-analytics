
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SchedulingHeaderProps {
  onAddShift: () => void;
}

export function SchedulingHeader({ onAddShift }: SchedulingHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Staff Scheduling</h1>
        <p className="text-muted-foreground mt-2">
          Manage employee shifts and schedules
        </p>
      </div>
      <Button 
        onClick={onAddShift}
        className="w-full sm:w-auto"
      >
        <Plus className="mr-2" />
        Add Shift
      </Button>
    </div>
  );
}
