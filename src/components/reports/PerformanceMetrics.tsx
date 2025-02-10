
import { Card } from "@/components/ui/card";
import { MetricsChart } from "@/components/dashboard/MetricsChart";

export function PerformanceMetrics() {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Revenue & Performance</h2>
      <MetricsChart />
    </Card>
  );
}
