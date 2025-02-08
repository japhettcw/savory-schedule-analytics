
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { AddInventoryDialog } from "@/components/inventory/AddInventoryDialog";
import { LowStockAlert } from "@/components/inventory/LowStockAlert";
import { ExpirationTracker } from "@/components/inventory/ExpirationTracker";
import { OutOfStockNotification } from "@/components/inventory/OutOfStockNotification";
import { SupplierManagement } from "@/components/inventory/SupplierManagement";
import { AutomaticReorderSystem } from "@/components/inventory/AutomaticReorderSystem";
import { OrderTracker } from "@/components/inventory/OrderTracker";
import { IngredientUsageAnalysis } from "@/components/inventory/IngredientUsageAnalysis";
import { WastageReport } from "@/components/inventory/WastageReport";
import { CostAnalysis } from "@/components/inventory/CostAnalysis";
import { VirtualizedInventoryTable } from "@/components/inventory/VirtualizedInventoryTable";
import { WasteForecast } from "@/components/waste/WasteForecast";
import { PortionAdjustmentSuggestion } from "@/components/waste/PortionAdjustmentSuggestion";
import { InventoryWasteLink } from "@/components/waste/InventoryWasteLink";
import { HighWasteAlert } from "@/components/waste/HighWasteAlert";
import { SupplierQualityAlert } from "@/components/waste/SupplierQualityAlert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Inventory() {
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchInventoryItems();

    // Set up realtime subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory_items'
        },
        () => {
          fetchInventoryItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchInventoryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setInventoryItems(data);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory items",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <Button onClick={() => setIsAddInventoryOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>

      <div className="grid gap-6">
        <HighWasteAlert items={[]} />
        <SupplierQualityAlert issues={[]} />
        <OutOfStockNotification items={inventoryItems} />
        <LowStockAlert items={inventoryItems} />
        <ExpirationTracker items={inventoryItems} />
        <SupplierManagement />
        <AutomaticReorderSystem items={inventoryItems} />
        <OrderTracker />
        <IngredientUsageAnalysis />
        <WastageReport />
        <CostAnalysis />
        <VirtualizedInventoryTable items={inventoryItems} />
        <WasteForecast historicalData={[]} />
        <PortionAdjustmentSuggestion data={[]} />
        <InventoryWasteLink data={[]} />
      </div>

      <AddInventoryDialog
        open={isAddInventoryOpen}
        onOpenChange={setIsAddInventoryOpen}
      />
    </div>
  );
}
