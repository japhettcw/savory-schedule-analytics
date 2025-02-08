
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

type ReorderItem = {
  id: number;
  name: string;
  quantity: number;
  reorderPoint: number;
  supplier: string;
};

type AutomaticReorderSystemProps = {
  items: ReorderItem[];
};

export function AutomaticReorderSystem({ items }: AutomaticReorderSystemProps) {
  const itemsToReorder = items.filter(
    (item) => item.quantity <= item.reorderPoint
  );

  const handleGenerateOrders = () => {
    // Mock function to generate purchase orders
    // Replace with actual API call when integrating with backend
    toast.success("Purchase orders generated successfully");
    console.log("Generating orders for:", itemsToReorder);
  };

  if (itemsToReorder.length === 0) return null;

  return (
    <Alert className="mb-4">
      <ShoppingCart className="h-4 w-4" />
      <AlertTitle>Automatic Reorder System</AlertTitle>
      <AlertDescription>
        <p>{itemsToReorder.length} items need to be reordered:</p>
        <ul className="mt-2 list-disc list-inside mb-4">
          {itemsToReorder.map((item) => (
            <li key={item.id}>
              {item.name} (Current: {item.quantity}, Reorder at: {item.reorderPoint})
            </li>
          ))}
        </ul>
        <Button onClick={handleGenerateOrders}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Generate Purchase Orders
        </Button>
      </AlertDescription>
    </Alert>
  );
}
