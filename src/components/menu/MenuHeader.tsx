
import { Button } from "@/components/ui/button";
import { Plus, ShoppingBasket } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { OrderBasket } from "@/components/menu/OrderBasket";
import type { OrderBasketItem } from "@/types/menu";

interface MenuHeaderProps {
  onAddItem: () => void;
  basketItems: OrderBasketItem[];
  onUpdateQuantity: (itemId: string, change: number) => void;
}

export function MenuHeader({ onAddItem, basketItems, onUpdateQuantity }: MenuHeaderProps) {
  const basketItemCount = basketItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Menu Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your restaurant's menu items
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative"
            >
              <ShoppingBasket className="h-5 w-5" />
              {basketItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center animate-in zoom-in">
                  {basketItemCount}
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="fixed inset-0 sm:inset-auto sm:max-w-[425px] z-50">
            <DialogHeader>
              <DialogTitle>Your Order</DialogTitle>
              <DialogDescription className="sr-only">
                Manage your order items and checkout
              </DialogDescription>
            </DialogHeader>
            <OrderBasket 
              items={basketItems}
              onUpdateQuantity={onUpdateQuantity}
            />
          </DialogContent>
        </Dialog>
        <Button
          className="flex items-center gap-2"
          onClick={onAddItem}
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>
    </div>
  );
}
