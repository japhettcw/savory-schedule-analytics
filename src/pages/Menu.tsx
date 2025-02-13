
import { useState, useCallback, useMemo } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddEditMenuDialog } from "@/components/menu/AddEditMenuDialog";
import VirtualizedMenuList from "@/components/menu/VirtualizedMenuList";
import { MenuHeader } from "@/components/menu/MenuHeader";
import { MenuFilters } from "@/components/menu/MenuFilters";
import type { MenuItem, OrderBasketItem } from "@/types/menu";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useToast } from "@/hooks/use-toast";

const categories = [
  "All",
  "Starters",
  "Main Course",
  "Desserts",
  "Beverages",
  "Sides",
];

export default function Menu() {
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [orderBasket, setOrderBasket] = useState<OrderBasketItem[]>([]);
  const { toast } = useToast();

  const { 
    menuItems, 
    isLoading, 
    error, 
    handleAddEditItem, 
    handleDeleteItem 
  } = useMenuItems();

  const handleEditClick = useCallback((item: MenuItem) => {
    setSelectedItem(item);
    setIsAddEditDialogOpen(true);
  }, []);

  const handleDeleteClick = useCallback((item: MenuItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleAddToCart = useCallback((item: MenuItem) => {
    // Check if we have enough stock before adding to cart
    const currentQuantityInCart = orderBasket.find(
      basketItem => basketItem.item.id === item.id
    )?.quantity || 0;

    if (currentQuantityInCart >= (item.stockLevel || 0)) {
      toast({
        title: "Cannot Add Item",
        description: `Sorry, only ${item.stockLevel} ${item.name} available in stock.`,
        variant: "destructive",
      });
      return;
    }

    setOrderBasket(prevBasket => {
      const existingItem = prevBasket.find(basketItem => basketItem.item.id === item.id);
      
      if (existingItem) {
        return prevBasket.map(basketItem =>
          basketItem.item.id === item.id
            ? { ...basketItem, quantity: basketItem.quantity + 1 }
            : basketItem
        );
      }
      
      return [...prevBasket, { item, quantity: 1 }];
    });

    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    });
  }, [orderBasket, toast]);

  const handleUpdateQuantity = useCallback((itemId: string, change: number) => {
    setOrderBasket(prevBasket => {
      const existingItem = prevBasket.find(basketItem => basketItem.item.id === itemId);
      
      if (!existingItem) return prevBasket;
      
      const newQuantity = existingItem.quantity + change;

      // If the new quantity would be zero or less, remove the item
      if (newQuantity <= 0) {
        return prevBasket.filter(basketItem => basketItem.item.id !== itemId);
      }

      // Check if we have enough stock for the increase
      if (change > 0 && newQuantity > (existingItem.item.stockLevel || 0)) {
        toast({
          title: "Cannot Add More",
          description: `Sorry, only ${existingItem.item.stockLevel} ${existingItem.item.name} available in stock.`,
          variant: "destructive",
        });
        return prevBasket;
      }

      // Update the quantity
      return prevBasket.map(basketItem =>
        basketItem.item.id === itemId
          ? { ...basketItem, quantity: newQuantity }
          : basketItem
      );
    });
  }, [toast]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchTerm, selectedCategory]);

  if (isLoading) {
    return <div>Loading menu items...</div>;
  }

  if (error) {
    return <div>Error loading menu items: {error.toString()}</div>;
  }

  return (
    <div className="container mx-auto px-4 space-y-8 max-w-7xl">
      <MenuHeader 
        onAddItem={() => {
          setSelectedItem(undefined);
          setIsAddEditDialogOpen(true);
        }}
        basketItems={orderBasket}
        onUpdateQuantity={handleUpdateQuantity}
      />

      <div className="space-y-8">
        <MenuFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
        />

        <div className="min-h-[500px]">
          {filteredItems.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No menu items found
            </div>
          ) : (
            <VirtualizedMenuList
              items={filteredItems}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onAddToCart={handleAddToCart}
              isStaff={true}
              columnCount={1}
            />
          )}
        </div>
      </div>

      <AddEditMenuDialog
        open={isAddEditDialogOpen}
        onOpenChange={setIsAddEditDialogOpen}
        item={selectedItem}
        onSave={handleAddEditItem}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedItem?.name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedItem && handleDeleteItem(selectedItem.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
