
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data - replace with actual data from backend
const usageData = [
  { ingredient: "Tomatoes", usage: 45 },
  { ingredient: "Chicken", usage: 30 },
  { ingredient: "Rice", usage: 25 },
  { ingredient: "Onions", usage: 20 },
  { ingredient: "Garlic", usage: 15 },
];

export function IngredientUsageAnalysis() {
  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Ingredient Usage Analysis</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={usageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ingredient" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="usage" fill="#9b87f5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
