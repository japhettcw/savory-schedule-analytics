
import { Badge } from "@/components/ui/badge";

interface StockCheckerProps {
  stockLevel?: number;
  threshold?: number;
}

export function StockChecker({ 
  stockLevel = 0, 
  threshold = 10 
}: StockCheckerProps) {
  const getStockStatus = () => {
    if (stockLevel <= 0) {
      return {
        label: "Out of Stock",
        variant: "destructive" as const,
      };
    }
    if (stockLevel <= threshold) {
      return {
        label: "Low Stock",
        variant: "warning" as const,
      };
    }
    return {
      label: "In Stock",
      variant: "success" as const,
    };
  };

  const status = getStockStatus();

  return (
    <Badge variant={status.variant}>
      {status.label} ({stockLevel})
    </Badge>
  );
}
