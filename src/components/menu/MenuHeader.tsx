
import { Button } from "@/components/ui/button";
import { Plus, ShoppingBasket } from "lucide-react";

interface MenuHeaderProps {
  onAddItem: () => void;
  basketItemCount?: number;
}

export function MenuHeader({ onAddItem, basketItemCount = 0 }: MenuHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Menu Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your restaurant's menu items
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="relative"
        >
          <ShoppingBasket className="h-5 w-5" />
          {basketItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {basketItemCount}
            </span>
          )}
        </Button>
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
