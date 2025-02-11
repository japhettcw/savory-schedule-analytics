
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface ExpenseData {
  category: string;
  amount: number;
}

export function ExpenseBreakdown() {
  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenseBreakdown'],
    queryFn: async () => {
      console.log('Fetching expense breakdown...');
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

      console.log('Raw expense data:', data);

      const expensesByCategory = data.reduce((acc: Record<string, number>, expense) => {
        const categoryName = expense.expense_categories?.name || 'Uncategorized';
        acc[categoryName] = (acc[categoryName] || 0) + Number(expense.amount);
        return acc;
      }, {});

      const formattedData: ExpenseData[] = Object.entries(expensesByCategory).map(
        ([category, amount]) => ({
          category,
          amount: Number(amount.toFixed(2)),
        })
      );

      console.log('Formatted expense data:', formattedData);
      return formattedData;
    },
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-[400px] w-full" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={expenses} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="category"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{ 
                value: 'Amount ($)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
            />
            <Legend />
            <Bar 
              dataKey="amount" 
              fill="#8884d8" 
              name="Total Expenses"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
