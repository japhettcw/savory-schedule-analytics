
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { startTransition, useState } from "react";

interface DailyMetric {
  total_revenue: number;
  customer_count: number;
  total_orders: number;
  total_expenses: number;
  net_profit: number;
  date: string;
}

type ComparisonPeriod = "previous_day" | "previous_week" | "previous_month";

const fetchDailyMetrics = async (comparisonPeriod: ComparisonPeriod) => {
  console.log('Fetching daily metrics...', { comparisonPeriod });
  const currentDate = new Date();
  let compareDate = new Date();
  
  switch (comparisonPeriod) {
    case "previous_month":
      compareDate.setMonth(currentDate.getMonth() - 1);
      break;
    case "previous_week":
      compareDate.setDate(currentDate.getDate() - 7);
      break;
    default: // previous_day
      compareDate.setDate(currentDate.getDate() - 1);
  }

  const { data, error } = await supabase
    .from('daily_metrics')
    .select('*')
    .gte('date', compareDate.toISOString().split('T')[0])
    .lte('date', currentDate.toISOString().split('T')[0])
    .order('date', { ascending: false });

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

const getPeriodLabel = (period: ComparisonPeriod) => {
  switch (period) {
    case "previous_month":
      return "vs. previous month";
    case "previous_week":
      return "vs. previous week";
    default:
      return "vs. previous day";
  }
};

const getColorClass = (value: number, type: 'revenue' | 'expense' | 'customer' | 'order') => {
  switch (type) {
    case 'revenue':
    case 'customer':
    case 'order':
      return value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';
    case 'expense':
      return value >= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400';
  }
};

export function DailyMetrics() {
  const { toast } = useToast();
  const [comparisonPeriod, setComparisonPeriod] = useState<ComparisonPeriod>("previous_day");

  const { data: metrics, isLoading, error, refetch } = useQuery<DailyMetric[]>({
    queryKey: ['dailyMetrics', comparisonPeriod],
    queryFn: () => fetchDailyMetrics(comparisonPeriod),
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

  // Set up realtime sync for daily_metrics table
  useRealtimeSync({
    tableName: 'daily_metrics',
    onDataChange: refetch,
  });

  const handlePeriodChange = (period: ComparisonPeriod) => {
    startTransition(() => {
      setComparisonPeriod(period);
    });
  };

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
          <div className="text-center text-rose-500">
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
  const expensesChange = calculateChange(current.total_expenses, previous?.total_expenses);
  const profitChange = calculateChange(current.net_profit, previous?.net_profit);
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
      description: getPeriodLabel(comparisonPeriod),
    },
    {
      title: "Total Expenses",
      value: `$${current.total_expenses.toFixed(2)}`,
      change: `${expensesChange.value.toFixed(1)}%`,
      changeType: expensesChange.type === 'positive' ? 'negative' : 'positive',
      valueClass: getColorClass(expensesChange.value, 'expense'),
      description: getPeriodLabel(comparisonPeriod),
    },
    {
      title: "Net Profit",
      value: `$${current.net_profit.toFixed(2)}`,
      change: `${profitChange.value.toFixed(1)}%`,
      changeType: profitChange.type,
      valueClass: getColorClass(profitChange.value, 'revenue'),
      description: getPeriodLabel(comparisonPeriod),
    },
    {
      title: "Customers",
      value: current.customer_count.toString(),
      change: `${customerChange.value.toFixed(1)}%`,
      changeType: customerChange.type,
      valueClass: getColorClass(customerChange.value, 'customer'),
      description: getPeriodLabel(comparisonPeriod),
    },
    {
      title: "Orders",
      value: current.total_orders.toString(),
      change: `${ordersChange.value.toFixed(1)}%`,
      changeType: ordersChange.type,
      valueClass: getColorClass(ordersChange.value, 'order'),
      description: getPeriodLabel(comparisonPeriod),
    },
    {
      title: "Avg. Order Value",
      value: `$${avgOrderValue.toFixed(2)}`,
      change: `${avgOrderChange.value.toFixed(1)}%`,
      changeType: avgOrderChange.type,
      valueClass: getColorClass(avgOrderChange.value, 'revenue'),
      description: getPeriodLabel(comparisonPeriod),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={comparisonPeriod} onValueChange={(value: ComparisonPeriod) => handlePeriodChange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select comparison period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="previous_day">vs. Previous Day</SelectItem>
            <SelectItem value="previous_week">vs. Previous Week</SelectItem>
            <SelectItem value="previous_month">vs. Previous Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {stats.map((stat) => (
          <Card 
            key={stat.title} 
            className="p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-900/50"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    stat.changeType === "positive" ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"
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
    </div>
  );
}
