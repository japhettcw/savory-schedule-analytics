import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, CheckCircle } from "lucide-react";
import type { MenuItem } from "@/types/menu";
import { StockChecker } from "./StockChecker";
import { FeatureTooltip } from "@/components/ui/feature-tooltip";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onAddToCart: (item: MenuItem) => void;
  isStaff: boolean;
}

const MenuItemCard = ({ item, onEdit, onDelete, onAddToCart, isStaff }: MenuItemCardProps) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold">{item.name}</h3>
            <p className="text-sm text-muted-foreground">{item.category}</p>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {item.description}
              </p>
            )}
            <div className="mt-2">
              <FeatureTooltip content="Current stock level status">
                <StockChecker stockLevel={item.stockLevel} />
              </FeatureTooltip>
            </div>
            {item.allergens.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                <FeatureTooltip 
                  content="Food allergens that customers should be aware of"
                  showIcon={false}
                >
                  {item.allergens.map((allergen) => (
                    <Badge key={allergen} variant="outline">
                      {allergen}
                    </Badge>
                  ))}
                </FeatureTooltip>
              </div>
            )}
            {item.ingredients.length > 0 && (
              <div className="mt-2 text-sm text-muted-foreground">
                <FeatureTooltip content="Recipe ingredients and quantities">
                  <p className="font-medium">Ingredients:</p>
                </FeatureTooltip>
                <ul className="list-disc list-inside">
                  {item.ingredients.map((ingredient, index) => (
                    <li key={index}>
                      {ingredient.quantity} {ingredient.unit} {ingredient.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {item.variations && item.variations.length > 0 && (
              <div className="mt-2">
                <FeatureTooltip content="Available size and price variations">
                  <p className="text-sm font-medium">Variations:</p>
                </FeatureTooltip>
                <div className="space-y-1 mt-1">
                  {item.variations.map((variation) => (
                    <div key={variation.id} className="text-sm flex justify-between">
                      <span>{variation.name}</span>
                      <span className="font-medium">${variation.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <span className="text-lg font-bold">${item.price.toFixed(2)}</span>
        </div>
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
                  onClick={() => setShowDeleteConfirmation(true)}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </FeatureTooltip>
            </>
          )}
        </div>
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
