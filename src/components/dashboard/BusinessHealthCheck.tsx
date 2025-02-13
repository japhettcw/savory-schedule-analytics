
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek, subWeeks, format } from "date-fns";

export function BusinessHealthCheck() {
  const { data: expenses } = useQuery({
    queryKey: ['expenseBreakdown'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_expenses')
        .select(`
          amount,
          expense_categories (
            name
          )
        `)
        .gte('date', '2025-02-03')
        .lte('date', '2025-02-10');

      if (error) {
        console.error('Error fetching expenses:', error);
        throw error;
      }

      const expensesByCategory = data.reduce((acc: Record<string, number>, expense) => {
        const categoryName = expense.expense_categories?.name || 'Uncategorized';
        acc[categoryName] = (acc[categoryName] || 0) + Number(expense.amount);
        return acc;
      }, {});

      return Object.entries(expensesByCategory).map(([category, amount]) => ({
        category,
        amount: Number(amount.toFixed(2)),
      }));
    },
  });

  const { data: profitMarginData } = useQuery({
    queryKey: ['profitMargin'],
    queryFn: async () => {
      const currentWeekStart = startOfWeek(new Date());
      const currentWeekEnd = endOfWeek(new Date());
      const lastWeekStart = startOfWeek(subWeeks(new Date(), 1));
      const lastWeekEnd = endOfWeek(subWeeks(new Date(), 1));

      const { data: currentWeekData, error: currentWeekError } = await supabase
        .from('daily_metrics')
        .select('net_profit, total_revenue')
        .gte('date', format(currentWeekStart, 'yyyy-MM-dd'))
        .lte('date', format(currentWeekEnd, 'yyyy-MM-dd'));

      if (currentWeekError) throw currentWeekError;

      const { data: lastWeekData, error: lastWeekError } = await supabase
        .from('daily_metrics')
        .select('net_profit, total_revenue')
        .gte('date', format(lastWeekStart, 'yyyy-MM-dd'))
        .lte('date', format(lastWeekEnd, 'yyyy-MM-dd'));

      if (lastWeekError) throw lastWeekError;

      const calculateProfitMargin = (data: any[]) => {
        const totalRevenue = data.reduce((sum, day) => sum + (day.total_revenue || 0), 0);
        const totalProfit = data.reduce((sum, day) => sum + (day.net_profit || 0), 0);
        return totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
      };

      const currentProfitMargin = calculateProfitMargin(currentWeekData);
      const lastProfitMargin = calculateProfitMargin(lastWeekData);

      const increase = lastProfitMargin > 0 
        ? ((currentProfitMargin - lastProfitMargin) / lastProfitMargin) * 100
        : currentProfitMargin;

      return {
        increase: Number(increase.toFixed(1)),
        currentMargin: Number(currentProfitMargin.toFixed(1))
      };
    },
  });

  const profitMarginIncrease = profitMarginData?.increase ?? 0;
  const isProfitMarginHealthy = profitMarginIncrease > 0;

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Business Health Check</h3>
      
      <div className="space-y-4">
        <Alert
          variant={isProfitMarginHealthy ? "default" : "destructive"}
          className={`${
            isProfitMarginHealthy 
              ? "border-primary/50 text-primary bg-primary/10" 
              : "border-destructive/50 text-destructive bg-destructive/10"
          }`}
        >
          {isProfitMarginHealthy ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <AlertTitle>Profit Margin Health</AlertTitle>
          <AlertDescription>
            Profit Margin is {isProfitMarginHealthy ? "healthy" : "concerning"} with a {Math.abs(profitMarginIncrease).toFixed(1)}% {profitMarginIncrease >= 0 ? "increase" : "decrease"}
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
}
