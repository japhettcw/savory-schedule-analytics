
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { AddInventoryDialog } from "@/components/inventory/AddInventoryDialog";
import { LowStockAlert } from "@/components/inventory/LowStockAlert";

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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="capitalize">{item.category}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.expiryDate}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>
                      {item.quantity <= item.reorderPoint ? (
                        <span className="text-yellow-600 font-medium">
                          Low Stock
                        </span>
                      ) : (
                        <span className="text-green-600 font-medium">OK</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      <AddInventoryDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
