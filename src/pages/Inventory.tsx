
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";
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
        <LowStockAlert />
        <OutOfStockNotification />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InventorySummary />
        <WasteForecast />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ExpirationTracker />
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

      <AutomaticReorderSystem />

      <Card>
        <VirtualizedInventoryTable />
      </Card>

      <AddInventoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
