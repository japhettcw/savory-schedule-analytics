
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Minus, Plus, Trash2 } from "lucide-react";
import type { MenuItem } from "@/types/menu";

export type BasketItem = {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
};

interface OrderBasketProps {
  items: BasketItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onUpdateNotes: (itemId: string, notes: string) => void;
  onRemoveItem: (itemId: string) => void;
  onSubmitOrder: (tableNumber: string) => void;
  isSubmitting: boolean;
}

export function OrderBasket({
  items,
  onUpdateQuantity,
  onUpdateNotes,
  onRemoveItem,
  onSubmitOrder,
  isSubmitting
}: OrderBasketProps) {
  const [tableNumber, setTableNumber] = useState("");
  
  const total = items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    onSubmitOrder(tableNumber);
  };

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Current Order</h2>
      
      {items.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">
          No items in order
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.menuItem.id} className="flex items-start gap-4 pb-4 border-b">
              <div className="flex-1">
                <h3 className="font-medium">{item.menuItem.name}</h3>
                <p className="text-sm text-muted-foreground">
                  ${item.menuItem.price.toFixed(2)} each
                </p>
                <Input
                  className="mt-2"
                  placeholder="Add notes (optional)"
                  value={item.notes || ""}
                  onChange={(e) => onUpdateNotes(item.menuItem.id, e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveItem(item.menuItem.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          
          <div className="pt-4">
            <div className="flex justify-between mb-4">
              <span className="font-medium">Total:</span>
              <span className="font-bold">${total.toFixed(2)}</span>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Table number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                required
              />
              <Button
                type="submit"
                className="w-full"
                disabled={items.length === 0 || !tableNumber || isSubmitting}
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Submit Order
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}
