
import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

// Mock data - replace with actual data from backend
const wastageData = [
  { reason: "Expired", value: 40 },
  { reason: "Damaged", value: 30 },
  { reason: "Overproduction", value: 20 },
  { reason: "Quality Issues", value: 10 },
];

const COLORS = ["#ea384c", "#FEC6A1", "#F2FCE2", "#0EA5E9"];

export function WastageReport() {
  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Wastage Report</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={wastageData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {wastageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
