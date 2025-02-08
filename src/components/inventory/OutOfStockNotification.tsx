
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XCircle } from "lucide-react";

type OutOfStockNotificationProps = {
  items: Array<{
    name: string;
    quantity: number;
  }>;
};

export function OutOfStockNotification({ items }: OutOfStockNotificationProps) {
  const outOfStockItems = items.filter((item) => item.quantity === 0);

  if (outOfStockItems.length === 0) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <XCircle className="h-4 w-4" />
      <AlertTitle>Out of Stock Items</AlertTitle>
      <AlertDescription>
        <p>The following items are currently out of stock:</p>
        <ul className="mt-2 list-disc list-inside">
          {outOfStockItems.map((item) => (
            <li key={item.name}>{item.name}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
