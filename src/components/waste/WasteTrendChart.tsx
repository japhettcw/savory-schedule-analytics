
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
import { Card } from "@/components/ui/card";
import { memo } from "react";

interface WasteTrendChartProps {
  data: Array<{
    name: string;
    waste: number;
    cost: number;
  }>;
}

export const WasteTrendChart = memo(function WasteTrendChart({ data }: WasteTrendChartProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Weekly Waste Trend</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 border rounded-lg shadow">
                      <p className="font-semibold">{label}</p>
                      <p className="text-red-500">
                        Waste: {payload[0].value.toFixed(2)} kg
                      </p>
                      <p className="text-blue-500">
                        Cost: ${payload[1].value.toFixed(2)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="waste"
              stroke="#ef4444"
              strokeWidth={2}
              name="Waste (kg)"
              dot={{ strokeWidth: 2 }}
              activeDot={{ r: 8 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cost"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Cost ($)"
              dot={{ strokeWidth: 2 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
});
