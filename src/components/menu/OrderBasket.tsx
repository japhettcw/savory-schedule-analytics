
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import type { OrderBasketItem } from "@/types/menu";

interface OrderBasketProps {
  items: OrderBasketItem[];
  onUpdateQuantity: (itemId: string, change: number) => void;
}

export function OrderBasket({ items, onUpdateQuantity }: OrderBasketProps) {
  return (
    <Card className="bg-white border shadow-sm">
      <CardHeader>
        <CardTitle>Order Basket</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Your basket is empty
          </p>
        ) : (
          <ul className="space-y-4">
            {items.map((basketItem) => (
              <li 
                key={basketItem.item.id} 
                className="flex items-center justify-between gap-4 text-sm"
              >
                <span className="flex-grow">{basketItem.item.name}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUpdateQuantity(basketItem.item.id, -1)}
                    disabled={basketItem.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{basketItem.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUpdateQuantity(basketItem.item.id, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
