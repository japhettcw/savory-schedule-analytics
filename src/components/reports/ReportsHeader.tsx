
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { useToast } from "@/hooks/use-toast";

interface ReportsHeaderProps {
  dateRange: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
}

export function ReportsHeader({ dateRange, onRangeChange }: ReportsHeaderProps) {
  const { toast } = useToast();
  
  const handleExport = () => {
    toast({
      title: "Coming Soon",
      description: "Export functionality will be available soon",
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Financial Reports</h1>
        <p className="text-muted-foreground">
          View and analyze your financial performance
        </p>
      </div>
      <div className="flex items-center gap-4">
        <DateRangePicker
          onRangeChange={onRangeChange}
          onViewChange={() => {}}
        />
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleExport}
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
}
