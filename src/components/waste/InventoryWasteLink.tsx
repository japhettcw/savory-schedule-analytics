
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
  Legend,
} from "recharts";
import { InfoIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function InventoryWasteLink() {
  const [correlationData, setCorrelationData] = useState<Array<{
    inventoryLevel: number;
    wasteAmount: number;
    itemName: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCorrelationData = async () => {
      try {
        const { data, error } = await supabase.rpc('calculate_inventory_waste_correlation');
        
        if (error) {
          throw error;
        }

        const formattedData = data.map(item => ({
          inventoryLevel: Number(item.inventory_level),
          wasteAmount: Number(item.waste_amount),
          itemName: item.item_name
        }));

        console.log('Correlation data:', formattedData);
        setCorrelationData(formattedData);
      } catch (error) {
        console.error('Error fetching correlation data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch inventory-waste correlation data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCorrelationData();
  }, [toast]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-sm">{data.itemName}</p>
          <p className="text-sm">Inventory Level: {data.inventoryLevel.toFixed(1)}%</p>
          <p className="text-sm">Waste Amount: {data.wasteAmount.toFixed(1)} units</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">Inventory-Waste Correlation</h2>
            <p className="text-sm text-muted-foreground">
              Relationship between inventory levels and waste amounts
            </p>
          </div>
          <InfoIcon className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="h-[400px]">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">Loading data...</p>
            </div>
          ) : correlationData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">No correlation data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                <XAxis
                  type="number"
                  dataKey="inventoryLevel"
                  name="Inventory Level"
                  domain={[0, 200]}
                >
                  <Label
                    value="Inventory Level (%)"
                    position="bottom"
                    offset={20}
                    style={{ textAnchor: 'middle' }}
                  />
                </XAxis>
                <YAxis
                  type="number"
                  dataKey="wasteAmount"
                  name="Waste Amount"
                >
                  <Label
                    value="Waste Amount"
                    angle={-90}
                    position="left"
                    offset={-20}
                    style={{ textAnchor: 'middle' }}
                  />
                </YAxis>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Scatter
                  name="Items"
                  data={correlationData}
                  fill="#8884d8"
                  shape="circle"
                  strokeWidth={1}
                />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            This scatter plot shows how inventory levels correlate with waste amounts.
            Clusters or patterns can indicate optimal inventory ranges to minimize waste.
          </p>
        </div>
      </div>
    </Card>
  );
}
