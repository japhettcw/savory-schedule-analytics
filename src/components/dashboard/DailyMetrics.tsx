
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface DailyMetric {
  total_revenue: number;
  customer_count: number;
  total_orders: number;
  date: string;
}

export function DailyMetrics() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['daily-metrics'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_metrics')
        .select('*')
        .in('date', [today, yesterday])
        .order('date', { ascending: false });

      if (error) throw error;
      return data as DailyMetric[];
    },
  });

  const calculateChange = (today: number, yesterday: number) => {
    if (!yesterday) return { value: 0, type: 'neutral' };
    const change = ((today - yesterday) / yesterday) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      type: change >= 0 ? 'positive' : 'negative',
    };
  };

  const todayMetrics = metrics?.[0] || { total_revenue: 0, customer_count: 0, total_orders: 0 };
  const yesterdayMetrics = metrics?.[1] || { total_revenue: 0, customer_count: 0, total_orders: 0 };

  const kpis = [
    {
      title: "Daily Revenue",
      value: `$${todayMetrics.total_revenue.toLocaleString()}`,
      change: calculateChange(todayMetrics.total_revenue, yesterdayMetrics.total_revenue),
      description: "vs. yesterday",
    },
    {
      title: "Customer Count",
      value: todayMetrics.customer_count.toString(),
      change: calculateChange(todayMetrics.customer_count, yesterdayMetrics.customer_count),
      description: "vs. yesterday",
    },
    {
      title: "Total Orders",
      value: todayMetrics.total_orders.toString(),
      change: calculateChange(todayMetrics.total_orders, yesterdayMetrics.total_orders),
      description: "vs. yesterday",
    },
    {
      title: "Average Order Value",
      value: todayMetrics.total_orders ? 
        `$${(todayMetrics.total_revenue / todayMetrics.total_orders).toFixed(2)}` : 
        "$0",
      change: calculateChange(
        todayMetrics.total_orders ? todayMetrics.total_revenue / todayMetrics.total_orders : 0,
        yesterdayMetrics.total_orders ? yesterdayMetrics.total_revenue / yesterdayMetrics.total_orders : 0
      ),
      description: "vs. yesterday",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="p-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </p>
              <div
                className={`flex items-center gap-1 text-sm ${
                  kpi.change.type === 'positive' ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {kpi.change.type === 'positive' ? (
                  <ArrowUpIcon className="h-4 w-4" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4" />
                )}
                {kpi.change.value}%
              </div>
            </div>
            <h3 className="text-2xl font-semibold tracking-tight">
              {kpi.value}
            </h3>
            <p className="text-xs text-muted-foreground">
              {kpi.description}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
