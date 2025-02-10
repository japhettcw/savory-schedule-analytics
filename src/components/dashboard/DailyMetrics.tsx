
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";

interface DailyMetric {
  total_revenue: number;
  customer_count: number;
  total_orders: number;
  total_expenses: number;
  net_profit: number;
  date: string;
}

const fetchDailyMetrics = async () => {
  console.log('Fetching daily metrics...');
  // Get today's and yesterday's metrics
  const { data, error } = await supabase
    .from('daily_metrics')
    .select(`
      total_revenue,
      customer_count,
      total_orders,
      total_expenses,
      net_profit,
      date
    `)
    .order('date', { ascending: false })
    .limit(2);

  if (error) {
    console.error('Error fetching daily metrics:', error);
    throw error;
  }

  console.log('Daily metrics data:', data);
  return data as DailyMetric[];
};

const calculateChange = (current: number, previous: number) => {
  if (!previous) return { value: 0, type: 'neutral' };
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(change),
    type: change >= 0 ? 'positive' as const : 'negative' as const,
  };
};

const getColorClass = (value: number, type: 'revenue' | 'expense' | 'customer' | 'order' | 'profit') => {
  switch (type) {
    case 'revenue':
    case 'customer':
    case 'order':
    case 'profit':
      return value >= 0 ? 'text-green-600' : 'text-red-600';
    case 'expense':
      return value >= 0 ? 'text-red-600' : 'text-green-600';
  }
};

export function DailyMetrics() {
  const { toast } = useToast();

  const { data: metrics, isLoading, error, refetch } = useQuery({
    queryKey: ['dailyMetrics'],
    queryFn: fetchDailyMetrics,
    refetchInterval: 5 * 60 * 1000,
    meta: {
      onError: (error: Error) => {
        console.error('Query error:', error);
        toast({
          title: "Error",
          description: "Failed to fetch daily metrics",
          variant: "destructive",
        });
      },
    },
  });

  useRealtimeSync({
    tableName: 'daily_metrics',
    onDataChange: refetch,
  });

  console.log('Current metrics state:', { metrics, isLoading, error });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {Array(6).fill(0).map((_, i) => (
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

  if (error) {
    console.error('Rendering error state:', error);
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card className="p-6">
          <div className="text-center text-red-500">
            Failed to load metrics. Please try again later.
          </div>
        </Card>
      </div>
    );
  }

  if (!metrics || metrics.length === 0) {
    console.log('No metrics data available');
    return null;
  }

  const current = metrics[0];
  const previous = metrics[1];

  console.log('Processing metrics:', { current, previous });

  const revenueChange = calculateChange(current.total_revenue, previous?.total_revenue);
  const customerChange = calculateChange(current.customer_count, previous?.customer_count);
  const ordersChange = calculateChange(current.total_orders, previous?.total_orders);
  const expensesChange = calculateChange(current.total_expenses || 0, previous?.total_expenses || 0);
  const profitChange = calculateChange(current.net_profit || 0, previous?.net_profit || 0);
  const avgOrderValue = current.total_orders ? current.total_revenue / current.total_orders : 0;
  const prevAvgOrderValue = previous?.total_orders ? previous.total_revenue / previous.total_orders : 0;
  const avgOrderChange = calculateChange(avgOrderValue, prevAvgOrderValue);

  const stats = [
    {
      title: "Daily Revenue",
      value: `$${current.total_revenue.toFixed(2)}`,
      change: `${revenueChange.value.toFixed(1)}%`,
      changeType: revenueChange.type,
      valueClass: getColorClass(revenueChange.value, 'revenue'),
      description: "vs. previous day",
    },
    {
      title: "Total Expenses",
      value: `$${(current.total_expenses || 0).toFixed(2)}`,
      change: `${expensesChange.value.toFixed(1)}%`,
      changeType: expensesChange.type === 'positive' ? 'negative' : 'positive',
      valueClass: getColorClass(expensesChange.value, 'expense'),
      description: "vs. previous day",
    },
    {
      title: "Net Profit",
      value: `$${(current.net_profit || 0).toFixed(2)}`,
      change: `${profitChange.value.toFixed(1)}%`,
      changeType: profitChange.type,
      valueClass: getColorClass(profitChange.value, 'profit'),
      description: "vs. previous day",
    },
    {
      title: "Customers",
      value: current.customer_count.toString(),
      change: `${customerChange.value.toFixed(1)}%`,
      changeType: customerChange.type,
      valueClass: getColorClass(customerChange.value, 'customer'),
      description: "vs. previous day",
    },
    {
      title: "Orders",
      value: current.total_orders.toString(),
      change: `${ordersChange.value.toFixed(1)}%`,
      changeType: ordersChange.type,
      valueClass: getColorClass(ordersChange.value, 'order'),
      description: "vs. previous day",
    },
    {
      title: "Avg. Order Value",
      value: `$${avgOrderValue.toFixed(2)}`,
      change: `${avgOrderChange.value.toFixed(1)}%`,
      changeType: avgOrderChange.type,
      valueClass: getColorClass(avgOrderChange.value, 'revenue'),
      description: "vs. previous day",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      {stats.map((stat) => (
        <Card 
          key={stat.title} 
          className="p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <div
                className={`flex items-center gap-1 text-sm ${
                  stat.changeType === "positive" ? "text-green-500" : "text-red-500"
                }`}
              >
                {stat.changeType === "positive" ? (
                  <ArrowUpIcon className="h-4 w-4" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4" />
                )}
                {stat.change}
              </div>
            </div>
            <h3 className={`text-2xl font-semibold tracking-tight ${stat.valueClass}`}>
              {stat.value}
            </h3>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
