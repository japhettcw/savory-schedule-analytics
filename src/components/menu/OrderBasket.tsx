import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { OrderBasketItem } from "@/types/menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface OrderBasketProps {
  items: OrderBasketItem[];
  onUpdateQuantity: (itemId: string, change: number) => void;
}

export function OrderBasket({ items, onUpdateQuantity }: OrderBasketProps) {
  const [taxPercentage, setTaxPercentage] = useState("8.875");
  const [tipPercentage, setTipPercentage] = useState("15");
  const { toast } = useToast();

  // Calculate totals
  const subtotal = items.reduce((sum, basketItem) => {
    const itemTotal = basketItem.item.price * basketItem.quantity;
    return sum + itemTotal;
  }, 0);

  const taxAmount = (subtotal * (parseFloat(taxPercentage) / 100));
  const tipAmount = (subtotal * (parseFloat(tipPercentage) / 100));
  const total = subtotal + taxAmount + tipAmount;

  const handleConfirmOrder = async () => {
    try {
      // Check stock levels before confirming
      const outOfStockItems = items.filter(
        item => (item.item.stockLevel || 0) < item.quantity
      );

      if (outOfStockItems.length > 0) {
        toast({
          title: "Cannot Confirm Order",
          description: `Some items are out of stock: ${outOfStockItems.map(item => item.item.name).join(", ")}`,
          variant: "destructive",
        });
        return;
      }

      // Update stock levels
      for (const item of items) {
        const { data, error } = await supabase
          .from('menu_items')
          .update({ 
            stock_level: (item.item.stockLevel || 0) - item.quantity 
          })
          .eq('id', item.item.id)
          .select();

        if (error) {
          console.error('Error updating stock level:', error);
          throw error;
        }
      }

      toast({
        title: "Order Confirmed",
        description: `Your order total of $${total.toFixed(2)} has been confirmed.`,
      });

      // Reset quantities to clear the basket
      items.forEach(item => {
        onUpdateQuantity(item.item.id, -item.quantity);
      });
    } catch (error) {
      console.error('Error confirming order:', error);
      toast({
        title: "Error Confirming Order",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    }
  };

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
                className="flex items-center justify-between gap-4 text-sm animate-fade-in"
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
                    className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    onClick={() => {
                      onUpdateQuantity(basketItem.item.id, -1);
                      if (basketItem.quantity === 1) {
                        toast({
                          title: "Item Removed",
                          description: `${basketItem.item.name} has been removed from your basket.`,
                        });
                      }
                    }}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{basketItem.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => {
                      onUpdateQuantity(basketItem.item.id, 1);
                      toast({
                        title: "Quantity Updated",
                        description: `Added another ${basketItem.item.name} to your basket.`,
                      });
                    }}
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
        <CardFooter className="flex flex-col w-full gap-4">
          <Separator className="my-2" />
          
          <div className="w-full space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm w-24">Tax Rate (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.001"
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(e.target.value)}
                className="max-w-[100px] transition-all focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <label className="text-sm w-24">Tip (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                step="1"
                value={tipPercentage}
                onChange={(e) => setTipPercentage(e.target.value)}
                className="max-w-[100px] transition-all focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="w-full space-y-2 pt-2">
            <div className="flex justify-between w-full text-sm">
              <span>Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-full text-sm">
              <span>Tax ({taxPercentage}%)</span>
              <span className="font-medium">${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-full text-sm">
              <span>Tip ({tipPercentage}%)</span>
              <span className="font-medium">${tipAmount.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between w-full text-lg font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <Button 
            className="w-full mt-4 hover:scale-[1.02] transition-transform"
            size="lg"
            onClick={handleConfirmOrder}
          >
            Confirm Order (${total.toFixed(2)})
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
