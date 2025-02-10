
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface SalesData {
  name: string;
  value: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function TopSellingItems() {
  const [metric, setMetric] = useState<"quantity" | "revenue">("revenue");

  const { data: topItems, isLoading } = useQuery({
    queryKey: ['topSellingItems', metric],
    queryFn: async () => {
      console.log('Fetching top selling items...');
      const { data, error } = await supabase
        .from('item_sales')
        .select(`
          ${metric},
          menu_items (
            name
          )
        `)
        .gte('date', '2025-02-03')
        .lte('date', '2025-02-10');

      if (error) {
        console.error('Error fetching top selling items:', error);
        throw error;
      }

      console.log('Raw sales data:', data);

      const salesByItem = data.reduce((acc: Record<string, number>, sale) => {
        const itemName = sale.menu_items?.name || 'Unknown Item';
        acc[itemName] = (acc[itemName] || 0) + Number(sale[metric]);
        return acc;
      }, {});

      const formattedData: SalesData[] = Object.entries(salesByItem)
        .map(([name, value]) => ({
          name,
          value: Number(value.toFixed(2)),
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      console.log('Formatted sales data:', formattedData);
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Top Selling Items</h3>
        <Select value={metric} onValueChange={(value: "quantity" | "revenue") => setMetric(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="revenue">By Revenue</SelectItem>
            <SelectItem value="quantity">By Quantity</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={topItems}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
            >
              {topItems?.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [
                metric === "revenue" ? `$${value.toFixed(2)}` : value,
                metric === "revenue" ? "Revenue" : "Orders"
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
