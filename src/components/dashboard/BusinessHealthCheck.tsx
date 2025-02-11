
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

  const hasHighExpense = expenses?.some(item => item.amount > 2000);
  const profitMarginIncrease = 15; // This would typically come from your data
  const isProfitMarginHealthy = profitMarginIncrease > 10;

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Business Health Check</h3>
      
      <div className="space-y-4">
        {hasHighExpense && (
          <Alert 
            variant="destructive"
            className="border-destructive/50 text-destructive bg-destructive/10"
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>High Expense Alert</AlertTitle>
            <AlertDescription>
              Some expense categories have exceeded the weekly budget threshold of $2,000
            </AlertDescription>
          </Alert>
        )}

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
            Profit Margin is {isProfitMarginHealthy ? "healthy" : "concerning"} with a {profitMarginIncrease}% increase
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
}
