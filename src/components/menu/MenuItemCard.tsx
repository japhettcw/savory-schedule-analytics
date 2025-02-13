
import { Card } from "@/components/ui/card";
import type { MenuItem } from "@/types/menu";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useState } from "react";
import { ItemDetails } from "./ItemDetails";
import { ItemActions } from "./ItemActions";

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onAddToCart: (item: MenuItem) => void;
  isStaff: boolean;
}

const MenuItemCard = ({ item, onEdit, onDelete, onAddToCart, isStaff }: MenuItemCardProps) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <ItemDetails item={item} />
          <span className="text-lg font-bold">${item.price.toFixed(2)}</span>
        </div>
        <ItemActions
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddToCart={onAddToCart}
          onShowDeleteConfirmation={() => setShowDeleteConfirmation(true)}
          isStaff={isStaff}
        />
      </div>

      <ConfirmationDialog
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
        title="Delete Menu Item"
        description={`Are you sure you want to delete "${item.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          onDelete(item);
          setShowDeleteConfirmation(false);
        }}
      />
    </Card>
  );
};

export default MenuItemCard;
