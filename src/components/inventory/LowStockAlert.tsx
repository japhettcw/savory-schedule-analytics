
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

type LowStockAlertProps = {
  items: Array<{
    name: string;
    quantity: number;
    reorderPoint: number;
  }>;
};

export function LowStockAlert({ items }: LowStockAlertProps) {
  const lowStockItems = items.filter((item) => item.quantity <= item.reorderPoint);

  if (lowStockItems.length === 0) return null;

  return (
    <Alert variant="warning" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Low Stock Alert</AlertTitle>
      <AlertDescription>
        <p>The following items are running low:</p>
        <ul className="mt-2 list-disc list-inside">
          {lowStockItems.map((item) => (
            <li key={item.name}>
              {item.name} ({item.quantity} remaining)
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
