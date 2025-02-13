
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Card } from "@/components/ui/card";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { MetricsChart } from "@/components/dashboard/MetricsChart";
import { ExpenseBreakdown } from "@/components/dashboard/ExpenseBreakdown";
import { TopSellingItems } from "@/components/dashboard/TopSellingItems";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

const LoadingState = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-[200px] w-full" />
    <div className="grid gap-4 md:grid-cols-2">
      <Skeleton className="h-[300px]" />
      <Skeleton className="h-[300px]" />
    </div>
  </div>
);

export default function Reports() {
  console.log("Rendering Reports page");
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  
  const handleExport = () => {
    toast({
      title: "Coming Soon",
      description: "Export functionality will be available soon",
    });
  };

  const handleError = (errorMessage: string) => {
    console.error("Reports page error:", errorMessage);
    setError(errorMessage);
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground">
            View and analyze your financial performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DateRangePicker
            onRangeChange={range => {
              console.log("Date range changed:", range);
              setDateRange(range);
            }}
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

      <Suspense fallback={<LoadingState />}>
        <div className="grid gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Revenue & Performance</h2>
            <MetricsChart />
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <ExpenseBreakdown />
            <TopSellingItems />
          </div>
        </div>
      </Suspense>
    </div>
  );
}
