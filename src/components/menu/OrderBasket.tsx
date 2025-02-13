
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function OrderBasket() {
  return (
    <Card className="bg-white border shadow-sm">
      <CardHeader>
        <CardTitle>Order Basket</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          Your basket is empty
        </p>
      </CardContent>
    </Card>
  );
}
