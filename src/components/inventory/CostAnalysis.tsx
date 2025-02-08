
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
import { TrendingUp, DollarSign } from "lucide-react";

// Mock data - replace with actual data from backend
const costData = [
  { month: "Jan", cost: 5000 },
  { month: "Feb", cost: 5200 },
  { month: "Mar", cost: 4800 },
  { month: "Apr", cost: 5100 },
  { month: "May", cost: 5300 },
  { month: "Jun", cost: 5150 },
];

export function CostAnalysis() {
  return (
    <div className="space-y-4">
      <Alert>
        <DollarSign className="h-4 w-4" />
        <AlertTitle>Cost Optimization Suggestion</AlertTitle>
        <AlertDescription>
          Consider bulk ordering high-usage ingredients to reduce costs. Potential savings of 15% identified.
        </AlertDescription>
      </Alert>

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Cost Analysis</h2>
            <div className="flex items-center text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm">3% improvement</span>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={costData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke="#0EA5E9"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
}
