
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
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
import { InventorySummary } from "@/components/inventory/InventorySummary";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";

export default function Inventory() {
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const { toast } = useToast();

  const fetchInventoryItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setInventoryItems(data || []);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory items",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  // Set up realtime sync using our custom hook
  useRealtimeSync({
    tableName: 'inventory_items',
    onDataChange: fetchInventoryItems,
  });

  // Calculate summary values
  const totalItems = inventoryItems.length;
  const totalValue = inventoryItems.reduce((sum, item: any) => 
    sum + (item.quantity * item.unit_price), 0
  );
  const lowStockItems = inventoryItems.filter((item: any) => 
    item.quantity <= item.reorder_point
  ).length;

  // Transform data for components that need specific formats
  const stockItems = inventoryItems.map((item: any) => ({
    name: item.name,
    quantity: item.quantity,
    reorderPoint: item.reorder_point
  }));

  const expiryItems = inventoryItems
    .filter((item: any) => item.expiry_date)
    .map((item: any) => ({
      name: item.name,
      expiryDate: item.expiry_date
    }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <Button onClick={() => setIsAddInventoryOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>

      <InventorySummary 
        totalItems={totalItems}
        totalValue={totalValue}
        lowStockItems={lowStockItems}
      />

      <VirtualizedInventoryTable items={inventoryItems} />

      <div className="grid gap-6">
        <HighWasteAlert items={[]} />
        <SupplierQualityAlert issues={[]} />
        <OutOfStockNotification items={stockItems} />
        <LowStockAlert items={stockItems} />
        <ExpirationTracker items={expiryItems} />
        <SupplierManagement />
        <AutomaticReorderSystem items={inventoryItems} />
        <OrderTracker />
        <IngredientUsageAnalysis />
        <WastageReport />
        <CostAnalysis />
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
