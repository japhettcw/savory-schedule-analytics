import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddEditMenuDialog } from "@/components/menu/AddEditMenuDialog";
import VirtualizedMenuList from "@/components/menu/VirtualizedMenuList";
import { Cart } from "@/components/menu/Cart";
import { useToast } from "@/hooks/use-toast";
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

interface CartItem extends MenuItem {
  quantity: number;
}

export default function Menu() {
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: menuItems = [], isLoading, error } = useQuery({
    queryKey: ['menuItems'],
    queryFn: async () => {
      console.log('Fetching menu items...');
      const { data, error } = await supabase
        .from('menu_items')
        .select('*');
      
      console.log('Supabase response:', { data, error });
      
      if (error) {
        console.error('Error fetching menu items:', error);
        toast({
          title: "Error fetching menu items",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      const transformedData = data.map(item => ({
        ...item,
        id: item.id,
        allergens: item.allergens || [],
        ingredients: (item.ingredients as any[] || []).map((ing: any) => ({
          name: ing.name || '',
          quantity: ing.quantity || '',
          unit: ing.unit || '',
        })) as Ingredient[],
        image: item.image || "/placeholder.svg",
        variations: (item.variations as any[] || []).map((var_: any) => ({
          id: var_.id || crypto.randomUUID(),
          name: var_.name || '',
          price: Number(var_.price) || 0,
        })) as MenuItemVariation[],
        stockLevel: item.stock_level || 0,
      })) as MenuItem[];
      
      console.log('Transformed menu items:', transformedData);
      return transformedData;
    },
  });

  const { mutate: handleAddEditItem } = useMutation({
    mutationFn: async (item: MenuItem) => {
      console.log('Adding/Editing menu item:', item);
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error("No user session found");
      }

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
          user_id: session.session.user.id,
        })
        .select()
        .single();

      console.log('Upsert response:', { data, error });
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

  const { data: userRole } = useQuery({
    queryKey: ['userRole'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;
      return data?.role;
    },
  });

  const isStaff = userRole === 'staff' || userRole === 'manager' || userRole === 'owner';

  const handleAddToCart = useCallback((item: MenuItem) => {
    setCartItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart`,
    });
  }, [toast]);

  const handleUpdateCartItemQuantity = useCallback((itemId: string, quantity: number) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity }
          : item
      )
    );
  }, []);

  const handleRemoveCartItem = useCallback((itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const handleEditClick = useCallback((item: MenuItem) => {
    console.log('Edit clicked for item:', item);
    setSelectedItem(item);
    setIsAddEditDialogOpen(true);
  }, []);

  const handleDeleteClick = useCallback((item: MenuItem) => {
    console.log('Delete clicked for item:', item);
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  }, []);

  const { mutate: handleDeleteItem } = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting menu item:', id);
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
      setIsDeleteDialogOpen(false);
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

  const filteredItems = useMemo(() => {
    return menuItems?.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }) ?? [];
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
          <h1 className="text-4xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your restaurant's menu items
          </p>
        </div>
        <div className="flex gap-4">
          {isStaff && (
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
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-4 w-4" />
            Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
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
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onAddToCart={handleAddToCart}
            isStaff={isStaff}
            columnCount={1}
          />
        )}
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

      <Cart
        items={cartItems}
        onUpdateQuantity={handleUpdateCartItemQuantity}
        onRemoveItem={handleRemoveCartItem}
        open={isCartOpen}
        onOpenChange={setIsCartOpen}
      />
    </div>
  );
}
