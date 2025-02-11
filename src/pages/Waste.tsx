
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { AddWasteLogDialog } from "@/components/waste/AddWasteLogDialog";
import { WasteLogList, type WasteLog } from "@/components/waste/WasteLogList";
import { useToast } from "@/hooks/use-toast";
import { WasteTrendChart } from "@/components/waste/WasteTrendChart";
import { MostWastedItemsReport } from "@/components/waste/MostWastedItemsReport";
import { WasteCostCalculator } from "@/components/waste/WasteCostCalculator";
import { InventoryWasteLink } from "@/components/waste/InventoryWasteLink";
import { supabase } from "@/integrations/supabase/client";

export default function Waste() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<WasteLog | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWasteLogs = async () => {
      const { data, error } = await supabase
        .from('waste_logs')
        .select(`
          id,
          inventory_item_id,
          quantity,
          unit,
          reason,
          date,
          cost_impact,
          notes,
          inventory_items (name)
        `)
        .order('date', { ascending: false });

      if (error) {
        toast({
          title: "Error fetching waste logs",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      const formattedLogs: WasteLog[] = data.map(log => ({
        id: log.id,
        itemName: log.inventory_items.name,
        quantity: log.quantity,
        unit: log.unit,
        reason: log.reason,
        date: new Date(log.date).toISOString().split('T')[0],
        costImpact: log.cost_impact,
        notes: log.notes || undefined,
      }));

      setWasteLogs(formattedLogs);
    };

    fetchWasteLogs();
  }, [toast]);

  const handleAddLog = async (log: WasteLog) => {
    try {
      const { data: inventoryItem, error: inventoryError } = await supabase
        .from('inventory_items')
        .select('id')
        .eq('name', log.itemName)
        .single();

      if (inventoryError) throw inventoryError;

      const { error } = await supabase
        .from('waste_logs')
        .insert({
          inventory_item_id: inventoryItem.id,
          quantity: log.quantity,
          unit: log.unit,
          reason: log.reason,
          date: log.date,
          cost_impact: log.costImpact,
          notes: log.notes,
        });

      if (error) throw error;

      setWasteLogs([log, ...wasteLogs]);
      setIsDialogOpen(false);
      toast({
        title: "Waste log added",
        description: "The waste log has been successfully recorded.",
      });
    } catch (error) {
      console.error('Error adding waste log:', error);
      toast({
        title: "Error",
        description: "Failed to add waste log. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditLog = async (log: WasteLog) => {
    try {
      const { data: inventoryItem, error: inventoryError } = await supabase
        .from('inventory_items')
        .select('id')
        .eq('name', log.itemName)
        .single();

      if (inventoryError) throw inventoryError;

      const { error } = await supabase
        .from('waste_logs')
        .update({
          inventory_item_id: inventoryItem.id,
          quantity: log.quantity,
          unit: log.unit,
          reason: log.reason,
          date: log.date,
          cost_impact: log.costImpact,
          notes: log.notes,
        })
        .eq('id', log.id);

      if (error) throw error;

      setWasteLogs(wasteLogs.map((l) => (l.id === log.id ? log : l)));
      setSelectedLog(null);
      toast({
        title: "Waste log updated",
        description: "The waste log has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating waste log:', error);
      toast({
        title: "Error",
        description: "Failed to update waste log. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLog = async (id: number) => {
    try {
      const { error } = await supabase
        .from('waste_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWasteLogs(wasteLogs.filter((log) => log.id !== id));
      toast({
        title: "Waste log deleted",
        description: "The waste log has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting waste log:', error);
      toast({
        title: "Error",
        description: "Failed to delete waste log. Please try again.",
        variant: "destructive",
      });
    }
  };

  const totalWasteCost = wasteLogs.reduce(
    (sum, item) => sum + item.costImpact,
    0
  );

  // Calculate waste by reason for the WasteCostCalculator
  const wasteByReason = Object.entries(
    wasteLogs.reduce((acc, log) => {
      acc[log.reason] = (acc[log.reason] || 0) + log.costImpact;
      return acc;
    }, {} as Record<string, number>)
  ).map(([reason, cost]) => ({ reason, cost }));

  // Prepare data for MostWastedItemsReport
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

  // Prepare data for InventoryWasteLink
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
        <WasteTrendChart data={wasteLogs} />
        <WasteCostCalculator 
          wasteByReason={wasteByReason}
          totalCost={totalWasteCost}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <MostWastedItemsReport items={wastedItems} />
        <InventoryWasteLink data={inventoryWasteData} />
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
