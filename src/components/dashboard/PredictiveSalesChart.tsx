
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SalesData {
  week: string;
  actual_sales: number;
  predicted_sales: number | null;
}

const fetchHistoricalSales = async (): Promise<SalesData[]> => {
  // Get dates for the last 4 weeks
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 28); // 4 weeks ago

  const { data, error } = await supabase
    .from('daily_metrics')
    .select('date, total_revenue')
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching sales data:', error);
    throw error;
  }

  // Group data by week
  const weeklyData = data.reduce((acc: Record<string, number>, curr) => {
    const date = new Date(curr.date);
    const weekNum = Math.ceil((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const weekKey = `Week ${weekNum}`;
    acc[weekKey] = (acc[weekKey] || 0) + curr.total_revenue;
    return acc;
  }, {});

  // Calculate average weekly growth
  const weeklyValues = Object.values(weeklyData);
  let growthRate = 0;
  
  if (weeklyValues.length > 1) {
    const totalGrowth = weeklyValues.reduce((acc, curr, idx) => {
      if (idx === 0) return 0;
      return acc + ((curr - weeklyValues[idx - 1]) / weeklyValues[idx - 1]);
    }, 0);
    growthRate = totalGrowth / (weeklyValues.length - 1);
  }

  // Prepare historical data and predictions
  const result: SalesData[] = Object.entries(weeklyData).map(([week, sales]) => ({
    week,
    actual_sales: sales,
    predicted_sales: null
  }));

  // Add predictions for next 2 weeks
  const lastActualSales = weeklyValues[weeklyValues.length - 1];
  for (let i = 1; i <= 2; i++) {
    const predictedSales = lastActualSales * Math.pow(1 + growthRate, i);
    result.push({
      week: `Week ${result.length + 1}`,
      actual_sales: 0,
      predicted_sales: predictedSales
    });
  }

  return result;
};

export function PredictiveSalesChart() {
  const { data: salesData, isLoading, error } = useQuery({
    queryKey: ['predictiveSales'],
    queryFn: fetchHistoricalSales,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error loading sales prediction</AlertTitle>
        <AlertDescription>Failed to fetch sales data</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Predictive Sales Trend</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={salesData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="week"
              tick={{ fill: '#6B7280' }}
              tickLine={{ stroke: '#6B7280' }}
            />
            <YAxis
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              domain={[0, 60000]}
              ticks={[0, 10000, 20000, 30000, 40000, 50000, 60000]}
              tick={{ fill: '#6B7280' }}
              tickLine={{ stroke: '#6B7280' }}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Sales']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                padding: '0.5rem',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="actual_sales"
              stroke="#059669"
              strokeWidth={2}
              name="Actual Sales"
              dot={{ fill: '#059669', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="predicted_sales"
              stroke="#059669"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Predicted Sales"
              dot={{ fill: '#059669', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
