
import { Card } from "@/components/ui/card";
import { 
  Package, 
  AlertCircle, 
  DollarSign 
} from "lucide-react";

type InventorySummaryProps = {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
};

export function InventorySummary({ 
  totalItems, 
  totalValue, 
  lowStockItems 
}: InventorySummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-full">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Items</p>
            <h3 className="text-2xl font-bold">{totalItems}</h3>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-full">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Value</p>
            <h3 className="text-2xl font-bold">${totalValue.toFixed(2)}</h3>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-destructive/10 rounded-full">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
            <h3 className="text-2xl font-bold">{lowStockItems}</h3>
          </div>
        </div>
      </Card>
    </div>
  );
}
