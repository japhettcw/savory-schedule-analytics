
import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddEditMenuDialog } from "@/components/menu/AddEditMenuDialog";
import VirtualizedMenuList from "@/components/menu/VirtualizedMenuList";
import { OrderBasket, type BasketItem } from "@/components/order/OrderBasket";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRoleGuard } from "@/hooks/use-role-guard";
import type { MenuItem } from "@/types/menu";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  const [selectedItem, setSelectedItem] = useState<MenuItem | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [basketItems, setBasketItems] = useState<BasketItem[]>([]);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const { userRole } = useRoleGuard();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isStaff = userRole === "staff";
  const canManageMenu = userRole === "manager" || userRole === "owner";

  const { data: menuItems = [], isLoading, error } = useQuery({
    queryKey: ['menuItems'],
    queryFn: async () => {
      console.log('Fetching menu items...');
      const { data, error } = await supabase
        .from('menu_items')
        .select('*');
      
      if (error) {
        console.error('Error fetching menu items:', error);
        throw error;
      }
      
      const transformedData = data.map(item => ({
        ...item,
        allergens: item.allergens || [],
        ingredients: (item.ingredients as any[] || []).map((ing: any) => ({
          name: ing.name || '',
          quantity: ing.quantity || '',
          unit: ing.unit || '',
        })),
        image: item.image || "/placeholder.svg",
        variations: (item.variations as any[] || []).map((var_: any) => ({
          id: var_.id || crypto.randomUUID(),
          name: var_.name || '',
          price: Number(var_.price) || 0,
        })),
        stockLevel: item.stock_level || 0,
      })) as MenuItem[];
      
      return transformedData;
    },
  });

  const { mutate: handleAddEditItem } = useMutation({
    mutationFn: async (item: MenuItem) => {
      const { data, error } = await supabase
        .from('menu_items')
        .upsert({
          id: item.id,
          name: item.name,
          price: item.price,
          category: item.category,
          description: item.description,
          image: item.image,
          available: item.available,
          allergens: item.allergens,
          ingredients: item.ingredients,
          variations: item.variations,
          stock_level: item.stockLevel,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast({
        title: selectedItem ? "Menu item updated" : "Menu item added",
        description: `${variables.name} has been ${selectedItem ? "updated" : "added"} successfully.`,
      });
      setIsAddEditDialogOpen(false);
      setSelectedItem(undefined);
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Error saving menu item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { mutate: handleDeleteItem } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      if (selectedItem) {
        toast({
          title: "Menu item deleted",
          description: `${selectedItem.name} has been deleted successfully.`,
        });
      }
      setSelectedItem(undefined);
    },
    onError: (error: Error) => {
      console.error('Delete error:', error);
      toast({
        title: "Error deleting menu item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddToOrder = useCallback((item: MenuItem) => {
    setBasketItems(prev => {
      const existingItem = prev.find(i => i.menuItem.id === item.id);
      if (existingItem) {
        return prev.map(i => 
          i.menuItem.id === item.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
    
    toast({
      title: "Added to order",
      description: `${item.name} has been added to the order.`,
    });
  }, [toast]);

  const handleUpdateQuantity = useCallback((itemId: string, quantity: number) => {
    setBasketItems(prev => 
      quantity === 0
        ? prev.filter(i => i.menuItem.id !== itemId)
        : prev.map(i => 
            i.menuItem.id === itemId 
              ? { ...i, quantity }
              : i
          )
    );
  }, []);

  const handleUpdateNotes = useCallback((itemId: string, notes: string) => {
    setBasketItems(prev => 
      prev.map(i => 
        i.menuItem.id === itemId 
          ? { ...i, notes }
          : i
      )
    );
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    setBasketItems(prev => prev.filter(i => i.menuItem.id !== itemId));
  }, []);

  const handleSubmitOrder = async (tableNumber: string) => {
    try {
      setIsSubmittingOrder(true);
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_number: tableNumber,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = basketItems.map(item => ({
        order_id: order.id,
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        unit_price: item.menuItem.price,
        notes: item.notes,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear basket and show success message
      setBasketItems([]);
      toast({
        title: "Order submitted",
        description: `Order #${order.id} has been sent to the kitchen.`,
      });
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: "Error submitting order",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingOrder(false);
    }
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            {canManageMenu ? "Menu Management" : "Take Order"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {canManageMenu 
              ? "Manage your restaurant's menu items"
              : "Create and submit customer orders"}
          </p>
        </div>
        {canManageMenu && (
          <Button
            className="flex items-center gap-2"
            onClick={() => {
              setSelectedItem(undefined);
              setIsAddEditDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-h-[500px]">
            {filteredItems.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No menu items found
              </div>
            ) : (
              <VirtualizedMenuList
                items={filteredItems}
                onEdit={canManageMenu ? (item) => {
                  setSelectedItem(item);
                  setIsAddEditDialogOpen(true);
                } : undefined}
                onDelete={canManageMenu ? handleDeleteItem : undefined}
                onAddToOrder={isStaff ? handleAddToOrder : undefined}
                columnCount={1}
              />
            )}
          </div>
        </div>

        {isStaff && (
          <div className="lg:col-span-1">
            <OrderBasket
              items={basketItems}
              onUpdateQuantity={handleUpdateQuantity}
              onUpdateNotes={handleUpdateNotes}
              onRemoveItem={handleRemoveItem}
              onSubmitOrder={handleSubmitOrder}
              isSubmitting={isSubmittingOrder}
            />
          </div>
        )}
      </div>

      {canManageMenu && (
        <AddEditMenuDialog
          open={isAddEditDialogOpen}
          onOpenChange={setIsAddEditDialogOpen}
          item={selectedItem}
          onSave={handleAddEditItem}
        />
      )}
    </div>
  );
}
