
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DailyMetric {
  date: string;
  total_revenue: number;
  customer_count: number;
  total_orders: number;
}

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
const formatCount = (value: number) => value.toFixed(0);

const fetchMetricsHistory = async () => {
  console.log('Fetching metrics history...');
  const { data, error } = await supabase
    .from('daily_metrics')
    .select('total_revenue, customer_count, total_orders, total_expenses, net_profit, date')
    .gte('date', '2025-02-03')
    .lte('date', '2025-02-10')
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching metrics:', error);
    throw error;
  }
  
  console.log('Raw metrics data:', data);
  
  const formattedData = (data || []).map(metric => ({
    ...metric,
    date: new Date(metric.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    avg_order_value: metric.total_orders ? metric.total_revenue / metric.total_orders : 0,
  }));
  
  console.log('Formatted metrics data:', formattedData);
  return formattedData;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border rounded-lg shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.name.includes('Revenue') || entry.name.includes('Profit') || entry.name.includes('Expenses')
              ? formatCurrency(entry.value)
              : formatCount(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function MetricsChart() {
  const { toast } = useToast();

  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['metricsHistory'],
    queryFn: fetchMetricsHistory,
    refetchInterval: 5 * 60 * 1000,
    meta: {
      onError: (error: Error) => {
        console.error('Query error:', error);
        toast({
          title: "Error",
          description: "Failed to fetch metrics history",
          variant: "destructive",
        });
      },
    },
  });

  if (error) {
    console.error('Query error:', error);
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          Failed to load metrics. Please try again later.
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-[400px] w-full" />
      </Card>
    );
  }

  if (!metrics || metrics.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          No metrics data available for the selected date range
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Weekly Trends (Feb 3 - Feb 10)</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={metrics} className="animate-fade-in">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              yAxisId="revenue"
              orientation="left"
              tick={{ fontSize: 12 }}
              tickFormatter={formatCurrency}
              label={{ 
                value: 'Revenue & Financial Metrics ($)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12 }
              }}
            />
            <YAxis 
              yAxisId="count"
              orientation="right"
              tick={{ fontSize: 12 }}
              tickFormatter={formatCount}
              label={{ 
                value: 'Count (Orders & Customers)', 
                angle: 90, 
                position: 'insideRight',
                style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12 }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              yAxisId="revenue"
              type="monotone"
              dataKey="total_revenue"
              name="Revenue"
              stroke="#059669"
              dot={false}
              strokeWidth={2}
            />
            <Line
              yAxisId="revenue"
              type="monotone"
              dataKey="total_expenses"
              name="Expenses"
              stroke="#dc2626"
              dot={false}
              strokeWidth={2}
            />
            <Line
              yAxisId="revenue"
              type="monotone"
              dataKey="net_profit"
              name="Net Profit"
              stroke="#2563eb"
              dot={false}
              strokeWidth={2}
            />
            <Line
              yAxisId="count"
              type="monotone"
              dataKey="customer_count"
              name="Customers"
              stroke="#0ea5e9"
              dot={false}
              strokeWidth={2}
            />
            <Line
              yAxisId="count"
              type="monotone"
              dataKey="total_orders"
              name="Orders"
              stroke="#8b5cf6"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
