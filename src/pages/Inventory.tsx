import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
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

// Temporary mock data until we integrate with a backend
const inventoryData = [
  {
    id: 1,
    name: "Tomatoes",
    category: "produce",
    quantity: 50,
    unit: "kg",
    expiryDate: "2024-04-15",
    supplier: "Fresh Produce Co",
    reorderPoint: 20,
  },
  {
    id: 2,
    name: "Chicken Breast",
    category: "meat",
    quantity: 15,
    unit: "kg",
    expiryDate: "2024-04-10",
    supplier: "Quality Meats Inc",
    reorderPoint: 25,
  },
  {
    id: 3,
    name: "Rice",
    category: "dry-goods",
    quantity: 0,
    unit: "kg",
    expiryDate: "2024-12-31",
    supplier: "Global Foods Ltd",
    reorderPoint: 50,
  },
];

export default function Inventory() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getExpiringItems = () => {
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    return inventoryData.filter((item) => {
      const expiryDate = new Date(item.expiryDate);
      return expiryDate <= sevenDaysFromNow;
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground mt-2">
            Manage your restaurant's inventory items
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2" />
          Add Item
        </Button>
      </div>

      <LowStockAlert items={inventoryData} />
      <ExpirationTracker items={inventoryData} />
      <OutOfStockNotification items={inventoryData} />
      <AutomaticReorderSystem items={inventoryData} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Total Items</h3>
          <p className="text-3xl font-bold">{inventoryData.length}</p>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-2 text-yellow-600">Low Stock Items</h3>
          <p className="text-3xl font-bold">
            {
              inventoryData.filter(
                (item) => item.quantity <= item.reorderPoint
              ).length
            }
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-2 text-red-600">Expiring Soon</h3>
          <p className="text-3xl font-bold">{getExpiringItems().length}</p>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Current Inventory</h2>
          <VirtualizedInventoryTable items={inventoryData} />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <IngredientUsageAnalysis />
        <WastageReport />
      </div>
      
      <CostAnalysis />

      <SupplierManagement />
      <OrderTracker />

      <AddInventoryDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
