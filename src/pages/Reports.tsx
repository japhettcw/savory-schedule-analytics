
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { PerformanceMetrics } from "@/components/reports/PerformanceMetrics";
import { FinancialInsights } from "@/components/reports/FinancialInsights";

export default function Reports() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  return (
    <div className="space-y-6">
      <ReportsHeader 
        dateRange={dateRange}
        onRangeChange={range => setDateRange(range)}
      />
      <div className="grid gap-6">
        <PerformanceMetrics />
        <FinancialInsights />
      </div>
    </div>
  );
}
