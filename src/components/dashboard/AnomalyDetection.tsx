
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Triangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Anomaly {
  date: string;
  type: 'revenue' | 'expense';
  category?: string;
  percentageChange: number;
  description: string;
}

const fetchAnomalies = async (): Promise<Anomaly[]> => {
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Fetch revenue data
  const { data: revenueData, error: revenueError } = await supabase
    .from('daily_metrics')
    .select('date, total_revenue')
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .lte('date', now.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (revenueError) throw revenueError;

  // Fetch expense data
  const { data: expenseData, error: expenseError } = await supabase
    .from('daily_expenses')
    .select(`
      amount,
      date,
      expense_categories (
        name
      )
    `)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .lte('date', now.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (expenseError) throw expenseError;

  // Calculate average revenue and standard deviation
  const revenues = revenueData.map(d => d.total_revenue);
  const avgRevenue = revenues.reduce((a, b) => a + b, 0) / revenues.length;
  const stdDevRevenue = Math.sqrt(
    revenues.reduce((sq, n) => sq + Math.pow(n - avgRevenue, 2), 0) / revenues.length
  );

  // Calculate average expenses by category
  const expensesByCategory: Record<string, number[]> = {};
  expenseData.forEach(expense => {
    const category = expense.expense_categories?.name || 'Uncategorized';
    if (!expensesByCategory[category]) {
      expensesByCategory[category] = [];
    }
    expensesByCategory[category].push(expense.amount);
  });

  // Track seen revenue anomalies by date to prevent duplicates
  const seenRevenueAnomalies = new Set<string>();
  const anomalies: Anomaly[] = [];

  // Detect revenue anomalies (2 standard deviations from mean)
  revenueData.forEach(day => {
    const deviation = Math.abs(day.total_revenue - avgRevenue) / stdDevRevenue;
    // Only add if we haven't seen an anomaly for this date
    const anomalyKey = `revenue-${day.date}`;
    if (deviation > 2 && !seenRevenueAnomalies.has(anomalyKey)) {
      seenRevenueAnomalies.add(anomalyKey);
      const percentageChange = ((day.total_revenue - avgRevenue) / avgRevenue) * 100;
      anomalies.push({
        date: day.date,
        type: 'revenue',
        percentageChange,
        description: `Revenue ${percentageChange > 0 ? 'spike' : 'drop'} detected`
      });
    }
  });

  // Track seen expense anomalies by category and date to prevent duplicates
  const seenExpenseAnomalies = new Set<string>();

  // Detect expense anomalies
  Object.entries(expensesByCategory).forEach(([category, amounts]) => {
    const avgExpense = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDevExpense = Math.sqrt(
      amounts.reduce((sq, n) => sq + Math.pow(n - avgExpense, 2), 0) / amounts.length
    );

    amounts.forEach((amount, index) => {
      const deviation = Math.abs(amount - avgExpense) / stdDevExpense;
      const anomalyKey = `expense-${category}-${expenseData[index].date}`;
      if (deviation > 2 && !seenExpenseAnomalies.has(anomalyKey)) {
        seenExpenseAnomalies.add(anomalyKey);
        const percentageChange = ((amount - avgExpense) / avgExpense) * 100;
        anomalies.push({
          date: expenseData[index].date,
          type: 'expense',
          category,
          percentageChange,
          description: `Unusual ${category} expense detected`
        });
      }
    });
  });

  return anomalies.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export function AnomalyDetection() {
  const { data: anomalies, isLoading, error } = useQuery({
    queryKey: ['anomalies'],
    queryFn: fetchAnomalies,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <Triangle className="h-4 w-4" />
        <AlertTitle>Error loading anomalies</AlertTitle>
        <AlertDescription>Failed to fetch anomaly data</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return <Skeleton className="h-[200px] w-full" />;
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Anomaly Detection</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-md font-medium mb-3">Revenue Anomalies</h3>
          <div className="space-y-3">
            {anomalies
              ?.filter(a => a.type === 'revenue')
              .map((anomaly, index) => (
                <div
                  key={`${anomaly.date}-${index}`}
                  className="flex items-center gap-2 p-3 rounded-lg border"
                >
                  <Triangle className="h-4 w-4 text-orange-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {new Date(anomaly.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {anomaly.description}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      anomaly.percentageChange >= 0
                        ? 'text-orange-500'
                        : 'text-red-500'
                    }`}
                  >
                    {anomaly.percentageChange >= 0 ? '+' : ''}
                    {anomaly.percentageChange.toFixed(1)}%
                  </span>
                </div>
              ))}
            {anomalies?.filter(a => a.type === 'revenue').length === 0 && (
              <p className="text-sm text-muted-foreground">No revenue anomalies detected</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-md font-medium mb-3">Expense Anomalies</h3>
          <div className="space-y-3">
            {anomalies
              ?.filter(a => a.type === 'expense')
              .map((anomaly, index) => (
                <div
                  key={`${anomaly.date}-${index}`}
                  className="flex items-center gap-2 p-3 rounded-lg border"
                >
                  <Triangle className="h-4 w-4 text-orange-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {anomaly.category} -{' '}
                      {new Date(anomaly.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {anomaly.description}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-orange-500">
                    +{anomaly.percentageChange.toFixed(1)}%
                  </span>
                </div>
              ))}
            {anomalies?.filter(a => a.type === 'expense').length === 0 && (
              <p className="text-sm text-muted-foreground">No expense anomalies detected</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
