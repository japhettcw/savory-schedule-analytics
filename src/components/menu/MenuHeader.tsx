
import { Button } from "@/components/ui/button";
import { Plus, ShoppingBasket } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { OrderBasket } from "@/components/menu/OrderBasket";
import type { OrderBasketItem } from "@/types/menu";
import { useState } from "react";

interface MenuHeaderProps {
  onAddItem: () => void;
  basketItems: OrderBasketItem[];
  onUpdateQuantity: (itemId: string, change: number) => void;
}

export function MenuHeader({ onAddItem, basketItems, onUpdateQuantity }: MenuHeaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const basketItemCount = basketItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleDialogOpenChange = (open: boolean) => {
    console.log('Dialog open state changed:', open);
    setIsDialogOpen(open);
  };

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Menu Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your restaurant's menu items
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative"
              onClick={() => console.log('Basket button clicked')}
            >
              <ShoppingBasket className="h-5 w-5" />
              {basketItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center animate-in zoom-in">
                  {basketItemCount}
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent 
            className="fixed left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[425px] max-h-[85vh] overflow-y-auto bg-background rounded-lg shadow-lg z-[100]"
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              console.log('Dialog content mounted');
            }}
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              console.log('Dialog content unmounted');
            }}
          >
            <DialogHeader className="sticky top-0 bg-background pb-4 border-b">
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
