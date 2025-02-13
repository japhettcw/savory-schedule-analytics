
import { Button } from "@/components/ui/button";
import { CheckCircle, Edit, Trash } from "lucide-react";
import { FeatureTooltip } from "@/components/ui/feature-tooltip";
import type { MenuItem } from "@/types/menu";
import { useToast } from "@/hooks/use-toast";

interface ItemActionsProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onAddToCart: (item: MenuItem) => void;
  onShowDeleteConfirmation: () => void;
  isStaff: boolean;
}

export function ItemActions({ 
  item, 
  onEdit, 
  onDelete, 
  onAddToCart, 
  onShowDeleteConfirmation,
  isStaff 
}: ItemActionsProps) {
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (!item.stockLevel || item.stockLevel <= 0) {
      toast({
        title: "Item Out of Stock",
        description: `${item.name} is currently out of stock.`,
        variant: "destructive",
      });
      return;
    }
    onAddToCart(item);
  };

  const handleAcceptOrder = (item: MenuItem) => {
    if (!item.stockLevel || item.stockLevel <= 0) {
      toast({
        title: "Cannot Accept Order",
        description: `${item.name} is out of stock.`,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Order Accepted",
      description: `Order Accepted for ${item.name}`,
    });
  };

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <FeatureTooltip content="Add item to cart" showIcon={false}>
        <Button
          variant="default"
          size="sm"
          onClick={handleAddToCart}
          disabled={!item.stockLevel || item.stockLevel <= 0}
        >
          Add to Cart
        </Button>
      </FeatureTooltip>
      <FeatureTooltip content="Accept this order" showIcon={false}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAcceptOrder(item)}
          disabled={!item.stockLevel || item.stockLevel <= 0}
          className={`${
            item.stockLevel && item.stockLevel > 0
              ? "bg-green-50 hover:bg-green-100 border-green-200"
              : "bg-gray-50 border-gray-200 cursor-not-allowed"
          }`}
        >
          <CheckCircle className={`h-4 w-4 mr-1 ${
            item.stockLevel && item.stockLevel > 0 ? "text-green-500" : "text-gray-400"
          }`} />
          {item.stockLevel && item.stockLevel > 0 ? "Accept Order" : "Not Accepting Order"}
        </Button>
      </FeatureTooltip>
      {isStaff && (
        <>
          <FeatureTooltip content="Edit menu item details" showIcon={false}>
            <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </FeatureTooltip>
          <FeatureTooltip content="Remove item from menu" showIcon={false}>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={onShowDeleteConfirmation}
            >
              <Trash className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </FeatureTooltip>
        </>
      )}
    </div>
  );
}
