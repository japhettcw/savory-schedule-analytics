
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface MenuHeaderProps {
  onAddItem: () => void;
}

export function MenuHeader({ onAddItem }: MenuHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Menu Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your restaurant's menu items
        </p>
      </div>
      <Button
        className="flex items-center gap-2"
        onClick={onAddItem}
      >
        <Plus className="h-4 w-4" />
        Add Item
      </Button>
    </div>
  );
}
