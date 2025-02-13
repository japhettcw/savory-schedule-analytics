
import { Button } from "@/components/ui/button";
import { Plus, ShoppingBasket } from "lucide-react";
import { Dialog, DialogPortal, DialogOverlay, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
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

  return (
    <div className="flex justify-between items-center relative">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Menu Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your restaurant's menu items
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            console.log('Attempting to change dialog state to:', open);
            setIsDialogOpen(open);
          }}
        >
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

          <DialogPortal>
            <DialogOverlay className="fixed inset-0 bg-black/40 z-[9999]" />
            <DialogContent 
              className="!fixed !left-[50%] !top-[50%] !-translate-x-1/2 !-translate-y-1/2 !w-[90vw] !max-w-[425px] !max-h-[85vh] !overflow-y-auto !bg-white !rounded-lg !shadow-xl !z-[9999] !p-6 !m-0 !border-0"
              onPointerDownOutside={(e) => {
                e.preventDefault();
                console.log('Preventing pointer down outside');
              }}
              onInteractOutside={(e) => {
                e.preventDefault();
                console.log('Preventing interaction outside');
              }}
              onEscapeKeyDown={(e) => {
                e.preventDefault();
                console.log('Preventing escape key');
                setIsDialogOpen(false);
              }}
            >
              <DialogHeader className="!sticky !top-0 !bg-white !pb-4 !border-b !mb-4">
                <DialogTitle className="text-xl font-semibold">Your Order</DialogTitle>
                <DialogDescription className="sr-only">
                  Manage your order items and checkout
                </DialogDescription>
              </DialogHeader>
              <div className="relative">
                <OrderBasket 
                  items={basketItems}
                  onUpdateQuantity={onUpdateQuantity}
                />
              </div>
            </DialogContent>
          </DialogPortal>
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
