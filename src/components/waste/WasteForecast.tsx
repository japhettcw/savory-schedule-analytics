
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrendingDown, LineChart as ChartIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";

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

  // Predict next 7 days
  return Array.from({ length: 7 }, (_, i) => {
    const predictedValue = Math.max(0, slope * (n + i) + intercept);
    return {
      date: format(subDays(new Date(), -i - 1), 'MMM dd'),
      amount: 0,
      prediction: Number(predictedValue.toFixed(2))
    };
  });
};

interface WasteForecastProps {
  historicalData?: Array<{
    date: string;
    amount: number;
  }>;
}

export function WasteForecast({ historicalData = [] }: WasteForecastProps) {
  const [wasteData, setWasteData] = useState<Array<{
    date: string;
    amount: number;
    prediction?: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWasteData = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
        
        const { data, error } = await supabase
          .from('waste_forecasts')
          .select('date, amount')
          .eq('user_id', userData.user.id)
          .gte('date', thirtyDaysAgo)
          .order('date', { ascending: true });

        if (error) throw error;

        const formattedData = (data || []).map(item => ({
          date: format(new Date(item.date), 'MMM dd'),
          amount: Number(item.amount)
        }));

        // Get predictions for next 7 days
        const predictions = predictWaste(formattedData);
        
        // Combine historical data with predictions
        const combinedData = [
          ...formattedData,
          ...(predictions || [])
        ];

        setWasteData(combinedData);
      } catch (error) {
        console.error('Error fetching waste data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWasteData();
  }, []);

  const currentAverage = wasteData.length > 0
    ? wasteData.filter(d => d.amount > 0).reduce((sum, item) => sum + item.amount, 0) / 
      wasteData.filter(d => d.amount > 0).length
    : 0;

  const latestPrediction = wasteData.find(d => d.prediction)?.prediction || 0;
  const improvement = ((currentAverage - latestPrediction) / currentAverage) * 100;

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="h-[300px] flex items-center justify-center">
          <ChartIcon className="h-8 w-8 animate-pulse text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Waste Forecast</h2>
      <div className="h-[300px] mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={wasteData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ 
                value: 'Amount (kg)', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: '12px' }
              }}
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="amount"
              name="Historical Waste"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="prediction"
              name="Predicted Waste"
              stroke="#ea580c"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {improvement > 0 && (
        <Alert className="bg-green-50">
          <TrendingDown className="h-4 w-4 text-green-600" />
          <AlertTitle>Projected Improvement</AlertTitle>
          <AlertDescription>
            Based on current trends, we project a {improvement.toFixed(1)}% reduction
            in waste over the next week.
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
}
