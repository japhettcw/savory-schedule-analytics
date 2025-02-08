
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrendingDown } from "lucide-react";

// Simple linear regression for waste prediction
const predictWaste = (historicalData: Array<{ date: string; amount: number }>) => {
  const n = historicalData.length;
  if (n < 2) return null;

  const x = Array.from({ length: n }, (_, i) => i);
  const y = historicalData.map(d => d.amount);

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Predict next week
  const nextValue = slope * n + intercept;
  return Math.max(0, nextValue); // Ensure prediction isn't negative
};

interface WasteForecastProps {
  historicalData: Array<{
    date: string;
    amount: number;
  }>;
}

export function WasteForecast({ historicalData }: WasteForecastProps) {
  const prediction = predictWaste(historicalData);
  const currentAverage = historicalData.length > 0
    ? historicalData.reduce((sum, item) => sum + item.amount, 0) / historicalData.length
    : 0;

  const improvement = prediction !== null
    ? ((currentAverage - prediction) / currentAverage) * 100
    : 0;

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Waste Forecast</h2>
      <div className="h-[300px] mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#0ea5e9"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {prediction !== null && improvement > 0 && (
        <Alert className="bg-green-50">
          <TrendingDown className="h-4 w-4 text-green-600" />
          <AlertTitle>Projected Improvement</AlertTitle>
          <AlertDescription>
            Based on current trends, we project a {improvement.toFixed(1)}% reduction
            in waste next week.
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
}
