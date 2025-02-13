
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { OrderBasketItem } from "@/types/menu";

interface OrderBasketProps {
  items: OrderBasketItem[];
  onUpdateQuantity: (itemId: string, change: number) => void;
}

export function OrderBasket({ items, onUpdateQuantity }: OrderBasketProps) {
  // Calculate subtotal by summing up (item price × quantity) for all items
  const subtotal = items.reduce((sum, basketItem) => {
    const itemTotal = basketItem.item.price * basketItem.quantity;
    return sum + itemTotal;
  }, 0);

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
                <div className="flex flex-col flex-grow">
                  <span>{basketItem.item.name}</span>
                  <span className="text-muted-foreground text-xs">
                    ${basketItem.item.price.toFixed(2)} each
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUpdateQuantity(basketItem.item.id, -1)}
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
      {items.length > 0 && (
        <CardFooter className="flex flex-col">
          <Separator className="my-4" />
          <div className="flex justify-between w-full text-lg font-semibold">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
