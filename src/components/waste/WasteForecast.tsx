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
import { format, subDays, addDays } from "date-fns";

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

  const lastDate = new Date(historicalData[historicalData.length - 1].date);
  return Array.from({ length: 7 }, (_, i) => {
    const predictedValue = Math.max(0, slope * (n + i) + intercept);
    return {
      date: format(addDays(lastDate, i + 1), 'MMM dd'),
      amount: 0,
      prediction: Number(predictedValue.toFixed(2))
    };
  });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border rounded-lg shadow-lg">
        <p className="font-semibold">{label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-sm">
            {item.name}: {item.value.toFixed(2)} kg
          </p>
        ))}
      </div>
    );
  }
  return null;
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

        if (error) {
          console.error('Error fetching waste data:', error);
          return;
        }

        if (!data || data.length === 0) {
          console.log('No waste forecast data found');
          setIsLoading(false);
          return;
        }

        console.log('Fetched waste data:', data); // Debug log

        // Format historical data
        const formattedData = data.map(item => ({
          date: format(new Date(item.date), 'MMM dd'),
          amount: Number(item.amount),
          prediction: undefined
        }));

        // Get and format predictions
        const predictions = predictWaste(formattedData);
        const formattedPredictions = predictions || [];
        
        console.log('Historical data:', formattedData); // Debug log
        console.log('Predictions:', formattedPredictions); // Debug log

        // Combine historical data with predictions
        const combinedData = [
          ...formattedData,
          ...formattedPredictions
        ];

        console.log('Combined data:', combinedData); // Debug log

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
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Waste Forecast</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
              <span className="text-sm">Historical Waste</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-orange-500 mr-2" />
              <span className="text-sm">Predicted Waste</span>
            </div>
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={wasteData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
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
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                name="Historical Waste"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
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
          <Alert className="bg-green-50 mt-4">
            <TrendingDown className="h-4 w-4 text-green-600" />
            <AlertTitle>Projected Improvement</AlertTitle>
            <AlertDescription>
              Based on current trends, we project a {improvement.toFixed(1)}% reduction
              in waste over the next week.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  );
}
