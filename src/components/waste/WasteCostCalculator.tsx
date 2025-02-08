
import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface WasteCostCalculatorProps {
  wasteByReason: Array<{
    reason: string;
    cost: number;
  }>;
  totalCost: number;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#06b6d4'];

export function WasteCostCalculator({ wasteByReason, totalCost }: WasteCostCalculatorProps) {
  const data = wasteByReason.map(item => ({
    name: item.reason.charAt(0).toUpperCase() + item.reason.slice(1).replace('-', ' '),
    value: item.cost
  }));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Waste Cost Analysis</h2>
        <div className="text-2xl font-bold text-red-500">
          ${totalCost.toFixed(2)}
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
