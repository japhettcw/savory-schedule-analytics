
import { ExpenseBreakdown } from "@/components/dashboard/ExpenseBreakdown";
import { TopSellingItems } from "@/components/dashboard/TopSellingItems";

export function FinancialInsights() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ExpenseBreakdown />
      <TopSellingItems />
    </div>
  );
}
