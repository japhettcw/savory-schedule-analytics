
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { AddInventoryDialog } from "@/components/inventory/AddInventoryDialog";
import { LowStockAlert } from "@/components/inventory/LowStockAlert";
import { OutOfStockNotification } from "@/components/inventory/OutOfStockNotification";
import { SupplierManagement } from "@/components/inventory/SupplierManagement";
import { AutomaticReorderSystem } from "@/components/inventory/AutomaticReorderSystem";
import { OrderTracker } from "@/components/inventory/OrderTracker";
import { IngredientUsageAnalysis } from "@/components/inventory/IngredientUsageAnalysis";
import { CostAnalysis } from "@/components/inventory/CostAnalysis";
import { VirtualizedInventoryTable } from "@/components/inventory/VirtualizedInventoryTable";
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

  useRealtimeSync({
    tableName: 'inventory_items',
    onDataChange: fetchInventoryItems,
  });

  const totalItems = inventoryItems.length;
  const totalValue = inventoryItems.reduce((sum, item: any) => 
    sum + (item.quantity * item.unit_price), 0
  );
  const lowStockItems = inventoryItems.filter((item: any) => 
    item.quantity <= item.reorder_point
  ).length;

  const stockItems = inventoryItems.map((item: any) => ({
    name: item.name,
    quantity: item.quantity,
    reorderPoint: item.reorder_point
  }));

  return (
    <div className="max-w-[100vw] overflow-x-hidden">
      <div className="p-4 space-y-6 sm:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold sm:text-3xl">Inventory Management</h1>
          <Button onClick={() => setIsAddInventoryOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>

        {/* Summary Section */}
        <div className="w-full">
          <InventorySummary 
            totalItems={totalItems}
            totalValue={totalValue}
            lowStockItems={lowStockItems}
          />
        </div>

        {/* Table Section */}
        <div className="w-full">
          <VirtualizedInventoryTable items={inventoryItems} />
        </div>

        {/* Analytics and Alerts Grid */}
        <div className="grid gap-4 sm:gap-6">
          {/* Top Row - Full Width Items */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            <PortionAdjustmentSuggestion data={[]} />
            <InventoryWasteLink />
          </div>

          {/* Alerts Section */}
          <div className="space-y-4">
            <HighWasteAlert items={[]} />
            <SupplierQualityAlert issues={[]} />
            <OutOfStockNotification items={stockItems} />
            <LowStockAlert items={stockItems} />
          </div>

          {/* Management Section */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            <SupplierManagement />
            <AutomaticReorderSystem items={inventoryItems} />
            <OrderTracker />
            <IngredientUsageAnalysis />
            <CostAnalysis />
          </div>
        </div>

        <AddInventoryDialog
          open={isAddInventoryOpen}
          onOpenChange={setIsAddInventoryOpen}
        />
      </div>
    </div>
  );
}
