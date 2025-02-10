
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

const fetchMetricsHistory = async () => {
  console.log('Fetching metrics history...');
  const { data, error } = await supabase
    .from('daily_metrics')
    .select('*')
    .gte('date', '2025-02-03')
    .lte('date', '2025-02-10')
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching metrics:', error);
    throw error;
  }
  
  console.log('Raw metrics data:', data);
  
  const formattedData = (data as DailyMetric[]).map(metric => ({
    ...metric,
    date: new Date(metric.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    avg_order_value: metric.total_orders ? metric.total_revenue / metric.total_orders : 0,
  }));
  
  console.log('Formatted metrics data:', formattedData);
  return formattedData;
};

export function MetricsChart() {
  const { toast } = useToast();

  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['metricsHistory'],
    queryFn: fetchMetricsHistory,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 12 }}
              label={{ 
                value: 'Revenue ($)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              label={{ 
                value: 'Count', 
                angle: 90, 
                position: 'insideRight',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="total_revenue"
              stroke="#059669"
              name="Revenue"
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="customer_count"
              stroke="#0ea5e9"
              name="Customers"
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="total_orders"
              stroke="#8b5cf6"
              name="Orders"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
