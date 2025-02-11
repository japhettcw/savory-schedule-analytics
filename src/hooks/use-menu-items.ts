
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { MenuItem } from "@/types/menu";

export function useMenuItems() {
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast({
        title: variables.id ? "Menu item updated" : "Menu item added",
        description: `${variables.name} has been ${variables.id ? "updated" : "added"} successfully.`,
      });
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast({
        title: "Menu item deleted",
        description: "The menu item has been deleted successfully.",
      });
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

  return {
    menuItems,
    isLoading,
    error,
    handleAddEditItem,
    handleDeleteItem,
  };
}
