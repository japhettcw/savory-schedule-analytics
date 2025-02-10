
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
import { Suspense, useTransition } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface DailyMetric {
  date: string;
  total_revenue: number;
  customer_count: number;
  total_orders: number;
  avg_order_value?: number;
}

const fetchMetricsHistory = async (): Promise<DailyMetric[]> => {
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

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <Alert variant="destructive">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Error loading metrics</AlertTitle>
    <AlertDescription>{error.message}</AlertDescription>
  </Alert>
);

const MetricsChartContent = () => {
  console.log("Rendering MetricsChartContent");
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['metricsHistory'],
    queryFn: () => {
      console.log("Starting metrics fetch...");
      return new Promise<DailyMetric[]>((resolve) => {
        startTransition(() => {
          fetchMetricsHistory()
            .then(data => {
              console.log("Metrics fetch completed successfully");
              resolve(data);
            })
            .catch(error => {
              console.error("Metrics fetch failed:", error);
              throw error;
            });
        });
      });
    },
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
    return <ErrorFallback error={error} resetErrorBoundary={() => {}} />;
  }

  if (isLoading || isPending) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (!metrics || metrics.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        No metrics data available for the selected date range
      </div>
    );
  }

  return (
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
  );
};

export function MetricsChart() {
  console.log("Rendering MetricsChart wrapper");
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Weekly Trends (Feb 3 - Feb 10)</h3>
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <MetricsChartContent />
      </Suspense>
    </Card>
  );
}
