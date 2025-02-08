
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
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

// Mock data for inventory items
const mockInventoryItems = [
  {
    id: 1,
    name: "Tomatoes",
    category: "Produce",
    quantity: 50,
    unit: "kg",
    expiryDate: "2024-03-25",
    supplier: "Fresh Produce Co",
    reorderPoint: 20
  },
  {
    id: 2,
    name: "Chicken Breast",
    category: "Meat",
    quantity: 30,
    unit: "kg",
    expiryDate: "2024-03-20",
    supplier: "Quality Meats Inc",
    reorderPoint: 15
  }
];

// Mock data for waste forecast
const mockWasteHistoricalData = [
  { date: "2024-02-01", amount: 12 },
  { date: "2024-02-08", amount: 15 },
  { date: "2024-02-15", amount: 10 },
  { date: "2024-02-22", amount: 8 }
];

// Mock data for portion adjustments
const mockPortionData = [
  {
    itemName: "Chicken Breast",
    currentPortion: 200,
    suggestedPortion: 180,
    wastePercentage: 15,
    unit: "g"
  },
  {
    itemName: "Rice",
    currentPortion: 150,
    suggestedPortion: 130,
    wastePercentage: 12,
    unit: "g"
  }
];

// Mock data for alerts
const highWasteItems = [
  {
    name: "Fresh Tomatoes",
    wastePercentage: 25,
    timeFrame: "7 days"
  },
  {
    name: "Lettuce",
    wastePercentage: 30,
    timeFrame: "7 days"
  }
];

const supplierIssues = [
  {
    supplierName: "Fresh Produce Co",
    itemName: "Tomatoes",
    issueType: "Quality below standard",
    date: "2024-03-15"
  },
  {
    supplierName: "Quality Meats Inc",
    itemName: "Ground Beef",
    issueType: "Temperature control issue",
    date: "2024-03-14"
  }
];

export default function Inventory() {
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <Button onClick={() => setIsAddInventoryOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>

      <div className="grid gap-6">
        <HighWasteAlert items={highWasteItems} />
        <SupplierQualityAlert issues={supplierIssues} />
        <OutOfStockNotification items={mockInventoryItems} />
        <LowStockAlert items={mockInventoryItems} />
        <ExpirationTracker items={mockInventoryItems} />
        <SupplierManagement />
        <AutomaticReorderSystem items={mockInventoryItems} />
        <OrderTracker />
        <IngredientUsageAnalysis />
        <WastageReport />
        <CostAnalysis />
        <VirtualizedInventoryTable items={mockInventoryItems} />
        <WasteForecast historicalData={mockWasteHistoricalData} />
        <PortionAdjustmentSuggestion data={mockPortionData} />
        <InventoryWasteLink data={[]} />
      </div>

      <AddInventoryDialog
        open={isAddInventoryOpen}
        onOpenChange={setIsAddInventoryOpen}
      />
    </div>
  );
}
