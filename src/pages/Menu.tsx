
import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { MenuItem } from "@/types/menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import VirtualizedMenuList from "@/components/menu/VirtualizedMenuList";
import { MenuControls } from "@/components/menu/MenuControls";
import { MenuItemManager } from "@/components/menu/MenuItemManager";

export default function Menu() {
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: menuItems = [], isLoading, error } = useQuery({
    queryKey: ['menuItems'],
    queryFn: async () => {
      console.log('Fetching menu items...');
      const { data, error } = await supabase
        .from('menu_items')
        .select('*');
      
      if (error) {
        console.error('Error fetching menu items:', error);
        toast({
          title: "Error fetching menu items",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data.map(item => ({
        ...item,
        id: item.id,
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

  const filteredItems = useMemo(() => {
    console.log('Filtering items:', { menuItems, searchTerm, selectedCategory });
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
      <MenuItemManager
        selectedItem={selectedItem}
        isAddEditDialogOpen={isAddEditDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        onAddNewClick={() => {
          setSelectedItem(undefined);
          setIsAddEditDialogOpen(true);
        }}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        onAddEditDialogChange={setIsAddEditDialogOpen}
        onDeleteDialogChange={setIsDeleteDialogOpen}
        onSave={handleAddEditItem}
        onDelete={() => selectedItem && handleDeleteItem(selectedItem.id)}
      />

      <MenuControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
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
            columnCount={1}
          />
        )}
      </div>
    </div>
  );
}
