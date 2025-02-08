
import { Card } from "@/components/ui/card";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface InventoryWasteLinkProps {
  data: Array<{
    inventoryLevel: number;
    wasteAmount: number;
    itemName: string;
  }>;
}

export function InventoryWasteLink({ data }: InventoryWasteLinkProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Inventory-Waste Correlation</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="inventoryLevel"
              name="Inventory Level"
              unit="%"
            />
            <YAxis
              type="number"
              dataKey="wasteAmount"
              name="Waste Amount"
              unit="kg"
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ payload }) => {
                if (!payload || !payload[0]) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-2 border rounded shadow-sm">
                    <p className="font-medium">{data.itemName}</p>
                    <p>Inventory: {data.inventoryLevel}%</p>
                    <p>Waste: {data.wasteAmount}kg</p>
                  </div>
                );
              }}
            />
            <Scatter data={data} fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-muted-foreground mt-4">
        This chart shows the correlation between inventory levels and waste amounts.
        Clusters indicate patterns that can help optimize ordering and storage.
      </p>
    </Card>
  );
}
