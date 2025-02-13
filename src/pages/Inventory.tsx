
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddInventoryDialog } from "@/components/inventory/AddInventoryDialog";
import { VirtualizedInventoryTable } from "@/components/inventory/VirtualizedInventoryTable";
import { InventorySummary } from "@/components/inventory/InventorySummary";
import { AutomaticReorderSystem } from "@/components/inventory/AutomaticReorderSystem";
import { CostAnalysis } from "@/components/inventory/CostAnalysis";
import { ExpirationTracker } from "@/components/inventory/ExpirationTracker";
import { IngredientUsageAnalysis } from "@/components/inventory/IngredientUsageAnalysis";
import { LowStockAlert } from "@/components/inventory/LowStockAlert";
import { OrderTracker } from "@/components/inventory/OrderTracker";
import { OutOfStockNotification } from "@/components/inventory/OutOfStockNotification";
import { SupplierManagement } from "@/components/inventory/SupplierManagement";
import { WastageReport } from "@/components/inventory/WastageReport";
import { WasteForecast } from "@/components/waste/WasteForecast";

export default function Inventory() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: inventoryItems = [], isLoading } = useQuery({
    queryKey: ['inventory_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate inventory summary
  const totalItems = inventoryItems.length;
  const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * (item.unit_price || 0)), 0);
  const lowStockItems = inventoryItems.filter(item => item.quantity <= item.reorder_point).length;

  // Prepare expiry tracking items
  const expiryItems = inventoryItems
    .filter(item => item.expiry_date)
    .map(item => ({
      name: item.name,
      expiryDate: item.expiry_date
    }));

  // Prepare stock alert items
  const stockAlertItems = inventoryItems.map(item => ({
    name: item.name,
    quantity: item.quantity,
    reorderPoint: item.reorder_point
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your restaurant's inventory
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2" />
          Add Item
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <LowStockAlert items={stockAlertItems} />
        <OutOfStockNotification items={stockAlertItems} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InventorySummary 
          totalItems={totalItems}
          totalValue={totalValue}
          lowStockItems={lowStockItems}
        />
        <WasteForecast />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ExpirationTracker items={expiryItems} />
        <CostAnalysis />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <IngredientUsageAnalysis />
        <WastageReport />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <OrderTracker />
        <SupplierManagement />
      </div>

      <AutomaticReorderSystem items={inventoryItems} />

      <Card>
        <VirtualizedInventoryTable items={inventoryItems} />
      </Card>

      <AddInventoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
