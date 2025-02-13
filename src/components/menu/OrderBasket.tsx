
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { MenuItem } from "@/types/menu";

interface OrderBasketProps {
  items: MenuItem[];
}

export function OrderBasket({ items }: OrderBasketProps) {
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
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li key={`${item.id}-${index}`} className="text-sm">
                {item.name}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
