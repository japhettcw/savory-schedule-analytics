
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
  const { data, error } = await supabase
    .from('daily_metrics')
    .select('*')
    .order('date', { ascending: true })
    .limit(30);

  if (error) throw error;
  
  return (data as DailyMetric[]).map(metric => ({
    ...metric,
    date: new Date(metric.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    avg_order_value: metric.total_orders ? metric.total_revenue / metric.total_orders : 0,
  }));
};

export function MetricsChart() {
  const { toast } = useToast();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['metricsHistory'],
    queryFn: fetchMetricsHistory,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    meta: {
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to fetch metrics history",
          variant: "destructive",
        });
      },
    },
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-[400px] w-full" />
      </Card>
    );
  }

  if (!metrics || metrics.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">30-Day Trends</h3>
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
