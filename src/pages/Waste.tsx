import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { AddWasteLogDialog } from "@/components/waste/AddWasteLogDialog";
import { WasteLogList, type WasteLog } from "@/components/waste/WasteLogList";
import { useToast } from "@/components/ui/use-toast";
import { WasteTrendChart } from "@/components/waste/WasteTrendChart";
import { MostWastedItemsReport } from "@/components/waste/MostWastedItemsReport";
import { WasteCostCalculator } from "@/components/waste/WasteCostCalculator";
import { InventoryWasteLink } from "@/components/waste/InventoryWasteLink";
import { WasteForecast } from "@/components/waste/WasteForecast";
import { WastageReport } from "@/components/inventory/WastageReport";
import { ExpirationTracker } from "@/components/inventory/ExpirationTracker";
import { supabase } from "@/integrations/supabase/client";

const initialWasteData: WasteLog[] = [
  {
    id: 1,
    itemName: "Tomato Soup",
    quantity: 2.5,
    unit: "kg",
    date: "2024-03-15",
    reason: "expired",
    costImpact: 25.0,
    notes: "Found during weekly inventory check",
  },
  {
    id: 2,
    itemName: "Chicken Breast",
    quantity: 1.8,
    unit: "kg",
    date: "2024-03-14",
    reason: "over-prepared",
    costImpact: 18.0,
    notes: "Overestimated dinner service needs",
  },
];

const analyticsData = [
  { name: "Mon", waste: 45 },
  { name: "Tue", waste: 30 },
  { name: "Wed", waste: 25 },
  { name: "Thu", waste: 40 },
  { name: "Fri", waste: 35 },
  { name: "Sat", waste: 50 },
  { name: "Sun", waste: 42 },
];

export default function Waste() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>(initialWasteData);
  const [selectedLog, setSelectedLog] = useState<WasteLog | null>(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const { toast } = useToast();

  // Add fetch for inventory items to get expiry dates
  const fetchInventoryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('name, expiry_date');
      
      if (error) throw error;
      setInventoryItems(data || []);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    }
  };

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const expiryItems = inventoryItems.map((item: any) => ({
    name: item.name,
    expiryDate: item.expiry_date
  }));

  const handleAddLog = (log: WasteLog) => {
    const newLog = {
      ...log,
      id: Math.max(0, ...wasteLogs.map((l) => l.id)) + 1,
    };
    setWasteLogs([newLog, ...wasteLogs]);
    setIsDialogOpen(false);
    toast({
      title: "Waste log added",
      description: "The waste log has been successfully recorded.",
    });
  };

  const handleEditLog = (log: WasteLog) => {
    setWasteLogs(wasteLogs.map((l) => (l.id === log.id ? log : l)));
    setSelectedLog(null);
    toast({
      title: "Waste log updated",
      description: "The waste log has been successfully updated.",
    });
  };

  const handleDeleteLog = (id: number) => {
    setWasteLogs(wasteLogs.filter((log) => log.id !== id));
    toast({
      title: "Waste log deleted",
      description: "The waste log has been successfully deleted.",
    });
  };

  const totalWasteCost = wasteLogs.reduce(
    (sum, item) => sum + item.costImpact,
    0
  );

  const wasteByReason = Object.entries(
    wasteLogs.reduce((acc, log) => {
      acc[log.reason] = (acc[log.reason] || 0) + log.costImpact;
      return acc;
    }, {} as Record<string, number>)
  ).map(([reason, cost]) => ({ reason, cost }));

  const wastedItems = Object.entries(
    wasteLogs.reduce((acc, log) => {
      if (!acc[log.itemName]) {
        acc[log.itemName] = {
          itemName: log.itemName,
          quantity: 0,
          unit: log.unit,
          costImpact: 0,
          percentage: 0,
        };
      }
      acc[log.itemName].quantity += log.quantity;
      acc[log.itemName].costImpact += log.costImpact;
      return acc;
    }, {} as Record<string, any>)
  ).map(([_, item]) => ({
    ...item,
    percentage: (item.costImpact / totalWasteCost) * 100,
  }));

  const inventoryWasteData = wasteLogs.map(log => ({
    inventoryLevel: Math.random() * 100, // This would come from your inventory system in production
    wasteAmount: log.quantity,
    itemName: log.itemName
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Waste Management</h1>
          <p className="text-muted-foreground mt-2">
            Track and analyze food waste in your restaurant
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2" />
          Log Waste
        </Button>
      </div>

      <ExpirationTracker items={expiryItems} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Total Waste Logs</h3>
          <p className="text-3xl font-bold">{wasteLogs.length}</p>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-2">This Week's Cost Impact</h3>
          <p className="text-3xl font-bold">${totalWasteCost.toFixed(2)}</p>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Most Common Reason</h3>
          <p className="text-3xl font-bold capitalize">
            {
              Object.entries(
                wasteLogs.reduce((acc, log) => {
                  acc[log.reason] = (acc[log.reason] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"
            }
          </p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <WasteForecast />
        <WastageReport />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <WasteTrendChart data={analyticsData} />
        <WasteCostCalculator 
          wasteByReason={wasteByReason}
          totalCost={totalWasteCost}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <MostWastedItemsReport items={wastedItems} />
        <InventoryWasteLink />
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Waste Logs</h2>
          <WasteLogList
            logs={wasteLogs}
            onEdit={(log) => {
              setSelectedLog(log);
              setIsDialogOpen(true);
            }}
            onDelete={handleDeleteLog}
          />
        </div>
      </Card>

      <AddWasteLogDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedLog(null);
        }}
        initialData={selectedLog}
        onSubmit={selectedLog ? handleEditLog : handleAddLog}
      />
    </div>
  );
}
