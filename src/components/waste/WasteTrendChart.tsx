
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";

interface WasteTrendChartProps {
  data: Array<{
    name: string;
    waste: number;
  }>;
}

export function WasteTrendChart({ data }: WasteTrendChartProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Weekly Waste Trend</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="waste" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
